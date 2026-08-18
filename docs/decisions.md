---
status: current
type: log
date: 2026-08-18
---

# Decisions

Append-only. Entry shape: **date | decision | rationale**. Trust order:
code › the latest matching entry here › living docs › records.

---

**2026-08-14 — No name-binding public discoverability surfaces before the
rename.** `public/llms.txt` was added and then removed within the same
launch-readiness run: the citation namespace "Guidejar" already resolves to
the incumbent at guidejar.com, so any AI-SEO asset, directory submission,
store listing, or launch post published under this name teaches models and
directories to point at the incumbent (waste) or files trademark exposure.
Do not re-add `llms.txt`, submit to directories, or publish the Chrome
extension until the product is renamed. Full channel-by-channel rationale:
`docs/marketing-channels.md` (the "brand bars" and the `ai-seo` row).

**2026-08-14 — Umami analytics and session replays wait for a privacy
policy.** The house-standard analytics setup includes session replays, and
the launch checklist's own §2.3 requires a privacy policy that discloses the
recording. No privacy policy exists yet, so the dependency is recorded
instead of wiring replays without disclosure. Sequence: privacy policy
first, then Umami + replays.

**2026-08-14 — Session-auth on the AI spend endpoints is a prerequisite,
not the abuse fix.** `/api/voiceover` and `/api/translate` were gated to
require a signed-in session during the 2026-08-14 launch-readiness run
(uncommitted at the time of this entry). Per the CFO's §3 assessment, this
alone does not close the abuse GATE: self-serve signup has no email
verification, so a session costs one POST. The GATE stays open until a
per-user daily quota on AI spend exists. Do not tick the abuse item on the
auth gate alone.

**2026-08-14 — AI calls stay provider-direct to OpenAI for now; the
deviation is open, not ratified.** The deploy-drift audit (11 of 14
invariants hold) found `src/lib/server/openai.ts` calling `api.openai.com`
through the `openai` SDK on `OPENAI_API_KEY`, where the house standard
requires OpenRouter. Two halves, different dispositions: **translation**
(`gpt-4o-mini`) is a straight swap to `openai/gpt-4o-mini` via
`baseURL: https://openrouter.ai/api/v1`; **voiceover TTS**
(`gpt-4o-mini-tts`) is not — the conformant candidates
(`openai/gpt-audio-mini` on OpenRouter, or Workers AI `@cf/deepgram/aura-1`)
are chat-completions/other-vendor paths, so the six named voices and
verbatim-read behaviour need revalidating first. Remediate-vs-ratify on the
TTS half is Rick's GATE call plus the CFO's cost call, pending an hour's
evaluation. There is no `guidejar` OpenRouter workspace and no
`guidejar-prod` key today, so provider-direct spend is invisible to
`operations/openrouter-monitor` (it groups by `<slug>-prod` key name) —
whatever is chosen must land somewhere that monitor can see.

**Do not remediate this in isolation.** The AI endpoints are inert today
only because `OPENAI_API_KEY` is unset in prod, and they still have no rate
limit or per-user quota (see the abuse-gate entry above). Wiring a working
key — OpenRouter or otherwise — before the quota exists converts a dormant
endpoint into a live unbounded spend path. Ship §10 and the quota in the
same change. Detail and the empty approved-deviations registry:
`docs/deploy-drift.md`.
