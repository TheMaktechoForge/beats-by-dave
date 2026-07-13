// License PDF generator for the multi-item download page.

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { generateLicensePdf, LICENSES } from "@/lib/licenses";
import type { LicenseTier } from "@/lib/types";

interface RouteContext {
  params: Promise<{ token: string; title: string; license: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { token, title, license: licenseLabel } = await params;

  const supabase = createServiceSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("download_token", token)
    .maybeSingle();
  if (!order) return new NextResponse("Invalid link", { status: 404 });
  if (order.status !== "paid") return new NextResponse("Not paid", { status: 403 });
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
    return new NextResponse("Expired", { status: 410 });
  }

  const items = order.items as { beat_title: string; license: LicenseTier; price_cents: number }[];
  const item = items.find((i) => i.beat_title === title && LICENSES[i.license].label === licenseLabel);
  if (!item) return new NextResponse("Not in order", { status: 404 });

  const pdf = await generateLicensePdf({
    producerName: "Beats by Dave",
    beatTitle: item.beat_title,
    buyerName: order.payer_name,
    buyerEmail: order.payer_email,
    license: item.license,
    priceCents: item.price_cents,
    orderId: order.id,
    purchaseDate: order.created_at,
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${slug(item.beat_title)}-license.pdf"`,
    },
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}