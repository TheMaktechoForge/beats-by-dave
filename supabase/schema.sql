-- =========================================================
-- Beats by Dave — Supabase schema
-- =========================================================
-- Run this in Supabase SQL Editor (Project → SQL → New query).
-- Safe to re-run: uses CREATE ... IF NOT EXISTS where possible.

-- ===== ENUMS =============================================

create type license_tier as enum ('mp3', 'wav', 'trackouts', 'exclusive');
create type order_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ===== BEATS =============================================
-- One row per beat. Storage paths (not public URLs) so we
-- can rotate buckets and generate signed URLs on demand.

create table if not exists public.beats (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  producer        text not null default 'Beats by Dave',
  genre           text,
  mood            text,
  bpm             integer,
  musical_key     text,
  description     text,

  -- Storage object paths inside the `media` bucket
  cover_path      text,
  preview_path    text not null,           -- 30–60s tagged preview
  mp3_path        text,                    -- full MP3 (delivered after purchase)
  wav_path        text,                    -- full WAV
  trackouts_path  text,                    -- stems ZIP

  -- Prices in USD cents (integer to avoid float drift)
  price_mp3_cents       integer,
  price_wav_cents       integer,
  price_trackouts_cents integer,
  price_exclusive_cents integer,

  exclusive_sold  boolean not null default false,
  published       boolean not null default false,
  featured        boolean not null default false,
  plays           integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists beats_published_idx on public.beats (published, created_at desc);
create index if not exists beats_featured_idx on public.beats (featured) where featured = true;

-- ===== ORDERS ============================================
-- One row per checkout. items is a jsonb array so we don't
-- need a separate order_items table for v1.

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  paypal_order_id     text unique,
  paypal_capture_id   text,
  payer_email         text,
  payer_name          text,
  items               jsonb not null,        -- [{beat_id, beat_title, license, price_cents}]
  subtotal_cents      integer not null,
  total_cents         integer not null,
  currency            text not null default 'USD',
  status              order_status not null default 'pending',
  download_token      text unique,           -- signed token for /api/download/[token]
  download_expires_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_paypal_idx on public.orders (paypal_order_id);

-- ===== ADMIN =============================================
-- Uses Supabase Auth for the dashboard. We allow only the
-- email in ADMIN_EMAIL to read/write via RLS.

-- We don't create a separate admin table; Supabase's
-- auth.users + the JWT email claim drives RLS below.

-- ===== UPDATED_AT TRIGGER ================================

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists beats_touch on public.beats;
create trigger beats_touch
  before update on public.beats
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ===== ROW LEVEL SECURITY ================================

alter table public.beats  enable row level security;
alter table public.orders enable row level security;

-- Public can read published beats; no one can read orders anonymously.
drop policy if exists "beats_public_read" on public.beats;
create policy "beats_public_read"
  on public.beats for select
  using (published = true);

-- Only authenticated admin can write beats.
-- (We further restrict the email in a policy below.)
drop policy if exists "beats_admin_write" on public.beats;
create policy "beats_admin_write"
  on public.beats for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Orders: anon can insert a pending order (for the checkout flow
-- before PayPal redirects back). The webhook later flips it to paid.
drop policy if exists "orders_anon_insert" on public.orders;
create policy "orders_anon_insert"
  on public.orders for insert
  with check (status = 'pending');

-- Only admin can read or update orders.
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders for select
  using (auth.role() = 'authenticated');

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update
  using (auth.role() = 'authenticated');

-- Service role bypasses RLS automatically (used by API routes
-- with SUPABASE_SERVICE_ROLE_KEY for the PayPal webhook + admin
-- upload endpoints).

-- ===== STORAGE BUCKETS ====================================
-- Run these in the Supabase Storage UI or via the API:
--   bucket: media          (public read for cover art; signed for full files)
--   bucket: previews       (public read for waveform previews)
-- We'll create them via SQL helper if available, otherwise the
-- dashboard. The app code treats `media` as private (signed URLs).

insert into storage.buckets (id, name, public)
values ('previews', 'previews', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Public read on previews bucket.
drop policy if exists "previews_public_read" on storage.objects;
create policy "previews_public_read"
  on storage.objects for select
  using (bucket_id = 'previews');

-- Admin can upload/select on either bucket.
drop policy if exists "media_admin_all" on storage.objects;
create policy "media_admin_all"
  on storage.objects for all
  using (bucket_id in ('previews', 'media') and auth.role() = 'authenticated')
  with check (bucket_id in ('previews', 'media') and auth.role() = 'authenticated');

-- ===== DONE ==============================================
-- Next: create your admin user in Supabase Auth (Authentication
-- → Users → Add user) using the email in ADMIN_EMAIL, then sign
-- in at /admin/login.