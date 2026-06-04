"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { Logo } from "@/components/Logo";
import { useCurrentUser } from "@/lib/useCurrentUser";

type StatsResponse = {
  guide: { publicId: string; title: string; steps: { id: string; title: string }[] };
  stats: {
    totalViews: number;
    uniqueSessions: number;
    completions: number;
    completionRate: number;
    perStep: { stepId: string; views: number; uniqueSessions: number }[];
    branchPicks: { stepId: string | null; branchId: string; count: number }[];
    recent: { type: string; stepId: string | null; createdAt: number }[];
  };
};

export default function GuideAnalyticsPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetch(`/api/me/guides/${encodeURIComponent(publicId)}/stats`, {
      cache: "no-store",
    }).then(async (res) => {
      if (res.status === 401 || res.status === 403) {
        setError("You don't have access to this guide's analytics.");
        return;
      }
      if (res.status === 404) {
        setError("That guide doesn't exist.");
        return;
      }
      if (!res.ok) {
        setError("Failed to load");
        return;
      }
      setData((await res.json()) as StatsResponse);
    });
  }, [publicId, user, userLoading, router]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Logo href="/app" />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Link href="/me" className="text-xs text-slate-400 hover:underline">
              ← My guides
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {data?.guide.title ?? "Analytics"}
            </h1>
            <p className="text-sm text-slate-500">
              {data ? (
                <>
                  Anonymous engagement for{" "}
                  <code className="rounded bg-slate-100 px-1">/g/{data.guide.publicId}</code>
                </>
              ) : (
                "Loading…"
              )}
            </p>
          </div>
          {data && (
            <Link
              href={`/g/${data.guide.publicId}`}
              target="_blank"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50"
            >
              Open guide ↗
            </Link>
          )}
        </div>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : !data ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="space-y-6">
            <SummaryCards stats={data.stats} />
            <Funnel guide={data.guide} stats={data.stats} />
            {data.stats.branchPicks.length > 0 && (
              <BranchPicks stats={data.stats} />
            )}
            <Recent stats={data.stats} />
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCards({ stats }: { stats: StatsResponse["stats"] }) {
  const pct = Math.round(stats.completionRate * 100);
  const cards = [
    { label: "Views", value: stats.totalViews },
    { label: "Unique sessions", value: stats.uniqueSessions },
    { label: "Completions", value: stats.completions },
    { label: "Completion rate", value: stats.uniqueSessions > 0 ? `${pct}%` : "—" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <li
          key={c.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {c.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {c.value}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Funnel({
  guide,
  stats,
}: {
  guide: StatsResponse["guide"];
  stats: StatsResponse["stats"];
}) {
  const byStep = new Map(stats.perStep.map((r) => [r.stepId, r]));
  const first = byStep.get(guide.steps[0]?.id ?? "");
  const baseline = first?.uniqueSessions ?? 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Step funnel</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Unique sessions reaching each step. (Branching guides make this
        non-monotonic — that's expected.)
      </p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2">#</th>
            <th>Step</th>
            <th className="text-right">Sessions</th>
            <th className="text-right">Views</th>
            <th className="w-1/3 pl-3">Reach</th>
          </tr>
        </thead>
        <tbody>
          {guide.steps.map((s, i) => {
            const row = byStep.get(s.id);
            const sessions = row?.uniqueSessions ?? 0;
            const views = row?.views ?? 0;
            const pct = baseline > 0 ? sessions / baseline : 0;
            return (
              <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 text-slate-400">{i + 1}</td>
                <td className="truncate">{s.title || "Untitled step"}</td>
                <td className="text-right tabular-nums">{sessions}</td>
                <td className="text-right tabular-nums text-slate-500">
                  {views}
                </td>
                <td className="pl-3">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(100, pct * 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BranchPicks({ stats }: { stats: StatsResponse["stats"] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Branch picks</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {stats.branchPicks.map((p) => (
          <li
            key={`${p.stepId}:${p.branchId}`}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span className="font-mono text-xs text-slate-500">
              step {p.stepId} · branch {p.branchId}
            </span>
            <span className="tabular-nums font-medium">{p.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Recent({ stats }: { stats: StatsResponse["stats"] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Recent activity</h2>
      {stats.recent.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No events yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 font-mono text-xs">
          {stats.recent.map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between py-1.5"
            >
              <span>
                <span className="text-indigo-600">{e.type}</span>
                {e.stepId && <span className="text-slate-400"> · {e.stepId}</span>}
              </span>
              <span className="text-slate-400">
                {new Date(e.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
