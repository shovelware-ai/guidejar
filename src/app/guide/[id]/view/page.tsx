"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StepImage } from "@/components/StepImage";
import { getGuide } from "@/lib/db";
import type { Guide } from "@/lib/types";

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0); // === steps.length means "finished"

  useEffect(() => {
    getGuide(id).then((g) => (g ? setGuide(g) : setNotFound(true)));
  }, [id]);

  const total = guide?.steps.length ?? 0;

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

  if (notFound) {
    return (
      <Centered>
        <p>That guide doesn’t exist.</p>
        <Link href="/" className="text-indigo-600 underline">
          Back to dashboard
        </Link>
      </Centered>
    );
  }
  if (!guide) return <Centered>Loading…</Centered>;

  const finished = index >= total;
  const step = finished ? null : guide.steps[index];

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <Logo />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {guide.title}
        </span>
        <Link
          href={`/guide/${guide.id}/edit`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50"
        >
          Edit
        </Link>
      </header>

      {/* Progress bar */}
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
          <div className="text-center text-sm text-slate-500">
            <p>This guide has no steps yet.</p>
            <Link
              href={`/guide/${guide.id}/edit`}
              className="text-indigo-600 underline"
            >
              Add some screenshots
            </Link>
          </div>
        ) : finished ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>
            <h2 className="text-lg font-semibold">Guide complete</h2>
            <p className="mt-1 text-sm text-slate-500">
              You finished all {total} {total === 1 ? "step" : "steps"}.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setIndex(0)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                ↻ Restart
              </button>
              <Link
                href="/"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
              >
                All guides
              </Link>
            </div>
          </div>
        ) : (
          step && (
            <>
              <button
                onClick={next}
                className="group relative max-w-full cursor-pointer"
                title="Click to continue"
                aria-label="Next step"
              >
                <StepImage
                  imageId={step.imageId}
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
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 place-items-center">
      <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
        {children}
      </div>
    </div>
  );
}
