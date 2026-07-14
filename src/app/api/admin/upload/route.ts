// Admin upload — accepts multipart form-data with files + beat fields,
// uploads files to Supabase Storage, and inserts a beat row.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "beat";
}

function parseDollars(v: string | null): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  if (isNaN(n)) return null;
  return Math.round(n * 100);
}

export async function POST(req: NextRequest) {
  const authClient = await createServerSupabase();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServiceSupabase();

  const form = await req.formData();

  const title = (form.get("title") as string | null)?.trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const preview = form.get("preview") as File | null;
  if (!preview) return NextResponse.json({ error: "Preview MP3 required" }, { status: 400 });

  // Generate a slug; ensure uniqueness by appending a short suffix if needed.
  let slug = slugify(title);
  const { data: existing } = await admin.from("beats").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  // Upload helper.
  async function uploadTo(bucket: "previews" | "media", file: File, path: string) {
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(bucket).upload(path, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
    if (error) throw new Error(`Upload ${path} failed: ${error.message}`);
    return path;
  }

  const id = crypto.randomUUID();

  // Upload preview (public bucket) — strip the file ext into the storage path
  // but keep it human readable.
  const previewExt = preview.name.split(".").pop() ?? "mp3";
  const previewPath = `${slug}.${previewExt}`;
  await uploadTo("previews", preview, previewPath);

  // Optional files
  async function maybeUpload(field: string, ext: string, bucket: "media" | "previews" = "media") {
    const f = form.get(field) as File | null;
    if (!f) return null;
    const p = `${slug}.${ext}`;
    await uploadTo(bucket, f, p);
    return p;
  }

  const coverPath = await maybeUpload("cover", "jpg");
  const mp3Path = await maybeUpload("mp3", "mp3");
  const wavPath = await maybeUpload("wav", "wav");
  const trackoutsPath = await maybeUpload("trackouts", "zip");

  const { data: beat, error: insertErr } = await admin.from("beats").insert({
    slug,
    title,
    producer: process.env.NEXT_PUBLIC_PRODUCER_NAME ?? "Beats by Dave",
    genre: (form.get("genre") as string | null) || null,
    description: (form.get("description") as string | null) || null,
    cover_path: coverPath,
    preview_path: previewPath,
    mp3_path: mp3Path,
    wav_path: wavPath,
    trackouts_path: trackoutsPath,
    price_mp3_cents: parseDollars(form.get("price_mp3") as string | null),
    price_wav_cents: parseDollars(form.get("price_wav") as string | null),
    price_trackouts_cents: parseDollars(form.get("price_trackouts") as string | null),
    price_exclusive_cents: parseDollars(form.get("price_exclusive") as string | null),
    published: form.get("published") === "true",
    featured: form.get("featured") === "true",
  }).select("id, slug").single();

  if (insertErr) {
    console.error("Insert failed", insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: beat?.id, slug: beat?.slug });
}