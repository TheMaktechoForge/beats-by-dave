import Link from "next/link";
import { createServiceSupabase } from "@/lib/supabase";
import { resolveBeatUrls } from "@/lib/format";
import type { BeatWithUrls } from "@/lib/types";
import { BeatCard } from "@/components/BeatCard";

export const dynamic = "force-dynamic";

async function getBeats(): Promise<BeatWithUrls[]> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  const out: BeatWithUrls[] = [];
  for (const b of data) {
    const urls = await resolveBeatUrls(b);
    out.push({ ...b, ...urls });
  }
  return out;
}

export default async function HomePage() {
  const beats = await getBeats();
  // Featured slot prefers a non-sold beat (no point featuring something no one can buy)
  const available = beats.filter((b) => !b.exclusive_sold);
  const featured = available.find((b) => b.featured) ?? available[0] ?? beats[0];
  const newest = beats.filter((b) => b.id !== featured?.id).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner.png"
          alt="Beats by Dave — Beats that hit different"
          className="w-full h-auto block"
        />
      </section>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-block px-3 py-1 mb-3 rounded-full border border-[var(--color-border)] text-xs tracking-[0.25em] text-[var(--color-accent)]">
              PREMIUM BEATS BY DAVE
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight max-w-2xl">
              Instrumentals with instant download and clear licensing.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/beats" className="btn-primary text-base">Browse Beats</Link>
            <Link href="/licenses" className="btn-ghost text-base">See Licenses</Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-md text-sm">
          <Stat label="Beats" value={String(beats.length)} />
          <Stat label="Licenses" value="4 tiers" />
          <Stat label="Delivery" value="Instant" />
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-black">Featured Beat</h2>
            <Link href="/beats" className="text-sm text-[var(--color-accent)] hover:underline">
              All beats →
            </Link>
          </div>
          <BeatCard beat={featured} variant="featured" />
        </section>
      )}

      {/* NEWEST */}
      {newest.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-black mb-6">Newest</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newest.map((b) => (
              <BeatCard key={b.id} beat={b} />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {beats.length === 0 && (
        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-4">🎧</div>
          <h2 className="text-2xl font-black mb-2">No beats yet</h2>
          <p className="text-[var(--color-text-muted)]">
            Head to the{" "}
            <Link href="/admin" className="text-[var(--color-accent)] hover:underline">
              admin panel
            </Link>{" "}
            to upload your first beat.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-black text-2xl">{value}</div>
      <div className="text-[var(--color-text-dim)] uppercase tracking-wider text-xs mt-1">{label}</div>
    </div>
  );
}
