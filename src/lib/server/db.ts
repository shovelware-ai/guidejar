import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

/**
 * SQLite singleton.  Cached on globalThis so Next.js' dev-server hot reload
 * doesn't open a new handle on every module re-evaluation.
 */
const g = globalThis as unknown as { __guidejarDb?: Database.Database };

function open() {
  const db = new Database(path.join(DATA_DIR, "guidejar.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
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
  return db;
}

export function db(): Database.Database {
  return (g.__guidejarDb ??= open());
}

/** Step as stored in the DB / returned to clients. The `imageId` is a slug
 *  used to build the image URL; the actual PNG lives on disk. */
export type PublishedStep = {
  imageId: string;
  title: string;
  description: string;
  hotspot?: { x: number; y: number };
};

export type PublishedGuide = {
  publicId: string;
  title: string;
  description: string;
  steps: PublishedStep[];
  createdAt: number;
  updatedAt: number;
};

type Row = {
  public_id: string;
  edit_key: string;
  title: string;
  description: string;
  steps_json: string;
  created_at: number;
  updated_at: number;
};

function rowToGuide(row: Row): PublishedGuide {
  return {
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps_json) as PublishedStep[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getGuide(publicId: string): PublishedGuide | null {
  const row = db()
    .prepare<[string], Row>("SELECT * FROM guides WHERE public_id = ?")
    .get(publicId);
  return row ? rowToGuide(row) : null;
}

/** Returns just the editKey for ownership checks, or null if no such guide. */
export function getEditKey(publicId: string): string | null {
  const row = db()
    .prepare<[string], { edit_key: string }>(
      "SELECT edit_key FROM guides WHERE public_id = ?",
    )
    .get(publicId);
  return row?.edit_key ?? null;
}

export function insertGuide(
  publicId: string,
  editKey: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt">,
): PublishedGuide {
  const now = Date.now();
  db()
    .prepare(
      `INSERT INTO guides (public_id, edit_key, title, description, steps_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      publicId,
      editKey,
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      now,
      now,
    );
  return { publicId, ...guide, createdAt: now, updatedAt: now };
}

export function updateGuide(
  publicId: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt">,
): void {
  db()
    .prepare(
      `UPDATE guides SET title = ?, description = ?, steps_json = ?, updated_at = ?
       WHERE public_id = ?`,
    )
    .run(
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      Date.now(),
      publicId,
    );
}

export function deleteGuideRow(publicId: string): void {
  db().prepare("DELETE FROM guides WHERE public_id = ?").run(publicId);
}
