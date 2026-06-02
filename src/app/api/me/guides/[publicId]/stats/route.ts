import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getGuide, getGuideStats } from "@/lib/server/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { publicId } = await params;
  const guide = getGuide(publicId);
  if (!guide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (guide.userId !== me.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  return NextResponse.json({
    guide: {
      publicId: guide.publicId,
      title: guide.title,
      steps: guide.steps.map((s) => ({ id: s.id, title: s.title })),
    },
    stats: getGuideStats(publicId),
  });
}
