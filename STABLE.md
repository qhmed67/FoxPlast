# STABLE — Fox Plast snapshot

> **This file marks the most recent known-good version.** If a new change breaks
> something, restore this snapshot first, then debug on a branch.

- **Snapshot name:** `stable-2026-10-29-2`
- **Commit:** `ee757d9` (`feat/storefront-order-flow`)
- **Date:** 2026-10-29
- **Live site:** https://fox-plast.vercel.app
- **Supabase project:** `uuvqaklyhflxuqggdnxd`
- **GitHub repo:** https://github.com/qhmed67/FoxPlast

## Why this snapshot

This is the last build before the basket/checkout restyle and the Telegram access
gate. It is fully verified: storefront, catalog, order flow, admin login, RLS,
security headers, Telegram order card with address + WhatsApp button.

## What is frozen

These parts are approved by the owner and **must not be redesigned or refactored**
without an explicit instruction:

- **Payment ticket** — `src/features/orders/Ticket.tsx` + `src/styles/ticket.css`
  (the owner explicitly likes this version; never restyle it during page work)
- **Checkout logic** — steps, validation, pricing, idempotency, `create-order`
  contract (`src/features/checkout/CheckoutPage.tsx` logic, not its skin)
- InstaPay payment stub, copy buttons, barcode, perforated ticket look
- The InstaPay account and link:
  - `ahmedyousseftaha@instapay`
  - `https://ipn.eg/S/ahmedyousseftaha/instapay/0xdJfL`
- WhatsApp number `201278954638`
- The order → Telegram notification flow
- Admin auth model: public signup disabled, `admins` writable by service role only,
  `is_admin()` RLS on every admin table

## What this snapshot contains

| Area | State |
| --- | --- |
| Editorial home, hero campaign 2 (2048×768) | Working |
| Catalog, product, portfolio, contact | Working |
| Basket + 3-step checkout | Working |
| Payment ticket (InstaPay stub) | Working and approved |
| Server-side pricing + idempotency | Working |
| Telegram `/start` staff bootstrap | Working (first-user bootstrap) |
| Telegram order card: address + WhatsApp contact button | Working |
| Admin `/admin` (email+password, orders, statuses, CSV, proofs) | Working |
| Admin hardening (signup off, RLS, CSP, noindex) | Working |
| Vercel production deploy | Working (`ee757d9`) |
| Git authors | Only `qhmed67 <ahmedalmslm74@gmail.com>` |

## Branches at snapshot time

- `feat/storefront-order-flow` — integration branch
- `frontend/hero-campaign-2`
- `fix/admin-hardening`
- `frontend/admin-console`
- `backend/order-address-whatsapp`
- local `master` — never pushed

## How to restore this version

```bash
# inside the repo
git fetch --all --tags
git checkout stable-2026-10-29-2
npm ci
npm run build
```

If a future branch has uncommitted work, stash it first:

```bash
git stash push -u -m "work-before-restore"
```

To restore only the approved ticket:

```bash
git checkout stable-2026-10-29-2 -- \
  src/features/orders/Ticket.tsx \
  src/styles/ticket.css
```

To redeploy this exact build, create a Vercel deployment from commit `ee757d9`,
or merge the snapshot tag into the production branch:

```bash
git checkout feat/storefront-order-flow
git merge --no-ff stable-2026-10-29-2
git push origin feat/storefront-order-flow:feat/phase-2-order-flow
```

## Verification at snapshot time

- `npm run build` — pass
- `npm run typecheck` — pass
- `npm run lint` — pass (0 warnings in `src/`)
- Playwright — **15/15**
- Live: home, catalog, product, basket, checkout, admin — 200, no console errors
- Security probes: signup disabled, anon orders empty, anon `admins` denied,
  status RPC returns `forbidden` for anon and works for the admin user
- Live Telegram card: address line + WhatsApp button; `create-order` rejects a
  missing address with `400 customer.address`

## Known gaps at this snapshot

- Cloudflare Turnstile keys are not set yet.
- The QR box inside the ticket is still a visual placeholder (`QR` text).
- Telegram staff registration is still first-come bootstrap; the password gate
  ships after this snapshot.
- Basket/checkout still use the legacy colour skin.
- The old `feat/phase-2-order-flow` branch is the GitHub default but points at
  the same clean commit as production.

## Previous snapshots

| Tag | Commit | Note |
| --- | --- | --- |
| `stable-2026-10-29` | `45e77b2` | Pre-editorial / pre-admin baseline |
| `stable-2026-10-29-2` | `ee757d9` | Storefront + admin + Telegram address/WhatsApp, before basket restyle |
