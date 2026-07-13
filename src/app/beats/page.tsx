import { createServiceSupabase } from "@/lib/supabase";
import { resolveBeatUrls } from "@/lib/format";
import type { BeatWithUrls } from "@/lib/types";
import { BeatCard } from "@/components/BeatCard";

export const revalidate = 60;

async function getBeats(): Promise<BeatWithUrls[]> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .eq("published", true)
    .eq("exclusive_sold", false)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const out: BeatWithUrls[] = [];
  for (const b of data) {
    const urls = await resolveBeatUrls(b);
    out.push({ ...b, ...urls });
  }
  return out;
}

export default async function BeatsPage() {
  const beats = await getBeats();
  const genres = Array.from(new Set(beats.map((b) => b.genre).filter(Boolean))) as string[];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">Catalog</div>
          <h1 className="text-4xl md:text-5xl font-black">All Beats</h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            {beats.length} beat{beats.length === 1 ? "" : "s"} available. Click any beat to preview and license.
          </p>
        </div>
      </div>

      {genres.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map((g) => (
            <span key={g} className="px-3 py-1 text-xs rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
              {g}
            </span>
          ))}
        </div>
      )}

      {beats.length === 0 ? (
        <div className="text-center py-24 text-[var(--color-text-muted)]">
          No beats published yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {beats.map((b) => (
            <BeatCard key={b.id} beat={b} />
          ))}
        </div>
      )}
    </div>
  );
}