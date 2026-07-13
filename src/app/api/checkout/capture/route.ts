// Capture a PayPal order and finalize the DB record.
// Body: { paypalOrderId: string, email: string, name?: string }

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServiceSupabase } from "@/lib/supabase";
import { capturePayPalOrder } from "@/lib/paypal";
import { generateLicensePdf } from "@/lib/licenses";
import { sendReceipt } from "@/lib/email";
import { resolveBeatUrls } from "@/lib/format";
import type { BeatWithUrls, Order } from "@/lib/types";

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

  // Mark beats sold (exclusives only) so they disappear from the catalog.
  for (const item of (updated.items as { beat_id: string; license: string }[])) {
    if (item.license === "exclusive") {
      await supabase
        .from("beats")
        .update({ exclusive_sold: true, published: false })
        .eq("id", item.beat_id);
    }
  }

  // Generate and stash license PDFs (lazy: we generate on download too,
  // but caching them now means the buyer gets a clean URL).
  // For simplicity we just generate on demand in /api/download/[token].
  // Email the buyer (best-effort).
  try {
    const beatIds = (updated.items as { beat_id: string }[]).map((i) => i.beat_id);
    const { data: beats } = await supabase.from("beats").select("*").in("id", beatIds);
    const resolved: BeatWithUrls[] = [];
    for (const b of beats ?? []) {
      const urls = await resolveBeatUrls(b);
      resolved.push({ ...b, ...urls });
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    await sendReceipt({
      order: updated as Order,
      beats: resolved,
      downloadUrl: `${siteUrl}/api/download/${token}`,
    });
  } catch (e) {
    console.error("Receipt email failed (non-blocking):", e);
  }

  return NextResponse.json({ downloadToken: token });
}