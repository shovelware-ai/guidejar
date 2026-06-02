"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AuthNav } from "@/components/AuthNav";
import { useCurrentUser } from "@/lib/useCurrentUser";

type MyGuide = {
  publicId: string;
  title: string;
  stepCount: number;
  createdAt: number;
  updatedAt: number;
};

export default function MyGuidesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [guides, setGuides] = useState<MyGuide[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me/guides", { cache: "no-store" });
    if (res.status === 401) return; // user effect will redirect
    if (!res.ok) {
      setError("Failed to load");
      return;
    }
    const data = (await res.json()) as { guides: MyGuide[] };
    setGuides(data.guides);
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    refresh();
  }, [user, userLoading, router, refresh]);

  async function unpublish(g: MyGuide) {
    if (!confirm(`Unpublish “${g.title}”? The share link will stop working.`)) return;
    const res = await fetch(`/api/guides/${encodeURIComponent(g.publicId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Unpublish failed");
      return;
    }
    refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            My published guides
          </h1>
          <p className="text-sm text-slate-500">
            Guides you've published while signed in as <b>{user?.email}</b>.
            Drafts live in your browser and aren't shown here.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : guides === null ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : guides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="font-medium">No published guides yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              From the dashboard, open a draft and use <b>Share → Publish</b>.
              Guides you publish while signed in will show up here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {guides.map((g) => (
              <li
                key={g.publicId}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/g/${g.publicId}`}
                    className="block truncate font-medium hover:underline"
                  >
                    {g.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {g.stepCount} {g.stepCount === 1 ? "step" : "steps"} ·
                    updated {new Date(g.updatedAt).toLocaleDateString()} ·{" "}
                    <code className="rounded bg-slate-100 px-1">/g/{g.publicId}</code>
                  </p>
                </div>
                <Link
                  href={`/g/${g.publicId}`}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100"
                >
                  Open
                </Link>
                <Link
                  href={`/me/guides/${g.publicId}`}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100"
                >
                  Analytics
                </Link>
                <button
                  onClick={() => unpublish(g)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Unpublish
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
