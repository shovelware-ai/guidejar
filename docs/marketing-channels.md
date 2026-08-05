---
status: current
type: living
date: 2026-08-05
---

# Guidejar — marketing channel assessment (rubric v2)

Scored against `shovelware-team/docs/marketing/channel-rubric.md` **v2**. Complete
rewrite of the v1 assessment. v2 separates **status** (OPEN / BARRED — the only
closing verdict) from **leverage** (`max(rev, diag) − effort`), adds a
**diagnostic impact** number, and replaces v1's one-month CAC ceiling with LTV
payback arithmetic. A LOW / OPEN row here is a candidate for investigation, not a
refusal.

## Header

**What it is.** An interactive step-by-step guide builder. A Chrome MV3 extension
records your clicks (or you paste screenshots); you drop hotspots, blur/arrow/text
annotations, chapters and branching choices onto each screenshot, and publish to a
public `/g/<publicId>` URL or an `<iframe>` embed — with AI voiceover and
translation, and per-step funnel analytics for the guide owner. ~6.2k lines of
TypeScript on Next.js 16 / Workers / D1 / R2.

**Buyer.** The person who documents repeatable software processes for other
people: customer success, IT/sysadmin, ops, internal onboarding — the same seat
Scribe ($13–25/seat/mo), Tango ($15/seat/mo) and guidejar.com ($16/seat/mo)
already charge for (**measured** — competitors' public pricing, via the memo's
competition table). The free floor is set by Dubble (uncapped free) and Folge
(free offline, one-time $89) — also **measured**.

**Stage / status / URL.** Registry stage **build**. Live and functional at
<https://guidejar.shovelware.ai> with zero users, zero revenue and **no payment
processor** (**measured** — no Stripe in `package.json`). Memo verdict:
**KILL · confidence high**, recommend sunset (2026-08-01).

**The fact that dominates this sheet:** the product name belongs to the live
commercial company we cloned. `guidejar.com` is an operating product, our
README's first line is "Guidejar (clone)", `extension/manifest.json` reads
`"name": "Guidejar Capture"`, and the clone is publicly served under the
incumbent's exact wordmark.

> **P12 (ratified), applied to the whole doc.** Unfunded, KILL-verdict lane.
> HIGH leverage means "highest value per unit of Rick-attention", not
> authorisation to spend it.

## Top 5 by leverage

| # | skill | Class | E | Rev | Diag | Leverage | Why it leads |
|---|---|---|---:|---:|---:|---|---|
| 1 | `analytics` | D | 2 | 2 | 7 | **HIGH +5** | **The trap row.** The repo *looks* instrumented — an events table, a `POST /api/g/<id>/events` sink, an owner stats page — but that is **product telemetry inside published guides** (`guide_view`, `step_view`, `branch_picked`, `guide_complete`), not marketing analytics. No PostHog, no landing funnel, no conversion event, no UTM convention. Anyone auditing this repo will mark analytics done; it is not, and under **P3** that means no kill test here can fire. Dropping in the house snippet is unsupervised agent work. |
| 2 | `referrals` | A | 2 | 6 | 6 | **HIGH +4** | **The product's one structural advantage, half switched off.** `PublicViewer` renders a "Made with Guidejar" footer linking home, so every shared guide is a placement in front of someone being walked through a process — the exact buyer at the exact moment of felt need, on the *user's* audience rather than ours, which sidesteps **P2** entirely. But `GuidePlayer.tsx:393` gates the footer (and `:210` the header logo) behind `!embed`, so the `?embed=1` snippet ShareDialog hands out — the highest-distribution surface — carries **zero attribution** (**measured** — read the file). One line. See the precondition below. |
| 3 | `competitor-profiling` | D | 2 | 4 | 6 | **HIGH +4** | The KILL rests on two facts that are *other companies' decisions*: Dubble's free tier being uncapped, and Folge being free-offline. If either moves, the "free + local-first" hole reopens and the verdict is wrong. A quarterly agent re-read of five public pricing pages is the cheapest thing on this sheet that could reverse a verdict — worth running even under sunset. |
| 4 | `customer-research` | D | 3 | 6 | 7 | **HIGH +4** | The memo's central charge is that there is "no ICP doc, no differentiation doc — nothing that survives a 'why would anyone switch' question". Mining Scribe/Tango/Arcade G2 reviews and the recurring pricing-complaint threads in r/CustomerSuccess and r/sysadmin is unsupervised agent work and is the only realistic route to a wedge. It is also the direct input to the memo's reversal test. |
| 5 | `pricing` | B | 3 | 6 | 6 | **HIGH +3** | The binding constraint on **P6**. Price today is $0 with no processor — no channel on this sheet can produce a paying stranger until a number exists. The work is small and the anchors are already gathered: Scribe $13–25/seat, Tango $15/seat, guidejar.com $16/seat, against a free floor set by Dubble (uncapped) and Folge (offline, one-time $89). Agent drafts the tiers, Rick picks the number. |

**`product-marketing` carries the highest revenue impact on this sheet (7) and is
not in the Top 5.** It costs 5 — it needs a domain decision and a Rick judgement
call on the name, not just agent output — so it lands MODERATE +2. Read that
correctly: it is **OPEN**, it is *the gate*, and it is the single job that
re-rates roughly fifteen rows at once, including every one of the six BARRED rows
below. Leverage orders; it does not close. Do it first regardless of band.

## Everything BARRED, with its reason

The bars here fall into one clean family, and naming it is this product's most
useful finding. Under the current name, brand-accumulating channels split in two:
those that merely **waste** work (it gets discarded at rename) and those that
convert a private trademark exposure into a **filed, public, attributable** one.
The first group is LOW/OPEN. The second group is barred until the rename.

| skill | Class | Bar condition | Reason |
|---|---|---|---|
| `ads` | A | 3 — negative EV in absolute terms | Not the arithmetic (see below — on a recurring per-seat price it clears). Running paid acquisition means standing up an advertiser identity under a live competitor's wordmark on Google and Meta, both of which carry a one-click trademark-complaint path and account-level consequences. The spend buys clicks *and* an advertised exposure. |
| `ad-creative` | C | 2 — structurally impossible | Its only consumer is `ads`, which is barred, and no other unbarred paid surface exists. |
| `aso` | A | 3 — negative EV in absolute terms | The Chrome Web Store is a real, ranked, install-intent surface and the artefact already exists — this is not an N/A. But a CWS listing is a **permanent, publicly indexed, identity-verified declaration** under another company's wordmark, on a surface with a one-click complaint form and account-level strike consequences that would follow any future extension we publish. `extension/manifest.json` currently reads `"name": "Guidejar Capture"`. Every other brand channel here merely wastes work if we rename late; this is the one that files the exposure. |
| `launch` | A | 3 — negative EV in absolute terms | A Product Hunt launch under the incumbent's exact name is the fastest available way to make a private exposure public, dated and permanently indexed — in front of an audience that includes the incumbent. Independently, `LAUNCH_CHECKLIST.md` (2026-06-30) is NO-GO on all three sections with the name GATE open and every launch asset missing. |
| `public-relations` | A | 3 — negative EV in absolute terms | The only story this product currently has is "startup clones vendor, keeps vendor's name". Coverage is a published, attributable liability rather than distribution. Compounded by **P2** (no relationships) and **P1** (journalists want a synchronous human). |
| `sms` | B | 2 — structurally impossible | A desktop, browser-based documentation tool. No phone number is collected anywhere in `migrations/0001_init.sql` (**measured**), and a multi-step interactive guide is not a mobile-notification medium. The surface does not exist. |

**All five brand bars are lifted by one action — the rename.** They are recorded
as BARRED rather than LOW because the expected value under the current name is
genuinely negative, not merely small: they cost attention *and* increase legal
exposure. See Preconditions.

### Paid arithmetic, worked (rubric §2.4) — and what it actually shows

```
CPC (B2B SaaS average)             $8.86     measured — rubric §2.4 verified 2026 benchmark
"Scribe alternative" category      $15–25    assumed — competitive software category; not checked in a keyword tool
visitor → paid conversion          2%        assumed — never measured here or anywhere in the portfolio
CAC = 8.86 / 0.02                = $443
payback @ $15/seat/mo            = 29.5 months
payback @ $25/seat/mo            = 17.7 months
CAC = 8.86 / 0.05                = $177      (at a 5% assumed conversion)
payback @ $15/seat/mo            = 11.8 months
payback @ $25/seat/mo            =  7.1 months
```

**This is a correction to v1.** v1 rejected `ads` partly on a CAC argument and
partly on **P11**. On v2's LTV framing the arithmetic is *not* the disqualifier:
the category is priced **recurring per seat** at $13–25 (**measured**), so a
multiple of MRR is a normal CAC and a 7–12 month payback at a plausible
conversion rate is a financing question, not an EV one. Fronting ~$3,500 for 20
customers may still be unaffordable — that is a **working-capital constraint,
stated separately**. What actually bars `ads` is the trademark. Note also that
our own price is $0 with no processor, so today a click has no revenue event at
all to recover against; that alone would bar it until `pricing` lands.

**P11 and its open question, flagged not resolved.** P11 (proposed) says paid is
not a first channel and spend needs a payback line. Here a payback line is
*drawable* from competitors' public per-seat prices even before we have our own —
which is unusual in the portfolio and worth noting. The catch-22 the rubric flags
still applies to the conversion rate, which only spend can measure. I have not
scored `ads` against P11 at all: the bar is condition 3, on trademark harm.

## Class A — Acquisition (17)

| skill | Effort | Rev | Diag | Leverage | Status | Rationale |
|---|---:|---:|---:|---|---|---|
| `ads` | 6 | 2 | 5 | LOW -1 | BARRED (negative EV — advertiser identity under a live competitor's wordmark, on platforms with a one-click trademark complaint and account-level strikes) | The obvious buy is "Scribe alternative" / "Tango alternative", real commercial intent, and the memo already holds the competitor price anchors. Diagnostic 5 is genuine — a bounded test would produce the visitor→signup rate nothing in this portfolio has measured — but the landing page it points at is branded with the incumbent's mark and there is no checkout to recover the click. |
| `ai-seo` | 3 | 3 | 3 | MODERATE 0 | OPEN | Agent-cheap (`llms.txt`, answer-shaped copy) and the category question — "how do I document a process without recording a video" — is exactly what people ask assistants. The specific defect is unusual and worth stating: the citation namespace "Guidejar" **already resolves to guidejar.com**, so every AI-SEO asset built under this name teaches models to cite the incumbent. This is waste, not exposure, which is why it is OPEN. It re-rates the day we rename. |
| `aso` | 6 | 5 | 6 | MODERATE 0 | BARRED (negative EV — a permanent, identity-verified CWS listing under another company's wordmark; one-click complaint path, account-level strikes) | **The store is the Chrome Web Store and the artefact already exists** — `extension/` is a working MV3 capture extension, unpacked-only today. CWS is a ranked search surface with install intent and it is the category leader's actual distribution: Scribe is a Chrome extension first and a web app second, which is precisely how it reached the seat we want. Effort 6 is not the packaging: `manifest.json` requests `<all_urls>` host permissions *and* an all-URLs content script (extended review, per-permission justification, published privacy policy, limited-use certification), and `bridge.js` matches only `http://localhost/*` and `127.0.0.1`, so a store-installed copy could not hand a capture back to production — the extension is loadable, not shippable. Diagnostic 6: an install count from a ranked store is the realest demand number this product could get. |
| `cold-email` | 5 | 2 | 4 | LOW -1 | OPEN | Async, so **P1**-clean, and CS/IT leads are enumerable. But the pitch is "a free clone of a product, named after the product it clones", and there is nothing to buy at the end of it — cold email that converts to a free signup and then nothing is **P6** reach. Diagnostic 4: replies would at least reveal whether the seat-cost complaint is real. |
| `co-marketing` | 8 | 1 | 2 | LOW -6 | OPEN | Co-marketing means a partner putting their brand next to ours in writing. No help-desk, LMS or onboarding vendor will co-brand with an unlicensed clone of a live competitor. Not barred — nothing structural or policy-based closes it, and a joint blog post needs no signature — but the counterparty side is empty until the rename, so the realistic upside is ~0. |
| `community-marketing` | 8 | 3 | 5 | LOW -3 | OPEN | The memo's own GTM names the real rooms — r/CustomerSuccess, r/sysadmin, Scribe/Arcade pricing threads — and they genuinely contain the buyer, which is why revenue is 3 rather than 1. Effort 8 is sustained recurring human presence in communities that punish astroturfing, with v2's reversibility rule running against us (a burned account is permanent). And the name invites the worst possible first comment: "that's not your product." |
| `competitors` | 3 | 4 | 4 | MODERATE +1 | OPEN | Best-fitting SEO shape in the category: "Scribe alternative", "Tango alternative", "Dubble vs …" all carry buying intent, and the memo already holds a five-row competitor table with live prices, so an agent could ship the pages this week. Blocked by an absurdity rather than a policy: we cannot credibly publish a "Guidejar alternative" page while we *are* named Guidejar, and a comparison page with no price column against $13–25/seat is a weak page. |
| `content-strategy` | 5 | 3 | 2 | LOW -2 | OPEN | A real topic space exists ("how to document an onboarding process", "SOP templates") and the product is the natural CTA at the end of each piece. But content compounds over 3–4 quarters and every URL published under the current name is discarded at rename — this is the channel most damaged by paying the brand debt late. Effort 5 because a calendar is a sustained commitment that cannot be switched off without the cluster visibly dying, which v2 prices above its hours. Waste, not exposure, so it stays OPEN. |
| `directory-submissions` | 4 | 2 | 3 | LOW -1 | OPEN | AlternativeTo / SaaSHub / TAAFT listings are the memo's named first move and are agent-executable. Two specific problems: a listing that reads "Guidejar — an alternative to Guidejar" is a takedown magnet, and directory backlinks are semi-permanent pointers at a name and a `shovelware.ai` subdomain we intend to abandon (v2 prices that permanence into effort 4). OPEN rather than BARRED because directory listings are editable and removable, unlike a store listing or a press cycle — but do not submit before the rename. |
| `free-tools` | 4 | 5 | 6 | MODERATE +2 | OPEN | Unusually apt: the product **already is** the free ungated tool — `/app` builds a guide with no account, drafts live in IndexedDB, publish is anonymous via a capability `editKey`. The strongest variant is carving the capture extension out as a standalone free utility that exports `.json` into `/import`; it is built, it can carry a new name cheaply, and it demonstrates the value in 30 seconds. Diagnostic 6: standalone-utility usage is a demand signal that does not depend on a price existing. |
| `launch` | 5 | 2 | 5 | MODERATE 0 | BARRED (negative EV — a permanent, dated, publicly indexed launch under the incumbent's exact name) | Diagnostic 5 is real: a launch day is the fastest single read on whether anyone cares. That value does not survive being spent under someone else's wordmark, and the card is single-use, so spending it now also destroys the post-rename version. |
| `programmatic-seo` | 4 | 4 | 3 | MODERATE 0 | OPEN | Two real mechanisms, both dormant. (1) **UGC SEO** — every published guide is already a unique indexable URL at `/g/<publicId>` with a real title and description; this is how Scribe ranks. (2) Templated "how to *X* in *Y*" guides generated with our own editor. Currently defeated by mechanics, not strategy: `sitemap.xml` 404s, `/g/` is `force-dynamic` with no canonical or OG tags, there is no gallery linking guides, and there are **zero published guides** to index. |
| `prospecting` | 6 | 2 | 3 | LOW -3 | OPEN | List-building is agent work, but the motion it feeds (identify → email → *talk*) hits **P1**, and prospecting for a product with no price means prospecting for free signups. The one thing that would make it sane — a per-seat number to quote against Scribe's $25 — does not exist. |
| `public-relations` | 8 | 1 | 2 | LOW -6 | BARRED (negative EV — the only available story is "startup clones vendor, keeps vendor's name") | Also **P2** (no relationships) and **P1** (journalists want a synchronous human). |
| `referrals` | 2 | 6 | 6 | HIGH +4 | OPEN | See Top 5. The mechanism is **built and one flag away**: `GuidePlayer.tsx:393` suppresses the footer and `:210` the header logo whenever `embed` is true, so the highest-distribution surface carries no attribution. Diagnostic 6 equals revenue 6 because turning it on and counting referred sessions is simultaneously the growth loop and the measurement of whether this product has one. **Precondition, not a bar:** shipping it before the rename broadcasts another company's wordmark into third parties' help centres. Unlike a store listing it is instantly reversible — a boolean — so it is OPEN, and the right sequence is to land it *with* the rename, not before. |
| `seo-audit` | 2 | 3 | 4 | MODERATE +2 | OPEN | Fully unsupervised, and there are concrete defects to find rather than a hypothetical audit: `sitemap.xml` 404s, no OG/Twitter meta anywhere, default Next.js `favicon.ico`, no canonical tags on published guides, and `force-dynamic` on the one page type we would most want crawled. Diagnostic 4 because those findings are the gating list for `programmatic-seo` and `referrals`. Capped by the fact that the subdomain is replaced at rename. |
| `social` | 7 | 2 | 2 | LOW -5 | OPEN | The artefact is genuinely demo-able — a branching click-through guide is a good 20-second clip — which is the only thing keeping this off a 1. Against it: a posting cadence is recurring human presence that cannot be quietly stopped, **P2** says we have no following, and every impression trains recall for a name we must abandon. |

## Class B — Conversion & lifecycle (14)

| skill | Effort | Rev | Diag | Leverage | Status | Rationale |
|---|---:|---:|---:|---|---|---|
| `churn-prevention` | 4 | 1 | 2 | LOW -2 | OPEN | Structurally nothing to prevent: no subscriptions, no processor, no renewals, no users. The one real retention risk this product *does* carry is unusual and is not a billing problem — drafts live only in the browser's IndexedDB with no export or backup path (checklist §1.4), so clearing site data silently destroys unpublished work. That is an engineering fix, not a save offer. |
| `copywriting` | 3 | 4 | 3 | MODERATE +1 | OPEN | The 368-line landing page converts nothing to a customer because it states no price, no ICP and no differentiation. Two concrete defects an agent fixes in an hour: the hero badge and footer both claim **"Open-source"** with no `LICENSE` file in the repo and no public repository link — an unsubstantiated marketing claim on a live page; and the value prop ("Turn any process into an interactive guide") is word-for-word what Scribe, Tango and the real Guidejar say. Capped at 4 because the headline it actually needs — "the free alternative to *X*" — cannot be written until the name is settled. |
| `cro` | 3 | 3 | 3 | MODERATE 0 | OPEN | There is a page and a signup form to work on, and one thing is already right: the primary CTA is "Start a guide →" to `/app`, not a signup wall, correctly matching the local-first pitch. The blocker is measurement — no marketing analytics is installed, so there is literally no conversion rate to optimise and no traffic to optimise it on. CRO here would be opinion dressed as method. Strictly downstream of `analytics`. |
| `emails` | 5 | 3 | 3 | LOW -2 | OPEN | No email system of any kind exists (checklist §2.7); a sending domain and stance is a Rick decision. Accounts do exist, so there are addresses. Note the gap that is *not* a marketing problem and must be fixed first: there is no email verification and **no password reset**, so a locked-out user today is permanently locked out. Do not write a welcome sequence into that. |
| `lead-magnets` | 4 | 2 | 2 | LOW -2 | OPEN | The product's own output is the lead magnet — a published guide is more compelling than any PDF we could gate. Putting an email wall in front of a checklist, in order to hand someone a free tool with no paid tier behind it, adds friction to a funnel that has no destination. |
| `offers` | 4 | 4 | 5 | MODERATE +1 | OPEN | There is no offer at all: no price, no plan names, no "free forever" statement, no end date on free. The memo calls open-ended free "a liability, not a plan", and the CFO flagged the specific trap — free *plus* unmetered paid AI endpoints, which is **P10** (free tiers carry a costed cap) failing in the most expensive possible way. Diagnostic 5: deciding whether voiceover/translation is the paid line is the fact that determines whether anything here is monetisable. |
| `onboarding` | 3 | 4 | 5 | MODERATE +2 | OPEN | The "aha" is sharp and identifiable — click through your process, get a finished guide — and it lives in the Chrome extension. But the extension is unpacked-only, so a stranger's first run silently drops to the slow path (paste screenshots one by one), which is exactly what competitors' free tiers already do. **No activation event is defined anywhere in the repo.** Diagnostic 5 because defining one — "published their first guide" — is the literal instrument of the memo's reversal test (10 of 20 recruited users publish a real guide and return unprompted within a week). |
| `paywalls` | 5 | 2 | 3 | LOW -2 | OPEN | Nothing to gate: no paid tier exists. The natural gate — AI voiceover and translation — is **dark in production** because `OPENAI_API_KEY` is unset and both endpoints return 503, so a paywall would sit in front of a feature that does not run. Turning the feature on to gate it is also what arms the cost blocker below. |
| `popups` | 2 | 1 | 1 | LOW -1 | OPEN | Zero traffic and no list to capture into. Actively unhelpful in the one place it might matter: a modal on a published guide degrades the shared artefact, which is this product's only genuine acquisition surface. Cheap and reversible, hence OPEN — but the expected sign is negative and the row should be left alone. |
| `pricing` | 3 | 6 | 6 | HIGH +3 | OPEN | See Top 5. This is the row that uncaps every other row's revenue ceiling from "produces signups" to "produces customers". |
| `schema` | 2 | 4 | 3 | MODERATE +2 | OPEN | Unusually well-matched: published guides are literally `HowTo` content, and `HowTo` + `ItemList` JSON-LD on `/g/<publicId>` is the exact structured-data type for step-by-step instructions — the difference between a guide URL being an opaque blob and an eligible rich result. Nothing is emitted today. Two-effort agent job, capped only because there are currently zero published guides to mark up. |
| `signup` | 3 | 4 | 4 | MODERATE +1 | OPEN | Auth is real (bcrypt + HMAC session cookie) and correctly optional — anonymous publish works via the `editKey` capability, which is a good design decision worth keeping. The gaps are recovery-shaped: no email verification, no password reset, no rate limiting on `/api/auth/signup`. And the account is asked for at the wrong moment: the highest-intent instant is *at publish*, when the user has something they want a link for, not at first visit. |
| `site-architecture` | 3 | 3 | 3 | MODERATE 0 | OPEN | The site is three surfaces stapled together: marketing root `/`, app at `/app`, and a public content surface at `/g/<publicId>` with **no index, no gallery, no internal links and no sitemap entry**. The user-generated content that would earn links and rankings is completely orphaned from the marketing site. Fixing that graph is a hard prerequisite for `programmatic-seo`. |
| `sms` | 7 | 1 | 1 | LOW -6 | BARRED (structurally impossible — no phone number collected anywhere in the schema; a desktop browser documentation tool) | See the BARRED table. |

## Class C — Craft & production (5)

| skill | Effort | Rev | Diag | Leverage | Status | Rationale |
|---|---:|---:|---:|---|---|---|
| `ad-creative` | 3 | 1 | 2 | LOW -1 | BARRED (structurally impossible — its only consumer, `ads`, is barred; no other paid surface exists) | Producing headline variants for campaigns that cannot run, pointed at a brand we intend to replace, against a landing page with no price. |
| `copy-editing` | 2 | 3 | 4 | MODERATE +2 | OPEN | Genuinely cheap and there is real, load-bearing copy to sweep — this is a claims audit, not a polish pass. The landing page's two unsubstantiated "Open-source" claims; the README whose *first line* is "Guidejar (clone)" and whose second links to the competitor, which is a public-facing liability the moment the repo is shown to anyone; and a README that still documents a filesystem server (`data/guidejar.db`, `data/images/...`) the product no longer uses — it runs on D1 + R2. Diagnostic 4: each of those is a discoverable factual error about our own product. |
| `image` | 3 | 4 | 3 | MODERATE +1 | OPEN | Concrete and directly load-bearing for the one channel that matters: there is no OG image and no `og:`/`twitter:` meta anywhere, so **every shared published guide renders as a blank card in Slack, X and LinkedIn** — which kneecaps exactly the shareable-artefact loop scored under `referrals`. Also still on the stock Next.js favicon and stock `public/*.svg`, with no logo asset beyond a code-drawn `Logo.tsx`. All throwaway until the rename, which is why effort is 3 and not 1. |
| `marketing-psychology` | 2 | 2 | 2 | MODERATE 0 | OPEN | Cheap enough to fold into the eventual rewrite, but this product cannot currently pull any of the three main levers: no scarcity (unlimited free), no social proof (zero users, zero testimonials, no logo wall), and no price to anchor against Scribe's $25. Framing without an offer underneath it is decoration — and saying that plainly is the whole finding. |
| `video` | 6 | 3 | 3 | LOW -3 | OPEN | A 40-second screen recording is objectively the best possible demo of this product — it *is* a walkthrough tool, and the checklist confirms no hero/demo asset exists. Not **P1**-barred: recorded video is asynchronous. It costs 6 because repeated takes and a voice are recurring human presence, and the finished asset would be branded with a name we must discard, making it the most re-shootable thing on the list. Do it once, after the rename. |

## Class D — Foundation & intelligence (9)

| skill | Effort | Rev | Diag | Leverage | Status | Rationale |
|---|---:|---:|---:|---|---|---|
| `ab-testing` | 4 | 1 | 2 | LOW -2 | OPEN | Nothing to split. Zero traffic, no marketing analytics, no conversion event defined — and **P3** requires kill tests fire from instrumentation we already run, which for acquisition does not exist here. A test would take more than two quarters to reach significance at current volume, breaching **P4** by an order of magnitude. Diagnostic 2, not 7, precisely because the test cannot run; it rises with `analytics` **and** traffic. |
| `analytics` | 2 | 2 | 7 | HIGH +5 | OPEN | See Top 5. The in-guide telemetry looking like coverage it is not is the single most misleading fact in this repo, and it is exactly the kind of thing v1 could not surface because it had no diagnostic column. |
| `competitor-profiling` | 2 | 4 | 6 | HIGH +4 | OPEN | See Top 5. Substantially done already — the memo carries five competitors with live 2026 pricing — so refreshing it is the cheapest thing on this sheet that could move a verdict. Worth a standing quarterly re-check even under sunset. |
| `customer-research` | 3 | 6 | 7 | HIGH +4 | OPEN | See Top 5. Diagnostic 7: it resolves the stated reason for the KILL — that no wedge exists — and it is fully async, so **P1**-clean. |
| `marketing-ideas` | 2 | 3 | 2 | MODERATE +1 | OPEN | Nearly free, but ideas are not this product's shortage. It has a working deployed app, a competent GTM sketch in the memo and a clear buyer. What it lacks is a legal name and a defensible reason to switch — neither is an idea-generation problem, and a brainstorm risks producing motion that looks like progress on the wrong axis. |
| `marketing-plan` | 4 | 2 | 2 | LOW -2 | OPEN | Writing a channel plan for a product whose memo verdict is KILL/sunset, when this document is already the artefact that would tell the plan what to say. Re-rates only if the product is revived under a new registry entry. |
| `product-marketing` | 5 | 7 | 6 | MODERATE +2 | OPEN | **The gate, and the highest revenue impact on the sheet.** Every Class A row above is discounted by the same two facts — the name is another company's live trademark, and there is no stated wedge. Naming plus positioning is the single job that re-rates roughly fifteen rows at once and lifts all five brand bars. Effort 5 rather than 3 because it needs a domain decision and a Rick judgement call on the name, not just agent output. Banded MODERATE by arithmetic; treat it as the first item regardless of band — that distinction is exactly what v2's split between leverage and status exists to make sayable. |
| `revops` | 6 | 3 | 2 | LOW -3 | OPEN | There is no revenue operation to operate: no Stripe in `package.json`, no plans, no invoices, no tax stance, and the CFO's outbound-payer question (whose card backs the OpenAI bill) is still open. Genuinely needed before money can move, but strictly downstream of `pricing`, so it must not start first. |
| `sales-enablement` | 7 | 1 | 2 | LOW -5 | OPEN | Battle cards, one-pagers and demo decks exist to serve a human seller in a deal. **P1** bars the calls, **P5** caps B2B procurement, there is no seller and no deal, and the product is a self-serve free tool with a public share link. Not barred — the collateral itself is async writing — but structurally this is the furthest thing on the sheet from how this product would ever make money, and `competitors` already produces the one useful artefact as public pages that also rank. |

## What this product's scores hinge on

**1. The name is a live competitor's trademark, and the deploy is public.**
`guidejar.com` is an operating commercial product; our README's first line is
"Guidejar (clone)", the extension manifest reads `"name": "Guidejar Capture"`,
and the clone is publicly served at `guidejar.shovelware.ai`. This is not a
branding nicety — it is a **discount applied to every brand-accumulating channel
on the sheet**, and for five of them it inverts the sign. v2 lets me draw the
line v1 could not: channels that merely *waste* work at rename (`content-strategy`,
`ai-seo`, `social`, `image`, `directory-submissions`) stay **OPEN at low
leverage**; channels that file a **public, attributable declaration** under the
mark (`ads`, `aso`, `launch`, `public-relations`) are **BARRED on negative EV**,
because they cost attention *and* convert a private exposure into a filed one.
One action lifts all five.

**2. There is no price and no processor, so P6 caps revenue impact everywhere —
which is precisely why diagnostic impact carries this sheet.** No Stripe, no
plan, no number on the landing page, open-ended free with no end date. Revenue
impact is defined as *paying strangers*, so every acquisition channel is capped
at "produces signups", explicitly diagnostic-only under **P6**. Four of the Top 5
therefore lead on their diagnostic number (`analytics` 2/7,
`competitor-profiling` 4/6, `customer-research` 6/7), and `pricing` is in the top
five as a Class B conversion skill because it is the row that *uncaps* the others.

**3. It genuinely does have a viral surface — and it is switched off exactly
where it counts.** This is the real deviation from a generic web micro-SaaS. Most
Shovelware products have no way to reach strangers without an audience (**P2**);
Guidejar produces a **public artefact the user sends to other people**. Every
published guide at `/g/<publicId>` and every `?embed=1` iframe dropped into a help
centre puts the product in front of someone consuming a walkthrough — the exact
buyer, at the moment of felt need, on borrowed distribution. `PublicViewer`
already renders "Made with Guidejar" linking home, so the mechanism is *built* —
but `GuidePlayer.tsx:393` suppresses the footer and `:210` the header logo
whenever `embed` is true, so the highest-distribution surface carries no
attribution at all. Turning that on is one boolean. It is also why `image`
(no OG meta → every shared guide previews blank) and `schema` (`HowTo` JSON-LD on
guide pages) punch above their apparent weight: they are the two things that make
the loop legible to a machine and to a human scroller respectively.

## Open questions worth buying an answer to

Rows where diagnostic impact exceeds revenue impact.

| skill | Rev → Diag | The question it buys an answer to | What it costs |
|---|---|---|---|
| `analytics` | 2 → 7 | **Is anything about acquisition here measurable at all?** Today it is not, and the repo actively misleads on the point — in-guide telemetry reads as coverage. **P3** is breached by construction, and `cro`, `ab-testing`, `referrals` and any future `ads` test are all gated behind it. Installing it is also the only way to answer the next question. | Effort 2. House PostHog snippet, conversion event, UTM convention. Unsupervised agent work. |
| `competitor-profiling` | 4 → 6 | **Has the free floor moved?** The KILL rests on Dubble being free-uncapped and Folge being free-offline — both other companies' decisions. If either changes, the "free + local-first" hole reopens and the verdict is wrong. | Effort 2, quarterly, agent-only. Worth running even under sunset. |
| `customer-research` | 6 → 7 | **Is there any wedge that is not "same thing, free"?** The memo's stated reason for the KILL. Public G2 reviews for Scribe/Tango/Arcade and recurring pricing threads are the only cheap source. | Effort 3, fully async. |
| `ads` | 2 → 5 | What is the visitor→signup rate on "Scribe alternative" intent? A number nothing in the portfolio has. **Currently unbuyable** — the bar is trademark, not economics. | Effort 6, and BARRED until the rename. |
| `aso` | 5 → 6 | Does a ranked Chrome Web Store listing produce installs the way it did for Scribe? This is the category leader's actual acquisition mechanism and the extension is already built. **Currently unbuyable** — the listing is the exposure. | Effort 6, BARRED until the rename; then this becomes the most interesting number available. |
| `launch` | 2 → 5 | Does anyone care? A launch day is the fastest single read. **Currently unbuyable**, and the card is single-use, so spending it now destroys the post-rename version too. | Effort 5, BARRED until the rename. |
| `onboarding` | 4 → 5 | **Do users reach the "aha"?** No activation event is defined anywhere in the repo. Defining "published their first guide" and instrumenting it is the literal apparatus of the memo's reversal test — 10 of 20 recruited users publishing and returning unprompted. | Effort 3, gated on `analytics`. |
| `offers` | 4 → 5 | Is voiceover/translation the paid line, and what is the costed cap on free? **P10** is currently failing in the most expensive way possible — an uncapped free tier in front of unmetered paid AI endpoints. | Effort 4, and it is a Rick decision, not agent output. |
| `free-tools` | 5 → 6 | Does the standalone capture extension get used on its own merits, under a neutral name, with no price attached? A demand read that does not depend on `pricing`. | Effort 4. Can carry a new name cheaply. |
| `seo-audit` | 3 → 4 | Which of the mechanical defects (sitemap 404, no canonical, `force-dynamic` on `/g/`, no OG meta) are actually blocking indexation of the UGC surface? | Effort 2, unsupervised. |
| `cold-email` | 2 → 4 | Do CS/IT leads confirm the per-seat cost complaint in their own words? | Effort 5. |

## Preconditions & triggers

Under **P12** this is not a funded lane and its memo verdict is KILL — everything
below is queued behind a revival decision.

| Currently | Re-rates when | To |
|---|---|---|
| Five rows BARRED on trademark (`ads`, `aso`, `launch`, `public-relations`, plus `ad-creative` by inheritance) | **Rename + own domain shipped** — new name, trademark-clear, real domain, `guidejar.shovelware.ai` retired, `extension/manifest.json` renamed | **All five become OPEN at once.** This is the single highest-value action on the sheet and no other action comes close. `competitors`, `directory-submissions`, `ai-seo`, `content-strategy`, `image` and `video` also stop being throwaway work — roughly fifteen rows move |
| `referrals` HIGH +4 / OPEN, but held | **Rename shipped, then** `GuidePlayer.tsx:393` renders the footer in embed mode (and `:210` the header logo), **plus** an OG image so shares stop previewing blank | Becomes the product's best channel by a distance and, with `analytics`, its first measurable loop. Shipping it *before* the rename broadcasts another company's wordmark into third parties' help centres — reversible, but pointless |
| Every Class A revenue ceiling | **Stripe wired + a published price** | Uncaps revenue impact from "signups" to "customers" across the board. `paywalls`, `revops` and `offers` become live work |
| `analytics` HIGH +5 / OPEN | PostHog + a conversion event + a UTM convention installed | `cro` 0→+2, `ab-testing` off the floor, `onboarding` measurable, and **P3** becomes satisfiable so a kill test can actually fire |
| `schema`, `programmatic-seo`, `site-architecture` | **First ~20 published guides exist**, plus a `/g/` index, a sitemap entry and canonical tags | All three currently score against an empty content surface. This is the UGC-SEO mechanism Scribe actually uses |
| `aso` BARRED | Rename shipped **and** `bridge.js` pointed at production instead of `localhost` **and** a privacy policy published **and** `<all_urls>` permissions justified or narrowed | OPEN, and probably the sharpest available demand test — this is how the category leader acquires. It only reaches high leverage once a price exists, since store installs are **P6**-diagnostic without a processor |
| `ads` BARRED | Rename shipped **and** a price + processor exist | OPEN. Re-run the §2.4 arithmetic then with a **measured** conversion rate; on a recurring per-seat price the payback is a financing question, not an EV one |
| `competitor-profiling` HIGH +4 / OPEN | **A competitor's free floor moves** — Dubble caps its free tier, or Folge ships hosted sharing | Re-opens the "free + local-first" hole the memo says is bracketed. The one trigger not in our control, and the reason this row earns a standing quarterly re-check even under sunset |
| Whole document | **Memo reversal test passes** — a wedge that is not "same thing, free", *and* 10 of 20 recruited target users each publish a real guide and return unprompted within a week | Revival under a new registry entry; `marketing-plan` re-rates and this document is rewritten from a funded position |

### Operational blockers (carried forward from v1 — these break if traffic arrives)

1. **Unmetered public AI endpoints (critical, latent).** `/api/voiceover` and
   `/api/translate` accept unauthenticated POSTs with no rate limit and no quota.
   The CFO's estimate is **~$2,160/hour / ~$50k/day** at 10 req/s of max-payload
   TTS, bounded only by the card limit. Dormant *only* because `OPENAI_API_KEY`
   is unset in production. Any marketing push that also turns the AI features on
   turns on the spigot. Hard blocker, and the reason **P10** currently fails.
2. **Trademark exposure on a live public deploy.** The clone is served publicly
   under the incumbent's exact name. Marketing does not create this exposure — it
   *amplifies* it, fastest through precisely the channels barred above.
3. **No payment processor.** Nothing can convert to revenue. Any campaign run
   before this is measured in **P6**-diagnostic units only.
4. **No marketing analytics.** Attribution is impossible, and the existing
   in-guide telemetry is easily mistaken for coverage that is not there.
5. **Shares render blank.** No OG/Twitter meta or OG image anywhere, so every
   link to a published guide — the product's own distribution mechanism —
   previews as an empty card in Slack, X and LinkedIn.
6. **Unsubstantiated "Open-source" claim** on the landing page (hero badge and
   footer) with no `LICENSE` file and no public repository link.
7. **No password reset and no email verification.** A user acquired by a campaign
   who forgets a password has no recovery path at all, and there is no export or
   backup for local IndexedDB drafts.

## Related

- `shovelware-team/docs/marketing/channel-rubric.md` — the v2 scoring frame.
- `shovelware-team/docs/memos/guidejar.md` — investment memo (KILL, 2026-08-01).
- `LAUNCH_CHECKLIST.md` — launch gate, NO-GO on all three sections (2026-06-30).
