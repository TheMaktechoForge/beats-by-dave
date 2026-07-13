// Email via Resend. Used by the post-payment success page to
// send a receipt + signed download links to the buyer.
//
// Order receipt template is inline for simplicity. If we ever
// need transactional templates with logo, dark mode, etc., move
// to React Email (resend/react-email).

import { Resend } from "resend";
import type { Order, BeatWithUrls } from "./types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface ReceiptInput {
  order: Order;
  beats: BeatWithUrls[];
  downloadUrl: string;
}

export async function sendReceipt({ order, beats, downloadUrl }: ReceiptInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY missing — skipping receipt email");
    return;
  }
  const to = order.payer_email;
  if (!to) return;

  const items = order.items
    .map((i) => {
      const beat = beats.find((b) => b.id === i.beat_id);
      return `<li><strong>${escapeHtml(i.beat_title)}</strong> — ${i.license.toUpperCase()} — $${(i.price_cents / 100).toFixed(2)}</li>`;
    })
    .join("");

  const html = `
    <div style="background:#0b0b0d;color:#fff;font-family:system-ui;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#16161a;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 8px;color:#ff8a00;font-size:14px;letter-spacing:2px;">BEATS BY DAVE</h1>
        <h2 style="margin:0 0 24px;font-size:24px;">Thanks for your purchase 🧡</h2>
        <p style="color:#b8b8c2;line-height:1.6;">
          Your order #${order.id.slice(0, 8).toUpperCase()} is confirmed. Total charged: $${(order.total_cents / 100).toFixed(2)}.
        </p>
        <ul style="color:#fff;line-height:1.8;padding-left:18px;">${items}</ul>
        <div style="margin:24px 0;padding:16px;border:1px solid #2a2a31;border-radius:8px;">
          <strong style="color:#ff8a00;">Download your beats</strong>
          <p style="margin:8px 0 16px;color:#b8b8c2;font-size:14px;">
            This link expires in ${Math.round((new Date(order.download_expires_at!).getTime() - Date.now()) / 36e5)} hours. Save the files now.
          </p>
          <a href="${downloadUrl}" style="display:inline-block;background:#ff8a00;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;">
            Download Files
          </a>
        </div>
        <p style="color:#6c6c75;font-size:12px;margin-top:32px;">
          Receipt issued ${new Date(order.created_at).toLocaleString("en-US")}. Questions? Reply to this email.
        </p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "Beats by Dave <beats@beatsbydave.com>",
    to,
    subject: `Your Beats by Dave order #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}