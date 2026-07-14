// Pure money/format utilities — safe in both server and client components.

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function priceFor(
  beat: {
    price_mp3_cents: number | null;
    price_wav_cents: number | null;
    price_trackouts_cents: number | null;
    price_exclusive_cents: number | null;
  },
  license: "mp3" | "wav" | "trackouts" | "exclusive"
): number {
  switch (license) {
    case "mp3": return beat.price_mp3_cents ?? 0;
    case "wav": return beat.price_wav_cents ?? 0;
    case "trackouts": return beat.price_trackouts_cents ?? 0;
    case "exclusive": return beat.price_exclusive_cents ?? 0;
  }
}

export function cartItemPrice(item: { beat: { price_mp3_cents: number | null; price_wav_cents: number | null; price_trackouts_cents: number | null; price_exclusive_cents: number | null }; license: "mp3" | "wav" | "trackouts" | "exclusive" }): number {
  return priceFor(item.beat, item.license);
}
