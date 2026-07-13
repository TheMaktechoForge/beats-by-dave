# Beats by Dave

A focused beat storefront for selling licenses on beats. Built to be cheap
to run ($12/year for a domain, $0/mo for everything else until scale) and
simple for the artist to operate.

## Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript 5**
- **Tailwind CSS v4** for styling
- **Supabase** — Postgres for beats/orders, Storage for audio + cover art, Auth for the admin dashboard
- **PayPal Smart Buttons** via `@paypal/react-paypal-js` (Orders API v2 on the server)
- **WaveSurfer.js 7** for the waveform player
- **pdf-lib** for license PDFs (generated on demand for every order)
- **Resend** for the receipt email
- **Zustand** for the client-side cart (persists in `localStorage`)

## Local development

```bash
pnpm install
cp .env.example .env.local        # fill in Supabase + PayPal + Resend keys
pnpm dev                          # http://localhost:3000
```

## Deploy

Designed for **Vercel** free tier.

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add every env var from `.env.example` to the Vercel project settings.
4. Deploy. Each push to `main` redeploys.

## Database setup (Supabase)

1. Create a free project at https://supabase.com
2. Open SQL Editor, paste and run `supabase/schema.sql`
3. Open SQL Editor again, paste and run `supabase/seed.sql` (3 placeholder beats)
4. Storage → create two buckets:
   - `previews` (public read)
   - `media` (private)
5. Authentication → Users → Add user (email + password) — this is the admin login

## Payment setup (PayPal)

1. Create a PayPal Business account at https://paypal.com
2. https://developer.paypal.com → My Apps & Credentials → Create App
3. Use **Sandbox** keys for dev (set `PAYPAL_ENVIRONMENT=sandbox`)
4. Switch to **Live** keys when ready for real payments (set `PAYPAL_ENVIRONMENT=live`)
5. Webhooks → Add webhook:
   - URL: `https://your-domain.com/api/webhook/paypal`
   - Events: `CHECKOUT.ORDER.COMPLETED`, `PAYMENT.CAPTURE.COMPLETED`
   - Copy the Webhook ID into `PAYPAL_WEBHOOK_ID`

## Email (Resend)

1. Sign up at https://resend.com (free tier = 100 emails/day, 3,000/month)
2. Add and verify your sending domain
3. Copy API key → `RESEND_API_KEY`
4. Set `RESEND_FROM` to something like `"Beats by Dave <beats@yourdomain.com>"`

## Pages

| Route | Purpose |
|---|---|
| `/` | Hero + featured beat + newest grid |
| `/beats` | Full catalog |
| `/beats/[slug]` | Beat detail + license selector + waveform |
| `/licenses` | License tier explainer |
| `/cart` | Cart with checkout CTA |
| `/checkout` | PayPal Smart Buttons |
| `/checkout/success?token=…` | Post-payment download landing |
| `/about`, `/contact`, `/terms` | Static info pages |
| `/admin` | Owner dashboard (auth required) |
| `/admin/upload` | Drag-and-drop upload form |
| `/admin/beats` | Beat list with status badges |
| `/admin/orders` | Order history |
| `/admin/login` | Supabase auth sign-in |

## API routes

| Route | Purpose |
|---|---|
| `POST /api/checkout` | Create PayPal order + pending DB order |
| `POST /api/checkout/capture` | Capture payment, mark paid, generate download token, email receipt |
| `GET /api/download/[token]` | Exchange token for signed file URL (or render download page for multi-item orders) |
| `GET /api/download/[token]/license/[title]/[license]` | Generate license PDF |
| `POST /api/webhook/paypal` | Backup payment confirmation via PayPal webhook |
| `POST /api/admin/upload` | Multipart upload — files to Storage, beat row to DB |

## Data model

See [`supabase/schema.sql`](./supabase/schema.sql). Quick map:

- `beats` — one row per beat, storage paths + cents-denominated prices
- `orders` — one row per checkout, items in jsonb, status enum, download token
- `storage.buckets` — `previews` (public) and `media` (signed URLs only)

All prices are **integer cents** to avoid float drift. Display layer formats them.

## What "done" looks like for v1

- [ ] Beat cover art uploaded (square, ≥ 800×800)
- [ ] Preview MP3s are **30–60s tagged clips**, not full songs
- [ ] Full MP3 + WAV + trackouts uploaded for each beat
- [ ] Prices set per beat for all four license tiers
- [ ] `NEXT_PUBLIC_PRODUCER_NAME` and tagline match the actual brand
- [ ] Real email + social handles in `/contact` and `/about`
- [ ] PayPal Business account connected with live keys
- [ ] Resend domain verified
- [ ] Custom domain connected to Vercel

## Out of scope for v1 (intentionally cut)

These were in the original ChatGPT plan. **Cut on purpose** for a focused launch:

- Coupon / discount codes
- Customer accounts (buyers get download links by email instead)
- Sales analytics beyond the dashboard totals
- Trending / favorites / similar-beat recommendations
- AI-powered search
- Progressive Web App
- Custom audio upload UI beyond the admin panel

If any of these are wanted after launch, they're additive — none of them require rewriting what's here.