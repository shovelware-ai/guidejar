import bcrypt from "bcryptjs";
import { shortId } from "./ids";

export type User = { id: string; email: string; createdAt: number };

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
};

function rowToUser(row: UserRow): User {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}

export async function findUserByEmail(
  db: D1Database,
  email: string,
): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.trim())
    .first<UserRow>();
  return row ? rowToUser(row) : null;
}

export async function findUserById(
  db: D1Database,
  id: string,
): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<UserRow>();
  return row ? rowToUser(row) : null;
}

export async function createUser(
  db: D1Database,
  email: string,
  password: string,
): Promise<User> {
  if (await findUserByEmail(db, email)) {
    throw new Error("An account with that email already exists.");
  }
  const hash = await bcrypt.hash(password, 10);
  const id = shortId(12);
  const createdAt = Date.now();
  await db
    .prepare(
      "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(id, email.trim(), hash, createdAt)
    .run();
  return { id, email: email.trim(), createdAt };
}

/** Returns the user if email+password match, else null (don't leak which). */
export async function verifyPassword(
  db: D1Database,
  email: string,
  password: string,
): Promise<User | null> {
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.trim())
    .first<UserRow>();
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  return ok ? rowToUser(row) : null;
}
