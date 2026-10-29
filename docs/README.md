# Fox-Plast docs — index and ownership

Read this first. It tells you what each file is, who owns which topic, and what wins
when two files disagree.

## Files

| File | Owns | Read when |
| --- | --- | --- |
| `AGENTS.md` (repo root) | How the 14 skills combine; motion conflict rules; project guardrails | every session (auto-loaded) |
| `DESIGN.md` (repo root) | Colors, type, spacing, components, imagery, Arabic voice | any UI work |
| `docs/00-product-brief.md` | What the product is, users, catalog, features, scope, open client questions | start of the project, copy/content work |
| `docs/01-architecture.md` | Stack, repo layout, data model, RLS, Edge Functions, env vars, deploy | any backend/data/infra work |
| `docs/02-order-and-payment-flow.md` | Order state machine, Telegram + WhatsApp flows, payment ticket, proof upload, anti-spam/fraud | order, payment, notification work |
| `docs/03-ui-motion-plan.md` | Screen-by-screen map: which component/skill owns which motion; perf and a11y budgets | any motion/animation/page-structure work |
| `docs/04-delivery-plan.md` | Phases, checklists, acceptance criteria, testing, decisions log | picking the next task |
| `docs/05-tips-and-risks.md` | Risks, honest caveats, free-tier limits, workflow tips | before architecture decisions; before launch |
| `docs/06-admin-and-app.md` | Admin panel, PWA, optional Android shell, force-update | admin / app work |
| `docs/99-kickoff-prompt.md` | The prompt the owner pastes to start the agent | humans only |

## Single-owner rule

Every topic has exactly one owner file (table above). To change something, change it in
the owner file only; other files link to it. If you find the same fact in two places,
delete one and link.

## Precedence when files disagree

1. The user's latest explicit instruction.
2. For **skill usage and motion ownership**: `AGENTS.md`.
3. For **visuals** (color, type, components, copy tone): `DESIGN.md`.
4. For **data, flows, infrastructure, scope**: `docs/01`, `docs/02`, `docs/00`.
5. `docs/05` is advice; it never overrides the above. If advice and a decision conflict,
   record the decision in `docs/04` → Decisions log.

## Where things live in the repo

```
public/brand/      logos (supplied by the owner; see list below)
public/products/   real product photos supplied by the factory
.opencode/skills/  the 14 skills (do not edit)
src/styles/        globals.css, theme.css (tokens → shadcn vars), morph.css (copied), motion.css (token bridge)
src/components/morph/  morph-ui components, copied unchanged
supabase/          migrations, functions, seed
tests/e2e/         Playwright specs
```

### Brand assets the owner must place in `public/brand/`

| File name | What it is |
| --- | --- |
| `logo-horizontal.png` | Fox head + navy "FOX" + orange "PLAST" on transparent/white |
| `logo-fox-mark.png` | Final mark (2026-10-29): solid black fox head, trimmed and transparent; inverted in dark sections |
| `poster-storage-bag.png` | "شنطة الخزين" poster (70×60×20, four colors) |
| `ref-grid-1.png`, `ref-grid-2.png` | Screenshots of the product/portfolio grids |

If a file is missing, create the component with a clearly marked placeholder
(`TODO(asset)`) and continue — do not block on assets.

## Conventions

- Docs are written in English for the agent; **UI copy is Arabic** (samples in `DESIGN.md` §10).
- Placeholders that need a client answer: `TODO(client)`. Placeholders that need a file: `TODO(asset)`.
- Tick boxes in `docs/04` as work completes; log non-obvious decisions there.
