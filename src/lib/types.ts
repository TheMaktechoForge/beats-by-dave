// Domain types — match supabase/schema.sql exactly.

export type LicenseTier = "audio" | "exclusive";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Beat {
  id: string;
  slug: string;
  title: string;
  producer: string;
  genre: string | null;
  mood: string | null;
  bpm: number | null;
  musical_key: string | null;
  description: string | null;
  cover_path: string | null;
  preview_path: string;
  mp3_path: string | null;
  wav_path: string | null;
  trackouts_path: string | null;
  price_mp3_cents: number | null;
  price_wav_cents: number | null;
  price_trackouts_cents: number | null;
  price_exclusive_cents: number | null;
  exclusive_sold: boolean;
  published: boolean;
  featured: boolean;
  plays: number;
  created_at: string;
  updated_at: string;
}

// Resolved URLs after signed-URL generation on the server side.
export interface BeatWithUrls extends Beat {
  cover_url: string | null;
  preview_url: string;
}

export interface CartItem {
  beat: Beat;
  license: LicenseTier;
}

export interface OrderItemSnapshot {
  beat_id: string;
  beat_title: string;
  license: LicenseTier;
  price_cents: number;
}

export interface Order {
  id: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  payer_email: string | null;
  payer_name: string | null;
  items: OrderItemSnapshot[];
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  status: OrderStatus;
  download_token: string | null;
  download_expires_at: string | null;
  created_at: string;
  updated_at: string;
}