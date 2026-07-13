// Create a pending order + PayPal order.
// Body: { items: CartItem[], email: string, name?: string }

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createServiceSupabase } from "@/lib/supabase";
import { LICENSES } from "@/lib/licenses";
import { createPayPalOrder } from "@/lib/paypal";
import type { Beat, LicenseTier } from "@/lib/types";

interface Body {
  items: { beat: Beat; license: LicenseTier }[];
  email: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.email || !body.items?.length) {
    return NextResponse.json({ error: "Missing email or items" }, { status: 400 });
  }

  const supabase = createServiceSupabase();

  // Re-price items server-side to prevent client tampering.
  const beatIds = body.items.map((i) => i.beat.id);
  const { data: beats, error } = await supabase
    .from("beats")
    .select("*")
    .in("id", beatIds)
    .eq("published", true)
    .eq("exclusive_sold", false);
  if (error || !beats) {
    return NextResponse.json({ error: "Beat lookup failed" }, { status: 500 });
  }

  const beatMap = new Map(beats.map((b) => [b.id, b]));
  const orderItems: { beat_id: string; beat_title: string; license: LicenseTier; price_cents: number }[] = [];
  let subtotal = 0;

  for (const item of body.items) {
    const beat = beatMap.get(item.beat.id);
    if (!beat) {
      return NextResponse.json({ error: `Beat ${item.beat.id} not available` }, { status: 400 });
    }
    if (beat.exclusive_sold) {
      return NextResponse.json({ error: `${beat.title} has been sold exclusively` }, { status: 400 });
    }
    const meta = LICENSES[item.license];
    const price = beat[meta.priceField];
    if (price === null || price === undefined) {
      return NextResponse.json({ error: `${beat.title} does not offer ${meta.label}` }, { status: 400 });
    }
    orderItems.push({
      beat_id: beat.id,
      beat_title: beat.title,
      license: item.license,
      price_cents: price,
    });
    subtotal += price;
  }

  if (orderItems.some((i) => i.license === "exclusive")) {
    // For exclusive sales, we charge the exclusive price even if MP3/WAV
    // tiers are also in the cart — typically the cart holds a single item.
    // We don't add multiple line items; this just documents the intent.
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  // Create PayPal order
  let paypal;
  try {
    paypal = await createPayPalOrder({
      items: orderItems.map((i) => ({
        title: `${i.beat_title} — ${LICENSES[i.license].label}`,
        unitAmountCents: i.price_cents,
        quantity: 1,
      })),
      returnUrl: `${siteUrl}/checkout/success`,
      cancelUrl: `${siteUrl}/cart`,
    });
  } catch (e) {
    console.error("PayPal createOrder failed", e);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }

  // Insert pending order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      paypal_order_id: paypal.id,
      payer_email: body.email,
      payer_name: body.name ?? null,
      items: orderItems,
      subtotal_cents: subtotal,
      total_cents: subtotal, // no tax/shipping for digital
      currency: "USD",
      status: "pending",
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    console.error("Order insert failed", orderErr);
    return NextResponse.json({ error: "Order save failed" }, { status: 500 });
  }

  return NextResponse.json({ paypalOrderId: paypal.id, orderId: order.id });
}