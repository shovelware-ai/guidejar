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
    useImageUrl.ts            Hook: stored Blob -> object URL
```

Screenshot bytes live in a separate `images` object store keyed by id; guide
objects only reference them. Hotspots are stored as relative (0..1) coordinates
so they stay correct at any display size.

## Roadmap

Features from Guidejar not yet built, roughly in order of value:

- **Capture browser extension** — auto-record clicks and screenshots instead of
  manual upload (the biggest differentiator).
- **Sharing & embedding** — a real backend so guides have shareable URLs and can
  be embedded in other sites. Requires moving storage off the browser.
- Image annotations: blur regions, arrows, text callouts.
- Branching paths and chapters.
- AI voiceover and translation.
- Analytics on guide engagement.
