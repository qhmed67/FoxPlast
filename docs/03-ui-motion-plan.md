# 03 — UI and motion plan

> Owner of: screen-by-screen map of **which component/skill owns which motion**, performance and
> accessibility budgets for motion, and the test recipe.
> Not the owner of: the generic conflict rules (`AGENTS.md`), visual tokens (`/DESIGN.md`).
> If a row here conflicts with `AGENTS.md`, `AGENTS.md` wins and this row gets fixed.

Signature interaction language (owner's taste): **morph** — one object transforms into the next
instead of cutting between views. Everything else stays still or uses small CSS transitions.

## 1. Ownership legend

| Tag | Meaning | Skill to load |
| --- | --- | --- |
| **M** | morph-ui: React `<ViewTransition>` + `vt-*` | `morph-ui` |
| **C** | CSS micro-state / recipe with motion tokens | `transitions-dev`, `transitions-polish` |
| **G** | GSAP timeline / ScrollTrigger / plugin | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react` (+ `gsap-plugins` when needed) |
| **—** | static, no motion | — |

Always start with `impeccable` for the design decision and finish with `make-interfaces-feel-better`
for the polish pass.

## 2. Screen map

| Screen / moment | What moves | Owner | Notes |
| --- | --- | --- | --- |
| Route change | Page crossfade (blurred variant OK) | M `page-transition` | `<ViewTransition>` keyed by `usePathname`-equivalent; navigation inside `startTransition` |
| Nav (mobile) | Menu button grows into a panel | M `morphing-popover` | links live inside the panel; controls outside the boundary |
| Basket pill → basket summary | Pill morphs into a sheet | M `mini-player` pattern | sheet content is static after the morph |
| Basket count, quantities, prices | Digit roll | M `number-flip` | `tabular-nums`; ≈200 ms (`vt-quick`) |
| Empty basket → first item | Button grows into the first line | M `empty-state` | |
| Home hero | One-shot entrance: stitched seam draws, bag silhouette settles, headline reveals | **G** timeline (once) | Split Arabic by **words only**, never characters (letter joining breaks). Skip on reduced-motion |
| Home "from roll to bag" story | Pinned scroll sequence (3–4 steps) | **G** ScrollTrigger | Mobile: no pin, stacked reveals with IntersectionObserver + CSS. Lazy-load GSAP for this chunk |
| Client-logo strip | Slow marquee | C (CSS keyframes) | Pause on hover/focus; hidden under reduced-motion |
| Catalog filters | Chips toggle; grid adds/removes/reorders | C for chip state, M `animated-list` for the grid | |
| Grid ↔ list toggle | Cards fold into rows | M `list-switcher` | |
| Product card → product page | Photo + title morph into the detail layout | M shared element (`name` + `share="vt-morph"`) | Names namespaced with `useId`/product id; both sides nested the same way |
| Product page: swatches, tier table row highlight | Fill/ring/background | C | no GSAP, no VT |
| Product page: qty stepper | Digit roll | M `number-flip` | |
| Customizer (v1.1) | Color change on SVG fill; logo drag preview | C for fills; pointer events for drag | `gsap-plugins` Draggable only if pointer code gets complex. Keyboard nudging is not animated |
| Order wizard | Step slide forward/back | M `step-wizard` | **Check RTL screenshot**: forward must travel in reading direction; override in a wrapper if reversed |
| Wizard review → submit | Summary card morphs into the ticket | M shared element | the signature morph |
| Ticket "print" | Paper slides out of a printer slot, lines stagger in, barcode draws | **G** timeline ≈ 900 ms, once | Starts **after** the morph finishes: `await document.activeViewTransition?.finished` (guard for null). Never overlaps the morph |
| Copy buttons | Check-mark swap, "تم النسخ" | C | |
| Proof upload | Dropzone state, progress bar | C | thumbnail → ticket slot: M shared element |
| Status stamp (`paid`) | Stamp thumps in, −8° | C keyframes (single owner) | static under reduced-motion |
| Tracking status steps | Active step fills | C | polling updates swap content without animation unless the status changed |
| Toasts | Slide/fade | C | |
| Admin | None decorative | — | allowed: M `animated-list` for new orders, M `morph-dialog` for order detail. Keep everything else still |
| Portfolio grid → lightbox | Thumbnail morphs to full view | M `photo-grid` / `morph-dialog` | blur logo area of unapproved items inside the same component |

## 3. Boundaries and sequencing rules (practical)

- **One owner per element.** An element inside a `<ViewTransition>` boundary is not also tweened by
  GSAP or given a CSS `transition` on the same properties during the transition.
- **Sequence, don't overlap.** Morph first, GSAP second. Use `document.activeViewTransition?.finished`.
- **Controls stay outside boundaries.** Snapshots ignore clicks until the transition ends.
- **Skip before start.** `document.activeViewTransition?.skipTransition()` before every animated `startTransition`.
- **Functional state updates** (`setX(x => …)`) in anything that animates.
- **No-ops don't animate.** Clicking the active tab/step does nothing.
- **Keyboard-driven changes never animate.**
- **Fixed heights** around growing/shrinking regions to avoid page jumps.
- **Tokens only.** Durations/eases come from `motion.css`; GSAP reads CSS variables
  (`getComputedStyle(document.documentElement).getPropertyValue('--...')`). No literals.
- **Unsupported browsers:** View Transitions degrade to an instant change. Never rely on motion to convey state.

## 4. Budgets

| Area | Budget |
| --- | --- |
| Initial route JS | ≤ 180 KB gzip (target) — GSAP, html-to-image, qrcode, admin are dynamic imports |
| LCP (4G, mid-range Android emulation) | ≤ 2.5 s on home and product |
| CLS | < 0.1 |
| INP | < 200 ms |
| Motion duration | micro 120–180 ms · UI 200–300 ms · structural morph ≈ 400 ms · ticket print ≈ 900 ms once |
| Simultaneous animated elements | ≤ ~12 on screen on mobile; no animating `width/height/top/left` (use transform/opacity) |
| Reduced motion | every animation has a static equivalent; verified by test |

## 5. Test recipe (Playwright)

For each changed screen, run and attach screenshots:

1. Mobile 360×740, `dir="rtl"`, normal motion.
2. Same with `reducedMotion: 'reduce'` — no motion, no layout shift, all content visible.
3. Desktop 1280×800.
4. Chromium with 4× CPU throttle (CDP) — no dropped-frame jank on the morphs; if janky, shorten or drop the effect.
5. Keyboard-only pass: focus ring visible, no animation on arrow-key changes, no focus trap.
6. For morphs: click, wait for `document.activeViewTransition` to be null, assert final DOM state; also click twice quickly to prove `skipTransition` handling.

## 6. Accessibility

- Contrast ≥ 4.5:1 for text (orange is never body text; see `/DESIGN.md` §2).
- Status is never color-only (icon + text).
- Touch targets ≥ 44 px (48 px for primary inputs/buttons).
- Forms: labels above inputs, errors announced (`aria-live`), numeric inputs use `inputMode`.
- Directional icons mirrored in RTL; numbers/codes isolated with `dir="ltr"`.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency` (we use none), and `forced-colors` basics.
