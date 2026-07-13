// Cart store — Zustand with localStorage persistence.
// Cart items reference Beat records by ID so we can re-hydrate
// from the server on load.

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Beat, CartItem, LicenseTier } from "./types";

interface CartState {
  items: CartItem[];
  add: (beat: Beat, license: LicenseTier) => void;
  remove: (beatId: string, license: LicenseTier) => void;
  clear: () => void;
  totalCents: () => number;
}

function priceFor(beat: Beat, license: LicenseTier): number {
  switch (license) {
    case "mp3": return beat.price_mp3_cents ?? 0;
    case "wav": return beat.price_wav_cents ?? 0;
    case "trackouts": return beat.price_trackouts_cents ?? 0;
    case "exclusive": return beat.price_exclusive_cents ?? 0;
  }
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (beat, license) => {
        const existing = get().items.find(
          (i) => i.beat.id === beat.id && i.license === license
        );
        if (existing) return; // de-dupe
        set({ items: [...get().items, { beat, license }] });
      },
      remove: (beatId, license) =>
        set({
          items: get().items.filter(
            (i) => !(i.beat.id === beatId && i.license === license)
          ),
        }),
      clear: () => set({ items: [] }),
      totalCents: () =>
        get().items.reduce((s, i) => s + priceFor(i.beat, i.license), 0),
    }),
    { name: "beats-by-dave-cart" }
  )
);

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function cartItemPrice(item: CartItem): number {
  return priceFor(item.beat, item.license);
}

export { priceFor };