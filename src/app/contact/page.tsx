export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">Contact</div>
      <h1 className="text-4xl md:text-5xl font-black mb-6">Get in touch</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Custom work, licensing questions, bulk deals, or just to say what's up.
        I respond within a couple of days.
      </p>

      <div className="card p-4 mb-6 bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)] font-bold mb-1">Current bundle promo</div>
        <div className="text-sm text-[var(--color-text)] font-bold">Any 2 MP3 leases for $20</div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">
          Just mention &ldquo;bundle&rdquo; in your message and I&apos;ll set it up manually.
        </div>
      </div>

      <div className="card p-6 space-y-4 text-sm">
        <Row label="Email" value="chadavbeats@gmail.com" href="mailto:chadavbeats@gmail.com" />
      </div>

      <p className="mt-8 text-xs text-[var(--color-text-dim)]">
        For licensing questions, bulk deals, custom beats, or anything else — email is the fastest path.
      </p>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <a href={href} className="text-[var(--color-accent)] hover:underline font-medium">{value}</a>
    </div>
  );
}