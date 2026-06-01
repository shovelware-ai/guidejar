"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { Logo } from "@/components/Logo";
import { ShareDialog } from "@/components/ShareDialog";
import { StepCanvas } from "@/components/StepCanvas";
import { Thumb } from "@/components/Thumb";
import {
  VoiceoverPanel,
  VoicePicker,
  type Voice,
  VOICES,
} from "@/components/VoiceoverPanel";
import { deleteAudio, deleteImage, getGuide, putImage, saveGuide, uid } from "@/lib/db";
import {
  END_OF_GUIDE,
  type Branch,
  type Chapter,
  type Guide,
  type PublishInfo,
  type Step,
} from "@/lib/types";

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
      // Drop any branches in remaining steps that pointed to the deleted one.
      for (const s of g.steps) {
        if (s.branches) {
          s.branches = s.branches.filter((b) => b.targetStepId !== step.id);
          if (s.branches.length === 0) delete s.branches;
        }
      }
      // Prune chapters that nothing references any more.
      if (g.chapters?.length) {
        const used = new Set(g.steps.map((s) => s.chapterId).filter(Boolean));
        g.chapters = g.chapters.filter((c) => used.has(c.id));
        if (g.chapters.length === 0) delete g.chapters;
      }
    });
    await deleteImage(step.imageId);
    if (step.audioId) await deleteAudio(step.audioId);
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
        <VoicePicker
          voice={(VOICES as readonly string[]).includes(guide.voice ?? "")
            ? (guide.voice as Voice)
            : "alloy"}
          onChange={(v) => update((g) => void (g.voice = v))}
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
            {guide.steps.map((step, i) => {
              const prev = i > 0 ? guide.steps[i - 1] : null;
              const showHeader = step.chapterId && step.chapterId !== prev?.chapterId;
              const chapter = guide.chapters?.find((c) => c.id === step.chapterId);
              return (
                <div key={step.id}>
                  {showHeader && chapter && (
                    <div className="mt-3 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {chapter.title}
                    </div>
                  )}
                  <li>
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
                </div>
              );
            })}
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
                <ChapterPicker
                  step={selected}
                  chapters={guide.chapters ?? []}
                  onAssign={(chapterId) =>
                    update((g) => {
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (!s) return;
                      if (chapterId) s.chapterId = chapterId;
                      else delete s.chapterId;
                    })
                  }
                  onCreate={(title) => {
                    const id = uid();
                    update((g) => {
                      g.chapters = [...(g.chapters ?? []), { id, title }];
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (s) s.chapterId = id;
                    });
                  }}
                />
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

                <VoiceoverPanel
                  text={`${selected.title}. ${selected.description}`}
                  voice={
                    (VOICES as readonly string[]).includes(guide.voice ?? "")
                      ? (guide.voice as Voice)
                      : "alloy"
                  }
                  audioId={selected.audioId}
                  onAssign={(audioId) =>
                    update((g) => {
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (!s) return;
                      if (audioId) s.audioId = audioId;
                      else delete s.audioId;
                    })
                  }
                />

                <BranchesEditor
                  step={selected}
                  allSteps={guide.steps}
                  onUpdate={(branches) =>
                    update((g) => {
                      const s = g.steps.find((x) => x.id === selected.id);
                      if (!s) return;
                      if (branches.length === 0) delete s.branches;
                      else s.branches = branches;
                    })
                  }
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

function ChapterPicker({
  step,
  chapters,
  onAssign,
  onCreate,
}: {
  step: Step;
  chapters: Chapter[];
  onAssign: (chapterId: string | null) => void;
  onCreate: (title: string) => void;
}) {
  const NEW = "__new__";
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Chapter
      </span>
      <select
        value={step.chapterId ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === NEW) {
            const title = prompt("New chapter name");
            if (title?.trim()) onCreate(title.trim());
          } else {
            onAssign(v || null);
          }
        }}
        className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
      >
        <option value="">— None —</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
        <option value={NEW}>+ New chapter…</option>
      </select>
    </div>
  );
}

function BranchesEditor({
  step,
  allSteps,
  onUpdate,
}: {
  step: Step;
  allSteps: Step[];
  onUpdate: (branches: Branch[]) => void;
}) {
  const branches = step.branches ?? [];
  const otherSteps = allSteps; // allow self-referencing; can be intentional

  function add() {
    const first = otherSteps.find((s) => s.id !== step.id) ?? otherSteps[0];
    onUpdate([
      ...branches,
      {
        id: uid(),
        label: "",
        targetStepId: first?.id ?? END_OF_GUIDE,
      },
    ]);
  }
  function patch(id: string, p: Partial<Branch>) {
    onUpdate(branches.map((b) => (b.id === id ? { ...b, ...p } : b)));
  }
  function remove(id: string) {
    onUpdate(branches.filter((b) => b.id !== id));
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Branches
          </span>
          {branches.length === 0 && (
            <p className="text-xs text-slate-400">
              Add choices to turn this into a decision step. Otherwise the
              viewer advances linearly.
            </p>
          )}
        </div>
        <button
          onClick={add}
          className="rounded-md bg-white px-2 py-1 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-100"
        >
          + Add branch
        </button>
      </div>
      {branches.length > 0 && (
        <ul className="space-y-2">
          {branches.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <input
                value={b.label}
                onChange={(e) => patch(b.id, { label: e.target.value })}
                placeholder="Button label (e.g. “Yes, sign in”)"
                className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
              <select
                value={b.targetStepId}
                onChange={(e) => patch(b.id, { targetStepId: e.target.value })}
                className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {otherSteps.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}: {(s.title || "Untitled").slice(0, 32)}
                  </option>
                ))}
                <option value={END_OF_GUIDE}>🏁 End guide</option>
              </select>
              <button
                onClick={() => remove(b.id)}
                aria-label="Remove branch"
                className="rounded-md px-2 py-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
