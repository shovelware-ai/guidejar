---
status: current
type: living
date: 2026-08-31
---

# Guidejar docs — the map

Trust order when sources disagree: **code › the latest matching
`docs/decisions.md` entry › living docs › records.** Doc standards: the
house `documentation-principles` skill (this file is the §7 map).

**Read this before doing anything public-facing:** the product name
collides with a live commercial product (guidejar.com — this repo is a
clone of it). A rename is required before launch, and until then no
name-binding public surface ships: no `llms.txt`, no directory or store
submissions, no launch posts, no extension publishing. See the 2026-08-14
`decisions.md` entry and `marketing-channels.md` for the full rationale.

## Inventory

- [`decisions.md`](decisions.md) — log, current. Dated decisions; check the
  latest matching entry before re-deciding anything.
- [`marketing-channels.md`](marketing-channels.md) — living, current
  (2026-08-31). Channel-by-channel assessment against the org rubric v2;
  holds the naming-collision analysis and which channels are barred until
  the rename. Header carries what-changed notes for the 2026-08-22 and
  2026-08-31 passes (the latter corrects an OG-override claim and adds the
  `mainroom` rename precedent).
- [`marketing-surfaces.md`](marketing-surfaces.md) — living, current
  (2026-08-31). Which specific store/directory/answer-engine rows the
  product qualifies for, given what is built.

Launch-readiness runs (2026-06-30, 2026-08-14, 2026-08-22, 2026-08-31) also
produce `LAUNCH_CHECKLIST.md` (repo root) and `docs/finance.md`,
`docs/deploy-drift.md`, `docs/ux-review.md`, `docs/CURRENT_STATUS.md`. As of
2026-08-31 those still exist only as uncommitted files in the primary
checkout, unchanged since 2026-08-22 — until they land, treat this note as
the pointer to where that state lives. The headline from `deploy-drift.md`
is summarised in `decisions.md` so it survives that gap: as of 2026-08-31
the only open GATE deviation is **AI calls going provider-direct to OpenAI
instead of OpenRouter** (§10a/§10b) — the Umami/privacy-policy GATE (§11) is
code-complete pending a live deploy and verification. The approved-deviations
registry is empty — nothing on this product has ever been ratified in
writing, so no deviation you find here should be read as blessed.

## Reading paths

- **Assessing launch readiness:** `decisions.md` (latest entries) →
  `LAUNCH_CHECKLIST.md` if present → `marketing-channels.md` header.
- **Any marketing/discoverability work:** the naming note above →
  `marketing-channels.md` → `marketing-surfaces.md`.
- **Touching voiceover, translation, or anything that spends AI money:**
  the 2026-08-14 provider-direct entry in `decisions.md` first, then
  `docs/deploy-drift.md` §10 and §4a. The root `README.md` tells you to set
  `OPENAI_API_KEY`; that is accurate about the code and says nothing about
  the open GATE deviation or the missing spend quota.
- **Understanding the product itself:** the root `README.md` (note: it
  predates the Workers port in places; code wins where they disagree).
