import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { findUserById, type User } from "./users";

const SECRET_PATH = path.join(process.cwd(), "data", "secret");
const COOKIE_NAME = "gj_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Lazily read or generate the HMAC secret. Stored at data/secret (gitignored)
 *  so sessions survive restarts; cached on globalThis between calls. */
const cache = globalThis as unknown as { __guidejarSecret?: Buffer };

function getSecret(): Buffer {
  if (cache.__guidejarSecret) return cache.__guidejarSecret;
  if (existsSync(SECRET_PATH)) {
    cache.__guidejarSecret = readFileSync(SECRET_PATH);
  } else {
    const buf = randomBytes(32);
    writeFileSync(SECRET_PATH, buf, { mode: 0o600 });
    cache.__guidejarSecret = buf;
  }
  return cache.__guidejarSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** Cookie format: `<userId>.<expiresMs>.<base64url-hmac>`. */
function makeToken(userId: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, sig] = parts;
  const expected = sign(`${userId}.${expiresStr}`);
  // timing-safe compare on buffers of equal length only.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expiresStr) < Date.now()) return null;
  return userId;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const userId = verifyToken(raw);
  if (!userId) return null;
  return findUserById(userId);
}
