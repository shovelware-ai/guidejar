import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type {
  Annotation,
  Branch,
  Chapter,
  StepTranslation,
} from "@/lib/types";

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
  // v4 — analytics events. ON DELETE CASCADE keeps events tied to their
  //      guide so unpublish wipes them automatically.
  (db) => {
    db.exec(`
      CREATE TABLE events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        public_id   TEXT NOT NULL REFERENCES guides(public_id) ON DELETE CASCADE,
        event_type  TEXT NOT NULL,
        step_id     TEXT,
        session_id  TEXT NOT NULL,
        props_json  TEXT NOT NULL DEFAULT '{}',
        created_at  INTEGER NOT NULL
      );
      CREATE INDEX idx_events_public_created ON events(public_id, created_at);
      CREATE INDEX idx_events_public_type    ON events(public_id, event_type);
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
  translations?: Record<string, StepTranslation>;
};

export type PublishedGuide = {
  publicId: string;
  title: string;
  description: string;
  steps: PublishedStep[];
  chapters?: Chapter[];
  languages?: string[];
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
  const steps = JSON.parse(row.steps_json) as PublishedStep[];
  // Derive the available language set from the translations actually on the
  // steps — a target language with nothing translated yet has nothing to show.
  const langs = new Set<string>();
  for (const s of steps) {
    for (const code of Object.keys(s.translations ?? {})) langs.add(code);
  }
  return {
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    steps,
    chapters: chapters.length > 0 ? chapters : undefined,
    languages: langs.size > 0 ? [...langs].sort() : undefined,
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

// ---- Events --------------------------------------------------------------

export type EventType =
  | "guide_view"
  | "step_view"
  | "branch_picked"
  | "guide_complete";

export const EVENT_TYPES: EventType[] = [
  "guide_view",
  "step_view",
  "branch_picked",
  "guide_complete",
];

export function recordEvent(args: {
  publicId: string;
  eventType: EventType;
  stepId?: string;
  sessionId: string;
  props?: Record<string, unknown>;
}): void {
  db()
    .prepare(
      `INSERT INTO events (public_id, event_type, step_id, session_id, props_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      args.publicId,
      args.eventType,
      args.stepId ?? null,
      args.sessionId,
      JSON.stringify(args.props ?? {}),
      Date.now(),
    );
}

export type GuideStats = {
  totalViews: number;
  uniqueSessions: number;
  completions: number;
  completionRate: number;          // 0..1
  perStep: { stepId: string; views: number; uniqueSessions: number }[];
  branchPicks: { stepId: string | null; branchId: string; count: number }[];
  recent: { type: EventType; stepId: string | null; createdAt: number }[];
};

/** Aggregate stats for an owner dashboard. One DB roundtrip per metric;
 *  no joins fancier than COUNT(DISTINCT) so SQLite handles it easily. */
export function getGuideStats(publicId: string): GuideStats {
  const d = db();

  const totalViews = (d
    .prepare<[string], { c: number }>(
      "SELECT COUNT(*) AS c FROM events WHERE public_id = ? AND event_type = 'guide_view'",
    )
    .get(publicId)?.c) ?? 0;

  const uniqueSessions = (d
    .prepare<[string], { c: number }>(
      "SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE public_id = ?",
    )
    .get(publicId)?.c) ?? 0;

  const completions = (d
    .prepare<[string], { c: number }>(
      "SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE public_id = ? AND event_type = 'guide_complete'",
    )
    .get(publicId)?.c) ?? 0;

  const perStep = d
    .prepare<[string], { stepId: string; views: number; uniqueSessions: number }>(
      `SELECT step_id AS stepId,
              COUNT(*) AS views,
              COUNT(DISTINCT session_id) AS uniqueSessions
       FROM events
       WHERE public_id = ? AND event_type = 'step_view' AND step_id IS NOT NULL
       GROUP BY step_id`,
    )
    .all(publicId);

  const branchPicks = d
    .prepare<
      [string],
      { stepId: string | null; branchId: string; count: number }
    >(
      `SELECT step_id AS stepId,
              json_extract(props_json, '$.branchId') AS branchId,
              COUNT(*) AS count
       FROM events
       WHERE public_id = ? AND event_type = 'branch_picked'
       GROUP BY step_id, branchId`,
    )
    .all(publicId)
    .filter((r) => !!r.branchId);

  const recent = d
    .prepare<[string], { type: EventType; stepId: string | null; createdAt: number }>(
      `SELECT event_type AS type, step_id AS stepId, created_at AS createdAt
       FROM events
       WHERE public_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
    )
    .all(publicId);

  return {
    totalViews,
    uniqueSessions,
    completions,
    completionRate: uniqueSessions > 0 ? completions / uniqueSessions : 0,
    perStep,
    branchPicks,
    recent,
  };
}
