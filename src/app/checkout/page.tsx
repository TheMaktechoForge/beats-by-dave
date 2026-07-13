"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCart, formatPrice, cartItemPrice } from "@/lib/cart";
import { LICENSES } from "@/lib/licenses";
import Link from "next/link";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.totalCents());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
        <Link href="/beats" className="btn-primary">Browse Beats</Link>
      </div>
    );
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "test";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.beat.id}-${item.license}`} className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{item.beat.title}</div>
                  <div className="text-[var(--color-text-muted)] text-xs">
                    {LICENSES[item.license].label}
                  </div>
                </div>
                <div>{formatPrice(cartItemPrice(item))}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between font-black text-lg">
            <span>Total</span>
            <span className="text-[var(--color-accent)]">{formatPrice(total)}</span>
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-4">Your Details</h2>
          <label className="block text-sm mb-3">
            <span className="text-[var(--color-text-muted)]">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="Your name"
            />
          </label>
          <label className="block text-sm mb-4">
            <span className="text-[var(--color-text-muted)]">Email (for download links)</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="you@example.com"
            />
          </label>

          <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
              disabled={!email || busy}
              createOrder={async () => {
                setBusy(true);
                try {
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items, email, name }),
                  });
                  if (!res.ok) throw new Error("Failed to create order");
                  const json = await res.json();
                  return json.paypalOrderId;
                } finally {
                  setBusy(false);
                }
              }}
              onApprove={async (data) => {
                const res = await fetch("/api/checkout/capture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paypalOrderId: data.orderID, email, name }),
                });
                if (!res.ok) {
                  alert("Payment captured but we couldn't finalize. Contact us with the PayPal order ID: " + data.orderID);
                  return;
                }
                const json = await res.json();
                clear();
                router.push(`/checkout/success?token=${json.downloadToken}`);
              }}
              onError={(err) => {
                console.error(err);
                alert("PayPal error. Try again or use a different payment method.");
              }}
            />
          </PayPalScriptProvider>

          <p className="mt-4 text-xs text-[var(--color-text-dim)]">
            PayPal account or guest card. You'll get download links by email immediately after payment.
          </p>
        </div>
      </div>
    </div>
  );
}