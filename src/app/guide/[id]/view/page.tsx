"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GuidePlayer, type PlayerStep } from "@/components/GuidePlayer";
import { getGuide } from "@/lib/db";
import type { Guide } from "@/lib/types";

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getGuide(id).then((g) => (g ? setGuide(g) : setNotFound(true)));
  }, [id]);

  if (notFound) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
          <p>That guide doesn’t exist.</p>
          <Link href="/" className="text-indigo-600 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  if (!guide) {
    return (
      <div className="grid flex-1 place-items-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  const steps: PlayerStep[] = guide.steps.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    hotspot: s.hotspot,
    annotations: s.annotations,
    branches: s.branches,
    chapterId: s.chapterId,
    imageId: s.imageId,
    audioId: s.audioId,
  }));

  return (
    <GuidePlayer
      steps={steps}
      chapters={guide.chapters}
      title={guide.title}
      headerExtras={
        <Link
          href={`/guide/${guide.id}/edit`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-50"
        >
          Edit
        </Link>
      }
    />
  );
}
