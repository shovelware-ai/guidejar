"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { StepImage } from "@/components/StepImage";
import { useAudioUrl } from "@/lib/useAudioUrl";
import {
  END_OF_GUIDE,
  type Annotation,
  type Branch,
  type Chapter,
  type Hotspot,
  type StepTranslation,
} from "@/lib/types";

/** Player-facing step shape. Either `imageId` (resolved via IndexedDB) or
 *  `src` (server URL) must be set — the local and public viewers each map
 *  their own model into this. */
export type PlayerStep = {
  id: string;
  title: string;
  description?: string;
  hotspot?: Hotspot;
  annotations?: Annotation[];
  branches?: Branch[];
  chapterId?: string;
  imageId?: string;
  src?: string;
  /** Local audio Blob id (resolved via IndexedDB).  Ignored when `audioSrc`
   *  is given. */
  audioId?: string;
  /** Direct URL — used by the public viewer to point at the server. */
  audioSrc?: string;
  translations?: Record<string, StepTranslation>;
};

/**
 * Self-contained interactive guide player.  Backwards-compatible with linear
 * guides (no branches) and falls back to index-based navigation visuals
 * (progress bar, "Step N of T") in that mode.  When any step has branches,
 * it switches to choice-based navigation with a history stack for Back.
 */
export function GuidePlayer({
  steps,
  chapters,
  languages,
  title,
  embed = false,
  headerExtras,
  footer,
}: {
  steps: PlayerStep[];
  chapters?: Chapter[];
  languages?: string[];
  title?: string;
  embed?: boolean;
  /** Slot rendered at the right of the header (e.g. Edit link). */
  headerExtras?: React.ReactNode;
  /** Footer rendered below the main area (e.g. "Made with Guidejar"). */
  footer?: React.ReactNode;
}) {
  // Source = whatever's in step.title / step.description.  `null` here.
  const [language, setLanguage] = useState<string | null>(null);
  const total = steps.length;
  const hasBranches = useMemo(
    () => steps.some((s) => (s.branches?.length ?? 0) > 0),
    [steps],
  );

  // Navigation is id-based throughout so branch targets work uniformly,
  // and so the player tolerates step reorders.
  const [currentId, setCurrentId] = useState<string>(steps[0]?.id ?? END_OF_GUIDE);
  const [history, setHistory] = useState<string[]>([]);

  // If the underlying guide changes (e.g. you edit and switch tabs),
  // reset to the first step.
  useEffect(() => {
    setCurrentId(steps[0]?.id ?? END_OF_GUIDE);
    setHistory([]);
  }, [steps]);

  const currentIndex =
    currentId === END_OF_GUIDE
      ? -1
      : steps.findIndex((s) => s.id === currentId);
  const step =
    currentIndex >= 0 ? steps[currentIndex] : null;
  // Treat a stale currentId (e.g. branch target was deleted) as end-of-guide.
  const finished = !step;

  const goto = useCallback(
    (id: string) => {
      setHistory((h) => (currentId === END_OF_GUIDE ? h : [...h, currentId]));
      setCurrentId(id);
    },
    [currentId],
  );

  const next = useCallback(() => {
    if (!step) return;
    if ((step.branches?.length ?? 0) > 0) return; // decision step — no linear advance
    const nextStep = steps[currentIndex + 1];
    goto(nextStep ? nextStep.id : END_OF_GUIDE);
  }, [step, steps, currentIndex, goto]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const next = h.slice(0, -1);
      setCurrentId(h[h.length - 1]);
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    setHistory([]);
    setCurrentId(steps[0]?.id ?? END_OF_GUIDE);
  }, [steps]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  const canBack = history.length > 0;
  const branches = step?.branches ?? [];
  const isDecision = branches.length > 0;
  const chapter = chapters?.find((c) => c.id === step?.chapterId);

  // Audio: resolve either the local Blob (via IndexedDB) or the server URL.
  const localAudioUrl = useAudioUrl(step?.audioId);
  const audioUrl = step?.audioSrc ?? localAudioUrl;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);

  // On step change, attempt autoplay. Browsers block autoplay before any
  // user gesture; if .play() rejects we expose a small play overlay button.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) {
      setNeedsUserPlay(false);
      return;
    }
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => setNeedsUserPlay(false)).catch(() => setNeedsUserPlay(true));
    }
  }, [audioUrl, currentId]);

  // Step ranges per chapter, for the ToC sidebar.
  const chapterRanges = useMemo(() => {
    if (!chapters?.length) return [];
    return chapters
      .map((c) => {
        const indices = steps
          .map((s, i) => (s.chapterId === c.id ? i : -1))
          .filter((i) => i >= 0);
        if (indices.length === 0) return null;
        return {
          chapter: c,
          firstStepId: steps[indices[0]].id,
          firstIndex: indices[0],
          lastIndex: indices[indices.length - 1],
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [chapters, steps]);

  return (
    <div className="flex h-screen flex-col">
      {!embed && (
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <Logo />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {title}
          </span>
          {languages && languages.length > 0 && (
            <LanguagePicker
              languages={languages}
              value={language}
              onChange={setLanguage}
            />
          )}
          {chapterRanges.length > 0 && (
            <TocMenu
              ranges={chapterRanges}
              activeChapterId={step?.chapterId}
              onPick={(firstStepId) => goto(firstStepId)}
            />
          )}
          {headerExtras}
        </header>
      )}

      {/* Progress bar: linear guides only. */}
      {!hasBranches && total > 0 && (
        <div className="h-1 w-full bg-slate-200">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{
              width: `${(finished ? total : currentIndex) / total * 100}%`,
            }}
          />
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-auto p-6">
        {total === 0 ? (
          <p className="text-sm text-slate-500">This guide has no steps yet.</p>
        ) : finished ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>
            <h2 className="text-lg font-semibold">Guide complete</h2>
            {!hasBranches && (
              <p className="mt-1 text-sm text-slate-500">
                You finished all {total} {total === 1 ? "step" : "steps"}.
              </p>
            )}
            <button
              onClick={restart}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              ↻ Restart
            </button>
          </div>
        ) : (
          step && (
            <>
              {/* Clicking the image advances only for linear steps. */}
              <div className="relative">
                <button
                  onClick={isDecision ? undefined : next}
                  disabled={isDecision}
                  className="relative max-w-full cursor-pointer disabled:cursor-default"
                  aria-label={isDecision ? "Decision step" : "Next step"}
                >
                  <StepImage
                    imageId={step.imageId}
                    src={step.src}
                    hotspot={step.hotspot}
                    annotations={step.annotations}
                    pulse={!isDecision}
                  />
                </button>
                {audioUrl && needsUserPlay && (
                  <button
                    onClick={() => audioRef.current?.play().catch(() => {})}
                    className="absolute bottom-3 left-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-indigo-700 shadow-lg ring-1 ring-slate-200 hover:bg-white"
                    title="Play voiceover"
                    aria-label="Play voiceover"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
                {/* Hidden audio: controls via the small overlay above. */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setNeedsUserPlay(false)}
                    preload="auto"
                  />
                )}
              </div>

              <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                {chapter && (
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {chapter.title}
                  </div>
                )}
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {hasBranches
                    ? isDecision
                      ? "Choose what happens next"
                      : "Step"
                    : `Step ${currentIndex + 1} of ${total}`}
                </div>
                {(() => {
                  const localized = language
                    ? (step.translations?.[language] ?? null)
                    : null;
                  const displayTitle =
                    localized?.title?.trim() || step.title || "Untitled step";
                  const displayDescription =
                    localized?.description?.trim() ?? step.description;
                  return (
                    <>
                      <h2 className="text-lg font-semibold">{displayTitle}</h2>
                      {displayDescription && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {displayDescription}
                        </p>
                      )}
                    </>
                  );
                })()}

                {isDecision ? (
                  <BranchList
                    branches={branches}
                    onPick={(b) =>
                      goto(b.targetStepId)
                    }
                  />
                ) : (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={back}
                      disabled={!canBack}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      ‹ Back
                    </button>
                    <span className="text-xs text-slate-400">
                      Use ← → keys, or click the screenshot
                    </span>
                    <button
                      onClick={next}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                      {currentIndex === total - 1 ? "Finish" : "Next ›"}
                    </button>
                  </div>
                )}

                {isDecision && canBack && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <button
                      onClick={back}
                      className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                      ‹ Back
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </main>

      {!embed && footer && (
        <footer className="border-t border-slate-200 bg-white px-6 py-2 text-center text-xs text-slate-400">
          {footer}
        </footer>
      )}
    </div>
  );
}

function LanguagePicker({
  languages,
  value,
  onChange,
}: {
  languages: string[];
  value: string | null;
  onChange: (lang: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs uppercase focus:border-indigo-400 focus:outline-none"
      title="Language"
    >
      <option value="">Source</option>
      {languages.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );
}

function TocMenu({
  ranges,
  activeChapterId,
  onPick,
}: {
  ranges: {
    chapter: Chapter;
    firstStepId: string;
    firstIndex: number;
    lastIndex: number;
  }[];
  activeChapterId?: string;
  onPick: (firstStepId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50"
      >
        Chapters ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {ranges.map(({ chapter, firstStepId, firstIndex, lastIndex }) => {
              const active = chapter.id === activeChapterId;
              return (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onPick(firstStepId);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                    active ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  <span className="block truncate">{chapter.title}</span>
                  <span className="block text-xs text-slate-400">
                    Steps {firstIndex + 1}
                    {lastIndex !== firstIndex && `–${lastIndex + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function BranchList({
  branches,
  onPick,
}: {
  branches: Branch[];
  onPick: (b: Branch) => void;
}) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {branches.map((b) => {
        const ends = b.targetStepId === END_OF_GUIDE;
        return (
          <li key={b.id}>
            <button
              onClick={() => onPick(b)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span className="block">{b.label || "Unlabeled choice"}</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {ends ? "→ End the guide" : "→ Continue"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

