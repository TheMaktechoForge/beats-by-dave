// Email via Resend. Used by the post-payment success page to
// send a receipt + signed download links to the buyer, and a
// producer notification to the artist on every order.

import { Resend } from "resend";
import type { Order } from "./types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// FROM intentionally defaults to the beatsbydave.com sender — that's the
// address Resend has verified. The marketing domain (themaktechoforge.com)
// is not a verified Resend sender, so falling back to it would break sends
// silently if RESEND_FROM ever goes missing.
const FROM = process.env.RESEND_FROM ?? "Beats by Dave <beats@beatsbydave.com>";
const PRODUCER_NOTIFICATION_TO = process.env.PRODUCER_NOTIFICATION_EMAIL ?? "tr3@themaktechoforge.com";

export interface ReceiptInput {
  order: Order;
  downloadUrl: string;
  beatTitles: string[];
}

export async function sendReceipt({ order, downloadUrl, beatTitles }: ReceiptInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY missing — skipping receipt email");
    return;
  }
  const to = order.payer_email;
  if (!to) return;

  const items = order.items
    .map((i) => `<li><strong>${escapeHtml(i.beat_title)}</strong> — ${i.license.toUpperCase()} — $${(i.price_cents / 100).toFixed(2)}</li>`)
    .join("");

  const html = `
    <div style="background:#0b0b0d;color:#fff;font-family:system-ui;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#16161a;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 8px;color:#B5D300;font-size:14px;letter-spacing:2px;">BEATS BY DAVE</h1>
        <h2 style="margin:0 0 24px;font-size:24px;">Thanks for your purchase 🧡</h2>
        <p style="color:#b8b8c2;line-height:1.6;">
          Your order #${order.id.slice(0, 8).toUpperCase()} is confirmed. Total charged: $${(order.total_cents / 100).toFixed(2)}.
        </p>
        <ul style="color:#fff;line-height:1.8;padding-left:18px;">${items}</ul>
        <div style="margin:24px 0;padding:16px;border:1px solid #2a2a31;border-radius:8px;">
          <strong style="color:#B5D300;">Download your beats</strong>
          <p style="margin:8px 0 16px;color:#b8b8c2;font-size:14px;">
            This link expires in ${Math.round((new Date(order.download_expires_at!).getTime() - Date.now()) / 36e5)} hours. Save the files now.
          </p>
          <a href="${downloadUrl}" style="display:inline-block;background:#B5D300;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;">
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
    from: FROM,
    to,
    subject: `Your Beats by Dave order #${order.id.slice(0, 8).toUpperCase()}`,
    html,
  });
}

export interface ProducerNotificationInput {
  order: Order;
  beatTitles: string[];
}

export async function sendProducerNotification({ order, beatTitles }: ProducerNotificationInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY missing — skipping producer notification");
    return;
  }

  const items = order.items
    .map((i) => `<li><strong>${escapeHtml(i.beat_title)}</strong> — ${i.license.toUpperCase()} — $${(i.price_cents / 100).toFixed(2)}</li>`)
    .join("");

  const sold = order.items.some((i) => i.license === "exclusive");

  const html = `
    <div style="background:#0b0b0d;color:#fff;font-family:system-ui;padding:40px 20px;">
      <div style="max-width:560px;margin:0 auto;background:#16161a;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 8px;color:#B5D300;font-size:14px;letter-spacing:2px;">NEW SALE</h1>
        <h2 style="margin:0 0 24px;font-size:22px;">${
          sold ? "🧡 Exclusive sold" : "Order received"
        }</h2>
        <p style="color:#b8b8c2;line-height:1.6;">
          <strong>Order:</strong> #${order.id.slice(0, 8).toUpperCase()}<br/>
          <strong>Buyer:</strong> ${escapeHtml(order.payer_name ?? "—")} &lt;${escapeHtml(order.payer_email ?? "—")}&gt;<br/>
          <strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}<br/>
          <strong>Time:</strong> ${new Date(order.created_at).toLocaleString("en-US")}
        </p>
        <ul style="color:#fff;line-height:1.8;padding-left:18px;">${items}</ul>
        ${sold ? '<p style="color:#B5D300;margin-top:24px;"><strong>Note:</strong> The beat has been marked SOLD and removed from public sale. Customer has been emailed download links.</p>' : ""}
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to: PRODUCER_NOTIFICATION_TO,
      subject: sold
        ? `🧡 EXCLUSIVE SOLD — ${order.items[0]?.beat_title ?? "Beat"} — $${(order.total_cents / 100).toFixed(2)}`
        : `New sale: ${beatTitles.length} beat${beatTitles.length === 1 ? "" : "s"} — $${(order.total_cents / 100).toFixed(2)}`,
      html,
    });
  } catch (e) {
    // Producer notification failure must NOT block the buyer's flow.
    console.error("Producer notification failed:", e);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
