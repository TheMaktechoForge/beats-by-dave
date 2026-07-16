// Create a PayPal donation order.
// Body: { amount: number, email?: string, name?: string }

import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

interface Body {
  amount: number;
  email?: string;
  name?: string;
}

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 500;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (
    !body.amount ||
    typeof body.amount !== "number" ||
    body.amount < MIN_AMOUNT ||
    body.amount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      { error: `Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}` },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beats.themaktechoforge.com";

  try {
    const order = await createPayPalOrder({
      items: [
        {
          title: "Donation to The Maktecho Forge",
          unitAmountCents: Math.round(body.amount * 100),
          quantity: 1,
        },
      ],
      returnUrl: `${siteUrl}/donate?status=success`,
      cancelUrl: `${siteUrl}/donate?status=cancel`,
    });
    return NextResponse.json({ paypalOrderId: order.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "PayPal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
