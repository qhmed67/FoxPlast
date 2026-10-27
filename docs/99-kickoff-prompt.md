# 99 — Kickoff prompt (for the human)

Paste **Prompt A** into OpenCode once, at the start. For every later session use **Prompt B**.
Before pasting, make sure the repo looks like this (copy the files from the kit):

```
AGENTS.md                 ← repo root (replaces the old one)
DESIGN.md                 ← repo root
docs/README.md … 06-…md   ← docs/ folder
public/brand/             ← put the logo PNGs here (names in docs/README.md)
public/products/          ← factory photos, if you already have them
.opencode/skills/         ← your 13 existing skills (+ morph-ui, installed by the agent if missing)
```

---

## Prompt A — first session

```
You are the lead engineer for "Fox Plast", a zero-budget Arabic (RTL) website for a promo-bag
factory: catalog -> order wizard -> payment ticket -> proof upload -> staff confirmation via
Telegram. Stack: React + Vite + TypeScript + Tailwind v4, Supabase (free), Vercel.

## How this repo is organized (read before doing anything)
- AGENTS.md (repo root, auto-loaded): HOW the 14 skills in .opencode/skills/ combine, motion
  conflict rules, and project guardrails. It does not describe the product.
- DESIGN.md (repo root): the visual system (colors, type, components, imagery, Arabic copy tone).
  Its colors are provisional until Phase 0 extracts them from the logos.
- docs/README.md: index + which file OWNS which topic + precedence when files disagree.
- docs/00-product-brief.md   what we build, scope, open client questions
- docs/01-architecture.md    stack, data model, RLS, Edge Functions, env vars, deploy
- docs/02-order-and-payment-flow.md  order states, Telegram, wa.me, ticket, proof upload, fraud
- docs/03-ui-motion-plan.md  which skill/component owns which motion, budgets, test recipe
- docs/04-delivery-plan.md   phases + checkboxes + Decisions log  <- your task list
- docs/05-tips-and-risks.md  risks and advice (never overrides the files above)
- docs/06-admin-and-app.md   admin panel, PWA, optional Android shell, updates
Assets: logos and the storage-bag poster go in public/brand/ (file names in docs/README.md).
Product photos go in public/products/. If an asset is missing, use a placeholder marked
TODO(asset) and continue. Anything that needs a client answer is marked TODO(client).

## Hard rules
1. Zero budget: no paid service, API or plan. If something needs money, stop and propose a free option.
2. Never put secrets in the repo or in chat. Only VITE_* values are public.
3. Never invent prices, phone numbers, brand names or payment accounts.
4. Verify any API (Supabase, Telegram, React ViewTransition, Vite plugins, GSAP) in the official
   docs with the Firecrawl MCP before using it. Do not rely on memory.
5. Do not edit anything in .opencode/skills/. Do not edit morph.css or the morph components after
   copying them; tune via src/styles/motion.css and wrapper components.
6. Single owner per topic (docs/README.md). Don't duplicate content between files; link instead.
7. After each task: build, lint, typecheck, and a Playwright screenshot at 360px RTL if UI changed.
   Look at the screenshot. Commit per task with a clear message.

## Your job this session: Phase 0 ONLY (docs/04-delivery-plan.md)
Do NOT start Phase 1. Steps:
1. Read AGENTS.md, DESIGN.md, docs/README.md, docs/04 (Phase 0), docs/01 sections 2-3.
2. Report in 10 lines or less: what you understood, what is missing in the repo (assets, skills,
   MCPs), and any conflicts you found between the files. Do not fix the docs yourself unless the
   conflict blocks you; list it.
3. Check .opencode/skills/ has 14 skill folders. If morph-ui is missing, install it with the
   command in AGENTS.md. Confirm Playwright and Firecrawl MCPs respond.
4. Do the React version gate (docs/01 section 2) and record the result in the Decisions log.
5. Scaffold the app, styles (theme.css mapped from DESIGN.md section 2), fonts, RTL base,
   Playwright (3 projects), CI, as listed in Phase 0.
6. Brand extraction: extract the real palette from the logos in public/brand/, update DESIGN.md
   (colors, status: final), vectorize the horizontal logo and make a knockout variant.
7. Check the current free-tier limits and the Vercel commercial-use clause; write findings and the
   date in the Decisions log (docs/05 lists what to check).
8. Tick the Phase 0 boxes you actually completed. Finish with: what is done, what is blocked,
   and the exact first task for the next session. Ask me at most 3 questions, only if blocked.

Load skills one at a time by name when a sub-task needs them (impeccable for design decisions
first). Keep your plan short, then work.
```

---

## Prompt B — every later session

```
Read AGENTS.md and docs/README.md. Open docs/04-delivery-plan.md and take the first unchecked
task in the current phase (current phase: <N>). Read only the docs that task needs (docs/README.md
says which file owns what). Verify any API in official docs via Firecrawl before using it.
Do that task only, run build/lint/typecheck and the Playwright checks (360px RTL + reduced motion
for UI work), look at the screenshots, commit, tick the box, and tell me in 5 lines what changed
and what the next task is. If a decision was made, add it to the Decisions log. If you need a
client answer, use TODO(client) and continue.
```

---

## Prompt C — motion phase (Phase 5), per screen

```
Load @impeccable first and critique the screen against DESIGN.md. Then take ONE row of the table in
docs/03-ui-motion-plan.md section 2: <screen/moment>. Implement it with the owner listed in that
row (@morph-ui / @transitions-dev / @gsap-*), then run @make-interfaces-feel-better and
@transitions-polish for details. Follow AGENTS.md conflict rules and docs/03 sections 3-5
(boundaries, budgets, tests). Show me screenshots for normal and reduced motion at 360px RTL.
```
