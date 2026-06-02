/** A clickable point on a step's screenshot, stored as relative coordinates
 *  (0..1) so it scales with however the image is displayed. */
export type Hotspot = {
  x: number;
  y: number;
};

/**
 * Overlays drawn on top of a step's screenshot. Like hotspots, every
 * coordinate is relative to the image (0..1) so layouts scale cleanly.
 *  - `blur`  hides a rectangle (e.g. sensitive data) with a backdrop blur
 *  - `arrow` is a straight line with an arrowhead from `from` → `to`
 *  - `text`  is a small callout card at `pos` with the given `text`
 */
export type BlurAnnotation = {
  id: string;
  kind: "blur";
  rect: { x: number; y: number; w: number; h: number };
};
export type ArrowAnnotation = {
  id: string;
  kind: "arrow";
  from: { x: number; y: number };
  to: { x: number; y: number };
};
export type TextAnnotation = {
  id: string;
  kind: "text";
  pos: { x: number; y: number };
  text: string;
};
export type Annotation = BlurAnnotation | ArrowAnnotation | TextAnnotation;

/** Magic value: a branch targeting this finishes the guide. */
export const END_OF_GUIDE = "__end__";

/**
 * A single branch out of a decision step. The viewer renders branches as
 * choice buttons; picking one jumps to the target step (or ends the guide
 * if `targetStepId === END_OF_GUIDE`).
 */
export type Branch = {
  id: string;
  label: string;
  targetStepId: string; // step id or END_OF_GUIDE
};

/** Chapters group **consecutive** steps with the same chapterId into a named
 *  section. They don't reorder steps — the steps array is still the truth. */
export type Chapter = {
  id: string;
  title: string;
};

/** A single step in a guide. The screenshot itself lives in the `images`
 *  object store keyed by `imageId`; the step only references it. */
/** Translated copies of a step's text content, keyed by BCP-47 language code. */
export type StepTranslation = {
  title?: string;
  description?: string;
};

export type Step = {
  id: string;
  imageId: string;
  title: string;
  description: string;
  hotspot?: Hotspot;
  annotations?: Annotation[];
  /** When non-empty, the viewer shows choice buttons instead of Next. */
  branches?: Branch[];
  /** References a `Chapter.id` on the parent guide. */
  chapterId?: string;
  /** When set, an audio Blob lives in the IndexedDB `audio` store under
   *  this key — generated voiceover for this step. */
  audioId?: string;
  /** Translated text per language code (e.g. "es", "fr-CA"). The source
   *  language stays in `title` / `description`. */
  translations?: Record<string, StepTranslation>;
};

/** Set on a guide once it has been published to the server. The editKey is a
 *  per-guide capability secret that lets this client update/unpublish later;
 *  it stays local. */
export type PublishInfo = {
  publicId: string;
  editKey: string;
  publishedAt: number;
};

export type Guide = {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  chapters?: Chapter[];
  /** Voice id used when generating voiceover (e.g. "alloy"). */
  voice?: string;
  /** Target language codes this guide is translated into. */
  languages?: string[];
  createdAt: number;
  updatedAt: number;
  publishedAs?: PublishInfo;
};
