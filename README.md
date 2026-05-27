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
    page.tsx                  Dashboard — list / create / delete guides
    guide/[id]/edit/page.tsx  Step editor (add screenshots, hotspots, captions)
    guide/[id]/view/page.tsx  Interactive viewer / player
  components/
    Logo.tsx
    StepImage.tsx             Screenshot + positioned hotspot (edit & view modes)
    Thumb.tsx                 Step-list thumbnail
  lib/
    types.ts                  Guide / Step / Hotspot models
    db.ts                     IndexedDB storage + CRUD helpers
    import.ts                 Turn a captured session into a stored guide
    useImageUrl.ts            Hook: stored Blob -> object URL

extension/                    Chrome (MV3) capture extension — see below
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

## Roadmap

Features from Guidejar not yet built, roughly in order of value:

- **Sharing & embedding** — a real backend so guides have shareable URLs and can
  be embedded in other sites. Requires moving storage off the browser.
- Image annotations: blur regions, arrows, text callouts.
- Branching paths and chapters.
- AI voiceover and translation.
- Analytics on guide engagement.
