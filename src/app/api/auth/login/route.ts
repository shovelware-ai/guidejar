import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/server/auth";
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
  const user = await verifyPassword(email, password);
  if (!user) {
    // Same message regardless of which one was wrong.
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
