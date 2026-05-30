import { readImage } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; imageId: string }> },
) {
  const { publicId, imageId } = await params;
  let bytes: Buffer | null;
  try {
    bytes = await readImage(publicId, imageId);
  } catch {
    // Invalid id segments (path traversal etc.) — treat as not found.
    return new Response("Not found", { status: 404 });
  }
  if (!bytes) return new Response("Not found", { status: 404 });
  // Copy into a fresh Uint8Array so the body type is unambiguously a BufferSource
  // (Node's Buffer.buffer may type as ArrayBuffer | SharedArrayBuffer).
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
