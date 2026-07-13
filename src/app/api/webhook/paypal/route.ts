// PayPal webhook receiver — backup path for capture confirmation.
// The /api/checkout/capture route handles the success-redirect path,
// but PayPal may also POST events for out-of-band confirmation.

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paypal";
import { createServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const ok = await verifyWebhookSignature(req.headers, body);
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 400 });

  let event: { event_type: string; resource: { id?: string; status?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  if (event.event_type === "CHECKOUT.ORDER.COMPLETED" || event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const orderId = event.resource.id;
    if (orderId) {
      const supabase = createServiceSupabase();
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("paypal_order_id", orderId)
        .eq("status", "pending");
    }
  }

  return NextResponse.json({ received: true });
}