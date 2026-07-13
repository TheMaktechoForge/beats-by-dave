// PayPal Orders API v2 — REST, no SDK.
//
// We only run on the server. The client uses @paypal/react-paypal-js
// which talks directly to PayPal; this module handles order creation,
// capture verification, and webhook validation.

const BASE =
  process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

interface TokenCache { token: string; expiresAt: number }
let cached: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  if (!id || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

export interface CreateOrderInput {
  items: { title: string; description?: string; unitAmountCents: number; quantity: number }[];
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createPayPalOrder(input: CreateOrderInput): Promise<{ id: string; approvalUrl: string }> {
  const token = await getAccessToken();
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: input.currency ?? "USD",
          value: (input.items.reduce((s, i) => s + i.unitAmountCents * i.quantity, 0) / 100).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: input.currency ?? "USD",
              value: (input.items.reduce((s, i) => s + i.unitAmountCents * i.quantity, 0) / 100).toFixed(2),
            },
          },
        },
        items: input.items.map((i) => ({
          name: i.title.slice(0, 127),
          description: (i.description ?? "").slice(0, 127),
          unit_amount: { currency_code: input.currency ?? "USD", value: (i.unitAmountCents / 100).toFixed(2) },
          quantity: String(i.quantity),
        })),
      },
    ],
    application_context: {
      brand_name: process.env.NEXT_PUBLIC_PRODUCER_NAME ?? "Beats by Dave",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
  };
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal createOrder failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  const approval = json.links.find((l) => l.rel === "approve");
  if (!approval) throw new Error("PayPal response missing approval link");
  return { id: json.id, approvalUrl: approval.href };
}

export interface CaptureResult {
  id: string;
  status: string;
  payerEmail?: string;
  payerName?: string;
  captureId?: string;
}

export async function capturePayPalOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    id: string;
    status: string;
    payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
    purchase_units?: { payments?: { captures?: { id: string; status: string }[] } }[];
  };
  const captureId = json.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const given = json.payer?.name?.given_name ?? "";
  const surname = json.payer?.name?.surname ?? "";
  return {
    id: json.id,
    status: json.status,
    payerEmail: json.payer?.email_address,
    payerName: [given, surname].filter(Boolean).join(" ").trim() || undefined,
    captureId,
  };
}

export async function getPayPalOrder(orderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PayPal getOrder failed: ${res.status}`);
  return res.json();
}

// Webhook signature verification
// https://developer.paypal.com/api/rest/webhooks/event-names/
import crypto from "node:crypto";

export async function verifyWebhookSignature(headers: Headers, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false;

  // Fetch cert
  const certRes = await fetch(certUrl);
  if (!certRes.ok) return false;
  const certPem = await certRes.text();

  const expected = [
    webhookId,
    transmissionId,
    transmissionTime,
    process.env.PAYPAL_CLIENT_ID ?? "",
    crypto.createHash("sha256").update(body).digest("hex"),
  ].join("|");

  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(expected);
    verify.end();
    return verify.verify(certPem, transmissionSig, "base64");
  } catch {
    return false;
  }
}