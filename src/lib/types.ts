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

/** A single step in a guide. The screenshot itself lives in the `images`
 *  object store keyed by `imageId`; the step only references it. */
export type Step = {
  id: string;
  imageId: string;
  title: string;
  description: string;
  hotspot?: Hotspot;
  annotations?: Annotation[];
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
  createdAt: number;
  updatedAt: number;
  publishedAs?: PublishInfo;
};
