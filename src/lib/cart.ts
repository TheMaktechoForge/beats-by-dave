// Cart store — Zustand with localStorage persistence.
// Cart items reference Beat records by ID so we can re-hydrate
// from the server on load.
//
// Formatting helpers (formatPrice, priceFor, cartItemPrice) live in
// ./format.ts so they're safe in both server and client components.

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Beat, CartItem, LicenseTier } from "./types";
import { formatPrice, priceFor } from "./money";

export { formatPrice, priceFor };

interface CartState {
  items: CartItem[];
  add: (beat: Beat, license: LicenseTier) => void;
  remove: (beatId: string, license: LicenseTier) => void;
  clear: () => void;
  totalCents: () => number;
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

export function cartItemPrice(item: CartItem): number {
  return priceFor(item.beat, item.license);
}
