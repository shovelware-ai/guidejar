import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const user = await getCurrentUser(db);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  });
}
