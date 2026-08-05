---
status: current
type: living
date: 2026-08-05
---

# Guidejar — qualifying marketing surfaces

The registry join. `docs/marketing-channels.md` scores *whether* to run
`aso` / `directory-submissions` / `ai-seo` / `prospecting`; this doc answers the
mechanical successor — **which of the 367 store rows, 643 directory rows, 40
answer-engine rows and 137 buyer-register rows Guidejar actually qualifies
for**, given what is built. Registries:
`shovelware-team/docs/marketing/surfaces/`.

## Header

**What it is.** An interactive step-by-step guide builder: a **Chrome MV3
extension** records clicks and screenshots, an editor adds hotspots, blur/arrow
annotations, chapters and branching, and the result publishes to a public
`/g/<publicId>` URL or an `?embed=1` **iframe**. AI voiceover and translation;
per-step funnel analytics for the guide owner.

**What it is built on** (all **measured** from the repo):

- **Next.js 16 + React 19 on OpenNext → Cloudflare Workers**, D1 for data, **R2**
  for screenshots and audio, bcrypt + HMAC session cookies for optional auth.
- **A real, working MV3 extension in `extension/`** — `manifest.json` requests
  `tabs`, `scripting`, `storage`, `unlimitedStorage` and **`<all_urls>` host
  permissions**, plus an **all-URLs content script** (`recorder.js`).
- **`openai` is a production dependency**; `/api/voiceover` and `/api/translate`
  exist — so unlike the rest of this batch, Guidejar genuinely *is* an AI
  product. Both endpoints **return 503 in production** because `OPENAI_API_KEY`
  is unset.
- 13 API routes, including a public `/api/guides` and a public embeddable player.
- **No Stripe, no price, no processor.** No marketing analytics (the in-guide
  event sink is product telemetry, not acquisition measurement).
- Live at `https://guidejar.shovelware.ai`; zero users, zero published guides.

**The fact that decides this entire document:** *the product name is a live
competitor's trademark.* `guidejar.com` is an operating commercial product; the
README's first line is "Guidejar (clone)"; `extension/manifest.json` reads
`"name": "Guidejar Capture"`; the clone is publicly served under the incumbent's
exact wordmark.

> **Every surface registry is a public, permanent, identity-verified
> declaration.** That is what a store listing, a review-shelf profile and a
> directory backlink *are*. So for this product the join produces an unusual
> shape: **almost everything qualifies technically and almost nothing may be
> submitted**, because submission is the act that converts a private trademark
> exposure into a filed, dated, attributable one. The channel doc bars `aso`,
> `launch`, `ads` and `public-relations` on exactly this ground.

> **P12 (ratified).** Unfunded lane, memo verdict **KILL · confidence high**
> (2026-08-01), recommend sunset. Everything here is queued.

## Qualifies today

Every row carries the same overriding blocker — **the name** — so it is stated
once here rather than repeated: *submitting under "Guidejar" files a public
declaration under `guidejar.com`'s wordmark on a surface with a one-click
complaint path.* The blocker column names what is additional, and the last
column flags whether the row is **brand-safe** (mints nothing public) or
**brand-filing** (does).

| Surface | Registry | What listing requires | Additional blocker | Q | Brand |
|---|---|---|---|---|---|
| **PublicWWW** | buyer-registers | Freemium; paid export. Finds every site containing a given script — i.e. **every help centre already embedding a Scribe or Tango walkthrough** | Cash for export only | B | **brand-safe** |
| **BuiltWith** | buyer-registers | Paid lists/bulk. Same technographic query by detected vendor | Cash + Rick's list-sourcing stance | B | **brand-safe** |
| **Wappalyzer** | buyer-registers | Free extension, paid lists/API | Cash for bulk | B | **brand-safe** |
| Chrome Web Store | stores (`browser-extension-store`) | $5 developer fee, identity verification, packaged MV3 zip | **Three hard technical blockers beyond the name:** (a) `<all_urls>` host permissions *and* an all-URLs content script trigger extended review with per-permission justification and limited-use certification; (b) **no privacy policy exists** and CWS requires a published one; (c) `bridge.js` matches only `http://localhost/*` and `127.0.0.1` — **a store-installed copy physically cannot hand a capture back to production**. The extension is loadable, not shippable | A | brand-filing |
| Firefox Add-ons (AMO) | stores (`browser-extension-store`) | Free, **no identity verification**, 1–14 day mostly-automated review | Same `bridge.js` defect; MV3 on Firefox needs the `browser.*` namespace shim | A | brand-filing |
| Microsoft Edge Add-ons | stores | Free; identity verification; 1–7 days | Chromium build works as-is once `bridge.js` is fixed | B | brand-filing |
| Opera Add-ons | stores | Free, no identity verification, 7–30 days | Same | C | brand-filing |
| G2 | stores (`review-shelf`) | Vendor claim + work-email verification, free | Scribe, Tango and Arcade already occupy the shelf; **zero customers means zero reviews** and no rank | A | brand-filing |
| Capterra + GetApp + Software Advice | stores (`review-shelf`) | **One Gartner Digital Markets vendor account covers all three** (measured, registry README); domain verification, 3–10 days | Same zero-review problem; also requires a domain we intend to abandon | A ×3 | brand-filing |
| TrustRadius / SourceForge → Slashdot / Trustpilot | stores (`review-shelf`) | Light vendor claim or domain verification | Same | A/B | brand-filing |
| **Futurepedia / There's An AI For That / Toolify / TopAI.tools / Altern / OpenTools / Future Tools / Supertools / Aixploria / Ben's Bites / Easy With AI / AI Tools FYI** | directories (`ai-tools`, 88 rows) | Free listing + description + screenshot | **Guidejar genuinely qualifies here and the rest of this batch does not** — `openai` is a real dependency and voiceover/translation are real features. But **both endpoints return 503 in production**, so the listed capability does not run for a visitor. Listing it is a false claim until `OPENAI_API_KEY` is set | A→D | brand-filing |
| AlternativeTo | directories (DR 79) | Free listing as an alternative to Scribe / Tango / Arcade / Dubble | The channel doc's own line applies: *"Guidejar — an alternative to Guidejar" is a takedown magnet* | A | brand-filing |
| SaaSHub / Slant / Alternative.me / OpenSourceAlternative.to | directories (DR 45–72) | Free alternatives listings | `OpenSourceAlternative.to` additionally needs a licence — and the landing page's **"Open-source" claim is currently unsubstantiated** (no `LICENSE` file, no public repo) | A/B | brand-filing |
| Product Hunt | stores (`ranked-shelf`) | Live URL, gallery, maker account with age + activity | **Single-use and permanent.** Channel doc bars it: a launch under the incumbent's name is the fastest way to make the exposure public, dated and indexed, in front of an audience that includes the incumbent | A | brand-filing |
| Hacker News (Show HN) | directories (DR 91) | Live URL, one post | Same one-shot logic; the top comment writes itself | A | brand-filing |
| ChatGPT / Perplexity / Claude / Copilot / Google AI Overviews / Brave Leo / Exa / Tavily / You.com | answer-engines | Crawler allowances (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `bingbot`), extractable pages | **A defect specific to this product:** the citation namespace "Guidejar" *already resolves to guidejar.com*, so every AI-SEO asset built under this name teaches models to cite the incumbent. This is waste, not exposure — hence OPEN in the channel doc | A/B | waste, not filing |
| Bing Webmaster / IndexNow | answer-engines | Domain verification, then URL push | Domain is being abandoned | B | waste |
| StackShare | directories (DR 74) | Tech-stack profile — Next.js 16 / Workers / D1 / R2 / OpenAI is honest and specific | Reaches developers, not the CS/IT/ops buyer | A | brand-filing |
| BetaList / Uneed / TinyLaunch / MicroLaunch / StartupBase / Peerlist / Launching Next / BetaPage / Startup Stash / StartupRanking / KillerStartups | directories (DR 40–75) | Live URL + copy; free tiers; one agent pass | Semi-permanent pointers at a name and a subdomain we intend to abandon | A/B/C | brand-filing |
| Crunchbase / F6S / Wellfound / Gust | directories (DR 65–91) | Organisation profile | Needs a company entity, and the entity would be filed against the disputed name | A/B | brand-filing |
| Indie Hackers / r/SideProject / DEV Community / daily.dev / Lobsters | directories (DR 78–92) | Standing account + a post | **P2** — no standing anywhere; and these audiences will identify the clone immediately | A/B | brand-filing |

**Count: 3 surfaces qualify today and are brand-safe. ~40 more qualify
technically and are brand-filing** — i.e. blocked by the rename, not by any
missing artefact.

**That ratio is the finding.** Guidejar is the only product in this batch whose
blocker is not "nothing is built". It is unusually *well* supplied with
qualifying artefacts — a working extension, an embeddable player, real AI
features, a live deploy — and cannot spend any of it.

## Qualifies after a small build

Estimates assume the rename has happened; without it none of these should ship.

| Build | Est. | Unlocks | Registry | Notes |
|---|---|---|---|---|
| **Fix `bridge.js` to match production + write a privacy policy + justify or narrow `<all_urls>`** | **Agent-work for the manifest and bridge; Rick-work for the privacy policy and the permission justification** | Chrome Web Store (A), Firefox AMO (A), Edge Add-ons (B), Opera (C) | stores (`browser-extension-store`) | **Not a new build — an unblocking of one that exists.** The extension is 100% written and 0% shippable. This is the shortest distance in the document between current state and a ranked, install-intent store surface — and it is the category leader's actual acquisition mechanism: Scribe is a Chrome extension first and a web app second |
| **Set `OPENAI_API_KEY` with a hard quota** | Config, not code — but it arms the CFO's `~$2,160/hour` unmetered-endpoint blocker, so the quota is the work | The 88 `ai-tools` directory rows become truthful rather than aspirational | directories | Do not do this without the rate limit. The endpoints accept unauthenticated POSTs today |
| **Confluence macro / Atlassian Forge app** that embeds a `/g/<publicId>` guide | **Agent-work, days.** The product already emits an iframe; a Forge macro is a thin wrapper | **Atlassian Marketplace (A)** — Confluence, Jira | stores (`saas-marketplace`) | **The best-fitting untouched surface in this doc.** Guidejar's buyer is the person who documents repeatable processes for other people, and in most companies that documentation lives in Confluence. A ranked marketplace, install intent, and a buyer already paying per seat for documentation |
| **Zendesk / Intercom help-centre app** rendering the embed | **Agent-work, days** each | Zendesk Marketplace (A), Intercom App Store (B), Freshworks Marketplace (B), HubSpot App Marketplace (A) | stores (`saas-marketplace`) | The CS seat is the named buyer. A walkthrough embedded in a help-centre article is the product's own distribution loop landing inside the tool the buyer already lives in |
| **Notion / Slack integration** | **Agent-work, days** | Notion Integration Gallery (A), Slack Marketplace (A), Microsoft Teams Store (A), monday.com (A), ClickUp (B), Asana (B), Miro (B) | stores (`saas-marketplace`) | Lower conviction than Confluence/Zendesk — a guide in Slack is a link, and links already work. Listed because the marketplaces are ranked search surfaces and the integration is genuinely small |
| **WordPress plugin** — shortcode/block embedding a published guide | **Agent-work, days** | **WordPress.org Plugin Directory (A)** — free, **no identity verification**, 14–90 day volunteer queue | stores (`cms-plugin-repo`) | Free, permanent, and reaches everyone who runs docs or a knowledge base on WordPress. The long review queue is wall-clock, so it should start early once the name is settled |
| **MCP server** — `create_guide(steps)` / `publish_guide()` over the existing `/api/guides` | **Agent-work, a day** | Official MCP Registry (A), Smithery (B), Glama (B), PulseMCP (B), mcp.so (B) | stores (`agent-registry`) | Genuinely novel: an agent that has just performed a process being able to *publish the walkthrough of it*. Reverse-DNS namespace is permanent, so it is post-rename by definition |
| **`HowTo` + `ItemList` JSON-LD on `/g/<publicId>`, plus OG/Twitter meta and a sitemap entry** | **Agent-work, hours** | No registry row — but it is the precondition for every answer-engine row above being *worth* having, and it fixes the "shares preview blank" blocker | answer-engines | Published guides are literally `HowTo` content. This is the cheapest correctly-typed structured data in the whole batch |
| **Safari extension** | Agent-work for the wrapper; **Apple Developer Program** for the rest | Safari Extensions via App Store (A) | stores | Deliberately deprioritised: $99/yr + **D-U-N-S for an organization account** for a fourth browser |
| **LTI wrapper** | Medium build, low conviction | Moodle Plugins Directory (A), Canvas LMS App Center (B), Instructure EduApp Center (B) | stores | "How to use this software" walkthroughs are real in education, but the buyer is a different seat and the integration is not thin |

## Does not qualify

- **All 11 `mobile app store` rows + Mac/Microsoft/Linux desktop stores** — the
  capture mechanism is a desktop browser extension recording desktop software.
  A phone cannot perform the core action. Not a wrapper problem; a
  physics-of-the-product problem.
- **All 25 `package-registry` / `package-manager` rows** (npm, PyPI, Homebrew,
  Docker Hub, crates.io) — nothing is distributed as a package, and the
  "Open-source" claim on the landing page is currently unsubstantiated anyway.
- **All 20 `ecommerce-app-marketplace` rows** (Shopify, BigCommerce, Wix,
  WooCommerce, Adobe Commerce, VTEX, Tiendanube…) and the **`pos-app-marketplace`
  rows** (Square, Clover, Toast) — a merchant does not buy process
  documentation from their storefront admin.
- **Most of the 38 `vertical-marketplace` rows** (Epic, Clio, Mindbody,
  ServiceTitan, Procore, Hostaway, Jobber, Cloudbeds…) — each needs a
  domain-specific integration plus, usually, a partner agreement. Several
  (Epic App Orchard, Oracle Health, athenahealth) additionally require
  healthcare partner programmes that **P5** caps and that would demand a call,
  which **P1** bars outright.
- **IDE `extension-store` rows** (VS Code, JetBrains, Open VSX, Zed, Sublime,
  Espanso) — the buyer is a CS/IT/ops person documenting *software processes for
  non-developers*. A guide builder is not a code editor plugin.
- **All 6 `deal-marketplace` rows** (AppSumo, StackSocial, PitchGround, Dealify,
  DealMirror, SaaS Mantra) — every one requires a business entity, product
  vetting and a price. There is no price, no processor, and vetting a clone
  under the cloned name is an obvious rejection.
- **All 9 `template-marketplace` rows** (Envato, Creative Market, Shopify Theme
  Store…) — Guidejar produces guides, not templates for sale.
- **Software-download directories** (CNET, Softpedia, Softonic, FileHippo,
  MajorGeeks, plus the DE/FR/CN/JP download shelves) — no binary. Folge, the
  offline competitor, *would* qualify here and does not; that asymmetry is worth
  noting as a competitive fact rather than a gap.
- **Chinese, Japanese and Korean platform strata** (WeChat Mini Programs,
  DingTalk, WeCom, Feishu, kintone, freee, Naver, Kakao) — every one requires
  in-country business registration or an ICP filing.
- **134 of the 137 buyer-register rows.** Guidejar's buyer is a *role* — the
  person who documents processes — not a licensed profession or a registered
  entity class. No register enumerates "customer success manager". The three
  that qualify do so because they enumerate by **installed technology** (sites
  already embedding a competitor's walkthrough), which is the only axis on which
  this buyer is discoverable. Google Places / Overture / OSM / Yelp fail on the
  same logic: the buyer has no physical location.
- **Design and award shelves** (Awwwards, Dribbble, Behance, CSS Design Awards,
  FWA, Land-book) — the site is on the stock Next.js favicon and stock
  `public/*.svg` assets. Structurally these are for design work; there is none.
- **Crowdfunding and accelerator directories** (Kickstarter, Indiegogo, Crowdcube,
  Seedrs, Startup Chile, La French Tech, Startup India) — programme-gated.

## Long-pole enrolments

| Enrolment | Scope | Lead time | Gate |
|---|---|---|---|
| **The rename itself** | **Product-level, and it is the pole that gates all the others** | Not a queue — an unmade decision, plus a trademark clearance search and a domain purchase | It lifts five BARRED rows and unblocks ~40 qualifying surfaces at once. **Nothing else in this document should start before it, with exactly one exception** (the technographic extraction, which publishes nothing) |
| **Chrome Web Store developer account** | **ORG-LEVEL** — one account serves every Shovelware extension | $5 one-time + identity verification. Review is 1–30 days *nominally* and **far longer for permission-heavy extensions** — `<all_urls>` host permissions plus an all-URLs content script is about as permission-heavy as MV3 gets | Requires a **published privacy policy** and a **limited-use certification**, neither of which exists. And a strike here has **account-level** consequences for every future Shovelware extension — which is precisely why filing under a disputed wordmark is the expensive mistake |
| **Firefox AMO account** | **ORG-LEVEL** | **No identity verification**, free, 1–14 days mostly automated | The cheapest store enrolment available to any product in this batch |
| **Microsoft Edge / Partner Center (Entra ID)** | **ORG-LEVEL** | 1–7 days; registration now **$0** | — |
| **Apple Developer Program** | **ORG-LEVEL** | Weeks; **D-U-N-S required for an organization account**, itself 1–5 business days minimum | $99/yr. Only needed for the Safari extension, which is the lowest-value browser here |
| **Atlassian Marketplace partner** | Product-level | Vendor registration + app review | Forge apps have a lighter path than Connect. Worth checking whether it needs a signed agreement — **P5** caps procurement and **P1** bars anything requiring a call |
| **WordPress.org plugin review** | Product-level | **14–90 days, measured** — volunteer queue, highly variable | Free, no identity verification. Pure wall-clock: submit early, forget about it |
| **Gartner Digital Markets vendor account** (Capterra + GetApp + Software Advice) | Product-level | 3–10 days | One verification → three A-grade listings. Best submission-to-listing ratio in the registry |
| **Official MCP Registry namespace** | Product-level, **permanent** | 0 days (CLI publish, automated) | Reverse-DNS namespace is an irrevocable claim on a name — so it is strictly post-rename |
| **Own domain** | Product-level | Not a queue; a purchase and a decision | Every slug-permanent listing points at a URL. Listing `guidejar.shovelware.ai` bakes both the wrong name *and* a subdomain we intend to retire into permanent third-party records |

**Note what is *not* a long pole here, unusually:** no D-U-N-S, no business
verification and no partner agreement stands between this product and its two
best surfaces. Chrome Web Store and Firefox AMO are $5 and $0. The pole is
entirely self-inflicted and entirely fixable.

## Recommended first three

**The controlling rule: a store slug is permanent, and this product's name is
someone else's.** So the ordering below is not "highest value first" — it is
"everything that mints a permanent public artefact waits for the rename", with
one row that does not.

**1 — Technographic buyer-register extraction: PublicWWW, BuiltWith,
Wappalyzer.** *Runnable today, under the current name, with zero brand
exposure.* It is the only row in this document that publishes nothing: we query
someone else's index and keep the answer. And the query is unusually sharp —
**every site whose help centre already embeds a Scribe or Tango walkthrough is a
company that has already bought this category, at a price**, and is
enumerable by script signature. That list feeds the channel doc's
`customer-research` (HIGH +4) and `cold-email` rows and does not decay. Gated on
cash (**P12**) and on Rick's list-sourcing stance.

**2 — Firefox Add-ons (AMO), immediately after the rename.** Free, **no identity
verification**, 1–14 day automated review, A-grade. It is the *rehearsal* for
the surface that matters: it proves the packaged extension works, the store copy
converts, and the listing craft is right — before spending the Chrome Web Store
slug, which is permanent, identity-verified and carries account-level strike
consequences for every future Shovelware extension. Preconditions are the same
three technical fixes either way: point `bridge.js` at production, publish a
privacy policy, and justify or narrow `<all_urls>`.

**3 — Chrome Web Store, after Firefox proves out.** This is the real one and the
channel doc knows it: CWS is a ranked, install-intent search surface, and it is
**how the category leader actually acquires** — Scribe is a Chrome extension
first and a web app second, which is exactly how it reached the seat we want.
The artefact is already written. What it needs is the rename, the three fixes,
and the acceptance that the listing name and slug are permanent.

**Explicitly not in the first three, and why:** the Confluence/Atlassian macro is
the best *product-fit* surface in this document and it is fourth, because it is a
build and the extension is not. Product Hunt, Show HN, G2 and every directory are
excluded on the same single ground — each is a permanent public filing under
another company's wordmark, and the channel doc bars or holds all of them for
that reason. Setting `OPENAI_API_KEY` to make the AI-directory listings truthful
is excluded until the unmetered-endpoint blocker (`~$2,160/hour` at 10 req/s per
the CFO) has a hard quota in front of it.

## Registry gaps found

**Not added to the CSVs.**

1. **Digital-adoption / walkthrough-tool review categories as a named shelf.**
   G2 and Capterra both have specific category shelves ("Digital Adoption
   Platform", "Screen and Video Capture", "Knowledge Management") where Scribe,
   Tango and Arcade rank. `stores.csv` records the *shelf* (G2, Capterra) but
   carries no category column, so the join cannot tell whether a product has a
   shelf to land on. For review-shelf rows, "which category" is most of the
   qualification.
2. **Help-centre / knowledge-base platform app directories** — Zendesk and
   Intercom are in `stores.csv`, but Document360, HelpScout, Freshdesk's own
   marketplace, GitBook and Guru are not. For a documentation product this is the
   natural ecosystem stratum and it is thin.
3. **Chrome Web Store *category* and permission-tier data.** The registry records
   `review_days: 1-30 (assumed - highly variable; permission-heavy extensions take
   far longer)` in a note. Permission tier is the single biggest driver of review
   time for this product and it is not a column — an `<all_urls>` extension and a
   single-origin extension are not the same surface.
4. **No `entry_method` column on `answer-engines.csv`** — nine of the ten rows
   here are entered by *permitting a crawler*, not submitting. Submit / permit /
   crawl-only is what determines whether an agent can act unsupervised.
5. **`buyer-registers.csv` has only four technographic rows** against 133
   legal-register rows. For every product in this batch whose buyer is defined by
   *what software they already run* rather than *what licence they hold*, those
   four rows are the whole registry. SimilarTech, Datanyze and script-signature
   search beyond PublicWWW are missing.

## Related

- `docs/marketing-channels.md` — the v2 channel assessment; §BARRED explains the
  trademark family that governs this document.
- `shovelware-team/docs/marketing/surfaces/README.md` — registry definitions and
  the list-first policy.
- `shovelware-team/docs/marketing/channel-rubric.md` §3 — P1, P2, P5, P10, P12.
- `shovelware-team/docs/memos/guidejar.md` — investment memo (KILL, 2026-08-01).
- `LAUNCH_CHECKLIST.md` — NO-GO on all three sections, name GATE open.
