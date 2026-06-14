# Guidejar (clone)

An interactive step-by-step guide builder, inspired by [Guidejar](https://www.guidejar.com/).
Turn a set of screenshots into a clickable walkthrough: add steps, mark where to
click, write a caption for each, then play it back as an interactive guide.

This is the **local-first MVP** — everything runs in the browser, no account or
server required. Guides and screenshots are stored in your browser via IndexedDB.

## The core loop

1. **Create** a guide from the dashboard.
2. **Add steps** by dropping in screenshots, pasting from the clipboard, or
   choosing files.
3. **Edit** each step: click the screenshot to drop a hotspot where the user
   should click, and add a title/description.
4. **Preview** it as an interactive player — pulsing hotspot, captions, and
   keyboard/click navigation through the steps.

## Running it

Two dev modes are supported:

**Workers dev (recommended — same runtime as production):**

```bash
npm install
npm run db:local          # create the local D1 + apply 0001_init.sql
npm run cf:dev            # opennextjs-cloudflare build && wrangler dev
```

Then open http://localhost:8787. Real workerd, D1 + R2 emulated in
`.wrangler/`. This is what the production deploy actually runs.

**Plain `next dev` (faster UI iteration):**

```bash
npm install
npm run db:local
npm run dev               # next dev on :3000
```

`initOpenNextCloudflareForDev()` is wired in `next.config.ts` so
`next dev` can resolve the same D1/R2 bindings via getCloudflareContext().

The root `/` is the marketing landing page; the app dashboard lives at
`/app`. Sign-in / sign-up redirect to `/app` once a session is established.

**Optional environment**

  - `OPENROUTER_API_KEY` — enables AI voiceover and AI translation, routed
    through [OpenRouter](https://openrouter.ai)'s OpenAI-compatible API.
    Without it, the editor's Generate buttons disable themselves and the
    endpoints return 503. Set via `.dev.vars` locally or
    `wrangler secret put OPENROUTER_API_KEY` for production. The models are
    overridable via `OPENROUTER_MODEL` (chat/translation, default
    `openai/gpt-4o-mini`) and `OPENROUTER_TTS_MODEL` (voiceover, default
    `openai/gpt-4o-mini-tts`).
  - `SESSION_SECRET` — HMAC secret for session cookies. Locally a dev
    placeholder is used; **production deploys MUST set this** via
    `wrangler secret put SESSION_SECRET` (any sufficiently long random
    string).

## Deploy

Standard shovelware model: Cloudflare Workers + D1 + R2 on the
`guidejar.shovelware.ai` custom domain. The Next.js app is bundled for
Workers via `@opennextjs/cloudflare`; SQLite lives in D1; screenshot and
voiceover blobs live in R2 (`guidejar-assets` bucket); the session secret
and OpenRouter key live as Workers secrets.

First-time deploy (one-shot):

```bash
export CLOUDFLARE_API_TOKEN=<token>     # see shovelware-deploy skill for token scopes

npm run db:create                       # creates the D1 — prints database_id
# Paste that id into wrangler.jsonc → d1_databases[0].database_id
npx wrangler r2 bucket create guidejar-assets

# Required production secrets:
npx wrangler secret put SESSION_SECRET  # any 32+ char random string
npx wrangler secret put OPENROUTER_API_KEY  # only if you want voiceover + translation

npm run db:remote                       # apply 0001_init.sql to the live D1
npm run deploy                          # opennextjs-cloudflare build && wrangler deploy
```

The custom domain (`guidejar.shovelware.ai`) is provisioned automatically
from the `routes` entry — first deploy may take ~1–2 minutes for TLS to
go active.

Subsequent deploys are just `npm run deploy`. If the schema changes, add a
new `migrations/NNNN_*.sql` and run `npm run db:remote` first.

Local and remote D1 are **independent stores** — both need their own
`db:local` / `db:remote` migration applies.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **Cloudflare Workers** (via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare))
  for production hosting
- **Cloudflare D1** (managed SQLite) for published-guide metadata, accounts,
  analytics
- **Cloudflare R2** for screenshot + voiceover MP3 storage
- **IndexedDB** (via [`idb`](https://github.com/jakearchibald/idb)) for *local*
  draft persistence in the editor (drafts never leave the browser until publish)

## Project structure

```
src/
  app/
    page.tsx                                Marketing landing page
    app/page.tsx                            Dashboard — list / create / delete guides
    guide/[id]/edit/page.tsx                Step editor (screenshots, hotspots, captions, Share)
    guide/[id]/view/page.tsx                Local interactive viewer / player
    import/page.tsx                         Receives captures from the extension or .json
    g/[publicId]/page.tsx                   Public viewer for a published guide
    login/page.tsx                          Sign-in form
    signup/page.tsx                         Account creation form
    me/page.tsx                             Signed-in user's published guides
    api/guides/route.ts                     POST: publish / update
    api/guides/[publicId]/route.ts          GET / DELETE one published guide
    api/guides/[publicId]/images/[id]/route.ts  Serve a screenshot PNG
    api/auth/{signup,login,logout,me}/route.ts  Auth endpoints
    api/me/guides/route.ts                  List the signed-in user's guides
  components/
    Logo.tsx
    AuthNav.tsx               Header widget: sign in / sign up / account menu
    AuthForm.tsx               Card shell + Field used by /login and /signup
    StepImage.tsx              Screenshot + hotspot + annotations (local + server URLs)
    StepCanvas.tsx             Editor canvas: toolbar + drag-to-draw annotations
    AnnotationLayer.tsx        Pure render of blur/arrow/text overlays
    GuidePlayer.tsx            Shared interactive player (linear + branching)
    Thumb.tsx                  Step-list thumbnail
    PublicViewer.tsx           Thin adapter mapping a published guide into GuidePlayer
    ShareDialog.tsx            Publish / update / unpublish modal
  lib/
    types.ts                  Guide / Step / Hotspot / PublishInfo
    db.ts                     IndexedDB storage + CRUD helpers
    useImageUrl.ts            Hook: stored Blob -> object URL
    useCurrentUser.ts         Hook: current signed-in user (fetches /api/auth/me)
    import.ts                 Turn a captured session into a stored guide
    publish.ts                Publish a local guide to the server, unpublish, share URL
    server/
      db.ts                   D1 query layer (async, takes env.DB)
      storage.ts              R2 read/write/clear-by-prefix for images + audio
      ids.ts                  Short URL ids + per-guide edit keys (Web Crypto)
      auth.ts                 HMAC-signed session cookies (Web Crypto subtle)
      users.ts                User CRUD + bcrypt password verify
      ai.ts                   TTS + translation via OpenRouter (env-gated by OPENROUTER_API_KEY)

extension/                    Chrome (MV3) capture extension — see below
migrations/0001_init.sql      D1 schema (consolidated v1→v4)
wrangler.jsonc                Workers + D1 + R2 + custom domain config
open-next.config.ts           OpenNext Cloudflare adapter config
```

Screenshot bytes live in a separate `images` object store keyed by id; guide
objects only reference them. Hotspots are stored as relative (0..1) coordinates
so they stay correct at any display size.

## Capture extension

`extension/` is a Manifest V3 Chrome extension that records a process and turns
it into a guide automatically — no manual screenshots.

**Load it (unpacked):**

1. Start the app (`npm run dev`).
2. Go to `chrome://extensions`, enable **Developer mode**, click **Load
   unpacked**, and select the `extension/` folder.
3. (If the app runs on a port other than 3000, open the extension popup and set
   the **App URL**.)

**Use it:**

1. Open the page you want to document, click the extension, **Start recording**.
2. Click through your process — each click captures a screenshot and drops a
   hotspot where you clicked. A floating badge shows the step count.
3. Click **Stop** (in the badge or popup). The app opens at `/import` and builds
   the guide automatically; you land in the editor to tidy it up.

**How the handoff works:** the extension can't write to the app's IndexedDB, so
on stop it stashes the capture and opens the app. A content-script *bridge*
(`bridge.js`, scoped to `localhost`) relays the capture into the page via
`postMessage`, and the app's `/import` page does the actual import — so the app
stays the sole owner of its data. As a fallback the popup can **download the
capture as `.json`**, which `/import` also accepts.

Files: `background.js` (recording state + `captureVisibleTab`), `recorder.js`
(click capture + on-page badge), `bridge.js` (page handoff), `popup.{html,js}`.

> Capturing on `pointerdown` means the screenshot shows the page *before* the
> click — exactly the "click here" state you want. Fast in-page navigations can
> occasionally outrun a capture; that step is skipped rather than wrong.

## Analytics

Anonymous engagement tracking for **published guides**.  When the public
viewer (`/g/<publicId>`) mounts, the `GuidePlayer` fires events to
`POST /api/g/<publicId>/events`.  Signed-in owners get an analytics page
at `/me/guides/<publicId>` with summary cards, a per-step funnel, branch
pick counts, and a recent-activity log.

**Privacy.**  What we store: a random per-visitor `session_id` (kept in
`localStorage` as `gj_sid`), event type, optional step id, optional
`props_json` (for branch ids).  What we don't store: IP addresses,
user agents, anything that could fingerprint a visitor.  The schema is
public-by-design.

**Events recorded.**

  - `guide_view`      — once per page load
  - `step_view`       — every time a step is shown
  - `branch_picked`   — when a choice button is clicked; props include `branchId`
  - `guide_complete`  — when the viewer reaches the end screen

The local editor's preview viewer (`/guide/<id>/view`) doesn't fire
events — only the published `PublicViewer` does, by passing
`analyticsPublicId` into `GuidePlayer`.

**Schema (v4 migration).**

  ```sql
  CREATE TABLE events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id  TEXT NOT NULL REFERENCES guides(public_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    step_id    TEXT,
    session_id TEXT NOT NULL,
    props_json TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL
  );
  ```

The `ON DELETE CASCADE` means unpublishing a guide drops its events at
the same moment — verified.

**API.**

  ```
  POST /api/g/<publicId>/events              Anonymous record-event sink
  GET  /api/me/guides/<publicId>/stats       Owner-only aggregate stats
  ```

The owner stats query computes total views, unique sessions, completion
count + rate, per-step session counts (the funnel), and per-branch pick
counts in five small statements — no joins fancier than
`COUNT(DISTINCT session_id)`.

## AI translation

A guide can carry per-step translations of its title + description.  In the
editor, add target language codes (BCP-47, e.g. `es`, `fr-CA`, `ja`) in the
toolbar.  Each step then shows a Translations subsection — one row per
language with an editable title + description and a Generate button that
hits `POST /api/translate` (OpenRouter `openai/gpt-4o-mini`, JSON-mode).

**Viewer.** When a published guide has any translation, a language picker
shows up in the header.  Picking a language renders that language per step,
falling back to source text when a particular step or field hasn't been
translated yet (partial translations are first-class).

**Where languages come from on the public side.** `PublishedGuide.languages`
is **derived on read** from the union of translation keys actually present
on the steps — a language with no translated copy anywhere just doesn't show
up.  No DB column, no migration.

**Env gate.** Same as voiceover: without `OPENROUTER_API_KEY` the endpoint
returns 503 and the editor's Generate buttons are hidden in favour of a
hint.  Manual editing still works.

## AI voiceover

Each step can have an MP3 voiceover generated from its title + description by
OpenAI's TTS (`openai/gpt-4o-mini-tts`), reached through OpenRouter.  The audio
plays automatically in the viewer; if the browser blocks autoplay before any
user gesture, a small play button shows on the screenshot.

**Flow.** The editor calls `POST /api/voiceover {text, voice}`; the server
hits OpenRouter and streams the MP3 back.  Bytes go into an IndexedDB `audio`
store (so drafts work offline and the local viewer can play it too); the
step gains an `audioId`.  On publish the bytes upload alongside images and
the server saves them to `data/audio/<publicId>/<stepId>.mp3`; the public
viewer fetches from `/api/guides/<publicId>/audio/<stepId>`.

**Voice.** One guide-level setting (`Guide.voice`) feeds every generation.
Available: alloy / echo / fable / onyx / nova / shimmer.  Changing it
doesn't auto-regenerate — clicking Regenerate on a step re-renders with the
current voice.

**Limits.** Hard-capped at 4 MB per voiceover MP3 server-side, and 4096
characters of input text (the TTS model's limit).  When `OPENROUTER_API_KEY`
isn't set the endpoint returns 503 and the editor disables the controls cleanly.

## Chapters

A guide can have a list of chapters (`{ id, title }[]`); each step optionally
references one via `chapterId`. Chapters group **consecutive** steps with the
same chapterId into a named section — they don't reorder steps. Guides
without chapters are unchanged.

**Editor.** The step details panel has a Chapter dropdown (existing chapters,
"+ New chapter…" to create one, or "— None —"). The sidebar step list shows a
chapter header above the first step of each section. Deleting a step prunes
any chapter that no longer has any steps in it.

**Player.** The header gains a **Chapters ▾** menu when the guide has any
chapters; clicking a chapter jumps to its first step (and adds a history
entry so Back returns to where you were). The current step's chapter title is
also rendered above the step caption.

**Server.** A real `user_version`-tracked schema migration (v3) added a
`chapters_json` column on the `guides` table; existing rows get `'[]'` and
keep working. The publish API drops any orphan chapters that no step
references — the model never carries dangling sections.

## Branching paths

Any step can carry a list of **branches** — `{ id, label, targetStepId }`.
When present, the viewer hides Next and shows the branches as choice buttons
instead. Picking one jumps to that step's id; the special target
`__end__` finishes the guide.

The model is **layered on top of linear navigation**, not a replacement:
guides without branches keep working exactly as before. When *any* step in a
guide has branches, the player switches subtle behaviours: it hides the
linear progress bar (it's no longer meaningful), keeps Back available via a
**history stack** so backing out of a choice returns to the decision step,
and updates step counter copy.

**Editor.** In the step details panel, a Branches section lets you add
choices (label + target dropdown of every step, plus a "🏁 End guide"
sentinel). Deleting a step also strips any dangling branches that pointed
to it, so the model never carries broken references.

**Implementation.** Steps gained a stable `id` field at the publish boundary
so branch targets resolve across the local/server round-trip (the local
editor already had `Step.id`; `PublishedStep` now carries it too). The
shared `GuidePlayer` component is id-based throughout (not index-based), so
the same code handles linear and branched flows.

## Annotations

Each step's screenshot supports three kinds of overlay on top of the hotspot:

- **Blur** — a rectangle that hides sensitive content via `backdrop-filter: blur`.
- **Arrow** — a coloured arrow from one point to another (SVG with marker).
- **Text** — a small amber callout card with arbitrary text.

Like hotspots, every coordinate is stored as a relative `0..1` so the overlay
stays correctly positioned at any rendered image size. The render layer uses
SVG percentage lengths so arrows don't distort or scale strokes incorrectly,
and CSS percentages for blur/text — no `ResizeObserver` needed.

**Editor.** The step canvas has a tool palette (Select / Hotspot / Blur /
Arrow / Text, with `V H B A T` shortcuts). Drag to draw blur or arrow,
click for hotspot or text. In Select mode, click an annotation to select
it, drag to move, `Backspace` to delete, double-clicking text re-enters
editing.

**Persistence.** Annotations are stored on each `Step` as
`annotations?: Annotation[]`. The wire/DB format is identical
(`steps_json` is JSON), so no schema migration was needed to add them.

## Sharing & embedding

Drafts stay local-first in IndexedDB. To make a guide shareable, hit **Share**
in the editor and **Publish**: the app uploads the steps + screenshots to the
server and gives you a public URL like `/g/<publicId>` plus an `<iframe>`
embed snippet (`?embed=1` strips chrome). **Update** re-uploads; **Unpublish**
removes the server copy. Drafts you never publish never leave the browser.

**Ownership model.** Two layers, designed to coexist:

1. **Capability key.** Every publish — anonymous or not — returns a secret
   `editKey` alongside the `publicId`. The client stores it on the local guide
   as `guide.publishedAs.editKey` and uses it to update/unpublish.
2. **Accounts.** If you're signed in when you publish, the guide is also tied
   to your account; from then on you can update/unpublish it from any browser
   without needing the editKey.

A request is authorised to mutate a guide if **either** the editKey matches
**or** the session owns it. Anyone with the share link can view; only those
two parties can change or delete.

**Where things live on the server.**

- `data/guidejar.db` — SQLite (single file, WAL mode); one row per published guide
  with title, description, step list (as JSON of `{imageId, title, description, hotspot}`),
  and the editKey.
- `data/images/<publicId>/<imageId>.png` — screenshot files, one directory per guide.

Re-publishing wipes the guide's image directory and writes fresh files, so the
server never accumulates orphans.

**API.**

```
POST   /api/auth/signup                      Create account + start session
POST   /api/auth/login                       Verify password + start session
POST   /api/auth/logout                      Clear session
GET    /api/auth/me                          Current user (or null)
GET    /api/me/guides                        List the signed-in user's guides

POST   /api/guides                           Publish (or update; auth by editKey or session)
GET    /api/guides/<publicId>                Fetch JSON metadata + step list
DELETE /api/guides/<publicId>[?key=<key>]    Unpublish (auth by editKey or session)
GET    /api/guides/<publicId>/images/<id>    Serve a screenshot (long cache)
```

**Sessions.** HMAC-signed cookie (`gj_session`) over `<userId>.<expiresMs>.<sig>`,
HTTP-only, lax SameSite, secure in production, 30-day TTL. The HMAC secret is
generated to `data/secret` (gitignored, mode 0600) on first run so sessions
survive restarts. Passwords are bcrypt-hashed (cost 10). Schema is versioned
via SQLite's `user_version` pragma, so future migrations apply once and stay
backwards-compatible.

**Limits & caveats.** 200 steps and 8 MB per screenshot, enforced server-side.
No rate limiting, no email verification, no password reset — fine for a
local/self-hosted MVP. Path traversal is defended at the storage layer (every
id must match `[A-Za-z0-9_-]{1,128}`).

## Roadmap

The headline Guidejar feature set is built. Possible next moves:
- Analytics on guide engagement.
