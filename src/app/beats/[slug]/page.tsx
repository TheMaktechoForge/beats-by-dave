import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase";
import { resolveBeatUrls } from "@/lib/format";
import type { BeatWithUrls } from "@/lib/types";
import { WavePlayer } from "@/components/WavePlayer";
import { LicenseSelector } from "@/components/LicenseSelector";
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
  // Allow viewing sold beats (they show as SOLD in UI), but not unpublished ones.
  const urls = await resolveBeatUrls(data);
  return { ...data, ...urls };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const beat = await getBeat(slug);
  if (!beat) return { title: "Beat not found" };
  return {
    title: `${beat.title} — Beats by Dave`,
    description: beat.genre ? `${beat.genre} beat by Beats by Dave` : `Beat by Beats by Dave`,
  };
}

export default async function BeatDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const beat = await getBeat(slug);
  if (!beat) notFound();

  const sold = beat.exclusive_sold;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link href="/beats" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
        ← Back to all beats
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div>
          <div className="relative">
            {beat.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beat.cover_url} alt={beat.title} className={`w-full aspect-square object-cover rounded-xl border border-[var(--color-border)] ${sold ? "opacity-40" : ""}`} />
            ) : (
              <div className={`w-full aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] flex items-center justify-center ${sold ? "opacity-40" : ""}`}>
                <div className="text-9xl font-black text-[var(--color-accent)] opacity-30">$</div>
              </div>
            )}
            {sold && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[140%] h-0.5 bg-[var(--color-accent)] rotate-45" />
                  <div className="absolute w-[140%] h-0.5 bg-[var(--color-accent)] -rotate-45" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-[var(--color-bg)]/90 text-[var(--color-accent)] font-black text-3xl tracking-widest px-6 py-2 rounded">
                    SOLD
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">
            {beat.genre ?? "Beat"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">{beat.title}</h1>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2">Preview</div>
            {sold ? (
              <div className="text-center py-8 rounded-lg border border-[var(--color-border)]">
                <div className="text-2xl font-black text-[var(--color-accent)]">SOLD</div>
                <div className="text-sm text-[var(--color-text-muted)] mt-2">
                  Exclusive rights have been transferred. Preview no longer available.
                </div>
              </div>
            ) : (
              <WavePlayer audio={beat.preview_url} height={80} />
            )}
          </div>

          {beat.description && (
            <p className="mt-8 text-[var(--color-text-muted)] leading-relaxed">{beat.description}</p>
          )}

          {!sold && (
            <div className="mt-10">
              <div className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-3">
                Choose a license
              </div>
              <LicenseSelector beat={beat} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
