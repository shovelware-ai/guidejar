import { putImage, saveGuide, uid } from "./db";
import type { Guide, Step } from "./types";

/**
 * Shape produced by the capture extension. Screenshots arrive as data URLs
 * (PNG) so the whole session is a single JSON-serialisable object that can be
 * posted across contexts or saved to a file. The app converts them to Blobs
 * on import so storage stays compact.
 */
export type CapturedStep = {
  imageDataUrl: string;
  hotspot?: { x: number; y: number };
  title?: string;
  description?: string;
};

export type CapturedSession = {
  title?: string;
  steps: CapturedStep[];
};

/** Basic runtime guard so we don't try to import arbitrary JSON. */
export function isCapturedSession(value: unknown): value is CapturedSession {
  if (!value || typeof value !== "object") return false;
  const steps = (value as CapturedSession).steps;
  return (
    Array.isArray(steps) &&
    steps.every(
      (s) => s && typeof (s as CapturedStep).imageDataUrl === "string",
    )
  );
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Create a new guide in IndexedDB from a captured session. */
export async function importSession(session: CapturedSession): Promise<Guide> {
  const now = Date.now();
  const steps: Step[] = [];

  for (const captured of session.steps) {
    const blob = await dataUrlToBlob(captured.imageDataUrl);
    const imageId = await putImage(blob);
    steps.push({
      id: uid(),
      imageId,
      title: captured.title || `Step ${steps.length + 1}`,
      description: captured.description ?? "",
      hotspot: captured.hotspot,
    });
  }

  const guide: Guide = {
    id: uid(),
    title: session.title || "Captured guide",
    description: "",
    steps,
    createdAt: now,
    updatedAt: now,
  };
  await saveGuide(guide);
  return guide;
}
