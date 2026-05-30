import { NextResponse } from "next/server";
import { deleteGuideRow, getEditKey, getGuide } from "@/lib/server/db";
import { clearImages } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const guide = getGuide(publicId);
  if (!guide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(guide);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const key = new URL(req.url).searchParams.get("key");
  const existing = getEditKey(publicId);
  if (!existing) return NextResponse.json({ ok: true }); // already gone
  if (existing !== key) {
    return NextResponse.json({ error: "Bad edit key" }, { status: 403 });
  }
  deleteGuideRow(publicId);
  await clearImages(publicId);
  return NextResponse.json({ ok: true });
}
