import { getAudio, getImage } from "./db";
import type { Guide, PublishInfo } from "./types";

/** Serialise a Blob as a bare base64 string (no data: prefix). */
async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  // Chunked to avoid `apply` blowing the call stack on big PNGs.
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + CHUNK) as unknown as number[],
    );
  }
  return btoa(binary);
}

/**
 * Publish (or re-publish, if `guide.publishedAs` is set) to the server.
 * Returns the publish info the caller should store on the local guide.
 */
export async function publishGuide(guide: Guide): Promise<PublishInfo> {
  if (guide.steps.length === 0) {
    throw new Error("Add at least one step before publishing.");
  }

  const steps = await Promise.all(
    guide.steps.map(async (s) => {
      const imageBlob = await getImage(s.imageId);
      if (!imageBlob) throw new Error(`Missing screenshot for step "${s.title}"`);
      const audioBlob = s.audioId ? await getAudio(s.audioId) : null;
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        hotspot: s.hotspot,
        annotations: s.annotations,
        branches: s.branches,
        chapterId: s.chapterId,
        image: {
          base64: await blobToBase64(imageBlob),
          mime: imageBlob.type || "image/png",
        },
        audio: audioBlob
          ? { base64: await blobToBase64(audioBlob) }
          : undefined,
      };
    }),
  );

  const res = await fetch("/api/guides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: guide.title,
      description: guide.description,
      publicId: guide.publishedAs?.publicId,
      editKey: guide.publishedAs?.editKey,
      chapters: guide.chapters,
      steps,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Publish failed");
  }
  const { publicId, editKey } = (await res.json()) as {
    publicId: string;
    editKey: string;
  };
  return { publicId, editKey, publishedAt: Date.now() };
}

export async function unpublishGuide(info: PublishInfo): Promise<void> {
  const url = `/api/guides/${encodeURIComponent(info.publicId)}?key=${encodeURIComponent(info.editKey)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error("Unpublish failed");
  }
}

export function shareUrl(publicId: string): string {
  if (typeof window === "undefined") return `/g/${publicId}`;
  return `${window.location.origin}/g/${publicId}`;
}

export function embedSnippet(publicId: string): string {
  const url = `${shareUrl(publicId)}?embed=1`;
  return `<iframe src="${url}" style="width:100%;height:640px;border:0" allowfullscreen></iframe>`;
}
