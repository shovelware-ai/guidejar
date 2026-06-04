import { readImage } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; imageId: string }> },
) {
  const { publicId, imageId } = await params;
  let object: Awaited<ReturnType<typeof readImage>>;
  try {
    object = await readImage(publicId, imageId);
  } catch {
    // Invalid id segments (e.g. path-traversal attempts) — treat as not found.
    return new Response("Not found", { status: 404 });
  }
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": object.httpEtag,
    },
  });
}
