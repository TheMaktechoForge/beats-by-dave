// Server-only Supabase clients. Must not be imported into a
// "use client" file (next/headers is server-only).
//
// Use:
//   createServerSupabase()  — server components / route handlers (RLS-aware)
//   createServiceSupabase() — bypasses RLS; for webhooks, admin ops, signed URLs
//   createBrowserSupabase() — client components; in ./supabase-browser.ts

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client that uses the user's cookies so RLS +
// auth.uid() work for the admin dashboard.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { createServerClient } = await import("@supabase/ssr");
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — ignore.
        }
      },
    },
  });
}

// Service-role client — bypasses RLS. Server-only.
export function createServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Storage helpers ----------------------------------------------------------

export async function getSignedUrl(path: string, ttlSeconds = 60 * 60 * 24) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.storage
    .from("media")
    .createSignedUrl(path, ttlSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function getPublicUrl(path: string) {
  const supabase = createServiceSupabase();
  const { data } = supabase.storage.from("previews").getPublicUrl(path);
  return data.publicUrl;
}