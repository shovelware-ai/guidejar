import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import {
  getDb,
  getGuideOwnership,
  insertGuide,
  type PublishedStep,
  updateGuide,
} from "@/lib/server/db";
import { clearAudio, clearImages, writeAudio, writeImage } from "@/lib/server/storage";
import { editKey as newEditKey, shortId } from "@/lib/server/ids";
import type {
  Annotation,
  Branch,
  Chapter,
  StepTranslation,
} from "@/lib/types";

export const runtime = "nodejs";

// Soft caps to keep a single publish from filling the disk by accident.
const MAX_STEPS = 200;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per screenshot
const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // 4 MB per voiceover MP3

type PublishStepInput = {
  /** Caller-provided step id, preserved verbatim so branch targets resolve.
   *  If missing, server generates one. */
  id?: string;
  title?: string;
  description?: string;
  hotspot?: { x: number; y: number };
  annotations?: Annotation[];
  branches?: Branch[];
  chapterId?: string;
  translations?: Record<string, StepTranslation>;
  image: { base64: string; mime?: string };
  /** Optional voiceover audio (MP3, base64).  When present the server saves
   *  it to R2 and the published step gets `hasAudio: true`. */
  audio?: { base64: string };
};

type PublishBody = {
  title?: string;
  description?: string;
  steps: PublishStepInput[];
  chapters?: Chapter[];
  // For updates: include the publicId + editKey returned at first publish.
  publicId?: string;
  editKey?: string;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return bad("Invalid JSON body");
  }
  if (!body || !Array.isArray(body.steps) || body.steps.length === 0) {
    return bad("Need at least one step");
  }
  if (body.steps.length > MAX_STEPS) {
    return bad(`Too many steps (max ${MAX_STEPS})`);
  }

  // Decode + validate image (and optional audio) bytes before touching any
  // persistent state — we want a 400 before half-writing files.
  const decoded: {
    imageBytes: Uint8Array;
    audioBytes: Uint8Array | null;
    step: PublishStepInput;
  }[] = [];
  for (let i = 0; i < body.steps.length; i++) {
    const step = body.steps[i];
    if (!step?.image?.base64) return bad(`Step ${i + 1} missing image`);
    let imageBytes: Uint8Array;
    try {
      imageBytes = base64ToBytes(step.image.base64);
    } catch {
      return bad(`Step ${i + 1} has invalid image base64`);
    }
    if (imageBytes.length === 0 || imageBytes.length > MAX_IMAGE_BYTES) {
      return bad(`Step ${i + 1} image is empty or too large`);
    }
    let audioBytes: Uint8Array | null = null;
    if (step.audio?.base64) {
      try {
        audioBytes = base64ToBytes(step.audio.base64);
      } catch {
        return bad(`Step ${i + 1} has invalid audio base64`);
      }
      if (audioBytes.length === 0 || audioBytes.length > MAX_AUDIO_BYTES) {
        return bad(`Step ${i + 1} audio is empty or too large`);
      }
    }
    decoded.push({ imageBytes, audioBytes, step });
  }

  const db = await getDb();
  const me = await getCurrentUser(db);

  // Decide between insert and update. Update is authorised by either the
  // editKey (works for anonymous publishers) or by being the owning user.
  let publicId = body.publicId;
  let editKey: string;
  let isUpdate = false;
  if (publicId) {
    const owner = await getGuideOwnership(db, publicId);
    if (!owner) return bad("Guide not found", 404);
    const byKey = !!body.editKey && body.editKey === owner.editKey;
    const byUser = !!me && owner.userId === me.id;
    if (!byKey && !byUser) return bad("Not allowed", 403);
    editKey = owner.editKey;
    isUpdate = true;
  } else {
    publicId = shortId();
    editKey = newEditKey();
  }

  if (isUpdate) {
    // Drop old assets; we're replacing the whole step set.
    await clearImages(publicId);
    await clearAudio(publicId);
  }

  // Assign stable step ids (preserve client-provided ones) before we write
  // assets, so audio files can be keyed by the same step id.
  const stepIds = decoded.map(({ step }) => step.id || shortId(12));
  const imageIds = decoded.map(() => shortId(12));

  for (let i = 0; i < decoded.length; i++) {
    const { imageBytes, audioBytes } = decoded[i];
    await writeImage(publicId, imageIds[i], imageBytes);
    if (audioBytes) {
      await writeAudio(publicId, stepIds[i], audioBytes);
    }
  }

  const steps: PublishedStep[] = decoded.map(({ step, audioBytes }, i) => ({
    id: stepIds[i],
    imageId: imageIds[i],
    title: step.title?.trim() || `Step ${i + 1}`,
    description: step.description ?? "",
    hotspot: step.hotspot,
    annotations: step.annotations,
    branches: step.branches,
    chapterId: step.chapterId,
    translations: step.translations,
    hasAudio: !!audioBytes,
  }));

  // Drop chapters that aren't referenced by any step — keeps the model tidy.
  const usedChapterIds = new Set(
    steps.map((s) => s.chapterId).filter((c): c is string => !!c),
  );
  const chapters = (body.chapters ?? []).filter((c) => usedChapterIds.has(c.id));

  const guide = {
    title: (body.title ?? "").trim() || "Untitled guide",
    description: body.description ?? "",
    steps,
    chapters: chapters.length > 0 ? chapters : undefined,
  };
  if (isUpdate) await updateGuide(db, publicId, guide);
  else await insertGuide(db, publicId, editKey, guide, me?.id ?? null);

  return NextResponse.json({ publicId, editKey, owned: !!me });
}

/** Strict base64 → Uint8Array (browser/workerd; no Node Buffer). */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
