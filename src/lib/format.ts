// Server-only URL resolution helpers.
// Imports supabase.ts which uses next/headers — must stay out of client components.

import { getSignedUrl, getPublicUrl } from "./supabase";
import type { Beat } from "./types";

export interface ResolvedBeatUrls {
  cover_url: string | null;
  preview_url: string;
}

export async function resolveBeatUrls(beat: Beat): Promise<ResolvedBeatUrls> {
  const preview_url = beat.preview_path.startsWith("http")
    ? beat.preview_path
    : await getPublicUrl(beat.preview_path);

  let cover_url: string | null = null;
  if (beat.cover_path) {
    cover_url = beat.cover_path.startsWith("http")
      ? beat.cover_path
      : await getSignedUrl(beat.cover_path, 60 * 60 * 24);
  }

  return { cover_url, preview_url };
}
