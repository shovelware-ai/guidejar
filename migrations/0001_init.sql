-- Consolidated D1 schema for Guidejar.
-- (The local better-sqlite3 build evolved across user_version 1→4; on D1 we
-- start fresh, so all four migrations collapse into this single file.)
--
-- Note: D1 does NOT enforce ON DELETE CASCADE / SET NULL even with the
-- declarations below.  The foreign-key clauses are kept as documentation and
-- portability hooks; the actual cascade behaviour (delete a guide's events
-- when the guide goes away) is implemented in code via db.batch().

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE guides (
  public_id     TEXT PRIMARY KEY,
  edit_key      TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  steps_json    TEXT NOT NULL,
  chapters_json TEXT NOT NULL DEFAULT '[]',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  user_id       TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_guides_user ON guides(user_id);

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
