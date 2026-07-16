import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="font-black text-lg">BEATS BY DAVE</div>
          <p className="text-[var(--color-text-muted)] mt-2 max-w-md">
            Premium Hip-Hop, Trap & R&B beats with instant download and full license clarity.
          </p>
        </div>
        <div>
          <div className="font-bold mb-3">Shop</div>
          <ul className="space-y-2 text-[var(--color-text-muted)]">
            <li><Link href="/beats" className="hover:text-[var(--color-accent)]">All Beats</Link></li>
            <li><Link href="/licenses" className="hover:text-[var(--color-accent)]">Licenses</Link></li>
            <li><Link href="/cart" className="hover:text-[var(--color-accent)]">Cart</Link></li>
            <li><Link href="/donate" className="hover:text-[var(--color-accent)]">Donate</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-3">Connect</div>
          <ul className="space-y-2 text-[var(--color-text-muted)]">
            <li><Link href="/contact" className="hover:text-[var(--color-accent)]">Contact</Link></li>
            <li><Link href="/about" className="hover:text-[var(--color-accent)]">About</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--color-accent)]">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-[var(--color-text-dim)] flex justify-between">
          <span>© {new Date().getFullYear()} Beats by Dave. All rights reserved.</span>
          <span>Built with care.</span>
        </div>
      </div>
    </footer>
  );
}