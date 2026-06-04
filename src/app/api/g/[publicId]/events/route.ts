import { NextResponse } from "next/server";
import {
  EVENT_TYPES,
  type EventType,
  getDb,
  getGuide,
  recordEvent,
} from "@/lib/server/db";

export const runtime = "nodejs";

const KNOWN = new Set<string>(EVENT_TYPES);

type IncomingEvent = {
  type?: string;
  stepId?: string;
  props?: Record<string, unknown>;
};

/**
 * Fire-and-forget event sink for the public viewer.
 * Accepts one event or a `{events: [...]}` batch.  No auth — the schema is
 * public-by-design (random session id, no PII).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const db = await getDb();
  // Make sure the guide actually exists before recording — keeps random
  // bots from filling the table with noise for non-existent ids.
  if (!(await getGuide(db, publicId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { sessionId?: string; event?: IncomingEvent; events?: IncomingEvent[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sessionId = body.sessionId?.trim();
  if (!sessionId || sessionId.length > 64) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const list = body.events ?? (body.event ? [body.event] : []);
  if (list.length === 0 || list.length > 50) {
    return NextResponse.json({ error: "no events" }, { status: 400 });
  }

  let recorded = 0;
  for (const e of list) {
    if (!e?.type || !KNOWN.has(e.type)) continue; // silently skip unknown types
    await recordEvent(db, {
      publicId,
      eventType: e.type as EventType,
      stepId: typeof e.stepId === "string" ? e.stepId : undefined,
      sessionId,
      props: e.props,
    });
    recorded++;
  }
  return NextResponse.json({ recorded });
}
