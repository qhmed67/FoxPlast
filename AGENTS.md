# Fox-Plast — agent notes

Frontend/UI project. Design, motion, and polish guidance lives in
`.opencode/skills/` (13 skills from four upstream packs):

| Pack | Skills | Role |
| --- | --- | --- |
| [impeccable](https://github.com/pbakaus/impeccable) v4.7.1 | `impeccable` | Design direction, critique, audit, design-system capture |
| [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) | `make-interfaces-feel-better` | Micro-detail polish checklist |
| [transitions.dev](https://github.com/Jakubantalik/transitions.dev) | `transitions-dev`, `transitions-polish`, `transitions-ui-generation` | CSS state transitions + motion tokens |
| [gsap-skills](https://github.com/greensock/gsap-skills) | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-utils`, `gsap-performance` | JS animation engine |

## Layering (apply in this order)

1. **`impeccable` — decides.** Hierarchy, layout, type, color, motion *intent*,
   and the design system (`DESIGN.md`, tokens). Load it first for any
   design/redesign/critique task.
2. **`make-interfaces-feel-better` — polishes details** inside that direction:
   hover/focus/active states, radii, shadows, optical alignment, icons,
   tabular numbers, spacing.
3. **`transitions.dev` — implements CSS motion.** `transitions-dev` adds
   recipes, `transitions-polish` tunes existing motion against the token scale,
   `transitions-ui-generation` only when explicitly requested.
4. **`gsap-skills` — implements JS motion.** Only when motion needs GSAP:
   timeline sequencing, ScrollTrigger, plugins (Flip, SplitText, Draggable…),
   SVG, or the user names GSAP.

## Conflict rules

These packs overlap on motion. When their guidance disagrees, resolve as follows:

- **One property, one owner.** Never animate the same property with both a CSS
  `transition` and a GSAP tween. Pick one per property.
- **Component state = CSS.** Hover, focus, open/close, enter/exit → transitions.dev
  recipes and tokens. Do not reach for GSAP for these.
- **Orchestration = GSAP.** Sequenced timelines, scroll-linked/pinned sections,
  stagger choreography across many elements, or plugin-driven effects → GSAP.
  Scroll-*triggered* one-off reveals are fine with IntersectionObserver + CSS.
- **Motion tokens are the single source of truth.** transitions.dev defines
  duration/distance/scale/blur/easing. When GSAP needs those values, read the
  CSS custom properties instead of hardcoding numbers.
- **Aesthetics: `impeccable` outranks `make-interfaces-feel-better`.** The
  polish skill executes inside the direction, it does not set it.
- **`transitions-ui-generation` is opt-in.** It is a demo-flavoured "AI is
  building this" effect; never apply it to production UI unprompted.
- **Restraint wins ties.** If adding motion is not clearly justified by the
  design intent, keep the interface still.
- `prefers-reduced-motion` must be honoured by all four packs. Where a recipe
  and a GSAP implementation both exist, the CSS one is the reduced-motion path.

## Skills

Skills are discovered automatically from `.opencode/skills`. Load one with the
`skill` tool by ID, or mention it as `@skill-id` (for example
`@transitions-polish`). Upstream packs also ship CLIs (`npx impeccable`,
`npx transitions-agent`, `npx transitions-refine live`) — those are optional and
not installed as part of a task unless the user asks.

Licensing: transitions.dev skills are free for personal and commercial use but
the library itself may not be redistributed; keep their `LICENSE.txt` files
beside the skills. gsap-skills are MIT; impeccable is Apache 2.0.
