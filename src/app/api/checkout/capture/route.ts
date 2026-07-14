// Capture a PayPal order and finalize the DB record.
// Body: { paypalOrderId: string, email: string, name?: string }

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServiceSupabase } from "@/lib/supabase";
import { capturePayPalOrder } from "@/lib/paypal";
import { generateLicensePdf } from "@/lib/licenses";
import { sendReceipt, sendProducerNotification } from "@/lib/email";
import type { Order } from "@/lib/types";

interface Body {
  paypalOrderId: string;
  email?: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.paypalOrderId) {
    return NextResponse.json({ error: "Missing paypalOrderId" }, { status: 400 });
  }

  const supabase = createServiceSupabase();

  // Capture with PayPal
  let capture;
  try {
    capture = await capturePayPalOrder(body.paypalOrderId);
  } catch (e) {
    console.error("PayPal capture failed", e);
    return NextResponse.json({ error: "Capture failed" }, { status: 502 });
  }

  if (capture.status !== "COMPLETED") {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("paypal_order_id", body.paypalOrderId);
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  // Look up the pending order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("paypal_order_id", body.paypalOrderId)
    .maybeSingle();
  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Generate a download token (24h expiry)
  const ttlHours = parseInt(process.env.DOWNLOAD_LINK_TTL_HOURS ?? "24", 10);
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();

  const { data: updated, error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paypal_capture_id: capture.captureId ?? null,
      payer_email: capture.payerEmail ?? body.email ?? order.payer_email,
      payer_name: capture.payerName ?? body.name ?? order.payer_name,
      download_token: token,
      download_expires_at: expiresAt,
    })
    .eq("id", order.id)
    .select("*")
    .single();

  if (updateErr || !updated) {
    console.error("Order update failed", updateErr);
    return NextResponse.json({ error: "Order finalize failed" }, { status: 500 });
  }

  // Mark beats sold (exclusives only). Keep them published so the catalog
  // can show them with an SOLD overlay instead of disappearing entirely.
  for (const item of (updated.items as { beat_id: string; license: string }[])) {
    if (item.license === "exclusive") {
      await supabase
        .from("beats")
        .update({ exclusive_sold: true })
        .eq("id", item.beat_id);
    }
  }

  // Email the buyer and notify the producer (best-effort).
  try {
    const beatTitles = (updated.items as { beat_title: string }[]).map((i) => i.beat_title);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    await sendReceipt({
      order: updated as Order,
      downloadUrl: `${siteUrl}/api/download/${token}`,
      beatTitles,
    });
    await sendProducerNotification({
      order: updated as Order,
      beatTitles,
    });
  } catch (e) {
    console.error("Post-purchase email failed (non-blocking):", e);
  }

  return NextResponse.json({ downloadToken: token });
}