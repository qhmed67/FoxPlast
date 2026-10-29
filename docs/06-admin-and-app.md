# 06 — Admin panel and app delivery

> Owner of: admin panel scope, PWA, optional Android shell, update/force-update strategy.
> Not the owner of: order logic (`02`) or tables (`01`).

## 1. Who the "app" is for

The factory staff need to **receive and manage orders**. Telegram already does that for free.
The admin panel adds everything Telegram can't (catalog, config, search, history). An installable
app is a convenience layer on top, not a separate backend. Recommended order of effort:

1. **Telegram bot** (Phase 2–3) — instant, zero install friction.
2. **Admin panel at `/admin`** (Phase 4) — responsive, works in any browser.
3. **PWA install** of the admin (Phase 6) — home-screen icon, fullscreen, auto-updating.
4. **Web Push** to staff phones (optional) — new-order alerts without Telegram.
5. **Android wrapper (TWA/APK)** (optional) — only if the client wants a "real app" icon and file.
6. **Native Kotlin inbox** (optional, later) — a real native app talking to Supabase; only worth it if 1–5 are not enough.

## 2. Admin panel scope

| Area | Features |
| --- | --- |
| Auth | Supabase Auth email + password (the free built-in email sender is heavily rate-limited, so avoid magic links). `admins` table + `is_admin()`. Optional TOTP later |
| Orders | Live list (newest first, filters by status/date/phone/code), detail with items, print spec, logo download, proof viewer (signed URL), status actions, notes, notification retry, CSV export |
| Catalog | Products, categories, price tiers, colors/sizes, images (client-side resize to 480/960/1600 webp), active/sort |
| Portfolio | Upload, caption, `approved` toggle, link to product |
| Config | Payment methods, deposit %, WhatsApp number, expiry hours, manual-quote flag, banners, feature flags |
| Staff | Telegram allowlist management |
| Safety | Every destructive action asks for confirmation; all status changes write `order_events` |

UI rules: dense and calm, no decorative motion (`03` §2), big touch targets, works one-handed on a phone.

### Bootstrap the first admin (remote)

The panel is live at `/admin`, but it needs a Supabase Auth user and a matching
`admins` row. Both are one-time dashboard steps (service role stays out of the browser):

1. **Authentication → Users → Add user**: email `<username>@admin.foxplast.app`
   (for example `ahmed@admin.foxplast.app`), set the password, confirm the user.
2. **SQL editor** — link that user to the admin table:

   ```sql
   insert into public.admins (user_id, name)
   select id, 'أحمد' from auth.users
    where email = 'ahmed@admin.foxplast.app'
   on conflict (user_id) do nothing;
   ```

3. Open `/admin` and sign in with the username (`ahmed`) and the password.
   The email itself also works in the username field.

Status changes go through `public.admin_set_order_status` (`0003_admin.sql`), which
checks `is_admin()`, writes `order_events` with the admin's name, and reuses
`apply_order_transition` so the UI can never step outside the state machine.

### Security model

- **No self-service admin.** Public signups are disabled at the project level, so
  nobody can create an account through the anon key. New admins are added in the
  dashboard and linked with SQL (service role).
- `admins` has **no insert/update/delete policy**; anon and authenticated roles
  cannot grant themselves a row. Only `service_role` writes it.
- Every admin table (`orders`, `order_items`, `payment_proofs`, `order_events`,
  `telegram_staff`) is `FOR SELECT/UPDATE TO authenticated USING (is_admin())`;
  anon reads return nothing.
- `/admin` is `noindex, nofollow`; the site sends a CSP (no inline app scripts),
  COOP and HSTS. Login is Supabase email+password with a 12-character minimum.
- The browser only ever uses the publishable key; the service-role key never
  ships. TOTP is available in Supabase if the owner wants a second factor later.

**Backup plan the owner mentioned** (a separate React admin app that pushes content to the site)
is supported by design: the admin talks only to Supabase (RLS + `is_admin()`), so the same code can be
moved to its own app (`apps/admin`) with no backend change. Start inside the same repo to avoid two deploys.

## 3. Updates: what is and isn't possible

| Need | Reality | Recommended solution |
| --- | --- | --- |
| "I ship an update and the client gets it without me telling them" | Fully automatic for **web content** (site, admin, PWA, TWA) | Deploy to the host; service worker detects a new build and shows **"تحديث متاح — اضغط للتحديث"**; `registerType` prompt or auto per your choice |
| "Force the client onto the latest version" | Possible for web builds | `VITE_APP_VERSION` is compared on launch with `app_config.min_web_version`; if lower, show a blocking "حدّث الآن" screen that clears the SW cache and reloads |
| "Upload an APK to Google Drive and the app updates itself silently" | **Not possible** for sideloaded apps. Android always shows an install prompt, requires "install unknown apps" permission, Play Protect may warn, and the new APK must be signed with the same key. Drive links also don't give direct downloads reliably | If an APK is truly needed, host it as a **GitHub Release asset** (stable direct link); the app checks `app_versions` and opens the download link; the user taps install |
| No Google Play | Possible but it costs a one-time developer fee | Out of scope (zero budget); PWA/TWA avoids the need |

### PWA details
- `vite-plugin-pwa` (verify current docs): manifest (Arabic name, RTL), icons from the fox mark (maskable), precache the shell only; **never cache API responses for orders**.
- Update flow: waiting service worker → toast with update button; `skipWaiting` + `clientsClaim` only when the user accepts.
- iOS: PWAs work but push requires installing to the home screen; don't depend on it.

### Optional TWA/APK
- Generate with Bubblewrap or PWABuilder (verify docs), serve `/.well-known/assetlinks.json`, sign with a keystore **the owner keeps** (back it up; losing it means no updates for existing installs).
- Because the TWA loads the live site, **content updates never need a new APK**; the APK changes only when the wrapper itself does.
- Add `app_versions(platform='android')` and a small in-app check (`min_supported` > installed → blocking screen with the release link).

### Optional native Kotlin inbox (the owner's strength)
- Jetpack Compose + MVVM, Supabase REST/Realtime via the official client or Ktor, Firebase Cloud Messaging (free) for pushes triggered from an Edge Function.
- Same auth and RLS as the web admin; no new backend. Build only after Phase 4 is stable and the client asks for it.

## 4. Web Push for staff (optional)

- VAPID keys as Supabase secrets; `push_subscriptions(admin_id, endpoint, keys, created_at)` table.
- `notify` sends a push in addition to Telegram for new orders and uploaded proofs.
- Handle expired subscriptions (410) by deleting them. Request permission from a user gesture only.
- Verify Deno-compatible web-push libraries before choosing one.
