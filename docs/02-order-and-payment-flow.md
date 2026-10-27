# 02 — Order and payment flow

> Owner of: order lifecycle, notifications (Telegram, WhatsApp), payment ticket behavior,
> proof upload, anti-fraud. Not the owner of: table definitions (`01`), ticket visuals
> (`/DESIGN.md` §7), ticket motion (`03`).

## 1. Order status machine

| From | To | Actor | Trigger |
| --- | --- | --- | --- |
| — | `submitted` | system | customer submits the wizard (`create-order`) |
| `submitted` | `quoted` | staff | staff sets a final price (only when `requires_manual_quote`) |
| `submitted` / `quoted` | `awaiting_payment` | system or staff | auto when no manual quote is required; otherwise after the quote |
| `awaiting_payment` | `proof_uploaded` | customer | `attach-proof` succeeds |
| `proof_uploaded` | `paid` | staff | **تأكيد الدفع** (Telegram button or admin) |
| `proof_uploaded` | `awaiting_payment` | staff | **رفض** + reason → customer re-uploads |
| `paid` | `in_production` | staff | **بدء التجهيز** |
| `in_production` | `ready` | staff | **جاهز** |
| `ready` | `delivered` | staff | **تم التسليم** |
| any before `in_production` | `cancelled` | staff / customer request | |
| `awaiting_payment` | `expired` | pg_cron | after `order_expiry_hours` (default 72) |

Every transition: validate it is allowed, write an `order_events` row, edit the Telegram message,
and be **idempotent** (pressing a button twice must not double-apply).

## 2. Customer journey

1. **Basket** (localStorage): items with variant + qty. Quantity stepper enforces min-qty with the friendly message from `/DESIGN.md` §10.
2. **Wizard steps** (morph step-wizard): ① items ② contact (name, phone, governorate, optional address, notes, optional logo upload) ③ review.
3. **Submit** → `create-order`. Client sends an `idempotency_key` (uuid per attempt) so double taps and retries return the same order.
4. **Ticket** appears. It shows: order code, items, subtotal, **deposit due now**, payment methods with copy buttons, expiry time, QR of the tracking URL.
5. Customer pays by transfer outside the site, then taps **ارفع صورة التحويل**.
6. Optional: **ابعت التفاصيل على واتساب** (a `wa.me` link, see §4) and **حمّل التذكرة** (image) / share.
7. Tracking page shows status; stamp animates when `paid`.

Phone validation (Egypt mobile): `^01[0125][0-9]{8}$` after normalizing Arabic-Indic digits to Western
and stripping spaces, dashes and a leading `+20`/`0020`. Show the normalized number back to the user.

## 3. Telegram (primary staff channel, zero cost)

Setup: create the bot with BotFather, add it to a private staff group (or DM each staff member),
register the webhook with `secret_token`, store the allowlist in `telegram_staff`.

**New order message** (HTML parse mode, user text escaped):

```
🧾 طلب جديد  FP-7K3M9Q
👤 {name} — {phone}
📍 {governorate}
────────────
{qty} × {product} ({color}/{size})
...
────────────
الإجمالي: {subtotal} ج.م
العربون المطلوب: {deposit} ج.م
🕒 {created_at}
```

**After a proof is uploaded:** `sendPhoto` of the screenshot (via a short-lived signed URL or bytes)
with caption: code, claimed amount, sender hint. Inline buttons: `✅ تأكيد الدفع` · `❌ رفض`.
After confirm: the same message is edited to show who confirmed and when, and the next buttons appear
(`بدء التجهيز` → `جاهز` → `تم التسليم`).

Rules:
- `callback_data` is ≤ 64 bytes: `o:<orderId first 8 chars>:<action>` and the function resolves the full id.
- Always `answerCallbackQuery`; handle Telegram retries (idempotent).
- Reject updates from users not in `telegram_staff` and answer with a neutral message.
- Reject needs a reason: reply-to-message flow ("اكتب سبب الرفض") or a few preset reasons as buttons.
- Customer opt-in: the ticket shows **تابع طلبك على تليجرام** → `https://t.me/<bot>?start=<public_token>`.
  The webhook links `chat_id` to the order and sends status updates. Optional; the tracking page is the baseline.
- Do not message customers who never opted in.

## 4. WhatsApp without any API or fees

The WhatsApp Business API and unofficial libraries (whatsapp-web.js, Baileys, etc.) are **out**:
the first costs money, the second risks banning the factory's number.

Free approach: a **click-to-chat link** the customer taps, which opens WhatsApp with a prefilled message:

```
https://wa.me/<number_in_international_format_without_plus>?text=<encodeURIComponent(message)>
```

- Number comes from `app_config.whatsapp_number` as `20XXXXXXXXXX` (no `+`, no leading `0`).
- Message (Arabic) includes the order code, items, qty, and the tracking link.
- The order is **already saved and sent to Telegram** before this link is shown, so a customer who
  never taps "send" does not lose the order. WhatsApp is a convenience and a trust signal, not the transport.
- Also provide `navigator.share({ files: [ticketImage] })` where supported. Feature-detect; the Facebook
  in-app browser often lacks it — then fall back to download + the wa.me link.
- Floating "كلمنا واتساب" button on content pages uses the same link with a generic message.

## 5. The payment ticket (signature)

Behavior (visuals in `/DESIGN.md` §7, motion in `03`):

- Rendered from order data returned by `create-order`; reopening the tracking URL re-renders the same ticket.
- Payment methods come from `app_config.payment_methods`: `[{ label, number, holder, note }]`.
  **Never hardcode or invent numbers.** Each has **نسخ الرقم** and a **نسخ المبلغ** button (Clipboard API
  with a `<input>` selection fallback for in-app browsers).
- Deposit = `ceil(subtotal × deposit_percent)` in piasters, rounded to whole pounds up.
- Shows a countdown/expiry ("الطلب محجوز حتى …").
- "Download as image": render the ticket DOM to PNG client-side (verify a library with Context7/Firecrawl,
  e.g. `html-to-image`; check it handles Arabic fonts and RTL). Load fonts before capture.
- Stamp states: none → `PAID/تم الدفع` (green) on `paid`; `مرفوض` banner (red) on rejection with the reason.

## 6. Proof upload

1. Customer picks or drops an image (accept `image/jpeg|png|webp`, ≤ 10 MB before compression).
2. Client compresses (target ≤ 400 KB, max 1600 px), strips EXIF, computes SHA-256.
3. `get-upload-url` → direct signed upload to `payment-proofs` → `attach-proof` with `{sha256, sender_hint, amount_claimed}`.
4. UI: thumbnail morphs into the ticket's "attached" slot; status becomes **بنراجع الدفع**.
5. Failure handling: retry with backoff; keep the file in memory; show a human message; offer the WhatsApp link as a fallback.
6. Limits: ≤ 3 proofs per order; ≤ 5 `get-upload-url` calls per order per hour.

## 7. Fraud and abuse controls (cheap, effective)

- **Screenshots can be faked.** Staff must confirm the money actually arrived in the wallet/bank app
  before pressing confirm. Say this in the staff checklist (`05`), and show the claimed amount + sender hint
  beside the photo.
- Flag duplicate `sha256` across orders and show a ⚠ in the Telegram caption.
- Turnstile on order creation; honeypot field; per-IP-hash rate limit (default 5 orders/hour); reject
  obviously fake phones.
- Never trust client totals; recompute from `price_tiers`.
- Do not store card or wallet credentials of anyone, ever. There is no gateway, so no card data exists in the system.
- Collect the minimum personal data (name, phone, governorate; address only if delivery is requested).

## 8. Edge cases to handle explicitly

- Customer reloads or loses the page → tracking URL restores the ticket.
- Customer pays a different amount → staff rejects with reason, or accepts and edits the deposit.
- Two staff press different buttons at once → last valid transition wins; the other gets "already updated".
- Order expires while the customer is uploading → accept the upload, set `proof_uploaded`, flag as late.
- Telegram API down → order is still saved; admin panel shows a "notification failed" badge; retry button.
- Facebook in-app browser quirks (no downloads/share/clipboard) → provide visible fallbacks and an
  "open in Chrome" hint.
