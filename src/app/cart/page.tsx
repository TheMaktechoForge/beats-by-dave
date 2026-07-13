"use client";

import Link from "next/link";
import { useCart, formatPrice, cartItemPrice } from "@/lib/cart";
import { LICENSES } from "@/lib/licenses";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.totalCents());

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-black mb-2">Your cart is empty</h1>
        <p className="text-[var(--color-text-muted)] mb-8">Find your next beat in the catalog.</p>
        <Link href="/beats" className="btn-primary">Browse Beats</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-8">Your Cart</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.beat.id}-${item.license}`}
            className="card p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{item.beat.title}</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {LICENSES[item.license].label}
              </div>
            </div>
            <div className="font-black text-[var(--color-accent)]">
              {formatPrice(cartItemPrice(item))}
            </div>
            <button
              onClick={() => remove(item.beat.id, item.license)}
              className="text-sm text-[var(--color-text-dim)] hover:text-red-400"
              aria-label="Remove"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--color-border)] pt-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--color-text-muted)]">Total</div>
          <div className="text-3xl font-black">{formatPrice(total)}</div>
        </div>
        <Link href="/checkout" className="btn-primary text-base">
          Checkout
        </Link>
      </div>
    </div>
  );
}