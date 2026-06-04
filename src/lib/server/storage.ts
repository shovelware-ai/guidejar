import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Blob storage on R2.  Mirrors the previous filesystem layout:
 *   images/<publicId>/<imageId>.png
 *   audio/<publicId>/<stepId>.mp3
 * Same per-segment safety regex so a hostile id can't escape its directory
 * (R2 keys are flat strings, but allowing arbitrary characters lets a key
 * pollute the prefix listing or collide with neighbours).
 */

const SEG = /^[A-Za-z0-9_-]{1,128}$/;

function safeSegment(s: string): string {
  if (!SEG.test(s)) {
    throw new Error(`Invalid id segment: ${s}`);
  }
  return s;
}

async function bucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.ASSETS_BUCKET;
}

function imageKey(publicId: string, imageId: string) {
  return `images/${safeSegment(publicId)}/${safeSegment(imageId)}.png`;
}
function audioKey(publicId: string, stepId: string) {
  return `audio/${safeSegment(publicId)}/${safeSegment(stepId)}.mp3`;
}

// ── Images ────────────────────────────────────────────────────────────

export async function writeImage(
  publicId: string,
  imageId: string,
  bytes: Buffer | Uint8Array,
): Promise<void> {
  await (await bucket()).put(imageKey(publicId, imageId), bytes, {
    httpMetadata: { contentType: "image/png" },
  });
}

export async function readImage(
  publicId: string,
  imageId: string,
): Promise<R2ObjectBody | null> {
  return (await bucket()).get(imageKey(publicId, imageId));
}

export async function clearImages(publicId: string): Promise<void> {
  await deleteByPrefix(`images/${safeSegment(publicId)}/`);
}

// ── Audio ─────────────────────────────────────────────────────────────

export async function writeAudio(
  publicId: string,
  stepId: string,
  bytes: Buffer | Uint8Array,
): Promise<void> {
  await (await bucket()).put(audioKey(publicId, stepId), bytes, {
    httpMetadata: { contentType: "audio/mpeg" },
  });
}

export async function readAudio(
  publicId: string,
  stepId: string,
): Promise<R2ObjectBody | null> {
  return (await bucket()).get(audioKey(publicId, stepId));
}

export async function clearAudio(publicId: string): Promise<void> {
  await deleteByPrefix(`audio/${safeSegment(publicId)}/`);
}

// ── Prefix delete (no recursive rm in R2) ─────────────────────────────

async function deleteByPrefix(prefix: string): Promise<void> {
  const b = await bucket();
  let cursor: string | undefined;
  // Paginate — `list` returns up to 1000 keys at a time.
  do {
    const page: R2Objects = await b.list({ prefix, cursor });
    if (page.objects.length === 0) break;
    await b.delete(page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}
