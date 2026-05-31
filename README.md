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

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build && npm start   # production build
```

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **IndexedDB** (via [`idb`](https://github.com/jakearchibald/idb)) for local
  persistence of guide data and screenshot blobs

## Project structure

```
src/
  app/
    page.tsx                                Dashboard — list / create / delete guides
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
    StepImage.tsx              Screenshot + positioned hotspot (local + server URLs)
    Thumb.tsx                  Step-list thumbnail
    PublicViewer.tsx           Player for a published guide (server-hosted images)
    ShareDialog.tsx            Publish / update / unpublish modal
  lib/
    types.ts                  Guide / Step / Hotspot / PublishInfo
    db.ts                     IndexedDB storage + CRUD helpers
    useImageUrl.ts            Hook: stored Blob -> object URL
    useCurrentUser.ts         Hook: current signed-in user (fetches /api/auth/me)
    import.ts                 Turn a captured session into a stored guide
    publish.ts                Publish a local guide to the server, unpublish, share URL
    server/
      db.ts                   SQLite + versioned migrations + CRUD
      storage.ts              Read/write screenshot PNGs under data/images/
      ids.ts                  Short URL ids + per-guide edit keys
      auth.ts                 HMAC-signed session cookies; getCurrentUser
      users.ts                User CRUD + bcrypt password verify

extension/                    Chrome (MV3) capture extension — see below
data/                         (gitignored) SQLite db + screenshot files + session secret
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

Features from Guidejar not yet built, roughly in order of value:

- **Image annotations**: blur regions (hide sensitive data), arrows, text callouts.
- Branching paths and chapters.
- AI voiceover and translation.
- Analytics on guide engagement.
