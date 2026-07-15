"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";

export function Header() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.length : 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-bg)]/85 border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-black shrink-0 border border-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-noface.png" alt="Beats by Dave" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-black tracking-tight text-lg leading-none">BEATS BY DAVE</div>
            <div className="text-[10px] text-[var(--color-accent)] tracking-[0.25em] leading-none mt-1">PREMIUM BEATS</div>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/beats" className="hover:text-[var(--color-accent)] transition">Beats</Link>
          <Link href="/licenses" className="hover:text-[var(--color-accent)] transition">Licenses</Link>
          <Link href="/about" className="hover:text-[var(--color-accent)] transition">About</Link>
          <Link href="/contact" className="hover:text-[var(--color-accent)] transition">Contact</Link>
        </nav>

        <Link href="/cart" className="relative btn-ghost !py-2 !px-4">
          Cart
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}