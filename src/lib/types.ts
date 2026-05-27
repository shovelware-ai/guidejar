/** A clickable point on a step's screenshot, stored as relative coordinates
 *  (0..1) so it scales with however the image is displayed. */
export type Hotspot = {
  x: number;
  y: number;
};

/** A single step in a guide. The screenshot itself lives in the `images`
 *  object store keyed by `imageId`; the step only references it. */
export type Step = {
  id: string;
  imageId: string;
  title: string;
  description: string;
  hotspot?: Hotspot;
};

export type Guide = {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  createdAt: number;
  updatedAt: number;
};
