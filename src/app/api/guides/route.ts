import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import {
  getGuideOwnership,
  insertGuide,
  type PublishedStep,
  updateGuide,
} from "@/lib/server/db";
import { clearImages, writeImage } from "@/lib/server/storage";
import { editKey as newEditKey, shortId } from "@/lib/server/ids";
import type { Annotation, Branch } from "@/lib/types";

export const runtime = "nodejs"; // better-sqlite3 + fs need Node, not Edge.

// Soft caps to keep a single publish from filling the disk by accident.
const MAX_STEPS = 200;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per screenshot

type PublishStepInput = {
  /** Caller-provided step id, preserved verbatim so branch targets resolve.
   *  If missing, server generates one. */
  id?: string;
  title?: string;
  description?: string;
  hotspot?: { x: number; y: number };
  annotations?: Annotation[];
  branches?: Branch[];
  image: { base64: string; mime?: string };
};

type PublishBody = {
  title?: string;
  description?: string;
  steps: PublishStepInput[];
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

  // Decode + validate image bytes before touching any persistent state.
  const decoded: { id: string; bytes: Buffer; step: PublishStepInput }[] = [];
  for (let i = 0; i < body.steps.length; i++) {
    const step = body.steps[i];
    if (!step?.image?.base64) return bad(`Step ${i + 1} missing image`);
    let bytes: Buffer;
    try {
      bytes = Buffer.from(step.image.base64, "base64");
    } catch {
      return bad(`Step ${i + 1} has invalid base64`);
    }
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
      return bad(`Step ${i + 1} image is empty or too large`);
    }
    decoded.push({ id: shortId(12), bytes, step });
  }

  const me = await getCurrentUser();

  // Decide between insert and update. Update is authorised by either the
  // editKey (works for anonymous publishers) or by being the owning user.
  let publicId = body.publicId;
  let editKey: string;
  let isUpdate = false;
  if (publicId) {
    const owner = getGuideOwnership(publicId);
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
    // Drop old screenshots; we're replacing the whole step set.
    await clearImages(publicId);
  }

  for (const { id, bytes } of decoded) {
    await writeImage(publicId, id, bytes);
  }

  const steps: PublishedStep[] = decoded.map(({ id, step }, i) => ({
    id: step.id || shortId(12),
    imageId: id,
    title: step.title?.trim() || `Step ${i + 1}`,
    description: step.description ?? "",
    hotspot: step.hotspot,
    annotations: step.annotations,
    branches: step.branches,
  }));

  const guide = {
    title: (body.title ?? "").trim() || "Untitled guide",
    description: body.description ?? "",
    steps,
  };
  if (isUpdate) updateGuide(publicId, guide);
  else insertGuide(publicId, editKey, guide, me?.id ?? null);

  return NextResponse.json({ publicId, editKey, owned: !!me });
}
