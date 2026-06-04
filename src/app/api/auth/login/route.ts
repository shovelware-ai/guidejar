import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/users";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required." },
      { status: 400 },
    );
  }
  const db = await getDb();
  const user = await verifyPassword(db, email, password);
  if (!user) {
    return NextResponse.json(
      { error: "That email and password don't match." },
      { status: 401 },
    );
  }
  await setSessionCookie(user.id);
  return NextResponse.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  });
}
