# COD Store — Next.js COD Ecommerce (Algeria)

A production-ready, ultra-fast, mobile-first **cash-on-delivery product order page**
engine for Algerian Facebook/Instagram ecommerce.

Not a long landing page: the product image, price, colors and a very short order
form — nothing else.

## Stack

- **Next.js 14** (App Router, Server Components by default, static product pages)
- **TypeScript + Tailwind CSS**
- **Supabase** — PostgreSQL (`orders`), Auth (admin), RLS
- **Google Sheets API** — order sync (Supabase stays the source of truth)
- **Meta Pixel + Conversions API** — PageView / ViewContent / InitiateCheckout / Lead
- Deploys cleanly to **Vercel**

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

Open `http://localhost:3000` → the default product (`paris-vintage-cap`).

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | inserts orders, bypasses RLS |
| `GOOGLE_SHEETS_ID` | **server only** | spreadsheet ID for order sync |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | **server only** | Google service account |
| `GOOGLE_PRIVATE_KEY` | **server only** | private key, `\n` newlines |
| `NEXT_PUBLIC_META_PIXEL_ID` | client + server | Meta Pixel ID |
| `META_ACCESS_TOKEN` | **server only** | Conversions API token |
| `NEXT_PUBLIC_SITE_URL` | build | canonical / OG / sitemap base URL |

Never put secrets in `NEXT_PUBLIC_*` variables. The admin API route
(`/api/admin/orders/[id]`) requires an authenticated Supabase user; the order API
itself is public by design (it's the checkout).

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/migrations/001_orders.sql` (creates the
   `orders` table, order-number sequence, indexes and RLS).
3. Copy the project URL + anon key + service-role key into `.env.local`.
4. **Create the admin user**: Authentication → Users → **Add user** → create the
   email/password used to access `/admin`. The middleware protects every
   `/admin/*` route.

## 2. Google Sheets setup

1. Google Cloud Console → create a **service account** → generate a JSON key.
2. Create a Google Sheet named with a tab called **`Orders`**, and add this
   header row in row 1:

   ```
   Order ID	Date	Time	Product	Variant	Quantity	Customer	Phone	Wilaya	Delivery	Commune	Address	Stopdesk	Unit Price	Total	Status	Source	Campaign
   ```

3. **Share the sheet** with the service account email (Editor).
4. Copy the spreadsheet ID (from its URL) into `GOOGLE_SHEETS_ID`,
   plus the service account email and private key into the env vars.

If Sheets is down or misconfigured, **orders still succeed** — the row is simply
marked `google_sheet_synced = false` in Supabase and you can re-sync manually.

## 3. Meta Pixel + Conversions API setup

1. Create a pixel in Meta Events Manager, copy its ID to `NEXT_PUBLIC_META_PIXEL_ID`.
2. For server-side deduplicated events: Events Manager → your pixel → Settings →
   Conversions API → generate an access token → `META_ACCESS_TOKEN`.

Events fired:

| Event | Where |
|---|---|
| `PageView` | layout, after pixel loads |
| `ViewContent` | product page (client) |
| `InitiateCheckout` | order form shown |
| `Lead` | **only after** the server returns `success` (browser pixel + server CAPI with matching `event_id`) |

No customer PII (name/phone/address) is ever sent to Meta.

Attribution (`fbclid`, `utm_*`) is captured on first landing (localStorage,
first-touch) and saved with each order — visible in the admin order detail and
the Google Sheet for campaign-level analysis.

## 4. Deploy to Vercel

1. Push the repo to GitHub/GitLab.
2. Vercel → **Add New Project** → import → framework auto-detected (Next.js).
3. Add all env vars from `.env.example` (production + preview).
4. Deploy. The product pages are statically generated; the order API is dynamic.

**Note on rate limiting**: `lib/rate-limit.ts` is in-memory — fine on a single
instance. For multi-instance serverless, swap it for [Upstash Redis](https://upstash.com)
(`@upstash/ratelimit`) — the call-sites in `app/api/orders/route.ts` stay identical.

## Adding / editing products

Everything is driven by `data/products.ts` — edit name, price, old price,
images, colors/variants, benefits, description. Drop WebP images into
`public/images/products/<slug>/` (square, ~1200×1200 recommended).

```ts
// single-color product
{ id: "perfume-x", name: "PERFUME X", slug: "perfume-x",
  price: 2500, currency: "DZD",
  images: [{ id: "p1", url: "/images/products/perfume-x/1.webp", alt: "Perfume X" }],
  deliveryAvailable: true }

// multi-color product: give each image a variantId, gallery switches per color
images: [{ id: "noir-1", url: ".../noir-1.webp", alt: "Noir", variantId: "noir" }],
variants: [{ id: "noir", name: "Noir", color: "#161616", images: [], available: true }]
```

Each product is automatically available at `/<slug>` with its own SEO/OG tags,
sitemap entry and JSON-LD.

## Project structure

```
app/
  [product]/page.tsx        # product page (static, SEO + JSON-LD)
  admin/                    # dashboard, orders list, order detail, login (auth-protected)
  api/orders/route.ts       # checkout endpoint (zod, rate-limit, Supabase, Sheets, CAPI)
  api/meta-conversion/      # server-side CAPI proxy
components/product/         # gallery, colors, quantity, delivery, wilaya select, form, sticky CTA
components/admin/           # stats tables, status badge/select, logout
lib/                        # supabase, validation, sheets, meta (pixel + CAPI), analytics, rate-limit
data/                       # products.ts (catalog) + wilayas.ts (58 wilayas)
supabase/migrations/        # SQL for the orders table
```

## Performance notes

- First gallery image loads with `priority`; others lazy-load (Next.js Image,
  AVIF/WebP, fixed aspect-ratio container → no CLS).
- One client island per product page; the shell is a Server Component.
- Meta Pixel loads `afterInteractive` and never blocks rendering.
- Target: Lighthouse 95+, LCP < 2s, CLS < 0.1 (test after adding real images).
