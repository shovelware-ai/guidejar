---
status: current
type: log
date: 2026-08-31
---

# Decisions

Append-only. Entry shape: **date | decision | rationale**. Trust order:
code › the latest matching entry here › living docs › records.

---

**2026-08-31 — 4th launch-readiness progress check: nothing in the repo
moved; two corrections landed; three items finally got filed to Rick.**
Nine days after the 2026-08-22 pass, `git status`/`git diff` are byte-identical
(the only commit since is `8123dec`, a CLAUDE.md symlink chore) and the live
site still serves the **2026-06-04** build — `/privacy`, `/terms`,
`/sitemap.xml` all 404 live, `robots.txt` is still Cloudflare's default. No
GATE opened or closed. What did change:

1. **A doc error is fixed.** `marketing-channels.md` and `marketing-surfaces.md`
   both claimed `/g/<publicId>` never overrides the site-wide OG/Twitter meta.
   The code disagrees — it has a `generateMetadata` setting the guide's own
   title/description and `og:type=article`. Code wins; both docs corrected.
   The real remaining defect is narrower than previously stated: there is
   still **no OG image asset anywhere** (`public/` is empty), so cards are
   text-only `summary`, not blank.
2. **The rename now has an org precedent and a priced cost.** On 2026-08-22
   Rick renamed `doorlist` → `mainroom` after an identical trademark collision
   (shovelware-team commit `61cf380`). Full cost: a name decision, a Cloudflare
   brand domain at ~$25.20/yr, handles on X/GitHub, a trademark search to
   `rick-meatware`, a 301, and an org-surface sweep (agent memory, the
   investment memo filename, the portfolio channel rollup, and — Guidejar-
   specific — the Umami website's own domain field, which must move in the
   same cutover or analytics silently goes quiet). "We don't know what a
   rename costs" is no longer a valid reason to leave this open.
3. **The standing $50/mo OpenAI launch-budget posture is retired — it was
   never re-examined, and it was wrong.** Re-derived against live data
   (cash on hand **$399.42**, below the org's $1,000 floor; BUILD-stage
   per-key norm elsewhere in the portfolio is $10/mo) the revised ask is
   **$10/mo OpenAI cap + $10.46 one-time domain = $130.46 year-one
   not-to-exceed**, and break-even against that cap is **1 paying user**, not
   2. Full derivation: `docs/finance.md` §5.
4. **Three items that had sat open across four passes without ever being
   asked of Rick finally got filed**, per the house rule that "queue this up"
   is the default when a question is his to close and nobody has put it in
   front of him: `rick-think 9d928067` ("rename it or sunset it" — framed as
   a binary on purpose, since sunset closes the §2 GATEs as cleanly as a
   rename); `rick-think 728e89b0` (approve the revised $130.46 year-one
   OpenAI/domain ceiling — a ceiling, not permission to set the key, since the
   abuse-quota GATE is independent and still open); `rick-meatware 5f326126`
   (confirm the OpenAI org-level spend cap and the card/limit behind the
   account — no credential available to any agent can read
   `/v1/organization/costs`, 403 again this pass). The CFO's own assessment:
   the budget GATE had read "FAIL — no approved number" for four consecutive
   passes and had never been filed; it is the sixth time this exact failure
   mode (a Rick-level question repeatedly re-reported instead of queued) has
   shown up across the portfolio.

**What this explicitly does not change.** No GATE opened or closed. No code
was committed or deployed this pass — that decision (queue the deploy, don't
do it unilaterally in a progress-check run) is unchanged from the three prior
passes. `docs/marketing-channels.md` and `docs/marketing-surfaces.md` are
re-dated 2026-08-31 with real content changes (not a bare re-date);
`docs/finance.md` is `last-verified: 2026-08-31`.

---

**2026-08-22 — The marketing channel and surface docs are re-dated to match;
no channel status changed.** A §2 marketing progress check re-read
`docs/marketing-channels.md` and `docs/marketing-surfaces.md` against the
working-tree changes recorded in the entry above, plus root-layout OG/Twitter
meta + `metadataBase`, `robots.ts`/`sitemap.ts` with `noindex` on every
app-internal route, and the removal of the unsupported "Open-source" hero and
footer claim. Both living docs are now dated 2026-08-22 with a
what-changed header. Three substantive corrections: the analytics precondition
said **PostHog** (the house standard is Umami); the "shares render blank"
blocker is now "shares preview **wrong**" — root-layout OG exists but there is
still **no OG image asset** and `/g/<publicId>` never overrides `openGraph`, so
a shared guide advertises the landing page's card; and the Chrome Web Store's
published-privacy-policy blocker is retired *in code only*.

**What this explicitly does not change.** No channel moves from BARRED to OPEN
and no surface becomes submittable. The 2026-08-14 no-name-binding-surfaces
decision stands in full — no `llms.txt`, no directory or store submissions, no
launch posts, no extension publishing until the rename. The privacy policy is
written under the pre-rename name and must be re-read after it. And **none of
this is deployed**: the live site serves no Umami, no OG tags, 404 on
`/sitemap.xml`, 404 on `/privacy`, and Cloudflare's default content-signals
`robots.txt` rather than the app's. Per the house analytics standard
`data-domains` silences non-prod hosts, so nothing here counts as verified
until a deploy plus a live check.

---

**2026-08-22 — Umami analytics website provisioned; privacy policy shipped;
four minor deploy-drift findings remediated — all in the working tree,
none deployed or committed.** During this session's launch-readiness
progress check: created the Guidejar website on the house Umami instance
(id `777edca7-45d1-48be-abc9-7b16ccc6296b`, domain
`guidejar.shovelware.ai`) with replay/heatmap settings matching the fleet
default (moderate mask, 30-day retention, 100% sample rate,
`[data-no-record]` block selector); wired the tracker, the three standard
events, `identifyUser()`, and `data-no-record` on the three places a
signed-in email renders on screen; shipped `/privacy` disclosing session
recording, retention, and the DNT opt-out, linked in the footer — same
change as the tracker, per `analytics-umami.md` §7. Also fixed a fail-open
bug in `src/lib/server/auth.ts` (session signing silently used a hardcoded
dev secret when `SESSION_SECRET` was unset; now throws unless `DEV_MODE=1`),
deleted five unused Next.js scaffold SVGs, fixed the `package.json` deploy
script wording, and added `.dev.vars.example`. None of this is committed or
deployed — see `docs/deploy-drift.md`'s 2026-08-22 entry for the
finding-by-finding disposition and what's still unverified (a live check of
the analytics wiring, and the Umami-side activation funnel, both need a real
deploy first). This closes deploy-drift §6/§11(code)/§12/§13/§13b; §10a/§10b
(provider-direct OpenAI) are untouched and remain the only open GATEs.

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
