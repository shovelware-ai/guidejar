"use client";

import Link from "next/link";
import { GuidePlayer, type PlayerStep } from "@/components/GuidePlayer";
import type { PublishedGuide } from "@/lib/server/db";

/**
 * Thin adapter: maps a server-side PublishedGuide into the shared GuidePlayer.
 * The only difference from the local viewer is the image source — published
 * guides serve screenshots from /api/guides/<publicId>/images/<imageId>.
 */
export function PublicViewer({
  guide,
  embed = false,
}: {
  guide: PublishedGuide;
  embed?: boolean;
}) {
  const steps: PlayerStep[] = guide.steps.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    hotspot: s.hotspot,
    annotations: s.annotations,
    branches: s.branches,
    chapterId: s.chapterId,
    src: `/api/guides/${guide.publicId}/images/${s.imageId}`,
    audioSrc: s.hasAudio
      ? `/api/guides/${guide.publicId}/audio/${s.id}`
      : undefined,
    translations: s.translations,
  }));

  return (
    <GuidePlayer
      steps={steps}
      chapters={guide.chapters}
      languages={guide.languages}
      title={guide.title}
      embed={embed}
      footer={
        <>
          Made with{" "}
          <Link href="/" className="text-indigo-600 hover:underline">
            Guidejar
          </Link>
        </>
      }
    />
  );
}
