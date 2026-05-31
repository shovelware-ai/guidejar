import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { listUserGuides } from "@/lib/server/db";

export const runtime = "nodejs";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({
    guides: listUserGuides(me.id).map((g) => ({
      publicId: g.publicId,
      title: g.title,
      stepCount: g.steps.length,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
  });
}
