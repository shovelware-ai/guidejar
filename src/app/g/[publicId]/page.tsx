import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb, getGuide } from "@/lib/server/db";
import { PublicViewer } from "@/components/PublicViewer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always reflect latest publish

type RouteProps = {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ embed?: string }>;
};

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { publicId } = await params;
  const db = await getDb();
  const guide = await getGuide(db, publicId);
  if (!guide) return { title: "Guide not found · Guidejar" };
  return {
    title: `${guide.title} · Guidejar`,
    description:
      guide.description ||
      `An interactive step-by-step guide with ${guide.steps.length} ${guide.steps.length === 1 ? "step" : "steps"}.`,
  };
}

export default async function PublicGuidePage({
  params,
  searchParams,
}: RouteProps) {
  const { publicId } = await params;
  const { embed } = await searchParams;
  const db = await getDb();
  const guide = await getGuide(db, publicId);
  if (!guide) notFound();
  return <PublicViewer guide={guide} embed={embed === "1"} />;
}
