# 00 — Product brief

> Owner of: what the product is, who it is for, scope, content inventory, open client questions.
> Not the owner of: tech (`01`), flows (`02`), visuals (`/DESIGN.md`), motion (`03`).

## 1. What we are building

A fast, Arabic-first (RTL) website for **Fox Plast**, a factory that makes promotional and
packaging bags: eco-friendly non-woven cloth bags, kraft paper bags, and large storage bags.
Brand hashtags: `#شنط_دعاية_صديقة_للبيئة`, `#شنط_قماش`, `#شنط_كرافت`.

The client first asked for "a simple site: show the work, then take an order". We keep that
core, but make it memorable: a bag customizer, a morphing UI, and a payment ticket that looks
like a thermal-printer receipt. No paid services anywhere (zero budget).

## 2. Users and traffic

| User | Goal | Notes |
| --- | --- | --- |
| Small-business owner (shops, clinics, brands) | See samples, get a price, order 100–5,000 branded bags | Arrives from **Facebook ads on a phone**, often inside the Facebook in-app browser |
| Individual buyer | Buy a few storage bags | Smaller quantities, price-sensitive |
| Factory staff (1–3 people) | Receive orders, check payments, update status | Uses Telegram + a phone-friendly admin |
| Owner (Ahmed, developer) | Update content without redeploying | Admin panel, config table |

Design for 360px-wide mid-range Android on 4G first. Desktop is secondary.

## 3. Catalog (inferred from the supplied photos — confirm with the client)

| Family | What the photos show |
| --- | --- |
| Non-woven cloth shopping bags | Die-cut handle ("D-cut") and loop-handle styles; printed with client logos; many colors (yellow, orange, black, red, pink, blue, green, white, natural) |
| Kraft paper bags | Brown and white, printed, rope handles |
| Storage bags ("شنطة الخزين") | Poster shows 70 × 60 × 20 cm, colors green / blue / gray / red, strong carry handles; also printed fabric versions |
| Garment covers | Black suit/garment cover with a printed logo |

All prices, MOQs and sizes are `TODO(client)`. Never invent them.

## 4. Key journeys

1. **Browse → request a price.** Home → catalog → product → add to order → wizard → ticket.
2. **Customize.** Product page → bag customizer (pick color, place logo, see a live preview) → add to order.
3. **Pay the deposit.** Ticket → pay to the shown number → upload the transfer screenshot → wait → stamp.
4. **Track.** `/track/<code>?t=<token>` shows status; opened from the ticket or a Telegram deep link.
5. **See the work.** Portfolio gallery of real production (only brand-approved items shown un-blurred).
6. **Staff.** Telegram message per order with buttons; admin panel for everything else.

## 5. Scope

### MVP (must ship)
- Catalog with categories, product pages, price tiers by quantity, min-qty rules.
- Basket and order wizard (items → contact → review → submit) with server-side pricing.
- Order ticket (signature component), WhatsApp "send details" button (`wa.me`), Telegram notification to staff.
- Payment proof upload, staff confirm/reject, public tracking page.
- Portfolio gallery with an `approved` flag per item.
- Admin: orders, catalog CRUD, portfolio, config.
- Arabic copy, SEO basics, Open Graph for sharing, privacy page.

### v1.1
- Bag customizer (SVG templates, logo placement preview, saved into the order as `print_spec`).
- Scroll story "from fabric roll to your bag" (GSAP).
- Telegram opt-in for customers (`t.me/<bot>?start=<token>`) to get status updates.
- PWA install + Web Push for staff.
- Meta Pixel `Lead` event on order submit (the client runs Facebook ads).

### Later / optional
- Android TWA/APK wrapper, native Kotlin staff inbox (see `06`).
- Quote PDFs, reorder from past orders, bilingual (English) pages.

### Non-goals
Card payments or any payment gateway; WhatsApp Business API or unofficial WhatsApp libraries;
customer accounts/login; inventory management; shipping-carrier integration.

## 6. Content inventory

| Content | Source | Status |
| --- | --- | --- |
| Logos (2 variants) | Owner supplied → `public/brand/` | received; vectorize in Phase 0 |
| Storage-bag poster | Owner supplied | received |
| Production photos | Client | partial; request originals (not Facebook-compressed) |
| Product list, sizes, prices, MOQ | Client | `TODO(client)` |
| About copy, factory story | Client | `TODO(client)` — draft from `DESIGN.md` §10 voice |

## 7. Open questions for the client (send as one message)

1. Official WhatsApp number and Telegram usernames of the staff who will receive orders.
2. Price tiers and minimum quantity per product; are prices shown publicly or "on request"?
3. Deposit percentage and accepted payment methods (InstaPay, Vodafone Cash, bank transfer): numbers and account-holder names.
4. Lead time, delivery governorates, delivery fees, pickup from the factory?
5. Print options: how many ink colors, print methods, artwork file formats, minimum logo size.
6. Which portfolio brands have agreed to be shown?
7. Factory address, working hours, social links, preferred domain name.
8. Who confirms payments and how fast (target response time shown on the ticket)?

## 8. Success measures

- Order form completion rate from mobile; ticket → proof-upload conversion.
- Time from "proof uploaded" to "confirmed" (staff SLA).
- Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility on home and product pages.
- Zero secrets in the repo; zero paid services.
