"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { createGuide, deleteGuide, listGuides } from "@/lib/db";
import type { Guide } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[] | null>(null);

  async function refresh() {
    setGuides(await listGuides());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleNew() {
    const guide = await createGuide();
    router.push(`/guide/${guide.id}/edit`);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”? This can't be undone.`)) return;
    await deleteGuide(id);
    refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <button
            onClick={handleNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            + New guide
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Your guides</h1>
          <p className="text-sm text-slate-500">
            Turn screenshots into interactive step-by-step walkthroughs.
          </p>
        </div>

        {guides === null ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : guides.length === 0 ? (
          <EmptyState onNew={handleNew} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                onDelete={() => handleDelete(g.id, g.title)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function GuideCard({
  guide,
  onDelete,
}: {
  guide: Guide;
  onDelete: () => void;
}) {
  return (
    <li className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <Link href={`/guide/${guide.id}/edit`} className="flex-1">
        <h2 className="line-clamp-2 font-medium">{guide.title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {guide.steps.length} {guide.steps.length === 1 ? "step" : "steps"} ·
          updated {new Date(guide.updatedAt).toLocaleDateString()}
        </p>
      </Link>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Link
          href={`/guide/${guide.id}/edit`}
          className="rounded-md border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50"
        >
          Edit
        </Link>
        <Link
          href={`/guide/${guide.id}/view`}
          className="rounded-md border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50"
        >
          Preview
        </Link>
        <button
          onClick={onDelete}
          className="ml-auto rounded-md px-2 py-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete guide"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <div className="max-w-sm">
        <h2 className="font-medium">No guides yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create your first guide, add some screenshots, and mark where to
          click. Then preview it as an interactive walkthrough.
        </p>
        <button
          onClick={onNew}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + New guide
        </button>
      </div>
    </div>
  );
}
