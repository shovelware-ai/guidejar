import { readAudio } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string; stepId: string }> },
) {
  const { publicId, stepId } = await params;
  let bytes: Buffer | null;
  try {
    bytes = await readAudio(publicId, stepId);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
