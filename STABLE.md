# STABLE — Fox Plast snapshot

> **This file marks a known-good version.** Treat everything described here as frozen
> until the owner explicitly asks to change it.

- **Snapshot name:** `stable-2026-10-29`
- **Commit:** `45e77b2` (`feat/storefront-order-flow`)
- **Date:** 2026-10-29
- **Live site:** https://fox-plast.vercel.app
- **Supabase project:** `uuvqaklyhflxuqggdnxd`
- **GitHub repo:** https://github.com/qhmed67/FoxPlast

## What is frozen

These parts are approved by the owner and **must not be redesigned or refactored**
without an explicit instruction:

- **Checkout wizard** — `src/features/checkout/CheckoutPage.tsx`
- **Payment ticket** — `src/features/orders/Ticket.tsx` + `src/styles/ticket.css`
- InstaPay payment stub, copy buttons, barcode, perforated ticket look
- The InstaPay account and link:
  - `ahmedyousseftaha@instapay`
  - `https://ipn.eg/S/ahmedyousseftaha/instapay/0xdJfL`
- WhatsApp number `201278954638`
- The order → Telegram notification flow

## What this snapshot contains

| Area | State |
| --- | --- |
| Catalog, basket, 3-step checkout | Working |
| Server-side pricing + idempotency | Working |
| Payment ticket (InstaPay stub) | Working and approved |
| Telegram `/start` staff bootstrap | Working (`telegram_staff`, verified) |
| New-order Telegram notification from allowlist | Working |
| InstaPay + WhatsApp config in `app_config` | Working |
| Turnstile | Client widget wired; **keys still pending** |
| Vercel production deploy | Working (`45e77b2`) |
| Git authors | Only `qhmed67 <ahmedalmslm74@gmail.com>` |

## Branches at snapshot time

- `feat/storefront-order-flow` — integration branch
- `frontend/instapay-ticket`
- `backend/telegram-start`
- `database/payment-config`
- `docs/payment-telegram`
- local `master` — never pushed

## How to restore this version

Fastest, if the working tree is damaged:

```bash
# inside the repo
git fetch --all --tags
git checkout stable/2026-10-29
npm ci
npm run build
```

If a future branch has uncommitted work, stash it first:

```bash
git stash push -u -m "work-before-restore"
```

To restore only the frozen checkout/ticket files:

```bash
git checkout stable/2026-10-29 -- \
  src/features/checkout/CheckoutPage.tsx \
  src/features/orders/Ticket.tsx \
  src/styles/ticket.css
```

To redeploy the stable build, push/merge the stable branch or run a Vercel
deployment from commit `45e77b2`.

## Verification at snapshot time

- `npm run build` — pass
- `npm run typecheck` — pass
- `npm run lint` — pass (warnings only in `.opencode` skill scripts)
- Playwright checkout + smoke — pass
- Live ticket check — InstaPay link and account present, ticket layout confirmed
- Git authors — no `dev` identity remains

## Known gaps at this snapshot

- Cloudflare Turnstile keys are not set yet. The widget code is ready in
  `src/features/checkout/TurnstileWidget.tsx`.
- The QR box inside the ticket is still a visual placeholder (`QR` text).
- The old `feat/phase-2-order-flow` branch is still the GitHub default because the
  current PAT lacks Administration permission. It points at the same clean commit.
- Vercel's production branch still tracks that old ref; pushes to it are kept in
  sync until the owner switches the default branch.

## Rule for the next redesign

The editorial redesign of the home page, hero, catalog cards, and colours may
change content pages only. Do **not** touch checkout or ticket while doing it.
