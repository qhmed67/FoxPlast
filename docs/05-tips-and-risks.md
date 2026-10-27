# 05 — Tips and risks

> Owner of: advice, caveats, free-tier limits, working-method tips. Advice only — it never
> overrides `AGENTS.md`, `DESIGN.md` or `docs/00–04`. If you accept a tip, record it as a decision in `04`.

## 1. Risks (check these before building the affected part)

| # | Risk | What to do |
| --- | --- | --- |
| R1 | **Vercel Hobby is for personal, non-commercial use.** A client's factory site is commercial. | Verify the current terms. Safest zero-budget options for a business site: Cloudflare Pages or Netlify free (verify their commercial terms too). The build is host-agnostic, so switching is cheap. Decide with the owner before launch. |
| R2 | **Supabase free projects pause after a period of inactivity** and the free plan has no downloadable daily backups. | `keepalive.yml` pings the project every few days; `db-backup.yml` dumps weekly to a private artifact; test a restore once. Check current limits. |
| R3 | **Free-tier ceilings** (DB size, storage, egress, function invocations). | Pre-size images, compress proofs, delete old proofs, cache catalog queries, avoid polling faster than 15 s. Re-check numbers in Phase 0. |
| R4 | **Client brand logos in the portfolio** (3M Syrian, Roots, Golden Shoes, Azab Jeans, Brother, KRO, Rashad, Koka, Packrich, Qamrin…). Showing them needs the brands' OK. | `approved` flag per item; unapproved items get a blur over the logo area; get consent in writing (a WhatsApp message is fine). |
| R5 | **Payment screenshots can be forged.** | Staff confirm the money in the actual wallet/bank app, not the image. Keep the claimed-amount and sender-hint fields; duplicate-hash warning. |
| R6 | **Facebook/Instagram in-app browser quirks** (limited share/download/clipboard, older webview). Most traffic comes from there. | Test early; every feature has a visible fallback; add an "open in Chrome" hint where needed. |
| R7 | **React 19.3 / `ViewTransition` availability and browser support.** | Version gate in `01`; motion is progressive enhancement — state never depends on it. |
| R8 | **Unofficial WhatsApp automation** gets numbers banned. | Not used. `wa.me` only. |
| R9 | **SPA + sharing previews.** Facebook/WhatsApp crawlers do not run JS. | Build-time static HTML shells with OG tags for key routes. |
| R10 | **Free coding models hallucinate APIs** (Supabase, Telegram, ViewTransition). | The "verify before using an API" rule in `AGENTS.md`; paste doc excerpts into the task when a model keeps getting it wrong. |
| R11 | **Personal data** (names, phones, addresses, payment screenshots). | Collect the minimum, private buckets, short retention, a clear privacy page. Confirm local legal requirements with someone qualified before launch. |
| R12 | **Single point of failure: one Telegram bot/one staff phone.** | At least two staff in the group; admin panel always shows pending orders; owner can re-send notifications. |

## 2. Product and UX tips

- **Sell the ticket.** Making payment feel like a receipt is the memorable moment. Spend polish time there, not on the hero.
- **Reduce form fields.** Name + phone + governorate is enough to start; ask for address after payment is confirmed.
- **Show min-qty and tiers early**, on the card and in the basket; surprises at the last step kill conversions.
- **Real photos beat renders.** Ask the factory for originals (not Facebook-compressed) and shoot on a plain kraft/white background; consistent crops make the site look expensive.
- **Make the first screen answer three things:** what you make, who it is for, and the next action (`اطلب عرض سعر`).
- **Egyptian specifics:** Western digits, `ج.م`, phone format `01X`, governorate list, Friday/Saturday working-days notice, Ramadan hours banner via config.
- **Facebook ads:** add the Meta Pixel `Lead` event on order submit and `InitiateCheckout` on wizard start (behind a config flag and the privacy page); UTM params are stored on the order so the client can see which ad works.
- **Trust signals** that cost nothing: factory photos, real client logos (approved), response-time promise, clear deposit explanation, visible phone/WhatsApp.
- **Don't build accounts or inventory.** They triple the scope and the client does not need them.

## 3. Engineering tips

- Build a **fake-but-realistic seed** first so every screen has data; replace with real content in Phase 7.
- Put **all Arabic copy in one place** (`src/lib/copy.ts` or i18n JSON) so the client can review it in one file.
- **Money:** integers, one formatter, tested. Never format in components ad hoc.
- **Dates:** store UTC, show `Africa/Cairo`.
- **Idempotency** on every mutation that can be double-tapped on mobile.
- **Feature flags in `app_config`** for Pixel, manual quote, customizer, Telegram opt-in — turn things on without redeploying.
- **Logs without PII.** Log order code and status, not names or phones.
- **Type the function contracts once** (zod) and generate TypeScript types for the client; keep copies in sync with a test.
- **Playwright MCP is your eyes.** Screenshot at 360px RTL after every UI change; look at it, don't assume.
- **Firecrawl MCP is your docs.** Use it for current Supabase/Telegram/React docs before writing integration code.
- **Commit small.** Free models drift; small commits make reverting painless.

## 4. Working with free models in OpenCode

- One phase per session. Start sessions with: "Read `AGENTS.md` and `docs/README.md`, then do task X from `docs/04`."
- Don't ask for "the whole site". Ask for one component or one function plus its test.
- Load **one** skill per sub-task by name (`@morph-ui`, `@gsap-timeline`…), not all fourteen. Layer order is in `AGENTS.md`.
- If a model starts inventing props or APIs, stop, fetch the official doc, and paste the relevant excerpt.
- Re-state constraints when context gets long: zero budget, no secrets in chat, Arabic RTL, no fabricated data.
- Ask for a short plan before multi-file changes; review it yourself before approving.
- Switch to a stronger model for architecture-heavy tasks (RLS, order state machine) and review those by hand.

## 5. Staff checklist for confirming payment (include in the handover doc)

1. Open the order in Telegram; read the claimed amount and sender hint.
2. Open the wallet/bank app and find the incoming transfer. Match amount and sender.
3. Match → **تأكيد الدفع**. No match → **رفض** with a reason; do not start production.
4. If the screenshot looks edited or the image was used on another order (⚠ warning) → call the customer.
5. After production: **جاهز** → customer is notified (if opted in) → **تم التسليم** on handover.

## 6. Free-tier numbers to re-check in Phase 0 (do not trust memory)

Supabase (database size, storage, egress, Edge Function invocations, inactivity pause, backups, SMTP limits for auth emails),
Vercel (commercial-use clause, bandwidth, build minutes), Telegram Bot API limits (messages per second per chat/group),
Cloudflare Turnstile (free tier terms), GitHub Actions (minutes for private repos).
Write what you find in the Decisions log with the date.
