"use client";

import { useId } from "react";
import type { Annotation } from "@/lib/types";

/**
 * Pure render of the overlays that sit on top of a step screenshot.
 * Positions are 0..1 relative coordinates so this scales to any image size
 * via plain CSS percentages — no ResizeObserver needed. SVG lines accept
 * percentage lengths against their viewport per SVG2, so arrows compose
 * the same way without distorting strokes or arrowheads.
 */
export function AnnotationLayer({
  annotations,
}: {
  annotations: Annotation[];
}) {
  if (annotations.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {annotations.map((a) => (
        <AnnotationView key={a.id} a={a} />
      ))}
    </div>
  );
}

function AnnotationView({ a }: { a: Annotation }) {
  if (a.kind === "blur") {
    return (
      <div
        className="absolute rounded-md bg-white/10 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)]"
        style={{
          left: `${a.rect.x * 100}%`,
          top: `${a.rect.y * 100}%`,
          width: `${a.rect.w * 100}%`,
          height: `${a.rect.h * 100}%`,
        }}
      />
    );
  }
  if (a.kind === "arrow") return <Arrow a={a} />;
  if (a.kind === "text") {
    return (
      <div
        className="absolute max-w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-md bg-amber-300 px-2 py-1 text-xs font-medium text-amber-950 shadow-md ring-1 ring-amber-500"
        style={{ left: `${a.pos.x * 100}%`, top: `${a.pos.y * 100}%` }}
      >
        {a.text || "Text"}
      </div>
    );
  }
  return null;
}

function Arrow({
  a,
}: {
  a: Extract<Annotation, { kind: "arrow" }>;
}) {
  // Per-instance marker id so multiple AnnotationLayers on one page don't clash.
  const markerId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="rgb(220,38,38)" />
        </marker>
      </defs>
      <line
        x1={`${a.from.x * 100}%`}
        y1={`${a.from.y * 100}%`}
        x2={`${a.to.x * 100}%`}
        y2={`${a.to.y * 100}%`}
        stroke="rgb(220,38,38)"
        strokeWidth={3}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
}
