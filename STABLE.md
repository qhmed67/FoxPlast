# STABLE — Fox Plast snapshot

> **This file marks the most recent known-good version.** If a new change breaks
> something, restore this snapshot first, then debug on a branch.

- **Snapshot name:** `stable-2026-10-29-3`
- **Commit:** `fbd3c49` (`feat/storefront-order-flow`, deployed as `feat/phase-2-order-flow`)
- **Date:** 2026-10-29
- **Live site:** https://fox-plast.vercel.app
- **Supabase project:** `uuvqaklyhflxuqggdnxd`
- **GitHub repo:** https://github.com/qhmed67/FoxPlast

## Why this snapshot

First build where the whole storefront speaks one visual language, the storefront
and the admin agree on what a finished order looks like, and the Telegram bot can
no longer be opened by a stranger.

## What is frozen

These parts are approved by the owner and **must not be redesigned or refactored**
without an explicit instruction:

- **Payment ticket** — `src/features/orders/Ticket.tsx` + `src/styles/ticket.css`
  (never restyle it during page work; the checkout only changed *around* it)
- **Checkout logic** — steps, validation, pricing, idempotency, `create-order`
  contract (`src/features/checkout/CheckoutPage.tsx` logic, not its skin)
- InstaPay payment stub, copy buttons, barcode, perforated ticket look
- The InstaPay account and link:
  - `ahmedyousseftaha@instapay`
  - `https://ipn.eg/ahmedyousseftaha/instapay/0xdJfL`
- WhatsApp number `201278954638`
- The order → Telegram notification flow
- Admin auth model: public signup disabled, `admins` writable by service role only,
  `is_admin()` RLS on every admin table

## What this snapshot contains

| Area | State |
| --- | --- |
| Editorial home, hero campaign 2 (2048×768) | Working |
| Catalog, product, portfolio, contact | Working |
| Editorial basket + 3-step checkout (behaviour unchanged) | Working |
| Payment ticket (InstaPay stub) | Working and approved |
| Server-side pricing + idempotency | Working |
| Mobile nav: visible active chip, hover/press feedback, reduced-motion path | Working |
| Telegram password gate (`TELEGRAM_ACCESS_PASSWORD`, 5 tries / 10 min) | Deployed |
| Telegram order card: Cairo time, address, WhatsApp + admin buttons | Deployed |
| Admin `/admin` (email+password, orders, statuses, CSV, proofs) | Working |
| Admin WhatsApp status message button | Working |
| Admin hardening (signup off, RLS, CSP, noindex) | Working |
| Vercel production deploy | Working (`fbd3c49`) |
| Git authors | Only `qhmed67 <ahmedalmslm74@gmail.com>` |

## Telegram access (read before touching the bot)

- `/start` no longer registers anybody. It asks for the team password.
- A correct password activates the account in `telegram_staff`; an existing admin
  row keeps `role = admin`.
- Wrong entries: 5 per 10 minutes per Telegram account, stored in `rate_limits`
  under `tg-access:<user id>`, cleared on success.
- Secret: `TELEGRAM_ACCESS_PASSWORD` (Supabase function secrets). If it is missing
  the bot answers that access is closed instead of failing open.
- The **profile photo cannot be set with the bot token** (Bot API `setMyProfilePhoto`
  needs a different call shape and the owner's account). Use BotFather:
  1. Open `@BotFather` → `/mybots` → `@FoxPlastbot` → **Edit Bot** → **Edit Botpic**
  2. Send `public/brand/telegram-bot-avatar-640.jpg` (square, 640×640, fox mark on bone)
- To rotate the password: set a new value with
  `supabase secrets set TELEGRAM_ACCESS_PASSWORD=…` and redeploy `telegram-webhook`.
  Everyone who already entered the old password stays active — remove them from
  `telegram_staff` if they must lose access.

## Branches at snapshot time

- `feat/storefront-order-flow` — integration branch (this snapshot)
- `feat/phase-2-order-flow` — production branch Vercel deploys from
- `frontend/editorial-order-skin` — basket/checkout skin + mobile nav
- `backend/telegram-password-gate` — bot gate + card redesign
- `frontend/admin-whatsapp-status` — admin WhatsApp status message
- local `master` — never pushed

## How to restore this version

```bash
# inside the repo
git fetch --all --tags
git checkout stable-2026-10-29-3
npm ci
npm run build
```

If a future branch has uncommitted work, stash it first:

```bash
git stash push -u -m "work-before-restore"
```

To restore only the approved ticket:

```bash
git checkout stable-2026-10-29-3 -- \
  src/features/orders/Ticket.tsx \
  src/styles/ticket.css
```

To redeploy this exact build, merge the tag into the production branch:

```bash
git checkout feat/storefront-order-flow
git merge --no-ff stable-2026-10-29-3
git push origin feat/storefront-order-flow:feat/phase-2-order-flow
```

If the breakage is in the **functions**, redeploy them from the tag:

```bash
git checkout stable-2026-10-29-3
supabase functions deploy create-order telegram-webhook --project-ref uuvqaklyhflxuqggdnxd
```

## Verification at snapshot time

- `npm run build` — pass
- `npm run typecheck` — pass
- `npm run lint` — 0 errors
- Playwright — **15/15** (mobile-rtl, mobile-reduced, desktop)
- Live: home, catalog, about, basket, checkout, admin — 200, no console errors
- Live mobile nav shows the correct active chip on `/`, `/catalog`, `/about`, `/basket`
- Live `telegram-webhook`: `GET` → 405, no/incorrect secret → 401, malformed JSON with
  an incorrect secret → 401
- Functions deployed at versions 11 (`create-order`, `telegram-webhook`) with
  `verify_jwt` true/false respectively

## Known gaps at this snapshot

- Cloudflare Turnstile keys are not set yet.
- The QR box inside the ticket is still a visual placeholder (`QR` text).
- The Telegram bot photo needs the one-off BotFather step above (no API path).
- Telegram `/start` on an already-active account only greets it; there is no
  self-service logout command yet.
- `live-check.mjs` is untracked and can create **real production orders** — do not
  run it casually.

## Previous snapshots

| Tag | Commit | Note |
| --- | --- | --- |
| `stable-2026-10-29` | `45e77b2` | Pre-editorial / pre-admin baseline |
| `stable-2026-10-29-2` | `ee757d9` | Storefront + admin + Telegram address/WhatsApp, before basket restyle |
| `stable-2026-10-29-3` | `fbd3c49` | Editorial basket/checkout, mobile nav states, admin WhatsApp status, Telegram gate |
