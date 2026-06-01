import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Annotation, Branch, Chapter } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

const g = globalThis as unknown as { __guidejarDb?: Database.Database };

/** Versioned schema migrations. Each migration runs once; current version is
 *  recorded in SQLite's user_version pragma. Append new ones at the bottom. */
const MIGRATIONS: ((db: Database.Database) => void)[] = [
  // v1 — initial guides table.
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS guides (
        public_id   TEXT PRIMARY KEY,
        edit_key    TEXT NOT NULL,
        title       TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        steps_json  TEXT NOT NULL,
        created_at  INTEGER NOT NULL,
        updated_at  INTEGER NOT NULL
      );
    `);
  },
  // v2 — accounts + per-guide ownership.
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at    INTEGER NOT NULL
      );
      ALTER TABLE guides
        ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
      CREATE INDEX idx_guides_user ON guides(user_id);
    `);
  },
  // v3 — chapters. Stored as JSON column; existing rows get '[]'.
  (db) => {
    db.exec(`
      ALTER TABLE guides
        ADD COLUMN chapters_json TEXT NOT NULL DEFAULT '[]';
    `);
  },
];

function migrate(db: Database.Database) {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      MIGRATIONS[v](db);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

function open() {
  const db = new Database(path.join(DATA_DIR, "guidejar.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

export function db(): Database.Database {
  return (g.__guidejarDb ??= open());
}

// ---- types ---------------------------------------------------------------

export type PublishedStep = {
  /** Stable step id preserved from the source guide; used as branch target. */
  id: string;
  imageId: string;
  title: string;
  description: string;
  hotspot?: { x: number; y: number };
  annotations?: Annotation[];
  branches?: Branch[];
  chapterId?: string;
  /** When true, the server has an audio file at
   *  data/audio/<publicId>/<id>.mp3 — viewer can fetch it. */
  hasAudio?: boolean;
};

export type PublishedGuide = {
  publicId: string;
  title: string;
  description: string;
  steps: PublishedStep[];
  chapters?: Chapter[];
  createdAt: number;
  updatedAt: number;
  userId?: string;
};

type GuideRow = {
  public_id: string;
  edit_key: string;
  title: string;
  description: string;
  steps_json: string;
  chapters_json: string;
  created_at: number;
  updated_at: number;
  user_id: string | null;
};

function rowToGuide(row: GuideRow): PublishedGuide {
  const chapters = (JSON.parse(row.chapters_json) as Chapter[]) ?? [];
  return {
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps_json) as PublishedStep[],
    chapters: chapters.length > 0 ? chapters : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id ?? undefined,
  };
}

// ---- guides --------------------------------------------------------------

export function getGuide(publicId: string): PublishedGuide | null {
  const row = db()
    .prepare<[string], GuideRow>("SELECT * FROM guides WHERE public_id = ?")
    .get(publicId);
  return row ? rowToGuide(row) : null;
}

/** Returns the editKey + userId for ownership checks, or null if no such guide. */
export function getGuideOwnership(
  publicId: string,
): { editKey: string; userId: string | null } | null {
  const row = db()
    .prepare<[string], { edit_key: string; user_id: string | null }>(
      "SELECT edit_key, user_id FROM guides WHERE public_id = ?",
    )
    .get(publicId);
  return row ? { editKey: row.edit_key, userId: row.user_id } : null;
}

export function insertGuide(
  publicId: string,
  editKey: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt" | "userId">,
  userId: string | null,
): PublishedGuide {
  const now = Date.now();
  db()
    .prepare(
      `INSERT INTO guides (public_id, edit_key, title, description, steps_json, chapters_json, created_at, updated_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      publicId,
      editKey,
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      JSON.stringify(guide.chapters ?? []),
      now,
      now,
      userId,
    );
  return {
    publicId,
    ...guide,
    createdAt: now,
    updatedAt: now,
    userId: userId ?? undefined,
  };
}

export function updateGuide(
  publicId: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt" | "userId">,
): void {
  db()
    .prepare(
      `UPDATE guides SET title = ?, description = ?, steps_json = ?, chapters_json = ?, updated_at = ?
       WHERE public_id = ?`,
    )
    .run(
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      JSON.stringify(guide.chapters ?? []),
      Date.now(),
      publicId,
    );
}

export function deleteGuideRow(publicId: string): void {
  db().prepare("DELETE FROM guides WHERE public_id = ?").run(publicId);
}

export function listUserGuides(userId: string): PublishedGuide[] {
  const rows = db()
    .prepare<[string], GuideRow>(
      "SELECT * FROM guides WHERE user_id = ? ORDER BY updated_at DESC",
    )
    .all(userId);
  return rows.map(rowToGuide);
}
