"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BeatWithUrls, LicenseTier } from "@/lib/types";
import { LICENSES, LICENSE_TIERS } from "@/lib/licenses";
import { useCart } from "@/lib/cart"; import { formatPrice } from "@/lib/money";

interface Props {
  beat: BeatWithUrls;
}

export function LicenseSelector({ beat }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<LicenseTier>("mp3");
  const [added, setAdded] = useState(false);

  const tiers = LICENSE_TIERS.filter((t) => {
    const meta = LICENSES[t];
    return beat[meta.priceField] !== null;
  });

  if (tiers.length === 0) {
    return <div className="text-[var(--color-text-muted)]">No licenses configured.</div>;
  }

  const handleAdd = () => {
    add(beat, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isExclusive = selected === "exclusive";

  // Pre-filled mailto for exclusive inquiries — opens user's email client
  const exclusiveMailto = `mailto:chadavbeats@gmail.com?subject=${encodeURIComponent(
    `Exclusive rights inquiry: ${beat.title}`
  )}&body=${encodeURIComponent(
    `Hi,\n\nI'm interested in exclusive rights to "${beat.title}".\n\nIntended use:\nProject / artist name:\nRelease timeline:\nBudget:\n\nThanks!`
  )}`;

  return (
    <div>
      <div className="space-y-2">
        {tiers.map((tier) => {
          const meta = LICENSES[tier];
          const price = beat[meta.priceField] ?? 0;
          const active = selected === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setSelected(tier)}
              className={`w-full text-left p-4 rounded-lg border transition ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-bg-card)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-dim)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {meta.label}
                    {meta.exclusive && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-black">
                        Exclusive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)] mt-1">{meta.description}</div>
                  {meta.exclusive && (
                    <div className="text-xs text-[var(--color-accent)] mt-2 font-medium">
                      Negotiated per-beat. Starting at {formatPrice(price)}. Email required to finalize.
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {meta.exclusive ? (
                    <>
                      <div className="text-xs text-[var(--color-text-dim)]">Starting at</div>
                      <div className="font-black text-lg">{formatPrice(price)}</div>
                    </>
                  ) : (
                    <div className="font-black text-lg">{formatPrice(price)}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isExclusive ? (
        <div className="flex gap-3 mt-6">
          <a href={exclusiveMailto} className="btn-primary flex-1 inline-flex items-center justify-center">
            Email to Negotiate
          </a>
          <Link href="/contact" className="btn-ghost inline-flex items-center justify-center">
            Or open contact page
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mt-6">
            <button onClick={handleAdd} className="btn-primary flex-1">
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
            <button onClick={() => { handleAdd(); router.push("/cart"); }} className="btn-ghost">
              Buy Now
            </button>
          </div>
          <div className="mt-4 text-xs text-[var(--color-text-dim)]">
            Secure checkout via PayPal. Instant download after payment.
          </div>
        </>
      )}
    </div>
  );
}
