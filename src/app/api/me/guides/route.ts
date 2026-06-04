import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getDb, listUserGuides } from "@/lib/server/db";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const me = await getCurrentUser(db);
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({
    guides: (await listUserGuides(db, me.id)).map((g) => ({
      publicId: g.publicId,
      title: g.title,
      stepCount: g.steps.length,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
  });
}
