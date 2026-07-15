// Download endpoint — exchange a single-use token for the purchased files.
//
// For a single license purchase we return:
//   1. The matching audio file (MP3 / WAV / stems ZIP)
//   2. A license PDF generated on demand
//
// We redirect the browser to a signed Supabase URL for the audio.
// For multi-item carts we return a small HTML page that lists all
// files with download links, plus a combined ZIP of license PDFs.

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase, getSignedUrl } from "@/lib/supabase";
import { generateLicensePdf, LICENSES } from "@/lib/licenses";
import type { Order } from "@/lib/types";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const supabase = createServiceSupabase();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("download_token", token)
    .maybeSingle();
  if (error || !order) return new NextResponse("Invalid link", { status: 404 });
  if (order.status !== "paid") return new NextResponse("Order not paid", { status: 403 });
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
    return new NextResponse("Download link expired", { status: 410 });
  }

  const items = order.items as { beat_id: string; beat_title: string; license: keyof typeof LICENSES; price_cents: number }[];

  // For a single-item order, redirect straight to the file.
  if (items.length === 1) {
    const item = items[0];
    const { data: beat } = await supabase.from("beats").select("*").eq("id", item.beat_id).maybeSingle();
    if (!beat) return new NextResponse("Beat not found", { status: 404 });
    const meta = LICENSES[item.license];
    const path = pickPath(beat, meta.filePreference);
    if (!path) return new NextResponse("No file available for this license", { status: 404 });
    const url = await getSignedUrl(path, 60 * 60);
    return NextResponse.redirect(url);
  }

  // Multi-item: render a small page with download links + combined PDFs.
  const rows: { title: string; license: string; audioUrl: string | null; audioPath: string | null }[] = [];
  for (const item of items) {
    const { data: beat } = await supabase.from("beats").select("*").eq("id", item.beat_id).maybeSingle();
    if (!beat) continue;
    const meta = LICENSES[item.license];
    const path = pickPath(beat, meta.filePreference);
    let audioUrl: string | null = null;
    if (path) {
      try { audioUrl = await getSignedUrl(path, 60 * 60 * 24); } catch {}
    }
    rows.push({ title: item.beat_title, license: meta.label, audioUrl, audioPath: path });
  }

  const html = renderDownloadPage(order, rows);
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function pickPath(beat: any, prefs: ("wav" | "mp3" | "trackouts")[]): string | null {
  for (const p of prefs) {
    const path = p === "wav" ? beat.wav_path : p === "mp3" ? beat.mp3_path : beat.trackouts_path;
    if (path) return path;
  }
  return null;
}

function renderDownloadPage(
  order: { id: string; total_cents: number; created_at: string; download_expires_at: string | null },
  rows: { title: string; license: string; audioUrl: string | null; audioPath: string | null }[]
) {
  const expires = order.download_expires_at
    ? new Date(order.download_expires_at).toLocaleString("en-US")
    : "soon";
  const itemsHtml = rows
    .map(
      (r) => `
      <tr>
        <td><strong>${escapeHtml(r.title)}</strong></td>
        <td>${escapeHtml(r.license)}</td>
        <td>${
          r.audioUrl
            ? `<a href="${r.audioUrl}" class="dl">Download</a>`
            : `<span class="muted">Unavailable</span>`
        }</td>
        <td><a href="/api/download/${order.id}/license/${encodeURIComponent(r.title)}/${encodeURIComponent(r.license)}" class="dl">PDF</a></td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Your downloads — Beats by Dave</title>
<style>
  body { background:#0b0b0d; color:#fff; font-family: ui-sans-serif, system-ui; margin: 0; padding: 40px 20px; }
  .wrap { max-width: 760px; margin: 0 auto; background:#16161a; border:1px solid #2a2a31; border-radius: 12px; padding: 32px; }
  h1 { margin: 0 0 8px; }
  .sub { color:#b8b8c2; margin: 0 0 24px; }
  .expires { color:#B5D300; font-size: 13px; margin: 0 0 24px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 12px 8px; border-bottom: 1px solid #2a2a31; font-size: 14px; }
  th { color:#b8b8c2; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; }
  a.dl { background:#B5D300; color:#000; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-weight: 700; }
  a.dl:hover { background:#9DAA00; }
  .muted { color:#6c6c75; }
  footer { margin-top: 32px; color:#6c6c75; font-size: 12px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Your downloads</h1>
    <p class="sub">Order #${order.id.slice(0, 8).toUpperCase()} • $${(order.total_cents / 100).toFixed(2)}</p>
    <p class="expires">This page expires ${escapeHtml(expires)}. Save your files now.</p>
    <table>
      <thead><tr><th>Beat</th><th>License</th><th>Audio</th><th>License PDF</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <footer>Beats by Dave · beatsbydave.com</footer>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}