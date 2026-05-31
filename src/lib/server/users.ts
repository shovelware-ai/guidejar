import bcrypt from "bcryptjs";
import { db } from "./db";
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

export function findUserByEmail(email: string): User | null {
  const row = db()
    .prepare<[string], UserRow>("SELECT * FROM users WHERE email = ?")
    .get(email.trim());
  return row ? rowToUser(row) : null;
}

export function findUserById(id: string): User | null {
  const row = db()
    .prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?")
    .get(id);
  return row ? rowToUser(row) : null;
}

export async function createUser(
  email: string,
  password: string,
): Promise<User> {
  if (findUserByEmail(email)) {
    throw new Error("An account with that email already exists.");
  }
  const hash = await bcrypt.hash(password, 10);
  const id = shortId(12);
  const createdAt = Date.now();
  db()
    .prepare(
      "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(id, email.trim(), hash, createdAt);
  return { id, email: email.trim(), createdAt };
}

/** Returns the user if email+password match, else null (don't leak which). */
export async function verifyPassword(
  email: string,
  password: string,
): Promise<User | null> {
  const row = db()
    .prepare<[string], UserRow>("SELECT * FROM users WHERE email = ?")
    .get(email.trim());
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  return ok ? rowToUser(row) : null;
}
