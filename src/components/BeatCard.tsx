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

  if (variant === "featured") {
    return (
      <Link
        href={`/beats/${beat.slug}`}
        className="card block p-6 md:p-8 group"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">
              Featured Beat
            </div>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">{beat.title}</h3>
            <div className="text-sm text-[var(--color-text-muted)] mt-2">
              {beat.genre ?? "Beat"} {beat.bpm ? `• ${beat.bpm} BPM` : ""} {beat.musical_key ? `• ${beat.musical_key}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--color-text-dim)]">Starting at</div>
            <div className="text-2xl font-black text-[var(--color-accent)]">
              {formatPrice(price)}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <WavePlayer audio={beat.preview_url} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/beats/${beat.slug}`} className="card group flex flex-col">
      {beat.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={beat.cover_url} alt={beat.title} className="w-full aspect-square object-cover" />
      ) : (
        <div className="aspect-square bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] flex items-center justify-center">
          <div className="text-4xl font-black text-[var(--color-accent)] opacity-30">$</div>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--color-accent)] transition">
          {beat.title}
        </h3>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">
          {beat.genre ?? "Beat"} {beat.bpm ? `• ${beat.bpm} BPM` : ""} {beat.musical_key ? `• ${beat.musical_key}` : ""}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-dim)]">From</span>
          <span className="font-black text-[var(--color-accent)]">{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  );
}