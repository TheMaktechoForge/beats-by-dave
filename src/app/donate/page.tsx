"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PRESETS = [5, 10, 25];
const DEFAULT = 5;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 500;

export default function DonatePage() {
  const [preset, setPreset] = useState<number>(DEFAULT);
  const [custom, setCustom] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ amount: number; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (done) {
    return <ThankYou amount={done.amount} email={done.email} />;
  }
  if (!mounted) return null;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "test";
  const finalAmount = custom ? Number(custom) : preset;
  const isValid = !!finalAmount && finalAmount >= MIN_AMOUNT && finalAmount <= MAX_AMOUNT;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">The Maktecho Forge</div>
      <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">A small workshop.<br />A real fire.</h1>
      <p className="text-[var(--color-text-muted)] tracking-wide text-sm mb-10">
        Supporting the work. Continuing the craft.
      </p>

      <div className="prose-invert space-y-4 text-[var(--color-text-muted)] leading-relaxed mb-10">
        <p>
          The Maktecho Forge is a small workshop. A handful of us, working with sound and code, color and rhythm, trying to make something true in the digital world.
        </p>
        <p>
          We don&apos;t make music to go viral. We don&apos;t build tools to scale. We make things because the making matters. Because art, in whatever form it takes, is how we stay human in a world that&apos;s rushing past.
        </p>
        <p>
          Any donation you give here goes back into that. Into the next beat, the next visual, the next quiet thing we make at 2am because we couldn&apos;t not. Into keeping this little forge lit.
        </p>
        <p>
          We don&apos;t take this lightly. Thank you for even reading this far.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">Choose an amount</div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPreset(p); setCustom(""); }}
              className={`py-3 rounded-lg border-2 font-black text-lg transition ${
                preset === p && !custom
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-dim)]"
              }`}
            >
              ${p}
            </button>
          ))}
        </div>
        <div className="text-sm text-[var(--color-text-muted)] mb-2">Or a different amount:</div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
          <input
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step="1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Anywhere from $1 to $500"
            className="w-full pl-7 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">Your details (optional)</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full mb-3 px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (for a thank-you note)"
          className="w-full px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>

      <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "donate" }}
          disabled={!isValid || busy}
          createOrder={async () => {
            setBusy(true);
            try {
              const res = await fetch("/api/donate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalAmount, email, name }),
              });
              if (!res.ok) throw new Error("Failed to create donation order");
              const json = await res.json();
              return json.paypalOrderId;
            } finally {
              setBusy(false);
            }
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/donate/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paypalOrderId: data.orderID, email, name, amount: finalAmount }),
            });
            if (res.ok) {
              setDone({ amount: finalAmount, email });
            } else {
              alert("Donation was captured but we couldn't finalize the thank-you. Your PayPal order ID: " + data.orderID);
            }
          }}
          onError={(err) => {
            console.error(err);
            alert("Donation error. Try again or use a different payment method.");
          }}
        />
      </PayPalScriptProvider>

      <p className="text-xs text-[var(--color-text-dim)] text-center mt-4">
        Secure checkout via PayPal. The Maktecho Forge is independently run.
        Donations are not tax-deductible and not refundable.
      </p>
    </div>
  );
}

function ThankYou({ amount, email }: { amount: number; email: string }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-6">🧡</div>
      <h1 className="text-4xl md:text-5xl font-black mb-6">Thank you.</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-3 leading-relaxed">
        Your ${amount.toFixed(2)} means more than you know. It keeps the lights on, the
        files moving, the late nights lit.
      </p>
      <p className="text-base text-[var(--color-text-muted)] mb-8 leading-relaxed">
        We&apos;re grateful. Truly.
      </p>
      {email && (
        <p className="text-sm text-[var(--color-text-dim)] mb-8">
          A receipt is on its way to {email}.
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/beats" className="btn-ghost">Browse beats</Link>
      </div>
    </div>
  );
}
