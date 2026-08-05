---
status: current
type: living
date: 2026-08-05
---

# Guidejar — marketing channel assessment

Scored independently against `shovelware-team/docs/marketing/channel-rubric.md`
(2026-08-05). Effort is denominated in Rick-attention first, cash second,
agent-hours barely at all. Impact is expected contribution to **paying
strangers within ~2 quarters**, for this product at its current stage.

## Header

Guidejar is an interactive step-by-step guide builder: a Chrome MV3 extension
records your clicks (or you paste screenshots), you drop hotspots, blur/arrow/text
annotations, chapters and branching choices onto each screenshot, and publish to a
public `/g/<publicId>` URL or an `<iframe>` embed — with AI voiceover and
translation, and per-step funnel analytics for the guide owner. The buyer is the
person who documents repeatable software processes for other people: customer
success, IT/sysadmin, ops, and internal onboarding — the same seat Scribe
($13–25/seat/mo), Tango ($15/seat/mo) and guidejar.com ($16/seat/mo) already
charge for. Registry stage **build**; live and functional at
<https://guidejar.shovelware.ai> with zero users, zero revenue, no payment
processor, and — the fact that dominates this entire sheet — **a product name that
belongs to the live commercial company we cloned** (`guidejar.com`). The
investment memo verdict is **KILL / recommend sunset** (2026-08-01).

## Top 5 / Bottom 5

**Top 5**

| # | Channel | Class | E | I | Priority | One line |
|---|---|---|---:|---:|---|---|
| 1 | `referrals` | A | 2 | 6 | **DO NOW** | Published guides already carry "Made with Guidejar" — but the `?embed=1` iframe strips it. One line of code turns every embedded guide into a placement. Rename first. |
| 2 | `pricing` | B | 3 | 6 | **DO NOW** | There is no price and no processor. P6's pass condition is unreachable until a number exists. |
| 3 | `customer-research` | D | 3 | 6 | **DO NOW** | No ICP doc, no wedge. Mining Scribe/Tango pricing complaints is the only cheap route to one, and it is fully async. |
| 4 | `analytics` | D | 2 | 5 | **DO NOW** | The repo *looks* instrumented and isn't: `lib/analytics.ts` is in-guide telemetry, not acquisition analytics. |
| 5 | `product-marketing` | D | 5 | 7 | CONSIDER | Highest impact on the sheet. Naming + positioning is the one job that re-rates ~15 other rows at once. |

**Bottom 5**

| # | Channel | Class | E | I | Priority | One line |
|---|---|---|---:|---:|---|---|
| 41 | `community-marketing` | A | 8 | 3 | DEFER | The right rooms (r/CustomerSuccess, r/sysadmin) exist, but they need a sustained human presence and the first reply to "check out Guidejar" is "that's not your product". |
| 42 | `social` | A | 7 | 2 | DEFER | Recurring cadence against P2's no-audience constraint, promoting a name we must discard. |
| 43 | `sales-enablement` | D | 7 | 1 | DEFER | Battle cards serve a seller. There is no seller (P1), no deal (P5), and no price. |
| 44 | `sms` | B | 7 | 1 | **N/A** | A desktop browser documentation tool. No phone number is captured anywhere in the schema. |
| 45 | `co-marketing` / `public-relations` (tie) | A | 8 | 1 | DEFER | Both require a counterparty to put their name next to ours. Ours is currently someone else's trademark. |

---

## Class A — Acquisition (17)

| Channel | E | I | Priority | Rationale (Guidejar-specific) |
|---|---:|---:|---|---|
| `ads` | 6 | 2 | DEFER | The obvious buy is "Scribe alternative" / "Tango alternative" — real commercial intent, and the memo already has the competitor price anchors. But the landing page it would point at is branded with a live competitor's trademark (disapproval and complaint risk on Google and Meta both), there is no checkout to recover the click, and P11 says paid isn't a first channel without a payback line. Spending against a $0 product with no processor is spend with no denominator. |
| `ai-seo` | 3 | 3 | CONSIDER | Agent-cheap (`llms.txt`, answer-shaped copy) and the category question — "how do I document a process without recording a video" — is exactly what people ask assistants. Fatal problem: the citation namespace "Guidejar" already resolves to guidejar.com. Every AI-SEO asset we build under this name teaches models to cite the incumbent. Re-rates the day we rename. |
| `aso` | 5 | 2 | **N/A** | No mobile app and none planned; the editor is a desktop browser surface. *But the near-neighbour is not N/A and is being skipped by inattention:* the Chrome MV3 capture extension in `extension/` is currently unpacked-only, and the **Chrome Web Store is a genuine search-driven discovery channel** for "screen recorder", "how-to guide", "screenshot documentation". See Preconditions. |
| `cold-email` | 5 | 2 | DEFER | Async, so P1-clean, and CS/IT leads are enumerable. But the pitch is "free clone of a product named after the product it clones" and there is nothing to buy at the end of it. Cold email that converts to a free signup and then nothing is P6 reach, not money. |
| `co-marketing` | 8 | 1 | DEFER | Co-marketing means a partner putting their brand next to ours in writing. No help-desk, LMS or onboarding vendor will co-brand with an unlicensed clone of a live competitor, and partnership conversations are the archetypal P1 violation. Zero-upside row. |
| `community-marketing` | 8 | 3 | DEFER | The memo's own GTM names the real rooms (r/CustomerSuccess, r/sysadmin, Scribe/Arcade pricing threads) and they genuinely contain the buyer — that's why this scores 3 and not 1. But it demands sustained recurring human presence in communities that punish astroturfing, and the name invites the worst possible first comment. |
| `competitors` | 3 | 4 | CONSIDER | Best-fitting SEO shape in the category: "Scribe alternative", "Tango alternative", "Dubble vs …" all carry buying intent and the memo already holds a five-row competitor table with live prices, so an agent could ship the pages this week. Blocked by absurdity: we cannot publish a "Guidejar alternative" page while we *are* named Guidejar, and a comparison page with no price column against competitors' $13–25/seat is a weak page. |
| `content-strategy` | 4 | 3 | DEFER | A real topic space exists ("how to document an onboarding process", "SOP templates") and the product is the natural CTA at the end of each piece. But content compounds over 3–4 quarters, and every URL published under the current name is discarded at rename — this is the channel most damaged by paying the brand debt late. |
| `directory-submissions` | 3 | 2 | DEFER | AlternativeTo / SaaSHub / TAAFT listings are the memo's named first move and are agent-executable. Two blockers: a listing that reads "Guidejar — an alternative to Guidejar" is a takedown magnet, and directory backlinks are semi-permanent pointers at a name and a `shovelware.ai` subdomain we intend to abandon. Cheap work, negative durable value, in that order. |
| `free-tools` | 4 | 5 | CONSIDER | Unusually apt: the product **already is** the free ungated tool — `/app` builds a guide with no account, drafts live in IndexedDB, publish is anonymous via a capability `editKey`. The strongest variant is carving the capture extension out as a standalone free utility that exports `.json` into `/import`; it is built, it can carry a new name cheaply, and it demonstrates the value in 30 seconds. Held at 5 because a free tool with nothing paid behind it produces P6 reach, not revenue. |
| `launch` | 5 | 2 | DEFER | `LAUNCH_CHECKLIST.md` (2026-06-30) is NO-GO on all three sections with the name GATE open and every launch asset (hero video, screenshots, OG image, announcement copy) missing. A Product Hunt launch under the incumbent's exact name is the single fastest way to convert a private trademark exposure into a public one. |
| `programmatic-seo` | 4 | 4 | CONSIDER | Two real mechanisms, both dormant. (1) **UGC SEO** — every published guide is already a unique indexable URL at `/g/<publicId>` with a real title and description; this is how Scribe ranks. (2) Templated "how to *X* in *Y*" guides generated with our own editor. Currently defeated by mechanics: `sitemap.xml` 404s, `/g/` is `force-dynamic` with no canonical or OG tags, there is no gallery linking the guides, and there are zero published guides to index. |
| `prospecting` | 6 | 2 | DEFER | List-building is agent work, but the motion it feeds (identify → email → *talk*) hits P1, and prospecting for a product with no price means prospecting for free signups. The one thing that would make prospecting sane — a per-seat number to quote against Scribe's $25 — does not exist. |
| `public-relations` | 8 | 1 | DEFER | No press relationships (P2), and journalists want a synchronous human (P1). More importantly the only story this product currently has is "startup clones vendor, keeps vendor's name" — coverage here is a liability, not distribution. |
| `referrals` | 2 | 6 | **DO NOW** | **This is the product's one structural advantage and it is half switched off.** Guidejar produces a shareable public artifact that the *user* sends to other people — `PublicViewer` renders a "Made with Guidejar" footer linking home, so every shared guide is a placement in front of someone who is, at that exact moment, being walked through a process. That sidesteps P2 entirely: it borrows the user's audience, not ours. But `GuidePlayer.tsx:393` gates the footer (and the header logo) behind `!embed` — so the `?embed=1` iframe snippet that ShareDialog hands out, the highest-distribution surface, carries **zero attribution**. That is a one-line fix an agent does unsupervised. The reason it is not already done is the only reason: the wordmark it would broadcast into other companies' help centres is another company's trademark. Rename, then ship it. |
| `seo-audit` | 2 | 3 | CONSIDER | Fully unsupervised and there are concrete defects to find: `sitemap.xml` 404s, no OG/Twitter meta anywhere, default Next.js `favicon.ico`, no canonical tags on published guides, `force-dynamic` on the one page type we'd want crawled. Capped at 3 because auditing a zero-DR staging subdomain that will be replaced at rename is fixing the plumbing of a house we're moving out of. |
| `social` | 7 | 2 | DEFER | The artifact is genuinely demo-able — a branching click-through guide is a good 20-second clip — which is the only thing keeping this off a 1. Against that: a posting cadence is recurring human presence, P2 says we have no following, and every impression trains recall for a name we must abandon. |

## Class B — Conversion & lifecycle (14)

| Channel | E | I | Priority | Rationale (Guidejar-specific) |
|---|---:|---:|---|---|
| `churn-prevention` | 4 | 1 | DEFER | Structurally nothing to prevent: no subscriptions, no processor, no renewals, no users. The one real retention risk this product *does* carry is unusual and not a billing problem — drafts live only in the browser's IndexedDB with no export or backup path (checklist §1.4), so clearing site data destroys a user's unpublished work silently. That's an engineering fix, not a save-offer. |
| `copywriting` | 3 | 4 | CONSIDER | The 368-line landing page exists and converts nothing to a customer because it states no price, no ICP and no differentiation. Two concrete defects an agent fixes in an hour: the hero badge and footer both claim **"Open-source"** with no `LICENSE` file in the repo and no link to a public repository — an unsubstantiated marketing claim on a live page; and the value prop ("Turn any process into an interactive guide") is identical to what Scribe, Tango and the real Guidejar say. Held at 4 because the headline it actually needs — "the free alternative to *X*" — cannot be written until the name is settled. |
| `cro` | 3 | 3 | CONSIDER | There is a page and a signup form to work on, and one thing is already right: the primary CTA is "Start a guide →" to `/app`, not a signup wall — correctly matching the local-first pitch. The blocker is measurement: no marketing analytics is installed, so there is literally no conversion rate to optimise, and no traffic to optimise it on. CRO here would be opinion dressed as method. |
| `emails` | 5 | 3 | DEFER | No email system of any kind exists (checklist §2.7) — a sending domain and stance is a Rick decision. Accounts do exist, so there are addresses. Worth noting the gap that is *not* a marketing problem: there is no email verification and **no password reset**, so a locked-out user today is permanently locked out. Fix that before writing a welcome sequence. |
| `lead-magnets` | 4 | 2 | DEFER | The product's own output is the lead magnet — a published guide is more compelling than any PDF we could gate. Putting an email wall in front of a checklist, to hand someone a free tool with no paid tier behind it, adds friction to a funnel that has no destination. |
| `offers` | 4 | 4 | CONSIDER | There is no offer at all: no price, no plan names, no "free forever" statement, no end date on free. The memo calls open-ended free "a liability, not a plan", and the CFO flagged the specific trap — free *plus* unmetered paid AI endpoints. Constructing the offer (what's free, what's paid, is voiceover/translation the paid line) is upstream of every Class A channel converting. |
| `onboarding` | 3 | 4 | CONSIDER | The "aha" is sharp and identifiable — click through your process, get a finished guide — and it lives in the Chrome extension. But the extension is unpacked-only, so a stranger's first run silently drops to the slow path (paste screenshots one by one), which is the version competitors' free tiers also do. No activation event is defined anywhere in the repo. Defining "published their first guide" as the activation moment and routing first-run to the extension is cheap and materially changes the funnel. |
| `paywalls` | 5 | 2 | DEFER | Nothing to gate: no paid tier exists. The natural gate — AI voiceover and translation — is *dark in production* because `OPENAI_API_KEY` is unset and both endpoints return 503, so a paywall would sit in front of a feature that doesn't run. |
| `popups` | 2 | 1 | DEFER | Zero traffic and no list to capture into. Actively harmful in the one place it might matter: a modal on a published guide degrades the shared artifact, which is this product's only genuine acquisition surface. |
| `pricing` | 3 | 6 | **DO NOW** | The binding constraint on P6. Price today is $0 with no processor in `package.json` — no channel on this sheet can produce a paying stranger until a number exists. The work is small and the anchors are already gathered in the memo: Scribe $13–25/seat, Tango $15/seat, guidejar.com $16/seat, against a free floor set by Dubble (uncapped) and Folge (offline, one-time $89). Agent drafts the tiers, Rick picks the number. |
| `schema` | 2 | 4 | CONSIDER | Unusually well-matched: published guides are literally `HowTo` content, and `HowTo` + `ItemList` JSON-LD on `/g/<publicId>` is the exact structured-data type for step-by-step instructions — the difference between a guide URL being an opaque blob and an eligible rich result. Nothing is emitted today. Two-effort agent job; held at 4 only because there are currently zero published guides to mark up. |
| `signup` | 3 | 4 | CONSIDER | Auth is real (bcrypt + HMAC session cookie) and correctly optional — anonymous publish works via the `editKey` capability, which is a good design. The gaps are recovery-shaped: no email verification, no password reset, no rate limiting on `/api/auth/signup`. And the account is asked for at the wrong moment — the highest-intent instant is *at publish*, when the user has something they want a link for, not at first visit. |
| `site-architecture` | 3 | 3 | CONSIDER | The site is three surfaces stapled together: marketing root `/`, app at `/app`, and a public content surface at `/g/<publicId>` that has **no index, no gallery, no internal links and no sitemap entry**. So the user-generated content that would earn links and rankings is completely orphaned from the marketing site. Fixing the graph is a prerequisite for the `programmatic-seo` row above. |
| `sms` | 7 | 1 | **N/A** | Structurally inapplicable: a desktop, browser-based documentation tool. No phone number is collected anywhere in `migrations/0001_init.sql`, and the artifact (a multi-step interactive guide) is not a mobile-notification medium. Would additionally require a provider, a number and a compliance stance — all Rick decisions plus cash. |

## Class C — Craft & production (5)

| Channel | E | I | Priority | Rationale (Guidejar-specific) |
|---|---:|---:|---|---|
| `ad-creative` | 3 | 1 | DEFER | Inherits directly from `ads` (DEFER, −4). Producing headline variants for campaigns we will not run, pointed at a brand we intend to replace, against a landing page with no price. |
| `copy-editing` | 2 | 3 | CONSIDER | Genuinely cheap and there is real copy to sweep: the landing page's two unsubstantiated "Open-source" claims, and the README whose *first line* is "Guidejar (clone)" and whose second links to the competitor — a public-facing liability the moment the repo is shown to anyone. Also the README documents a filesystem server (`data/guidejar.db`, `data/images/...`) the product no longer uses — it runs on D1 + R2. |
| `image` | 3 | 3 | CONSIDER | Concrete and directly load-bearing for the one channel that matters: there is no OG image and no `og:`/`twitter:` meta anywhere, so **every shared published guide renders as a blank card in Slack, X and LinkedIn** — which kneecaps exactly the shareable-artifact loop scored under `referrals`. Also still on the stock Next.js favicon and stock `public/*.svg` assets, with no logo asset beyond a code-drawn `Logo.tsx`. All of it is throwaway until the rename. |
| `marketing-psychology` | 2 | 2 | CONSIDER | Cheap enough to fold into the eventual rewrite, but this product cannot currently pull any of the three main levers: no scarcity (unlimited free), no social proof (zero users, zero testimonials, no logo wall), and no price to anchor against Scribe's $25. Framing without an offer underneath it is decoration. |
| `video` | 6 | 3 | DEFER | A 40-second screen recording is objectively the best possible demo of this product — it *is* a walkthrough tool, and the checklist confirms no hero/demo asset exists. But repeated takes and a voice are recurring human presence, and the finished asset would be branded with a name we must discard, making it the most re-shootable thing on the list. Do it once, after the rename. |

## Class D — Foundation & intelligence (9)

| Channel | E | I | Priority | Rationale (Guidejar-specific) |
|---|---:|---:|---|---|
| `ab-testing` | 4 | 1 | DEFER | Nothing to split. Zero traffic, no marketing analytics, no conversion event defined — and P3 requires kill tests to fire from instrumentation we already run, which for acquisition does not exist here. A test would take more than two quarters to reach significance on current volume, breaching P4 by an order of magnitude. |
| `analytics` | 2 | 5 | **DO NOW** | The trap row. The repo *looks* instrumented — there is an events table, a `POST /api/g/<id>/events` sink and an owner stats page — but that is **product telemetry inside published guides** (`guide_view`, `step_view`, `branch_picked`, `guide_complete`), not marketing analytics. No PostHog, no landing-page funnel, no conversion event, no UTM convention. Anyone auditing this repo will mark analytics done; it is not. Dropping the house PostHog snippet in is unsupervised agent work, and P3 makes it a precondition for any kill test. |
| `competitor-profiling` | 2 | 4 | CONSIDER | Substantially done already — the memo carries five competitors with live 2026 pricing — and refreshing it is the cheapest thing on the sheet that could move the verdict. The KILL rests on two specific facts that are *someone else's decisions*: Dubble's free tier being uncapped, and Folge being free-offline. If either changes, the "free + local-first" hole reopens. Worth a standing quarterly re-check even under sunset. |
| `customer-research` | 3 | 6 | **DO NOW** | The highest-value foundation row and fully async, so P1-clean. The memo's central charge is that there is "no ICP doc, no differentiation doc — nothing that survives a 'why would anyone switch' question". Review-mining Scribe/Tango/Arcade G2 reviews and the recurring pricing-complaint threads is unsupervised agent work and is the only realistic source of a wedge. It is also the direct input to the memo's reversal test, which requires 20 recruited target users. |
| `marketing-ideas` | 2 | 3 | CONSIDER | Nearly free, but ideas are not this product's shortage. It has a working, deployed app, a competent GTM sketch in the memo, and a clear buyer. What it lacks is a legal name and a defensible reason to switch — neither is an idea-generation problem, and a brainstorm risks producing motion that looks like progress on the wrong axis. |
| `marketing-plan` | 4 | 2 | DEFER | Writing a channel plan for a product whose memo verdict is KILL/sunset. P12 is explicit that a DO NOW in an unfunded project is queued, not permitted — and this document is already the artifact that would tell the plan what to say. Re-rates only if the product is revived under a new registry entry. |
| `product-marketing` | 5 | 7 | CONSIDER | **The gate.** Every Class A row above is discounted by the same two facts — the name is another company's live trademark, and there is no stated wedge. Positioning + naming is the single job that re-rates roughly fifteen rows at once, and nothing else on this sheet does that. Effort 5 rather than 3 because it needs a domain decision and a Rick judgement call on the name, not just agent output. Banded CONSIDER by the arithmetic; treat it as the first item regardless of band. |
| `revops` | 6 | 3 | DEFER | There is no revenue operation to operate: no Stripe in `package.json`, no plans, no invoices, no tax stance, and the CFO's outbound-payer question (whose card backs the OpenAI bill) is still open. Genuinely needed before money can move — but it is strictly downstream of the `pricing` decision, so it should not start first. |
| `sales-enablement` | 7 | 1 | DEFER | Battle cards, one-pagers and demo decks exist to serve a human seller in a deal. P1 bars the calls, P5 caps B2B procurement at PARK, there is no seller and no deal, and the product is a self-serve free tool with a public share link. Structurally the furthest thing on this sheet from how this product would ever make money. |

---

## What this product's scores hinge on

Three facts drove almost every number above.

**1. The name is a live competitor's trademark, and the deploy is public.**
`guidejar.com` is an operating commercial product; our README's first line is
"Guidejar (clone)" and our clone is publicly served at
`guidejar.shovelware.ai`. This is not a branding nicety — it is a **discount
applied to every brand-accumulating channel on the sheet**. Content, directories,
AI-SEO, PR, social, video and comparison pages all work by depositing recall and
backlinks against a name; here, every deposit is either thrown away at rename or
actively raises exposure. It is why nine Class A rows that would score 4–6 for a
generic micro-SaaS score 1–3 here, and why the highest-impact row on the whole
sheet is `product-marketing` rather than any channel.

**2. There is no price and no processor, so P6 is currently unreachable.**
No Stripe, no plan, no number on the landing page, and open-ended free with no end
date. Impact is defined as *paying strangers*, so every acquisition channel is
capped at "produces signups" — explicitly diagnostic-only under P6. This is what
pushes `pricing` into the top three despite being a Class B conversion skill: it
is the row that uncaps the others.

**3. It genuinely does have a viral surface — and it is switched off exactly
where it counts.** This is the real deviation from a generic web micro-SaaS. Most
Shovelware products have no way to reach strangers without an audience (P2);
Guidejar produces a **public artifact the user sends to other people**. Every
published guide at `/g/<publicId>` and every `?embed=1` iframe dropped into a help
centre puts our product in front of someone consuming a walkthrough — the exact
buyer, at the exact moment of felt need, on borrowed distribution. `PublicViewer`
already renders "Made with Guidejar" linking home, so the mechanism is *built* —
but `GuidePlayer.tsx:393` suppresses both the footer and the header logo whenever
`embed` is true, so the highest-distribution surface carries no attribution at
all. Turning that on is one line. The only thing standing in front of it is fact
(1): the wordmark it would broadcast into other companies' documentation is
another company's. Fix the name and this becomes the product's best channel by a
distance; leave the name and it is an amplifier for a trademark problem.

## Preconditions & triggers

What would have to become true to re-rate a DEFER upward. Note that under P12
this project is not a funded lane and its memo verdict is KILL — so everything
below is queued behind a revival decision, not permitted work.

| Trigger | Re-rates |
|---|---|
| **Rename + own domain shipped** (new name, trademark-clear, real domain, `guidejar.shovelware.ai` retired) | The big one. `referrals` becomes unambiguous DO NOW; `competitors`, `directory-submissions`, `ai-seo`, `content-strategy`, `launch` and `image` all jump 2–3 impact points, because brand-accumulating work stops being throwaway. Roughly fifteen rows move. |
| **Stripe wired + a published price** | Uncaps every Class A row's impact ceiling from "signups" to "revenue". `paywalls`, `revops` and `offers` become live work; `ads` becomes arguable for the first time (still needs a payback line under P11). |
| **Embed attribution enabled** (`GuidePlayer.tsx:393` — render the footer in embed mode; add an OG image so shares stop rendering blank) | `referrals` and `image` both become measurable rather than theoretical. Requires the rename first. |
| **First ~20 published guides exist** | `schema` (HowTo JSON-LD), `programmatic-seo` (UGC index + sitemap + a gallery), and `site-architecture` all re-rate — currently they score against an empty content surface. |
| **Capture extension listed on the Chrome Web Store** | Opens a real search-driven discovery channel this sheet cannot currently score under `aso` (which is N/A for lack of a mobile app). CWS listing optimisation is the live analogue and is the most likely channel to be skipped by inattention here. Needs a $5 developer fee and a store-review-safe name — i.e. gated on the rename too. |
| **Marketing analytics installed** (PostHog + conversion event + UTM convention) | `cro` and `ab-testing` become methodical instead of speculative; and P3 becomes satisfiable, so a kill test can actually fire. |
| **A competitor's free floor moves** (Dubble caps its free tier, or Folge ships hosted sharing) | Re-opens the "free + local-first" hole the memo says is bracketed. This is the one trigger that is not in our control and the reason `competitor-profiling` earns a standing quarterly re-check even under sunset. |
| **Memo reversal test passes** (a wedge that isn't "same thing, free", *and* 10 of 20 recruited users publish a real guide and return unprompted within a week) | Revival under a new registry entry. Only then does `marketing-plan` re-rate and this document get rewritten from a funded position. |

### Operational blockers that would break a marketing push

Flagged for the roll-up — these are not channel scores, they are things that
break if traffic arrives.

1. **Unmetered public AI endpoints (critical, latent).** `/api/voiceover` and
   `/api/translate` accept unauthenticated POSTs with no rate limit and no quota.
   The CFO's estimate is **~$2,160/hour / ~$50k/day** at 10 req/s of max-payload
   TTS, bounded only by the card limit. It is dormant *only* because
   `OPENAI_API_KEY` is unset in production. Any marketing push that also turns the
   AI features on turns on the spigot. Hard blocker.
2. **Trademark exposure on a live public deploy.** The clone is served publicly
   under the incumbent's exact name. Marketing does not create this exposure — it
   *amplifies* it, and does so fastest through the channels (PR, Product Hunt,
   directories) that are most visible to the incumbent.
3. **No payment processor.** Nothing can convert to revenue. Any campaign run
   before this is measured in P6-diagnostic units only.
4. **No marketing analytics.** Attribution is impossible; a campaign run today
   cannot be evaluated, and the existing in-guide telemetry is easily mistaken for
   coverage that isn't there.
5. **Shares render blank.** No OG/Twitter meta or OG image anywhere, so every link
   to a published guide — the product's own distribution mechanism — previews as
   an empty card in Slack, X and LinkedIn.
6. **Unsubstantiated "Open-source" claim** on the landing page (hero badge and
   footer) with no `LICENSE` file and no public repository link. A claim to fix or
   substantiate before pointing any traffic at the page.
7. **No password reset and no email verification.** Users acquired by a campaign
   who forget a password have no recovery path at all, and there is no export or
   backup for local IndexedDB drafts.

## Related

- `shovelware-team/docs/marketing/channel-rubric.md` — the scoring frame.
- `shovelware-team/docs/memos/guidejar.md` — investment memo (KILL, 2026-08-01).
- `LAUNCH_CHECKLIST.md` — launch gate, NO-GO on all three sections (2026-06-30).
