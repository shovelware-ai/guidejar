---
status: current
type: living
date: 2026-08-18
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
  (2026-08-05). Channel-by-channel assessment against the org rubric v2;
  holds the naming-collision analysis and which channels are barred until
  the rename.
- [`marketing-surfaces.md`](marketing-surfaces.md) — living, current
  (2026-08-05). Which specific store/directory/answer-engine rows the
  product qualifies for, given what is built.

Launch-readiness runs (2026-06-30, 2026-08-14) also produce
`LAUNCH_CHECKLIST.md` (repo root) and `docs/finance.md`,
`docs/deploy-drift.md`, `docs/ux-review.md`. As of 2026-08-14 those exist
only as uncommitted files in the primary checkout — until they land, treat
this note as the pointer to where that state lives. The headline from
`deploy-drift.md` is summarised in `decisions.md` so it survives that gap:
11 of 14 stack invariants hold; the two GATE deviations are **AI calls
going provider-direct to OpenAI instead of OpenRouter** and **no Umami
analytics or privacy policy**. The approved-deviations registry is empty —
nothing on this product has ever been ratified in writing, so no deviation
you find here should be read as blessed.

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
