"use client";

/**
 * Lightweight client for the analytics sink at /api/g/<publicId>/events.
 *
 * Privacy shape: a stable random session id in localStorage, plus event type
 * and (optionally) step id / props.  No IP, no fingerprinting, no PII —
 * what arrives at the server is what we send from here.
 */

const SID_KEY = "gj_sid";

export type AnalyticsEvent = {
  type: "guide_view" | "step_view" | "branch_picked" | "guide_complete";
  stepId?: string;
  props?: Record<string, unknown>;
};

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    try {
      localStorage.setItem(SID_KEY, sid);
    } catch {
      /* private mode / storage disabled: fall back to in-memory sid */
    }
  }
  return sid;
}

export function track(publicId: string, event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  const body = JSON.stringify({ sessionId, event });
  const url = `/api/g/${encodeURIComponent(publicId)}/events`;

  // sendBeacon is fire-and-forget and survives page navigation — best for
  // step_view / guide_complete which often happen right before a click.
  try {
    if (
      navigator.sendBeacon &&
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
    ) {
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  // Fallback for environments without sendBeacon.
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
