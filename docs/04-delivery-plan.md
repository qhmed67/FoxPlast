# 04 — Delivery plan

> Owner of: phases, task checklists, acceptance criteria, test commands, **Decisions log**.
> Tick boxes as work completes. One phase per working session; commit per task.

**How to work (free models):** keep each session to one phase or less. Load only the docs and
skills the current task needs. After every task: `build` + `lint` + typecheck, plus a Playwright
check when UI changed. If a task needs paid anything, stop and propose a free option.

## Phase 0 — Foundation and assets

- [x] Verify environment: Node LTS (v24.22), git, `.opencode/skills/` has 14 skill folders (morph-ui installed via degit). Playwright + Firecrawl MCPs respond.
- [x] React version gate (`01` §2). Result: React 19.3.1 stable (`latest`); exports `ViewTransition` + `addTransitionType`. Recorded as D7.
- [x] Scaffold Vite + React + TS; Tailwind v4; oxlint; Prettier; path alias `@/*`.
- [x] Add `src/styles/{globals,theme,morph,motion}.css`; copy `morph.css` unchanged (628 lines); write `theme.css` from `/DESIGN.md` §2 mapping.
- [x] Self-hosted fonts via `@fontsource`: Readex Pro 600/700, IBM Plex Sans Arabic 400/500/600, IBM Plex Mono 500.
- [x] `<html lang="ar" dir="rtl">`, base typography, focus ring, reduced-motion base.
- [x] **Brand extraction (partial):** extracted palettes from `logo.png` (fox-mark) and `brand logo and some products.png` (product grid) via k-means; recorded in `DESIGN.md` §12 and D10. `status` stays `provisional` — horizontal logo (`logo-horizontal.png`) missing, so navy/orange not finalized. Vectorize + knockout variant pending (potrace/vtracer not installed). See TODO(asset).
- [x] Playwright config: mobile RTL, reduced-motion, desktop projects; smoke test passes in all 3.
- [x] CI workflow: lint, typecheck, build, e2e on PR.
- [x] Check current free-tier limits + Vercel commercial clause; recorded as D8/D9.

**Done when:** `npm run build` passes, smoke test passes in 3 projects, `DESIGN.md` is `status: final`.

## Phase 1 — Catalog and static pages

- [ ] Supabase project; migrations for catalog tables + RLS; `seed.sql` with clearly fake placeholder products flagged `TODO(client)`.
- [ ] `lib/` helpers: money (piasters ↔ "١٢٠ ج.م" as Western digits), phone normalizer, Arabic text utils.
- [ ] Layout: nav, footer, floating WhatsApp button (link from `app_config`).
- [ ] Home (static first, no animation), catalog with filters, product page with tier table and swatches, portfolio, about/contact, privacy page.
- [ ] SEO: titles, descriptions, canonical, JSON-LD (`LocalBusiness`/`Product` where data exists), `sitemap.xml`, `robots.txt`, OG images, build-time static shells for `/p/<slug>`.
- [ ] Image pipeline: build script producing 480/960/1600 webp with `srcset`; `loading`/`fetchpriority` set correctly; explicit width/height.

**Done when:** Lighthouse mobile ≥ 90 perf on home/product, all pages render RTL at 360px, no console errors.

## Phase 2 — Order flow (no payment yet)

- [ ] Basket (localStorage) with min-qty enforcement.
- [ ] Migrations: orders, items, events, rate_limits, config; RLS with no anon access.
- [ ] Edge Function `create-order` (+ `_shared`): zod, Turnstile, rate limit, server-side pricing, idempotency.
- [ ] Wizard UI (3 steps) with validation and Arabic errors; static ticket v1 (no motion).
- [ ] Telegram: bot, webhook secret, `notify`, staff allowlist, new-order message.
- [ ] `wa.me` button (`02` §4); Meta Pixel `Lead` hook behind a config flag.
- [ ] Tests: happy path, double-submit, below-min-qty, bad phone, rate-limit.

**Done when:** a test order from a phone appears in Telegram within seconds and in the DB with correct server-computed totals.

## Phase 3 — Payment and tracking

- [ ] Payment methods config + ticket payment section (copy buttons, expiry).
- [ ] `get-upload-url`, `attach-proof`, client compression + EXIF strip + sha256.
- [ ] Telegram photo message + confirm/reject/next-status buttons; edit-in-place; idempotent callbacks.
- [ ] `track-order` + tracking page; polling while visible.
- [ ] pg_cron expiry; storage cleanup job.
- [ ] Optional Telegram customer opt-in.
- [ ] Tests: upload failure/retry, rejected → re-upload, expired order, duplicate proof flag.

**Done when:** full cycle submitted → proof → confirmed → delivered works end to end with real Telegram.

## Phase 4 — Admin

- [ ] Supabase Auth (email+password), `admins` table, `is_admin()`, route guard, code-split `/admin`.
- [ ] Orders: list, filters, detail (proof viewer via signed URL), status actions, notification retry.
- [ ] Catalog CRUD with client-side image resize to 3 widths; price tiers editor.
- [ ] Portfolio manager with the `approved` toggle.
- [ ] Config editor (payment methods, deposit %, WhatsApp number, expiry hours, manual-quote flag).
- [ ] Staff handover doc (Arabic, one page, screenshots).

**Done when:** a non-developer can add a product, edit a price, and handle an order without touching code.

## Phase 5 — Motion and polish

Apply in the order from `AGENTS.md`: `impeccable` critique → `make-interfaces-feel-better`
→ `morph-ui` → `transitions-polish` → GSAP last. Work through the map in `03` §2 row by row.

- [ ] `motion.css` token bridge (transitions.dev → `--vt-*` → GSAP reads).
- [ ] Route transition, nav popover, basket sheet, number flips.
- [ ] Product card → product morph; list/grid animations.
- [ ] Wizard step-wizard with RTL check; summary → ticket morph.
- [ ] Ticket print timeline (G), stamp, copy feedback.
- [ ] Hero entrance and "roll to bag" story (G), with mobile fallbacks.
- [ ] Perf pass against budgets in `03` §4; reduced-motion pass; 4× CPU throttle pass.
- [ ] Run `impeccable` audit; fix findings.

**Done when:** budgets met, reduced-motion verified, no layout shift from motion, owner approves the feel on a real phone.

## Phase 6 — Customizer, PWA, optional app

- [ ] Bag customizer (SVG templates per product, logo placement preview, saved as `print_spec`).
- [ ] PWA: manifest, icons, service worker with update prompt, offline shell. Verify `vite-plugin-pwa` docs.
- [ ] Web Push for staff (optional) — see `06`.
- [ ] Optional TWA/APK and `app_versions` force-update — see `06`.

## Phase 7 — Launch

- [ ] Real content and prices from the client; remove every `TODO(client)` and `TODO(asset)` (grep).
- [ ] Brand-permission flags set on all portfolio items.
- [ ] Production env vars, webhook registered, Turnstile production keys.
- [ ] Keep-alive and backup workflows running; restore test of a backup.
- [ ] Security pass: RLS review (anon cannot read orders/proofs), secrets scan, CORS, headers.
- [ ] In-app-browser test (Facebook/Instagram on Android and iOS): forms, upload, copy, share, wa.me.
- [ ] 5 real test orders by the client's staff; fix friction.
- [ ] Handover: credentials checklist (owner controls accounts), how to rotate the bot token, how to export data.

## Testing commands

Fill these in during Phase 0 once `package.json` exists, then keep them accurate:

```
npm run dev        # local
npm run build      # production build
npm run lint
npm run typecheck
npm run test:e2e   # Playwright, all three projects
```

## Decisions log

| # | Date | Decision | Why |
| --- | --- | --- | --- |
| D1 | — | Vite SPA (not Next.js) | static host + Supabase; morph-ui works with plain React; Next only needed for SSR/OG |
| D2 | — | Staff notifications via Telegram bot; WhatsApp via `wa.me` click-to-chat | WhatsApp API costs money; unofficial libs risk a ban |
| D3 | — | Admin lives at `/admin` in the same app (lazy chunk); split to its own app only if needed | one deploy, shared types; owner's "backup React admin" plan stays possible |
| D4 | — | Vercel as requested, host-agnostic build | Hobby plan is non-commercial — see `05` risk R1; revisit before launch |
| D5 | — | PWA/TWA before any native app | automatic updates without a store or manual APK installs — see `06` |
| D6 | — | Money as integer piasters; server-side pricing | correctness and anti-tamper |
| D7 | 2026-10-27 | React 19.3.1 (stable `latest`) | `npm view react dist-tags` → latest 19.3.1; exports `ViewTransition` and `addTransitionType` (verified in the 19.3.1 package). Satisfies morph-ui's React 19.3+ gate. No canary pin needed. |
| D8 | 2026-10-27 | Hosting: Vercel Hobby is non-commercial (fair-use guidelines: Hobby = personal use only) | Factory site is commercial → cannot use Hobby. Zero-budget options: Cloudflare Pages or Netlify free (verify their commercial terms before committing). Build stays host-agnostic. Decide with owner before launch. |
| D9 | 2026-10-27 | Free-tier snapshot (re-verify in Phase 0 of later work) | Supabase Free: 500 MB DB, 1 GB storage, 5 GB egress, 50k MAU, paused after 1 week inactivity, 2 active projects, no daily backups. Cloudflare Turnstile: free, up to 20 widgets. Telegram Bot API: 1 msg/sec per chat, 20/min in groups. GitHub Actions minutes apply only to private repos. |
| D10 | 2026-10-27 | Brand extraction partial; palette recorded, status stays provisional | K-means (PIL median-cut, 12 colors) on `logo.png` (fox-mark) and `brand logo and some products.png` (product grid). Extracted: fox-mark greens `#6a8f2d`/`#498d5c`, teal `#16a0c8`, red `#a02a18`, kraft `#eeeadc`; product grid navy `#012957`/`#082648`, teal `#075449`, kraft `#f8e2d2`. Horizontal logo not supplied, so navy/orange tokens remain eye-sampled. Full palette in `DESIGN.md` §12. |
