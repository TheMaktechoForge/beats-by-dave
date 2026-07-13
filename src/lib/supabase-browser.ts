"use client";

// Browser-only Supabase client. Imports must stay out of any file
// that also imports next/headers (see ./supabase.ts).

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserSupabase() {
  return createBrowserClient(url, anonKey);
}