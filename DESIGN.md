---
name: Fox Plast
description: >
  Eco-friendly promotional bag factory (non-woven cloth, kraft paper, storage bags).
  Warm kraft-paper surfaces, navy ink, one fox-orange accent. A craft-and-receipt
  visual language: stitched seams, die-cut handle slots, perforated tickets.
  Arabic-first, RTL.
status: provisional  # colors were sampled by eye from the logos; run the extraction step in docs/04 (Phase 0) and update here
colors:
  ink-900: "#101B33"      # body text, headings
  navy-800: "#16305F"     # dark sections
  navy-700: "#1D3F7B"     # brand navy ("FOX" in the logo)
  navy-500: "#2F63B5"     # links, focus ring, info
  orange-500: "#F28A1E"   # brand accent: fills only (primary buttons, highlights)
  orange-600: "#D9710A"   # accent hover / large display text only
  orange-100: "#FDE9D0"   # accent wash
  red-600: "#C62828"      # danger, rejected, "stamp" red
  green-600: "#1F7A3E"    # success, confirmed, "PAID" stamp
  teal-500: "#25A0C4"     # info highlights (from the fox-mark gradient)
  kraft-50: "#FBF7EF"     # page background
  kraft-100: "#F3EBDC"    # surfaces / cards
  kraft-200: "#E6D8BF"    # borders, dividers
  kraft-400: "#C9AD7C"    # stitch lines, decorative
  kraft-700: "#7A5C2E"    # muted text on kraft
typography:
  display: { family: "Readex Pro", weights: [600, 700], lineHeight: 1.3 }
  body:    { family: "IBM Plex Sans Arabic", weights: [400, 500, 600], lineHeight: 1.7 }
  mono:    { family: "IBM Plex Mono", weights: [500], use: "order codes, prices on the ticket, phone numbers" }
rounded: { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 }
spacing: { base: 4, scale: [4, 8, 12, 16, 24, 32, 48, 72, 112] }
---

# Fox Plast — Design System

> Owner of: visual tokens, type, components, imagery, voice.
> Not the owner of: motion implementation choices (see `AGENTS.md`), screen-by-screen
> motion mapping (`docs/03-ui-motion-plan.md`), data/flows (`docs/01`, `docs/02`).

## 1. Overview

Fox Plast makes bags that carry other people's brands. The site should feel like the
product: sturdy, honest, tactile, a little playful. We avoid the "AI template" look
(purple gradients, glass cards, three-icon feature grids) and instead lean on three
motifs taken from the factory floor and the checkout counter:

1. **Stitched seam** — dashed inset borders (`1.5px dashed kraft-400`, 6px inset) on
   key containers. Reads as bag stitching.
2. **Die-cut handle slot** — the rounded slot cut into a non-woven bag. Used as the
   notch in product cards, the hero shape, and the loading shape.
3. **Receipt tape** — perforated edges, monospace digits, dotted leaders. Used for
   the order/payment ticket and the order summary. The ticket is the signature
   moment of the site.

Overall tone: warm and confident, not corporate. Navy carries authority, orange
carries energy and is rationed (one orange element per viewport as a rule of thumb).

Direction input from the owner: **morph UI/UX style** — elements transform into one
another rather than cutting between views (card → dialog, summary → ticket, pill →
panel). See `docs/03-ui-motion-plan.md`.

## 2. Colors

| Role | Token | Notes |
| --- | --- | --- |
| Page background | `kraft-50` | with optional grain (see §6) |
| Surface / card | `kraft-100` | |
| Border / divider | `kraft-200` | stitch lines use `kraft-400` |
| Text | `ink-900` | secondary text `kraft-700` (check contrast on `kraft-100`) |
| Brand / dark section | `navy-700` / `navy-800` | white text on navy |
| Accent fill | `orange-500` | **text on orange is always `ink-900`** (≈7:1) |
| Accent as text | `orange-600` | large display text only (≈3.2:1 on kraft-50 — fails for body) |
| Success | `green-600` | confirmed, PAID stamp |
| Danger | `red-600` | rejected, error |
| Focus ring | `navy-500` 2px + 2px offset | visible on every interactive element |

Product color swatches (from the poster: green, blue, gray, red) are **product data**,
not UI colors — render them only inside swatch components.

The teal→green→orange gradient behind the second logo is a social-avatar background.
Do not use it as a site background.

### Theme variable mapping (needed by morph-ui)

Define in `src/styles/theme.css`, after `@import "tailwindcss"`:

| shadcn variable | Token |
| --- | --- |
| `--background` | `kraft-50` |
| `--foreground` | `ink-900` |
| `--card` / `--popover` | `kraft-100` |
| `--card-foreground` | `ink-900` |
| `--primary` / `--primary-foreground` | `orange-500` / `ink-900` |
| `--secondary` / `--secondary-foreground` | `navy-700` / white |
| `--muted` / `--muted-foreground` | `kraft-200` / `kraft-700` |
| `--accent` | `orange-100` |
| `--destructive` | `red-600` |
| `--border` / `--input` | `kraft-200` |
| `--ring` | `navy-500` |
| `--radius` | `10px` |

## 3. Typography

- **Display:** Readex Pro 600/700 — headings, big numbers, hero.
- **Body/UI:** IBM Plex Sans Arabic 400/500/600.
- **Mono:** IBM Plex Mono 500 — order codes, ticket amounts, phone numbers (Latin digits).
- Self-host through `@fontsource` packages (no third-party font requests). Verify the exact
  package names on npm; subset to `arabic` + `latin`; `font-display: swap`.
- Scale (fluid with `clamp`): 12 · 14 · 16 · 18 · 22 · 28 · 36 · 48 · 64.
- Body line-height ≥ 1.7, headings 1.3 — Arabic needs the room.
- **Never apply `letter-spacing` or `text-transform` to Arabic** (it breaks joining).
- Numerals: use Western digits (0-9) everywhere for prices, quantities, phones; currency
  suffix "ج.م". `font-variant-numeric: tabular-nums` on every number that can change.
- Phone numbers, order codes and URLs are wrapped in `dir="ltr"` with
  `unicode-bidi: isolate`.

## 4. Layout

- RTL root: `<html lang="ar" dir="rtl">`. Use logical properties only (`ms-*`, `pe-*`,
  `start-*`, `border-s`, `text-start`). Directional icons (arrows, chevrons) are mirrored.
- Mobile-first: most traffic arrives from Facebook ads on phones. Design at 360px first;
  breakpoints 640 / 1024 / 1280. Content max-width 1200.
- Spacing on the 4px scale above. Section rhythm 72–112px desktop, 48px mobile. Vary the
  rhythm; avoid a metronome of identical sections.
- Thumb-zone: primary actions on mobile sit in a sticky bottom bar (basket / next step).
- Do not stack identical rounded cards in a 3-up grid for everything. Mix: one large
  feature block, a ruled list, a horizontal strip, a ticket.

## 5. Elevation & shape

- Radius scale: sm 6 · md 10 · lg 16 · xl 24 · pill. Nested radii follow
  `outer = inner + padding`.
- Shadows are soft "paper" shadows, layered and tinted with ink, never pure black:
  `0 1px 0 rgb(16 27 51 / .06), 0 10px 24px -14px rgb(16 27 51 / .30)`.
  Prefer a shadow to a hard border for raised cards; keep borders for inputs and stitch lines.
- Images get a subtle inner outline (`outline: 1px solid rgb(16 27 51 / .08); outline-offset: -1px`).

## 6. Texture

Optional kraft grain on large background areas only: a static inline-SVG `feTurbulence`
noise at ≤6% opacity as a CSS background. Never animated, never on text containers
with small type, never on the ticket (the ticket must look like clean thermal paper).

## 7. Components

| Component | Spec |
| --- | --- |
| **Button – primary** | `orange-500` fill, `ink-900` text, `md` radius, 48px min height on mobile, pressed `scale(.97)`. One per viewport region. |
| **Button – secondary** | transparent with navy-700 1.5px border, navy text. |
| **Button – ghost/link** | text only, underline offset 4px on hover. |
| **Product card** | kraft-100, `lg` radius, die-cut slot notch at the top (inline-end aligned), 4:5 image, name, "من X ج.م للقطعة", min-qty chip, swatch dots. Whole card is the hit target. |
| **Chip** | pill, kraft-200 fill; selected = navy-700 fill + white text. |
| **Swatch** | 28px circle, 2px ring when selected, name in tooltip + `aria-label`. |
| **Input** | 48px height, kraft-50 fill, kraft-200 border, navy-500 focus ring, label above (never placeholder-only), inline error with icon + text. |
| **Quantity stepper** | − / number / + with number flip; numeric keyboard on mobile; min-qty enforced with a friendly message. |
| **Step indicator** | numbered stitched dots; current step filled navy. |
| **Tier table** | "كمّية → سعر القطعة" as a receipt-style ruled list with dotted leaders. |
| **Status pill** | one per order status, color + icon + text (never color alone). |
| **Ticket (signature)** | 360px max, off-white `#FFFFFF` paper, zig-zag perforation top & bottom (CSS mask), mono digits, dotted leaders, QR (order code), barcode decoration, copy buttons next to payment numbers, "PAID/تم الدفع" rubber-stamp (green-600, rotated −8°) when confirmed. Downloadable as an image. |
| **Toast** | bottom-start, 4s, `role="status"`. |
| **Nav** | logo (inline-start), links, basket button with count (number flip). On mobile the menu is a morphing popover. |

## 8. Motion (intent only)

Character: paper and fabric — quick, decisive, a slight settle, no springy overshoot
beyond ~4%. Roughly: micro 120–180ms, UI 200–300ms, structural morphs ≈ 400ms, the
ticket "print" ≈ 900ms once. Exact values come from the transitions.dev tokens bridged
in `src/styles/motion.css`; ownership per screen is in `docs/03-ui-motion-plan.md`.
Reduced motion: every motion has a static equivalent.

## 9. Imagery & logo

- **Real photos of real production** (the factory's own photos) over stock or generated
  imagery. Consistent crop (4:5 product, 16:9 scene), warm neutral background where
  possible. Missing product photos fall back to the SVG bag templates from the customizer.
- Client-brand bags shown in the portfolio (3M Syrian, Roots, Golden Shoes, Azab Jeans,
  Brother, KRO, Rashad, Koka, Packrich, Qamrin, …) require the brands' permission —
  see `docs/05-tips-and-risks.md`. Provide a per-item "approved" flag; unapproved items
  get a neutral blur on the logo area.
- Logos live in `public/brand/` (see `docs/README.md`):
  - horizontal logo (navy "FOX", orange "PLAST", fox head) → nav, footer, ticket header;
  - fox-mark with the gradient → favicon crop + social avatar only;
  - **the navy wordmark disappears on navy** — on dark sections use a white/orange
    knockout variant or place the logo on a kraft-50 chip. Do not redraw or recolor the logo
    by hand; ask the owner for the vector (or vectorize the PNG with potrace/vtracer).
  - Clear space = height of the "F"; minimum width 96px.
- Icons: one set (Lucide or Phosphor), 1.5px stroke, consistent size 20/24.

## 10. Voice (Arabic copy)

Warm, direct, Egyptian-friendly Arabic that stays readable (not slang-heavy). Short
sentences, verbs first.

| Moment | Copy |
| --- | --- |
| Hero line | شنط دعاية صديقة للبيئة… بتحمل اسم براندك |
| Primary CTA | اطلب عرض سعر |
| Secondary CTA | شوف شغلنا |
| Add to basket | ضيف للطلب |
| Min-qty message | أقل كمية للموديل ده {n} قطعة |
| Payment step | حوّل العربون وارفع صورة التحويل — هنأكد لك في أقرب وقت |
| Waiting | طلبك وصلنا ✓ — بنراجع الدفع |
| Confirmed | تم تأكيد الدفع. بدأنا التجهيز |
| Error | حصلت مشكلة. جرّب تاني، ولو استمرت كلمنا واتساب |

No exclamation-mark piles, no emoji in UI chrome (Telegram messages may use them).

## 11. Do / Don't

**Do** let the product's materials drive the look (kraft, thread, die-cut); keep one accent;
show real numbers and real photos; give every state a designed treatment (empty, loading,
error, success); make the ticket unforgettable.

**Don't** use gradient text, glassmorphism walls, decorative blobs, stock-photo smiles,
orange body text, color-only status, placeholder-only labels, or more than one primary
button per region. Where `impeccable` has its own ban list, that list also applies.
