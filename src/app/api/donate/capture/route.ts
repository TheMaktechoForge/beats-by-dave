// Capture a PayPal donation and send a thank-you email if an address was provided.

import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendDonationReceipt } from "@/lib/email";

interface Body {
  paypalOrderId: string;
  email?: string;
  name?: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.paypalOrderId || !body.amount) {
    return NextResponse.json({ error: "Missing paypalOrderId or amount" }, { status: 400 });
  }

  try {
    const capture = await capturePayPalOrder(body.paypalOrderId);

    if (body.email) {
      try {
        await sendDonationReceipt({
          donorEmail: body.email,
          donorName: body.name,
          amount: body.amount,
          transactionId: body.paypalOrderId,
        });
      } catch (e) {
        // Email failure shouldn't fail the donation capture
        console.error("donation receipt email failed", e);
      }
    }

    return NextResponse.json({ ok: true, capture });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
