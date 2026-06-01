import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "data", "images");
const AUDIO_DIR = path.join(process.cwd(), "data", "audio");

/** Reject anything that could escape the per-guide directory. */
function safeSegment(s: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(s)) {
    throw new Error(`Invalid id segment: ${s}`);
  }
  return s;
}

function guideDir(publicId: string) {
  return path.join(IMAGES_DIR, safeSegment(publicId));
}

function imagePath(publicId: string, imageId: string) {
  return path.join(guideDir(publicId), `${safeSegment(imageId)}.png`);
}

export async function writeImage(
  publicId: string,
  imageId: string,
  bytes: Buffer,
) {
  await mkdir(guideDir(publicId), { recursive: true });
  await writeFile(imagePath(publicId, imageId), bytes);
}

export async function readImage(
  publicId: string,
  imageId: string,
): Promise<Buffer | null> {
  try {
    return await readFile(imagePath(publicId, imageId));
  } catch {
    return null;
  }
}

/** Remove every screenshot for a guide (used on unpublish & on re-publish). */
export async function clearImages(publicId: string) {
  await rm(guideDir(publicId), { recursive: true, force: true });
}

// ── Audio (MP3 voiceover per step) ─────────────────────────────────────

function audioDir(publicId: string) {
  return path.join(AUDIO_DIR, safeSegment(publicId));
}
function audioPath(publicId: string, stepId: string) {
  return path.join(audioDir(publicId), `${safeSegment(stepId)}.mp3`);
}

export async function writeAudio(
  publicId: string,
  stepId: string,
  bytes: Buffer,
) {
  await mkdir(audioDir(publicId), { recursive: true });
  await writeFile(audioPath(publicId, stepId), bytes);
}

export async function readAudio(
  publicId: string,
  stepId: string,
): Promise<Buffer | null> {
  try {
    return await readFile(audioPath(publicId, stepId));
  } catch {
    return null;
  }
}

export async function clearAudio(publicId: string) {
  await rm(audioDir(publicId), { recursive: true, force: true });
}
