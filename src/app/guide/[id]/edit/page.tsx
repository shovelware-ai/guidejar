"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { Logo } from "@/components/Logo";
import { ShareDialog } from "@/components/ShareDialog";
import { StepCanvas } from "@/components/StepCanvas";
import { Thumb } from "@/components/Thumb";
import { deleteImage, getGuide, putImage, saveGuide, uid } from "@/lib/db";
import type { Guide, PublishInfo, Step } from "@/lib/types";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getGuide(id).then((g) => {
      if (!g) return setNotFound(true);
      setGuide(g);
      setSelectedId(g.steps[0]?.id ?? null);
    });
  }, [id]);

  // Debounced persistence: any mutation schedules a save shortly after.
  const scheduleSave = useCallback((g: Guide) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveGuide(g), 400);
  }, []);

  const update = useCallback(
    (producer: (g: Guide) => void) => {
      setGuide((prev) => {
        if (!prev) return prev;
        const next: Guide = structuredClone(prev);
        producer(next);
        next.updatedAt = Date.now();
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const images = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (images.length === 0) return;
      const created: Step[] = [];
      for (const file of images) {
        const imageId = await putImage(file);
        created.push({ id: uid(), imageId, title: "", description: "" });
      }
      update((g) => {
        for (const step of created) {
          step.title = `Step ${g.steps.length + 1}`;
          g.steps.push(step);
        }
      });
      setSelectedId(created[0].id);
    },
    [update],
  );

  // Paste a screenshot straight from the clipboard.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.some((f) => f.type.startsWith("image/"))) addImages(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addImages]);

  function moveStep(index: number, dir: -1 | 1) {
    update((g) => {
      const j = index + dir;
      if (j < 0 || j >= g.steps.length) return;
      [g.steps[index], g.steps[j]] = [g.steps[j], g.steps[index]];
    });
  }

  async function deleteStep(step: Step) {
    update((g) => {
      g.steps = g.steps.filter((s) => s.id !== step.id);
    });
    await deleteImage(step.imageId);
    setSelectedId((cur) =>
      cur === step.id ? (guide?.steps.find((s) => s.id !== step.id)?.id ?? null) : cur,
    );
  }

  if (notFound) {
    return (
      <CenteredMessage>
        <p>That guide doesn’t exist.</p>
        <Link href="/" className="text-indigo-600 underline">
          Back to dashboard
        </Link>
      </CenteredMessage>
    );
  }

  if (!guide) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  const selected = guide.steps.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <Logo />
        <input
          value={guide.title}
          onChange={(e) => update((g) => void (g.title = e.target.value))}
          className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1 text-sm font-medium hover:border-slate-200 focus:border-indigo-400 focus:outline-none"
          placeholder="Guide title"
        />
        <button
          onClick={() => setShareOpen(true)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
        >
          {guide.publishedAs ? "Shared" : "Share"}
          {guide.publishedAs && (
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
          )}
        </button>
        <Link
          href={`/guide/${guide.id}/view`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Preview ▸
        </Link>
        <span className="ml-1 border-l border-slate-200 pl-3">
          <AuthNav />
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Step list */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Steps ({guide.steps.length})
            </span>
            <button
              onClick={() => fileInput.current?.click()}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium transition hover:bg-slate-200"
            >
              + Add
            </button>
          </div>
          <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
            {guide.steps.map((step, i) => (
              <li key={step.id}>
                <button
                  onClick={() => setSelectedId(step.id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${
                    step.id === selectedId
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span className="w-4 text-xs text-slate-400">{i + 1}</span>
                  <Thumb imageId={step.imageId} />
                  <span className="line-clamp-2 min-w-0 flex-1 text-sm">
                    {step.title || "Untitled step"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* Canvas + step details */}
        <main
          className={`relative flex min-w-0 flex-1 flex-col overflow-auto ${
            dragOver ? "bg-indigo-50" : "bg-slate-100"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addImages(e.dataTransfer.files);
          }}
        >
          {selected ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-6">
              <StepCanvas
                imageId={selected.imageId}
                hotspot={selected.hotspot}
                annotations={selected.annotations ?? []}
                onUpdate={(patch) =>
                  update((g) => {
                    const s = g.steps.find((x) => x.id === selected.id);
                    if (!s) return;
                    if ("hotspot" in patch) {
                      if (patch.hotspot) s.hotspot = patch.hotspot;
                      else delete s.hotspot;
                    }
                    if (patch.annotations) s.annotations = patch.annotations;
                  })
                }
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Step details
                  </span>
                  {selected.hotspot && (
                    <button
                      onClick={() =>
                        update((g) => {
                          const s = g.steps.find((x) => x.id === selected.id);
                          if (s) delete s.hotspot;
                        })
                      }
                      className="text-xs text-slate-400 hover:text-red-600"
                    >
                      Remove click point
                    </button>
                  )}
                </div>
                <input
                  value={selected.title}
                  onChange={(e) =>
                    update((g) => {
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (s) s.title = e.target.value;
                    })
                  }
                  placeholder="Step title"
                  className="mb-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none"
                />
                <textarea
                  value={selected.description}
                  onChange={(e) =>
                    update((g) => {
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (s) s.description = e.target.value;
                    })
                  }
                  placeholder="Describe what happens in this step (optional)"
                  rows={3}
                  className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />

                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm">
                  {(() => {
                    const i = guide.steps.findIndex((s) => s.id === selected.id);
                    return (
                      <>
                        <button
                          onClick={() => moveStep(i, -1)}
                          disabled={i === 0}
                          className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                        >
                          ↑ Move up
                        </button>
                        <button
                          onClick={() => moveStep(i, 1)}
                          disabled={i === guide.steps.length - 1}
                          className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                        >
                          ↓ Move down
                        </button>
                        <button
                          onClick={() => deleteStep(selected)}
                          className="ml-auto rounded-md px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          Delete step
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid flex-1 place-items-center p-6">
              <div className="max-w-sm rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="font-medium">Add your first screenshot</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Drag &amp; drop images here, paste from your clipboard, or
                  pick files.
                </p>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Choose images
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) addImages(e.target.files);
          e.target.value = "";
        }}
      />

      {shareOpen && (
        <ShareDialog
          guide={guide}
          onClose={() => setShareOpen(false)}
          onUpdated={(info: PublishInfo | undefined) =>
            update((g) => {
              if (info) g.publishedAs = info;
              else delete g.publishedAs;
            })
          }
        />
      )}
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 place-items-center">
      <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
        {children}
      </div>
    </div>
  );
}
