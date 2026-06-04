import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { deleteGuideRow, getDb, getGuide, getGuideOwnership } from "@/lib/server/db";
import { clearAudio, clearImages } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const db = await getDb();
  const guide = await getGuide(db, publicId);
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
  const db = await getDb();
  const owner = await getGuideOwnership(db, publicId);
  if (!owner) return NextResponse.json({ ok: true }); // already gone
  const key = new URL(req.url).searchParams.get("key");
  const me = await getCurrentUser(db);
  const byKey = !!key && key === owner.editKey;
  const byUser = !!me && owner.userId === me.id;
  if (!byKey && !byUser) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  await deleteGuideRow(db, publicId);
  await clearImages(publicId);
  await clearAudio(publicId);
  return NextResponse.json({ ok: true });
}
