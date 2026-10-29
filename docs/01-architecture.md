# 01 — Architecture

> Owner of: stack, repo layout, data model, security (RLS), storage, Edge Functions, env vars, deploy.
> Not the owner of: order/payment behavior (`02`), UI (`/DESIGN.md`, `03`).

**Rule for versions and APIs:** the versions and function names below are starting points.
Before using any of them, confirm against official docs (Firecrawl MCP). Free-tier limits
change; check them in Phase 0 and write what you found in `04` → Decisions log.

## 1. System overview

```mermaid
flowchart LR
  C[Customer phone<br/>React SPA on Vercel] -->|read catalog: anon key + RLS| DB[(Supabase Postgres)]
  C -->|create order / get upload URL / track| EF[Supabase Edge Functions<br/>service role, validation, pricing]
  EF --> DB
  EF -->|private buckets| ST[(Supabase Storage)]
  EF -->|sendMessage / sendPhoto| TG[Telegram Bot API]
  TG -->|buttons: confirm, reject, status| WH[Edge Function telegram-webhook]
  WH --> DB
  A[Admin /admin route<br/>Supabase Auth + RLS is_admin] --> DB
  A --> ST
  C -. wa.me link, user taps send .-> WA[WhatsApp on the customer's phone]
  GH[GitHub Actions cron] -->|keep-alive ping, weekly DB dump| DB
```

Principles:

1. **The browser never writes orders directly.** All order/payment writes go through Edge
   Functions that validate, recompute prices, rate-limit, and write with the service role.
2. **The database is the source of truth.** Telegram and WhatsApp are notification/shortcut
   channels. If both fail, the order still exists and appears in the admin panel.
3. **Host-agnostic frontend.** A static Vite build + Supabase means we can move from Vercel to
   any static host without code changes (see `05` → risks).

## 2. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| UI | React 19.3+ (see below), TypeScript, Vite | morph-ui needs `ViewTransition` from `react` |
| Styling | Tailwind CSS v4 + shadcn-style CSS variables | variables mapped in `src/styles/theme.css` from `/DESIGN.md` |
| Routing | React Router (library mode) or TanStack Router | navigations wrapped in `startTransition`; **no router `viewTransition` prop** |
| Data | `@supabase/supabase-js`, TanStack Query | cache catalog; mutations go to Edge Functions |
| Forms | react-hook-form + zod | zod schemas shared with Edge Functions (copy, don't import across runtimes) |
| Motion | morph-ui (`<ViewTransition>`), transitions.dev CSS tokens, GSAP (lazy) | ownership in `03` and `AGENTS.md` |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions (Deno), pg_cron | free plan |
| Notifications | Telegram Bot API (webhook mode) | free |
| Anti-spam | Cloudflare Turnstile (free) + honeypot + DB rate limit | |
| Hosting | Vercel (owner's choice) | see licensing risk in `05` |
| CI | GitHub Actions | lint, typecheck, build, Playwright |
| Tests | Playwright (MCP available in the agent) | |

### React version gate (do this first)

morph-ui requires **React 19.3+**. In Phase 0 run `npm view react dist-tags` and read the
React release notes. If 19.3 is stable, use it. If only a canary/experimental tag has
`ViewTransition`, pin that exact version (no `latest`), note it in the Decisions log, and
tell the owner. If neither exists, stop; do not polyfill or swap libraries.

## 3. Repository layout

```
/
├─ AGENTS.md  DESIGN.md
├─ docs/
├─ .opencode/skills/              # 14 skills, never edited
├─ public/
│  ├─ brand/                      # logos (see docs/README.md)
│  └─ products/                   # factory photos until the admin uploads exist
├─ src/
│  ├─ app/                        # routes, layouts, providers
│  ├─ features/
│  │  ├─ catalog/  basket/  order/  ticket/  track/  customizer/  portfolio/
│  │  └─ admin/                   # lazy-loaded chunk, route group /admin
│  ├─ components/
│  │  ├─ ui/                      # buttons, inputs, chips (project-owned)
│  │  └─ morph/                   # morph-ui components, copied unchanged
│  ├─ lib/                        # supabase client, money, phone, arabic helpers, api wrappers
│  └─ styles/
│     ├─ globals.css  theme.css   # tokens → shadcn vars
│     ├─ morph.css                # copied unchanged from morph-ui
│     └─ motion.css               # bridge: transitions.dev tokens → --vt-* → GSAP reads
├─ supabase/
│  ├─ migrations/  seed.sql  config.toml
│  └─ functions/  create-order  get-upload-url  attach-proof  track-order  telegram-webhook  notify  _shared
├─ tests/e2e/
└─ .github/workflows/             # ci.yml, keepalive.yml, db-backup.yml
```

## 4. Data model (sketch — write real migrations, one per concern)

Money is stored as **integer piasters** (قروش). Never floats.

```sql
create type order_status as enum (
  'submitted','quoted','awaiting_payment','proof_uploaded','paid',
  'in_production','ready','delivered','cancelled','expired'
);

-- Catalog (public read)
categories(id, slug unique, name_ar, sort, active)
products(id, category_id, slug unique, name_ar, description_ar, material, min_qty int,
         sizes jsonb, handle_types jsonb, colors jsonb, images jsonb, active, sort)
price_tiers(product_id, min_qty int, unit_price_piasters int, primary key (product_id, min_qty))
portfolio_items(id, image_path, caption_ar, client_label, approved bool default false, product_id null, sort)

-- Config (public read of a whitelisted subset)
app_config(key text primary key, value jsonb, is_public bool default false)
-- keys: whatsapp_number, payment_methods[], deposit_percent, order_expiry_hours,
--       requires_manual_quote, business_hours, telegram_bot_username, min_web_version

-- Orders (NO anon access; Edge Functions + admins only)
orders(id uuid pk, code text unique, public_token text unique, status order_status,
       customer_name, phone, governorate, address null, notes,
       subtotal_piasters int, deposit_piasters int, idempotency_key text unique,
       utm jsonb, ip_hash text, created_at, updated_at)
order_items(id, order_id, product_id null, product_name text, variant jsonb,
            qty int check (qty > 0), unit_price_piasters int, print_spec jsonb, logo_path null)
payment_proofs(id, order_id, file_path, sha256 text, sender_hint text, amount_claimed_piasters int,
               status text check (status in ('pending','accepted','rejected')), reject_reason, reviewed_by, created_at)
order_events(id, order_id, from_status, to_status, actor text, note, at)  -- append-only audit

-- Plumbing
telegram_staff(telegram_user_id bigint pk, name, role, active)   -- allowlist
admins(user_id uuid pk references auth.users)
rate_limits(key text, window_start timestamptz, count int, primary key (key, window_start))
app_versions(platform text, version text, min_supported text, url text, notes, created_at)  -- see 06
```

Snapshot product name and unit price into `order_items` so later catalog edits never change
past orders.

## 5. Security model (RLS and functions)

- `alter table … enable row level security` on **every** table, then add policies explicitly.
- Anon/public: `select` on active catalog tables, `approved = true` portfolio rows, and
  `app_config where is_public`. Nothing else.
- `orders`, `order_items`, `payment_proofs`, `order_events`, `telegram_staff`, `rate_limits`:
  no anon policy at all. Admin policies use `public.is_admin()` (`security definer`, checks `admins`).
- Customer tracking uses `track-order` with `code + token`; compare tokens in constant time;
  return only the fields the tracking page needs (no phone, no address).
- Tokens: `public_token` is 128-bit random (url-safe base64). Order `code` is human-friendly
  (`FP-` + 6 chars from `23456789ABCDEFGHJKMNPQRSTUVWXYZ`) and is **not** a secret.
- Service-role key exists only as an Edge Function secret. It must never be in any `VITE_*` var,
  commit, log, or chat message.
- Validate every function input with zod; reject unknown fields; cap body size.
- Escape all user text before putting it into Telegram HTML messages.
- CORS: allow only the production origin(s) and localhost in dev.

## 6. Storage

| Bucket | Visibility | Who writes | Contents |
| --- | --- | --- | --- |
| `catalog` | public | admin | product + portfolio images, pre-sized (480/960/1600 webp) |
| `logos` | private | customer via signed upload URL | print artwork (png/svg/pdf, ≤ 5 MB) |
| `payment-proofs` | private | customer via signed upload URL | transfer screenshots (jpg/png/webp, ≤ 5 MB) |

- Supabase image transformations are a paid feature: **resize on the client in the admin
  upload (canvas) or in a build script (sharp)**, never at request time.
- Free tier storage is small (check the current number). Compress screenshots client-side
  (target ≤ 400 KB), strip EXIF, and delete proofs of cancelled/expired orders after 30 days (pg_cron).
- Staff see private files through short-lived signed URLs (60 s).

## 7. Edge Functions

| Function | Caller | Does |
| --- | --- | --- |
| `create-order` | browser | verify Turnstile, rate-limit, validate, recompute prices from `price_tiers`, enforce min-qty, insert order + items + event, call `notify`, return `{code, token, ticket}` |
| `get-upload-url` | browser | check `code+token`, bucket allowlist, max files per order, return signed upload URL + path |
| `attach-proof` | browser | after upload: verify object exists, store sha256/sender hint/claimed amount, set `proof_uploaded`, notify staff with photo |
| `track-order` | browser | return sanitized status for `code+token` |
| `telegram-webhook` | Telegram | verify `X-Telegram-Bot-Api-Secret-Token`, check staff allowlist, handle callbacks (`confirm`, `reject`, `start`, `ready`, `delivered`), edit the original message |
| `notify` | other functions | build message (Arabic), send via Bot API, retry once, never throw to the caller |
| `_shared` | — | zod schemas, money, rate limit, Telegram client, CORS, logging (no PII in logs) |

Scheduled: pg_cron job marks `awaiting_payment` orders `expired` after `order_expiry_hours`;
GitHub Actions `keepalive.yml` pings a cheap public endpoint every 3 days so the free project
does not pause; `db-backup.yml` dumps the schema and data weekly to a private artifact.

## 8. Environment variables

| Name | Where | Public? |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (fallback `VITE_SUPABASE_ANON_KEY`) | Vercel + `.env.local` | yes |
| `VITE_TURNSTILE_SITE_KEY` | Vercel | yes |
| `VITE_APP_VERSION` | build-time | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase function secrets (auto-injected) | **no** |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` | Supabase secrets | **no** |
| `TURNSTILE_SECRET` | Supabase secrets | **no** |
| `IP_HASH_SALT` | Supabase secrets | **no** |

Commit `.env.example` with names only. `.env*` stays in `.gitignore`.

## 9. Deploy

- Vercel: framework preset Vite; `vercel.json` rewrites all non-file routes to `/index.html`;
  security headers (CSP report-only first, `X-Content-Type-Options`, `Referrer-Policy`).
- Supabase: migrations via the CLI (`supabase db push`); functions via `supabase functions deploy`;
  set the Telegram webhook once with `secret_token`.

### Applying the schema without the CLI

The dashboard SQL editor is enough. Run the files **in order** and re-run is safe
(every statement is idempotent):

1. `supabase/migrations/0001_catalog.sql`
2. `supabase/seed.sql` (placeholder catalog — replace in Phase 7)
3. `supabase/migrations/0002_orders.sql`

Verify from a terminal (publishable key only — these must answer `200 []`, not `404`):

```bash
for t in orders order_items order_events payment_proofs rate_limits telegram_staff admins; do
  curl -s -o /dev/null -w "$t %{http_code}\n" \
    "https://<project-ref>.supabase.co/rest/v1/$t?select=*&limit=1" \
    -H "apikey: <publishable-key>"
done
```

### Deploying the functions

Needs a Supabase access token (`supabase login` once, or `SUPABASE_ACCESS_TOKEN`).
Never commit it.

```bash
npx supabase functions deploy create-order telegram-webhook --project-ref <ref>
```

Function secrets (dashboard → Edge Functions → Secrets, or `supabase secrets set`):

| Secret | Used by | Notes |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | both | from BotFather |
| `TELEGRAM_STAFF_CHAT_ID` | `create-order` | comma-separated chat ids for new-order messages |
| `TELEGRAM_WEBHOOK_SECRET` | `telegram-webhook` | 1–256 chars, `A-Z a-z 0-9 _ -` only |
| `TELEGRAM_ACCESS_PASSWORD` | `telegram-webhook` | team password; without it the bot stays closed |
| `IP_HASH_SALT` | `create-order` | random string; keeps IP hashes non-reversible |
| `TURNSTILE_SECRET` | `create-order` | optional; verification is skipped while unset |
| `ALLOWED_ORIGINS` | both | optional; comma-separated origins, defaults to any in dev |

Register the webhook once (Telegram retries until it gets `200`):

```bash
curl -s "https://api.telegram.org/bot<token>/setWebhook" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://<ref>.supabase.co/functions/v1/telegram-webhook",
       "secret_token":"<TELEGRAM_WEBHOOK_SECRET>",
       "allowed_updates":["callback_query"]}'
curl -s "https://api.telegram.org/bot<token>/getWebhookInfo"
```

- No DB password/CLI session? The dashboard path above is the supported fallback. The app
  detects missing tables in dev and falls back to `src/features/catalog/seed.ts`; production
  shows the error state instead.
- Per-product Open Graph tags: a build script writes small static HTML shells for `/p/<slug>`
  from a catalog snapshot, so Facebook/WhatsApp previews work without SSR.
- Previews: every PR gets a Vercel preview; Playwright runs against it.

### Current deployment (2026-10-27)

| Piece | Where |
| --- | --- |
| Frontend | `https://fox-plast.vercel.app` (Vercel project `fox-plast`, Hobby, production branch `feat/phase-2-order-flow`) |
| Database | Supabase `uuvqaklyhflxuqggdnxd`; `0001`, `seed.sql` and `0002` applied |
| Functions | `create-order`, `telegram-webhook` (project ref above) |
| Webhook | `https://uuvqaklyhflxuqggdnxd.supabase.co/functions/v1/telegram-webhook` |
| Public env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_VERSION` set for production/preview/development |
| Function secrets | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ACCESS_PASSWORD`, `IP_HASH_SALT`, `ALLOWED_ORIGINS` |

Still unset on purpose: `TELEGRAM_STAFF_CHAT_ID`, `TELEGRAM_STAFF_IDS` (optional; the
`telegram_staff` allowlist is the normal path),
`TURNSTILE_SECRET` / `VITE_TURNSTILE_SITE_KEY` (no Cloudflare account). `app_config` still has
placeholder `whatsapp_number` and no `payment_methods`; replace both in Phase 7.

To finish Telegram: the owner sends `/start` to `@FoxPlastbot`, then read the id with
`getUpdates` and set both secrets to that chat id (a private chat id equals the user id).

Rotate every token that was pasted into chat once handover is done. Nothing secret is stored in
the repo; `VITE_*` values are public by definition.
