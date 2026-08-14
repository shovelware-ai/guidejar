---
status: current
type: log
date: 2026-08-14
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
