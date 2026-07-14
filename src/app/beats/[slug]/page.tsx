import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase";
import { resolveBeatUrls } from "@/lib/format";
import type { BeatWithUrls } from "@/lib/types";
import { WavePlayer } from "@/components/WavePlayer";
import { LicenseSelector } from "@/components/LicenseSelector";
import { formatPrice } from "@/lib/money";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBeat(slug: string): Promise<BeatWithUrls | null> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  if (data.exclusive_sold) return null;
  const urls = await resolveBeatUrls(data);
  return { ...data, ...urls };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const beat = await getBeat(slug);
  if (!beat) return { title: "Beat not found" };
  return {
    title: `${beat.title} — Beats by Dave`,
    description: `${beat.genre ?? "Beat"} • ${beat.bpm ?? "?"} BPM • ${beat.musical_key ?? ""}`.trim(),
  };
}

export default async function BeatDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const beat = await getBeat(slug);
  if (!beat) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link href="/beats" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
        ← Back to all beats
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div>
          {beat.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beat.cover_url} alt={beat.title} className="w-full aspect-square object-cover rounded-xl border border-[var(--color-border)]" />
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] flex items-center justify-center">
              <div className="text-9xl font-black text-[var(--color-accent)] opacity-30">$</div>
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">
            {beat.genre ?? "Beat"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">{beat.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--color-text-muted)]">
            {beat.bpm && <span><strong className="text-white">{beat.bpm}</strong> BPM</span>}
            {beat.musical_key && <span><strong className="text-white">{beat.musical_key}</strong></span>}
            {beat.mood && <span><strong className="text-white">{beat.mood}</strong></span>}
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Preview</div>
            <WavePlayer audio={beat.preview_url} height={80} />
          </div>

          {beat.description && (
            <p className="mt-8 text-[var(--color-text-muted)] leading-relaxed">{beat.description}</p>
          )}

          <div className="mt-10">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-3">
              Choose a license
            </div>
            <LicenseSelector beat={beat} />
          </div>
        </div>
      </div>
    </div>
  );
}