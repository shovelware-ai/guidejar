import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { findUserById, type User } from "./users";

const COOKIE_NAME = "gj_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * HMAC-signed session cookies.
 *
 * Format: <userId>.<expiresMs>.<base64url-hmac-sha256>
 * The secret comes from env.SESSION_SECRET (a Workers secret).  Locally it
 * can be set via .dev.vars.  If unset we fall back to a constant placeholder
 * during dev — sessions still work but are forgeable; the production deploy
 * MUST set the real secret.
 */

const FALLBACK_DEV_SECRET = "guidejar-dev-secret-do-not-ship";
const cache = globalThis as unknown as {
  __guidejarSecretKey?: Promise<CryptoKey>;
};

async function getSigningKey(): Promise<CryptoKey> {
  if (cache.__guidejarSecretKey) return cache.__guidejarSecretKey;
  const { env } = await getCloudflareContext({ async: true });
  const secret =
    (env as { SESSION_SECRET?: string }).SESSION_SECRET ?? FALLBACK_DEV_SECRET;
  cache.__guidejarSecretKey = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cache.__guidejarSecretKey;
}

function bytesToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(payload: string): Promise<string> {
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bytesToBase64Url(sig);
}

async function makeToken(userId: string): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

async function verifyToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, sig] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(userId) || !/^\d+$/.test(expiresStr)) return null;
  if (Number(expiresStr) < Date.now()) return null;
  const key = await getSigningKey();
  // base64UrlToBytes returns a Uint8Array backed by a fresh ArrayBuffer; cast
  // through BufferSource because workerd's lib.d.ts declares the parameter
  // narrowly enough that Uint8Array<ArrayBufferLike> isn't accepted directly.
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(sig) as unknown as BufferSource,
    new TextEncoder().encode(`${userId}.${expiresStr}`),
  );
  return ok ? userId : null;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, await makeToken(userId), {
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

export async function getCurrentUser(
  db: D1Database,
): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const userId = await verifyToken(raw);
  if (!userId) return null;
  return findUserById(db, userId);
}
