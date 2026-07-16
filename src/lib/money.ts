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
  license: "audio" | "exclusive"
): number {
  if (license === "audio") return beat.price_mp3_cents ?? 0;
  return beat.price_exclusive_cents ?? 0;
}

export function cartItemPrice(item: { beat: { price_mp3_cents: number | null; price_wav_cents: number | null; price_trackouts_cents: number | null; price_exclusive_cents: number | null }; license: "audio" | "exclusive" }): number {
  return priceFor(item.beat, item.license);
}
