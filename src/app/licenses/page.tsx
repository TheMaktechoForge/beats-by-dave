import { LICENSES, LICENSE_TIERS } from "@/lib/licenses";
import { formatPrice } from "@/lib/cart";

export default function LicensesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">Licensing</div>
      <h1 className="text-4xl md:text-5xl font-black mb-3">Simple, honest terms.</h1>
      <p className="text-[var(--color-text-muted)] text-lg mb-12 max-w-2xl">
        Every beat is available in four tiers. Pick the one that matches your budget and your release.
        Higher tiers unlock more files and higher revenue caps.
      </p>

      <div className="space-y-4">
        {LICENSE_TIERS.map((tier) => {
          const meta = LICENSES[tier];
          return (
            <div key={tier} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xl">{meta.label}</h2>
                    {meta.exclusive && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-black">
                        Exclusive
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--color-text-muted)] mt-2">{meta.description}</p>
                  <ul className="mt-4 space-y-1 text-sm text-[var(--color-text-muted)]">
                    {bulletsFor(tier).map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-dim)]">From</div>
                  <div className="text-2xl font-black text-[var(--color-accent)]">
                    Set per beat
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-sm text-[var(--color-text-muted)]">
        Full license text is included as a PDF with every purchase. Questions before you buy?{" "}
        <a href="/contact" className="text-[var(--color-accent)] hover:underline">Get in touch</a>.
      </div>
    </div>
  );
}

function bulletsFor(tier: string): string[] {
  switch (tier) {
    case "mp3":
      return [
        "Untagged MP3 file",
        "For streams and sales up to US$10,000 gross revenue",
        "50% publishing royalty to producer",
        "Credit 'Produced by Beats by Dave'",
      ];
    case "wav":
      return [
        "Untagged WAV file (24-bit, 44.1 kHz)",
        "For streams and sales up to US$50,000 gross revenue",
        "50% publishing royalty to producer",
        "Credit 'Produced by Beats by Dave'",
      ];
    case "trackouts":
      return [
        "Untagged WAV + stems (trackouts) for mixing",
        "For streams and sales up to US$250,000 gross revenue",
        "50% publishing royalty to producer",
        "Credit 'Produced by Beats by Dave'",
      ];
    case "exclusive":
      return [
        "Full exclusive transfer of master recording rights",
        "Beat is delisted on sale",
        "Includes WAV + stems + project session if available",
        "Producer retains 50% of publishing rights",
      ];
    default:
      return [];
  }
}