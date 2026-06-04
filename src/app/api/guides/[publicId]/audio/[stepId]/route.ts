import { readAudio } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; stepId: string }> },
) {
  const { publicId, stepId } = await params;
  let object: Awaited<ReturnType<typeof readAudio>>;
  try {
    object = await readAudio(publicId, stepId);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": object.httpEtag,
    },
  });
}
