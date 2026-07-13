# Handoff — Beats by Dave

Built for Chase (a.k.a. "Dave"). This doc is the exact checklist to get from
"code on my Pi" to "live site accepting payments."

## What's already built

A complete Next.js 15 storefront with:

- Home, catalog, beat detail, cart, checkout, success pages
- Admin dashboard, beats list, orders list, drag-and-drop upload, login
- PayPal Smart Buttons (sandbox + live)
- Supabase schema for beats + orders + signed download tokens
- License PDFs (MP3, WAV, Trackouts, Exclusive) generated per order
- Receipt email via Resend with download link
- Sitemap, robots, dark theme, mobile-friendly
- TypeScript clean, `pnpm build` passing

The codebase lives at `~/beats-by-dave/` on Thot3Pi.

## What Chase still needs to do (in order)

### 1. Buy the domain (~$12)

Pick a domain. Good options:
- `beatsbydave.com`
- `beatsbydave.net`
- `cashdavisbeats.com` (if he wants to lean into the Cash Money homage)

Buy from Namecheap, Cloudflare, or Porkbun. **.com** is preferred for trust.

### 2. Set up Supabase (free tier)

1. Go to https://supabase.com → New project
2. Region: pick one close to customers (US East is fine for US buyers)
3. Save the database password somewhere safe (not in the repo)
4. SQL Editor → New query → paste contents of `supabase/schema.sql` → Run
5. SQL Editor → New query → paste contents of `supabase/seed.sql` → Run (3 placeholder beats so the site isn't empty during setup)
6. Storage → New bucket → `previews` (Public) → Create
7. Storage → New bucket → `media` (Private) → Create
8. Authentication → Users → Add user → email + password (this is Chase's admin login)
9. Project Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (treat as a secret — server-side only)

### 3. Set up PayPal Business

1. https://paypal.com → Business account (Chase will need his bank/SSN info)
2. https://developer.paypal.com → My Apps & Credentials → Create App
3. Start with **Sandbox** credentials while testing
4. Sandbox/Live → copy Client ID + Secret
5. Webhooks → Add webhook:
   - URL: `https://YOUR-DOMAIN.com/api/webhook/paypal`
   - Events: `CHECKOUT.ORDER.COMPLETED`, `PAYMENT.CAPTURE.COMPLETED`
   - Copy the Webhook ID

PayPal sandbox lets you create fake buyer accounts at https://developer.paypal.com/dashboard/accounts — use those to test before going live.

### 4. Set up Resend (free tier)

1. https://resend.com → sign up
2. Domains → Add Domain → follow DNS records
3. API Keys → Create → copy
4. Set `RESEND_FROM` to `"Beats by Dave <beats@yourdomain.com>"` (after the domain is verified)

### 5. Deploy to Vercel

1. https://vercel.com → sign up with GitHub
2. Import the repo (push `~/beats-by-dave/` to a new GitHub repo first — Chase's account, or a shared `Thot333Process` org repo)
3. Environment Variables → add all the keys from `.env.example` with real values
4. Deploy
5. Settings → Domains → add the custom domain Chase bought → follow DNS instructions

### 6. Replace the placeholder content

Before announcing the site:

- `/src/app/about/page.tsx` — write the real bio
- `/src/app/contact/page.tsx` — real email + social handles
- `/src/components/Header.tsx` — the "$" logo can stay, or replace with the real logo file in `/public/`
- `/src/app/page.tsx` — `NEXT_PUBLIC_PRODUCER_TAGLINE` in env
- `/src/app/licenses/page.tsx` — confirm the tier rules match what Chase wants

### 7. Upload the real beats

1. Go to `https://your-domain.com/admin/login`
2. Sign in with the Supabase auth email/password from step 2
3. Click **+ Upload Beat**
4. For each beat:
   - **Title, Genre, BPM, Key** (Chase should know these)
   - **Preview MP3** — **critical**: 30–60 second clipped preview with a "Produced by Beats by Dave" voice tag at the start. NOT the full song.
   - **Cover art** — square JPG/PNG
   - **Full MP3** — delivered to MP3 lease buyers
   - **Full WAV** — delivered to WAV and Trackouts buyers
   - **Trackouts** (stems ZIP) — delivered to Trackouts and Exclusive buyers
   - **Prices** for all four tiers (defaults are $29.99 / $49.99 / $99.99 / $499.99 — adjust per beat)
   - Toggle **Published** so it goes live
5. Test the flow yourself with a PayPal sandbox account before sharing with anyone

### 8. Test the full purchase path

End-to-end test before going public:

1. Browse to `/beats`
2. Click a beat
3. Hit **Add to Cart** → **Checkout**
4. Pay with the PayPal sandbox buyer account
5. Confirm: success page shows download link
6. Confirm: receipt email arrives
7. Confirm: clicking the download link returns the audio file
8. Confirm: the license PDF downloads and looks right

### 9. Switch to PayPal Live

Once the test flow works:

- `PAYPAL_ENVIRONMENT=live`
- Replace sandbox Client ID/Secret with live
- Create the live webhook in PayPal Live app
- Test with a real $1 purchase then refund it

## Ongoing

- **Beats sold as Exclusive**: the admin capture route automatically delists them. No manual action needed.
- **Customer support**: buyers get a download link valid for 24 hours. If they ask for a re-send, hit `/admin/orders` and the order row has everything you need to manually send a fresh token.
- **Taxes**: PayPal reports 1099-K for US sellers above thresholds. Chase should set aside ~25–30% of revenue for taxes depending on his state.

## Common issues

- **"Unauthorized" on upload**: cookies weren't set. Re-login at `/admin/login`.
- **"Beat lookup failed"**: Supabase service role key missing or wrong.
- **PayPal button doesn't load**: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is empty or sandbox mismatch.
- **Download link expired**: regenerate by sending the buyer a fresh token from the admin orders page (or re-run the capture manually — see `src/app/api/checkout/capture/route.ts` for the format).

## Cost summary

| | Per year |
|---|---|
| Domain | ~$12 |
| Vercel hosting | $0 (free tier) |
| Supabase DB + storage | $0 (free tier, 500MB / 1GB) |
| Resend email | $0 (free tier, 3k/month) |
| PayPal fees | ~3% per transaction |
| **Total fixed** | **$12/year + transaction fees** |

Supabase Pro ($25/mo) only needed once Chase exceeds the free tier — likely years away at indie producer scale.

## Where things live

| | Path |
|---|---|
| Repo | `/home/thot3process/beats-by-dave/` |
| Schema | `supabase/schema.sql` |
| License terms | `src/lib/licenses.ts` |
| Admin login | `/admin/login` |
| Upload | `/admin/upload` |
| Orders | `/admin/orders` |