"use client";

import Link from "next/link";
import type { BeatWithUrls } from "@/lib/types";
import { formatPrice } from "@/lib/money";
import { WavePlayer } from "./WavePlayer";

interface BeatCardProps {
  beat: BeatWithUrls;
  variant?: "grid" | "list" | "featured";
}

export function BeatCard({ beat, variant = "grid" }: BeatCardProps) {
  const price =
    beat.price_mp3_cents ??
    beat.price_wav_cents ??
    beat.price_trackouts_cents ??
    beat.price_exclusive_cents ??
    0;

  const sold = beat.exclusive_sold;

  if (variant === "featured") {
    return (
      <div className="card block p-6 md:p-8 group relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">
              Featured Beat
            </div>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">{beat.title}</h3>
            {beat.genre && (
              <div className="text-sm text-[var(--color-text-muted)] mt-2">{beat.genre}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--color-text-dim)]">Starting at</div>
            <div className="text-2xl font-black text-[var(--color-accent)]">
              {formatPrice(price)}
            </div>
          </div>
        </div>
        <div className="mt-6">
          {sold ? (
            <div className="text-center py-8">
              <div className="text-3xl font-black text-[var(--color-accent)]">SOLD</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-2">Exclusive rights transferred</div>
            </div>
          ) : (
            <WavePlayer audio={beat.preview_url} />
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href={sold ? "#" : `/beats/${beat.slug}`} className={`card group flex flex-col ${sold ? "cursor-not-allowed" : ""}`}>
      <div className="relative">
        {beat.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beat.cover_url} alt={beat.title} className={`w-full aspect-square object-cover ${sold ? "opacity-40" : ""}`} />
        ) : (
          <div className={`aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] flex items-center justify-center ${sold ? "opacity-40" : ""}`}>
            <div className="text-4xl font-black text-[var(--color-accent)] opacity-30">$</div>
          </div>
        )}
        {sold && (
          <>
            {/* Diagonal slash lines forming an X across the image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-[140%] h-0.5 bg-[var(--color-accent)] rotate-45" />
              <div className="absolute w-[140%] h-0.5 bg-[var(--color-accent)] -rotate-45" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-[var(--color-bg)]/90 text-[var(--color-accent)] font-black text-xl tracking-widest px-4 py-1 rounded">
                SOLD
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold text-lg leading-tight transition ${sold ? "text-[var(--color-text-dim)]" : "group-hover:text-[var(--color-accent)]"}`}>
          {beat.title}
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          {sold ? (
            <span className="text-xs text-[var(--color-text-dim)]">Exclusive</span>
          ) : (
            <span className="text-xs text-[var(--color-text-dim)]">From</span>
          )}
          <span className={`font-black ${sold ? "text-[var(--color-text-dim)] line-through" : "text-[var(--color-accent)]"}`}>
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
