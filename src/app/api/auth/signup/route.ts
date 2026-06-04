import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { createUser } from "@/lib/server/users";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }
  try {
    const db = await getDb();
    const user = await createUser(db, email, password);
    await setSessionCookie(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed" },
      { status: 409 },
    );
  }
}
