# Fox-Plast — agent notes

Storefront + order flow for a promo-bag factory (React + Vite + Supabase, zero budget).
Design, motion, and polish guidance lives in `.opencode/skills/` (14 skills from five
upstream packs).

**Scope of this file:** how the skills combine, plus a few project guardrails.
**What we are building** lives in `docs/` (start at `docs/README.md`).
**The visual system** (tokens, type, components) lives in `DESIGN.md`.
Never copy content between these files — link instead.

| Pack | Skills | Role |
| --- | --- | --- |
| [impeccable](https://github.com/pbakaus/impeccable) v4.7.1 | `impeccable` | Design direction, critique, audit, design-system capture |
| [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) | `make-interfaces-feel-better` | Micro-detail polish checklist |
| [morph-ui](https://github.com/AnmolSaini16/morph-ui) | `morph-ui` | Shared-element morphs, list/route/layout transitions via React `<ViewTransition>` + `vt-*` classes |
| [transitions.dev](https://github.com/Jakubantalik/transitions.dev) | `transitions-dev`, `transitions-polish`, `transitions-ui-generation` | CSS state transitions + motion tokens |
| [gsap-skills](https://github.com/greensock/gsap-skills) | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-utils`, `gsap-performance` | JS animation engine |

## Layering (apply in this order)

1. **`impeccable` — decides.** Hierarchy, layout, type, color, motion *intent*,
   and the design system (`DESIGN.md`, tokens). Load it first for any
   design/redesign/critique task. The owner's stated taste — the **morph UI/UX
   style** — is an input to this step: morph is the project's signature
   interaction language.
2. **`make-interfaces-feel-better` — polishes details** inside that direction:
   hover/focus/active states, radii, shadows, optical alignment, icons,
   tabular numbers, spacing.
3. **`morph-ui` — implements structural motion.** Shared-element morphs, cards
   that grow into dialogs, list add/remove/reorder, step/route transitions,
   number flips. Built on React `<ViewTransition>` and `morph.css` (`vt-*`).
4. **`transitions.dev` — implements CSS motion.** `transitions-dev` adds
   recipes, `transitions-polish` tunes existing motion against the token scale,
   `transitions-ui-generation` only when explicitly requested.
5. **`gsap-skills` — implements JS motion.** Only when motion needs GSAP:
   timeline sequencing, ScrollTrigger, plugins (Flip, SplitText, Draggable…),
   SVG, or the user names GSAP.

## Conflict rules

These packs overlap on motion. When their guidance disagrees, resolve as follows:

- **One property, one owner.** Never animate the same property with both a CSS
  `transition` and a GSAP tween. Pick one per property.
- **One element, one motion system.** An element that sits inside (or is captured
  by) a morph-ui `<ViewTransition>` boundary must not also be driven by GSAP or by
  a CSS `transition` on the same properties while that transition runs.
- **Micro-state = CSS.** Hover, focus, press, toggle, and a single element's
  in-place fade/slide → transitions.dev recipes and tokens. Do not reach for GSAP
  or ViewTransition for these.
- **Structure change = morph-ui.** An element that moves, resizes, appears or
  disappears across the layout, shared elements (card → dialog, summary → ticket),
  list add/remove/reorder, wizard steps, and route changes → morph-ui. Page/route
  transitions are never done with GSAP.
- **Orchestration = GSAP.** Sequenced timelines, scroll-linked/pinned sections,
  stagger choreography across many elements, or plugin-driven effects → GSAP.
  Scroll-*triggered* one-off reveals are fine with IntersectionObserver + CSS.
- **Motion tokens are the single source of truth.** transitions.dev defines
  duration/distance/scale/blur/easing. morph-ui's `--vt-*` settings and GSAP values
  are *derived* from those tokens in one file (`src/styles/motion.css`), via
  `var(...)` or by reading the CSS custom properties — never hardcoded numbers.
- **Aesthetics: `impeccable` outranks `make-interfaces-feel-better`.** The
  polish skill executes inside the direction, it does not set it.
- **`transitions-ui-generation` is opt-in.** It is a demo-flavoured "AI is
  being built" effect; never apply it to production UI unprompted.
- **Restraint wins ties.** If adding motion is not clearly justified by the
  design intent, keep the interface still. High-frequency UI (tabs, toggles,
  basket counters) stays ≈200ms (`vt-quick`) or static. Keyboard-driven changes
  (arrow keys, shortcuts) are never animated.
- `prefers-reduced-motion` must be honoured by all five packs. `morph.css`
  already handles it for `vt-*`; where a recipe and a GSAP implementation both
  exist, the CSS one is the reduced-motion path.

### morph-ui specifics

- Requires **React 19.3+** (`ViewTransition`, `addTransitionType` imported from
  `react`) and **Tailwind v4 with shadcn-style theme variables**. If React is
  older, stop and tell the user — no polyfills, no substitute library.
- Use only React's `<ViewTransition>`. **Never call `document.startViewTransition()`**
  and never use a router's `viewTransition` prop (it calls the native API directly).
  Navigations must run inside `startTransition`.
- Call `document.activeViewTransition?.skipTransition()` before every
  `startTransition` that triggers an animation.
- Components and `morph.css` are **copied in unchanged** (`src/components/morph/`,
  `src/styles/morph.css`). Project-specific tuning goes in `motion.css` and in
  wrapper components, never by editing the copies.
- RTL: `vt-forward` / `vt-back` slide directions must be checked in an RTL
  screenshot; swap or override in a wrapper if they read backwards.
- Colors always come from theme variables (`bg-card`, `text-muted-foreground`…),
  mapped to `DESIGN.md` tokens in `src/styles/theme.css`. No raw palette colors.

## Skills

Skills are discovered automatically from `.opencode/skills`. Load one with the
`skill` tool by ID, or mention it as `@skill-id` (for example
`@transitions-polish`). Upstream packs also ship CLIs (`npx impeccable`,
`npx transitions-agent`, `npx transitions-refine live`) — those are optional and
not installed as part of a task unless the user asks.

Install the morph-ui skill if `.opencode/skills/morph-ui/` is missing:
`npx degit AnmolSaini16/morph-ui/skills/morph-ui .opencode/skills/morph-ui`
(its `assets/` folder holds `morph.css`, the component `.tsx` files and examples;
`references/` holds props and class lists). Do not edit any skill's files.

Licensing: transitions.dev skills are free for personal and commercial use but
the library itself may not be redistributed; keep their `LICENSE.txt` files
beside the skills. gsap-skills are MIT; impeccable is Apache 2.0. morph-ui: check
the upstream repo's license before redistributing anything beyond the copied
components used in this app.

## Git hygiene and authorship

The commit list is part of the deliverable. Keep it readable.

- **One purpose, one commit.** If you make several commits for the same purpose
  before handing over, squash them into one. The history should read as a list of
  features/fixes, not a diary of attempts.
- **Additions are merge commits.** A follow-up that extends an already-committed
  feature is added as a merge commit, not squashed into the original. Only
  unshared commits with the *same* purpose get squashed.
- **Never push without an explicit instruction.** Commit locally; the owner
  decides when to push.
- **Author and co-author.** The owner is the author/editor:
  `qhmed67 <ahmedalmslm74@gmail.com>`. Every agent commit carries the trailer
  `Co-authored-by: qhmed67 <ahmedalmslm74@gmail.com>`.
- **Remote:** `https://github.com/qhmed67/FoxPlast` (do not push yet).

## Project docs (source of truth)

`docs/README.md` is the index and says which file owns which topic. Read it
before any non-trivial task, then only the files that task needs. Work phase by
phase from `docs/04-delivery-plan.md` and tick boxes there as work completes.

## Project guardrails (details in `docs/`)

- **Zero budget.** No paid service, API, or plan. If something needs money, stop
  and propose a free alternative.
- **Secrets never enter the repo or the chat.** Bot tokens and the Supabase
  service-role key live only in Supabase function secrets. `VITE_*` variables are
  public by definition.
- **Verify before using an API.** For Supabase, Telegram, React `ViewTransition`,
  Vite plugins: check the official docs (Firecrawl MCP) instead of recalling.
- **Arabic-first, RTL.** `dir="rtl"`, logical CSS properties, no letter-spacing on
  Arabic text.
- **Small verified steps.** After each task: build, lint, and a Playwright check
  where UI changed. Commit per task.
- **No fabrication.** Prices, phone numbers, brand names and payment accounts come
  from the client or `app_config`; never invent them. Placeholders are marked
  `TODO(client)`.
