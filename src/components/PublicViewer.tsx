"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StepImage } from "@/components/StepImage";
import type { PublishedGuide } from "@/lib/server/db";

/**
 * Player for a published guide. Mirrors the local viewer but loads screenshots
 * over HTTP from /api/guides/[publicId]/images/[imageId] instead of IndexedDB,
 * so it works for anyone who has the share link.
 */
export function PublicViewer({
  guide,
  embed = false,
}: {
  guide: PublishedGuide;
  embed?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const total = guide.steps.length;

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, total)),
    [total],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const finished = index >= total;
  const step = finished ? null : guide.steps[index];

  return (
    <div className="flex h-screen flex-col">
      {!embed && (
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <Logo />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {guide.title}
          </span>
        </header>
      )}

      {total > 0 && (
        <div className="h-1 w-full bg-slate-200">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-auto p-6">
        {total === 0 ? (
          <p className="text-sm text-slate-500">This guide has no steps.</p>
        ) : finished ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>
            <h2 className="text-lg font-semibold">Guide complete</h2>
            <p className="mt-1 text-sm text-slate-500">
              You finished all {total} {total === 1 ? "step" : "steps"}.
            </p>
            <button
              onClick={() => setIndex(0)}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              ↻ Restart
            </button>
          </div>
        ) : (
          step && (
            <>
              <button
                onClick={next}
                className="relative max-w-full cursor-pointer"
                title="Click to continue"
                aria-label="Next step"
              >
                <StepImage
                  src={`/api/guides/${guide.publicId}/images/${step.imageId}`}
                  hotspot={step.hotspot}
                  pulse
                />
              </button>

              <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Step {index + 1} of {total}
                </div>
                <h2 className="text-lg font-semibold">
                  {step.title || "Untitled step"}
                </h2>
                {step.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {step.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={prev}
                    disabled={index === 0}
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
                    {index === total - 1 ? "Finish" : "Next ›"}
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </main>

      {!embed && (
        <footer className="border-t border-slate-200 bg-white px-6 py-2 text-center text-xs text-slate-400">
          Made with{" "}
          <Link href="/" className="text-indigo-600 hover:underline">
            Guidejar
          </Link>
        </footer>
      )}
    </div>
  );
}
