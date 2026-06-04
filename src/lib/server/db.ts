import type {
  Annotation,
  Branch,
  Chapter,
  StepTranslation,
} from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * D1 data layer.  Every function takes the D1 binding (env.DB) as its first
 * argument; API routes pull it out of getCloudflareContext() and pass it in.
 *
 *   const { env } = await getCloudflareContext({ async: true });
 *   const guide = await getGuide(env.DB, publicId);
 */

/** Convenience: resolves env.DB without each call site having to know about
 *  OpenNext.  Don't use inside lib code; reserve for API routes. */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
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
  /** When true, the server has an audio file at audio/<publicId>/<id>.mp3
   *  in the R2 bucket — viewer can fetch it. */
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

export async function getGuide(
  db: D1Database,
  publicId: string,
): Promise<PublishedGuide | null> {
  const row = await db
    .prepare("SELECT * FROM guides WHERE public_id = ?")
    .bind(publicId)
    .first<GuideRow>();
  return row ? rowToGuide(row) : null;
}

export async function getGuideOwnership(
  db: D1Database,
  publicId: string,
): Promise<{ editKey: string; userId: string | null } | null> {
  const row = await db
    .prepare("SELECT edit_key, user_id FROM guides WHERE public_id = ?")
    .bind(publicId)
    .first<{ edit_key: string; user_id: string | null }>();
  return row ? { editKey: row.edit_key, userId: row.user_id } : null;
}

export async function insertGuide(
  db: D1Database,
  publicId: string,
  editKey: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt" | "userId">,
  userId: string | null,
): Promise<PublishedGuide> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO guides (public_id, edit_key, title, description, steps_json, chapters_json, created_at, updated_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      publicId,
      editKey,
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      JSON.stringify(guide.chapters ?? []),
      now,
      now,
      userId,
    )
    .run();
  return {
    publicId,
    ...guide,
    createdAt: now,
    updatedAt: now,
    userId: userId ?? undefined,
  };
}

export async function updateGuide(
  db: D1Database,
  publicId: string,
  guide: Omit<PublishedGuide, "publicId" | "createdAt" | "updatedAt" | "userId">,
): Promise<void> {
  await db
    .prepare(
      `UPDATE guides SET title = ?, description = ?, steps_json = ?, chapters_json = ?, updated_at = ?
       WHERE public_id = ?`,
    )
    .bind(
      guide.title,
      guide.description,
      JSON.stringify(guide.steps),
      JSON.stringify(guide.chapters ?? []),
      Date.now(),
      publicId,
    )
    .run();
}

/** D1 doesn't enforce FK cascade; drop child rows explicitly in a batch. */
export async function deleteGuideRow(
  db: D1Database,
  publicId: string,
): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM events WHERE public_id = ?").bind(publicId),
    db.prepare("DELETE FROM guides WHERE public_id = ?").bind(publicId),
  ]);
}

export async function listUserGuides(
  db: D1Database,
  userId: string,
): Promise<PublishedGuide[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM guides WHERE user_id = ? ORDER BY updated_at DESC",
    )
    .bind(userId)
    .all<GuideRow>();
  return results.map(rowToGuide);
}

// ---- events --------------------------------------------------------------

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

export async function recordEvent(
  db: D1Database,
  args: {
    publicId: string;
    eventType: EventType;
    stepId?: string;
    sessionId: string;
    props?: Record<string, unknown>;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO events (public_id, event_type, step_id, session_id, props_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      args.publicId,
      args.eventType,
      args.stepId ?? null,
      args.sessionId,
      JSON.stringify(args.props ?? {}),
      Date.now(),
    )
    .run();
}

export type GuideStats = {
  totalViews: number;
  uniqueSessions: number;
  completions: number;
  completionRate: number; // 0..1
  perStep: { stepId: string; views: number; uniqueSessions: number }[];
  branchPicks: { stepId: string | null; branchId: string; count: number }[];
  recent: { type: EventType; stepId: string | null; createdAt: number }[];
};

/**
 * Aggregate stats for an owner dashboard.  D1's batch() runs the four queries
 * in one round-trip — one prepared totals query + funnel + branch picks +
 * recent log.  No joins fancier than COUNT(DISTINCT).
 */
export async function getGuideStats(
  db: D1Database,
  publicId: string,
): Promise<GuideStats> {
  const [totalsRes, perStepRes, branchPicksRes, recentRes] = await db.batch([
    db
      .prepare(
        `SELECT
           SUM(CASE WHEN event_type='guide_view' THEN 1 ELSE 0 END) AS totalViews,
           COUNT(DISTINCT session_id) AS uniqueSessions,
           COUNT(DISTINCT CASE WHEN event_type='guide_complete' THEN session_id END) AS completions
         FROM events
         WHERE public_id = ?`,
      )
      .bind(publicId),
    db
      .prepare(
        `SELECT step_id AS stepId,
                COUNT(*) AS views,
                COUNT(DISTINCT session_id) AS uniqueSessions
         FROM events
         WHERE public_id = ? AND event_type = 'step_view' AND step_id IS NOT NULL
         GROUP BY step_id`,
      )
      .bind(publicId),
    db
      .prepare(
        `SELECT step_id AS stepId,
                json_extract(props_json, '$.branchId') AS branchId,
                COUNT(*) AS count
         FROM events
         WHERE public_id = ? AND event_type = 'branch_picked'
         GROUP BY step_id, branchId`,
      )
      .bind(publicId),
    db
      .prepare(
        `SELECT event_type AS type, step_id AS stepId, created_at AS createdAt
         FROM events
         WHERE public_id = ?
         ORDER BY created_at DESC
         LIMIT 20`,
      )
      .bind(publicId),
  ]);

  const totals = (totalsRes.results?.[0] ?? {}) as {
    totalViews: number | null;
    uniqueSessions: number | null;
    completions: number | null;
  };
  const totalViews = totals.totalViews ?? 0;
  const uniqueSessions = totals.uniqueSessions ?? 0;
  const completions = totals.completions ?? 0;

  const perStep = (perStepRes.results ?? []) as {
    stepId: string;
    views: number;
    uniqueSessions: number;
  }[];

  const branchPicks = ((branchPicksRes.results ?? []) as {
    stepId: string | null;
    branchId: string | null;
    count: number;
  }[]).filter((r): r is { stepId: string | null; branchId: string; count: number } => !!r.branchId);

  const recent = (recentRes.results ?? []) as {
    type: EventType;
    stepId: string | null;
    createdAt: number;
  }[];

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
