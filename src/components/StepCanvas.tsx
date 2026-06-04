"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { uid } from "@/lib/db";
import { useImageUrl } from "@/lib/useImageUrl";
import type { Annotation, Hotspot } from "@/lib/types";

type Tool = "select" | "hotspot" | "blur" | "arrow" | "text";

const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "select", label: "Select", key: "V" },
  { id: "hotspot", label: "Hotspot", key: "H" },
  { id: "blur", label: "Blur", key: "B" },
  { id: "arrow", label: "Arrow", key: "A" },
  { id: "text", label: "Text", key: "T" },
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Interactive editor for a step's screenshot.
 * The toolbar selects an active tool; click/drag on the canvas creates or
 * mutates annotations.  All coordinates are stored as 0..1 relative to the
 * displayed image (matching how Hotspot already works), so layouts scale.
 */
export function StepCanvas({
  imageId,
  hotspot,
  annotations = [],
  onUpdate,
  alt = "Step screenshot",
}: {
  imageId: string;
  hotspot?: Hotspot;
  annotations?: Annotation[];
  onUpdate: (patch: {
    hotspot?: Hotspot | null;
    annotations?: Annotation[];
  }) => void;
  alt?: string;
}) {
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<
    | null
    | { kind: "blur" | "arrow"; start: { x: number; y: number }; end: { x: number; y: number } }
  >(null);
  const url = useImageUrl(imageId);
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowMarkerId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // ── Helpers ────────────────────────────────────────────────────────────
  const rel = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    };
  }, []);

  // Keyboard tool shortcuts (V/H/B/A/T). Ignored while typing in a textarea
  // (e.g. editing the body of a text annotation).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const t = TOOLS.find((t) => t.key.toLowerCase() === e.key.toLowerCase());
      if (t) {
        setTool(t.id);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        deleteAnnotation(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, annotations]);

  // ── Mutations ──────────────────────────────────────────────────────────
  function replace(id: string, next: Annotation) {
    onUpdate({ annotations: annotations.map((a) => (a.id === id ? next : a)) });
  }
  function add(a: Annotation) {
    onUpdate({ annotations: [...annotations, a] });
    setSelectedId(a.id);
  }
  function deleteAnnotation(id: string) {
    onUpdate({ annotations: annotations.filter((a) => a.id !== id) });
    setSelectedId(null);
  }

  // Drag-to-move an existing annotation in Select mode. Anchor-based: each
  // move event applies the delta to the *original* annotation, not the last
  // rendered one — keeps motion correct under React batching.
  function startMove(a: Annotation, e: ReactPointerEvent) {
    if (tool !== "select") return;
    e.stopPropagation();
    setSelectedId(a.id);
    const anchor = rel(e.clientX, e.clientY);
    const original = a;
    function onMove(ev: PointerEvent) {
      const p = rel(ev.clientX, ev.clientY);
      const dx = p.x - anchor.x;
      const dy = p.y - anchor.y;
      replace(original.id, translate(original, dx, dy));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // ── Canvas-level pointer handlers (drawing tools) ──────────────────────
  function onCanvasPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const p = rel(e.clientX, e.clientY);
    if (tool === "hotspot") {
      onUpdate({ hotspot: p });
      return;
    }
    if (tool === "text") {
      add({ id: uid(), kind: "text", pos: p, text: "Text" });
      setTool("select");
      return;
    }
    if (tool === "blur" || tool === "arrow") {
      setDrawing({ kind: tool, start: p, end: p });
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    // select: clicking empty canvas deselects
    setSelectedId(null);
  }
  function onCanvasPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drawing) return;
    setDrawing({ ...drawing, end: rel(e.clientX, e.clientY) });
  }
  function onCanvasPointerUp() {
    if (!drawing) return;
    const { start, end, kind } = drawing;
    setDrawing(null);
    if (kind === "blur") {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      if (w > 0.005 && h > 0.005) {
        add({ id: uid(), kind: "blur", rect: { x, y, w, h } });
      }
    } else {
      if (Math.hypot(end.x - start.x, end.y - start.y) > 0.01) {
        add({ id: uid(), kind: "arrow", from: start, to: end });
      }
    }
    setTool("select");
  }

  // ── Render ─────────────────────────────────────────────────────────────
  const canvasCursor =
    tool === "select"
      ? "cursor-default"
      : tool === "hotspot"
        ? "cursor-crosshair"
        : "cursor-crosshair";

  return (
    <div className="flex flex-col items-center gap-3">
      <Toolbar tool={tool} setTool={setTool} />

      <div
        ref={containerRef}
        className={`relative inline-block max-w-full leading-none select-none ${canvasCursor}`}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={alt}
            draggable={false}
            className="block h-auto max-w-full rounded-lg border border-slate-200"
          />
        ) : (
          <div className="grid h-64 w-96 max-w-full place-items-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-400">
            Loading image…
          </div>
        )}

        {/* Annotations (interactive) */}
        {url &&
          annotations.map((a) => (
            <AnnotationEditor
              key={a.id}
              a={a}
              selected={selectedId === a.id}
              tool={tool}
              arrowMarkerId={arrowMarkerId}
              onPointerDown={(e) => startMove(a, e)}
              onSelect={() => setSelectedId(a.id)}
              onChange={(next) => replace(a.id, next)}
              onDelete={() => deleteAnnotation(a.id)}
            />
          ))}

        {/* In-progress drawing preview */}
        {drawing && <DrawingPreview drawing={drawing} arrowMarkerId={arrowMarkerId} />}

        {/* Hotspot — non-interactive in canvas; the Hotspot tool replaces it */}
        {hotspot && url && (
          <span
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
          >
            <span className="block h-5 w-5 rounded-full border-2 border-white bg-indigo-600 shadow-md" />
          </span>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        {hintFor(tool)}
      </p>
    </div>
  );
}

function Toolbar({
  tool,
  setTool,
}: {
  tool: Tool;
  setTool: (t: Tool) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={`${t.label} (${t.key})`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            tool === t.id
              ? "bg-indigo-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {t.label}
          <span className="ml-1 text-[10px] opacity-60">{t.key}</span>
        </button>
      ))}
    </div>
  );
}

function hintFor(tool: Tool): string {
  switch (tool) {
    case "select":
      return "Click an annotation to select; drag to move; Backspace to delete.";
    case "hotspot":
      return "Click on the screenshot to place the click hotspot.";
    case "blur":
      return "Drag to draw a blur region.";
    case "arrow":
      return "Drag to draw an arrow.";
    case "text":
      return "Click to drop a text callout, then type.";
  }
}

// ─── Annotation editors ─────────────────────────────────────────────────

function AnnotationEditor({
  a,
  selected,
  tool,
  arrowMarkerId,
  onPointerDown,
  onSelect,
  onChange,
  onDelete,
}: {
  a: Annotation;
  selected: boolean;
  tool: Tool;
  arrowMarkerId: string;
  onPointerDown: (e: ReactPointerEvent) => void;
  onSelect: () => void;
  onChange: (a: Annotation) => void;
  onDelete: () => void;
}) {
  const selectable = tool === "select";

  if (a.kind === "blur") {
    return (
      <div
        onPointerDown={selectable ? onPointerDown : undefined}
        onClick={selectable ? onSelect : undefined}
        className={`absolute rounded-md bg-white/10 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)] ${
          selectable ? "cursor-move" : "pointer-events-none"
        } ${selected ? "ring-2 ring-indigo-500" : ""}`}
        style={{
          left: `${a.rect.x * 100}%`,
          top: `${a.rect.y * 100}%`,
          width: `${a.rect.w * 100}%`,
          height: `${a.rect.h * 100}%`,
        }}
      >
        {selected && <DeleteHandle onDelete={onDelete} corner="tr" />}
      </div>
    );
  }

  if (a.kind === "arrow") {
    // Hit area is a fat invisible line on top of the visible one.
    return (
      <svg
        className={`absolute inset-0 h-full w-full overflow-visible ${
          selectable ? "" : "pointer-events-none"
        }`}
      >
        <defs>
          <marker
            id={arrowMarkerId}
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
          markerEnd={`url(#${arrowMarkerId})`}
          className={selected ? "drop-shadow-[0_0_3px_rgb(99,102,241)]" : ""}
        />
        {selectable && (
          <line
            x1={`${a.from.x * 100}%`}
            y1={`${a.from.y * 100}%`}
            x2={`${a.to.x * 100}%`}
            y2={`${a.to.y * 100}%`}
            stroke="transparent"
            strokeWidth={16}
            strokeLinecap="round"
            onPointerDown={onPointerDown}
            onClick={onSelect}
            className="cursor-move"
          />
        )}
        {selected && (
          <foreignObject
            x={`${Math.max(a.from.x, a.to.x) * 100}%`}
            y={`${Math.min(a.from.y, a.to.y) * 100}%`}
            width="22"
            height="22"
          >
            <DeleteHandle onDelete={onDelete} />
          </foreignObject>
        )}
      </svg>
    );
  }

  // text
  return (
    <div
      onPointerDown={selectable ? onPointerDown : undefined}
      onClick={selectable ? onSelect : undefined}
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${
        selectable ? "cursor-move" : "pointer-events-none"
      }`}
      style={{ left: `${a.pos.x * 100}%`, top: `${a.pos.y * 100}%` }}
    >
      {selected && selectable ? (
        <textarea
          value={a.text}
          onChange={(e) => onChange({ ...a, text: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          rows={Math.max(1, a.text.split("\n").length)}
          autoFocus
          className="block min-w-[120px] resize-none rounded-md bg-amber-300 px-2 py-1 text-xs font-medium text-amber-950 shadow-md ring-2 ring-indigo-500 focus:outline-none"
        />
      ) : (
        <div
          className={`rounded-md bg-amber-300 px-2 py-1 text-xs font-medium text-amber-950 shadow-md ring-1 ring-amber-500 ${
            selected ? "ring-2 ring-indigo-500" : ""
          }`}
        >
          {a.text || "Text"}
        </div>
      )}
      {selected && <DeleteHandle onDelete={onDelete} corner="tr" floating />}
    </div>
  );
}

function DeleteHandle({
  onDelete,
  corner = "tr",
  floating = false,
}: {
  onDelete: () => void;
  corner?: "tr" | "br" | "tl" | "bl";
  floating?: boolean;
}) {
  const pos = {
    tr: "right-0 top-0 -translate-y-1/2 translate-x-1/2",
    tl: "left-0 top-0 -translate-y-1/2 -translate-x-1/2",
    br: "right-0 bottom-0 translate-y-1/2 translate-x-1/2",
    bl: "left-0 bottom-0 translate-y-1/2 -translate-x-1/2",
  }[corner];
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      aria-label="Delete annotation"
      className={`${floating ? "absolute" : "absolute"} ${pos} z-10 grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-red-500 text-xs font-bold leading-none text-white shadow ring-2 ring-white hover:bg-red-600`}
    >
      ×
    </button>
  );
}

// ─── Drawing preview ────────────────────────────────────────────────────

function DrawingPreview({
  drawing,
  arrowMarkerId,
}: {
  drawing: { kind: "blur" | "arrow"; start: { x: number; y: number }; end: { x: number; y: number } };
  arrowMarkerId: string;
}) {
  if (drawing.kind === "blur") {
    const x = Math.min(drawing.start.x, drawing.end.x);
    const y = Math.min(drawing.start.y, drawing.end.y);
    const w = Math.abs(drawing.end.x - drawing.start.x);
    const h = Math.abs(drawing.end.y - drawing.start.y);
    return (
      <div
        className="pointer-events-none absolute rounded-md border-2 border-indigo-500 bg-indigo-500/10"
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${w * 100}%`,
          height: `${h * 100}%`,
        }}
      />
    );
  }
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <line
        x1={`${drawing.start.x * 100}%`}
        y1={`${drawing.start.y * 100}%`}
        x2={`${drawing.end.x * 100}%`}
        y2={`${drawing.end.y * 100}%`}
        stroke="rgb(99,102,241)"
        strokeWidth={3}
        strokeLinecap="round"
        markerEnd={`url(#${arrowMarkerId})`}
        strokeDasharray="6 4"
      />
    </svg>
  );
}

// ─── Translate an annotation by (dx, dy) in relative coords ─────────────

function translate(a: Annotation, dx: number, dy: number): Annotation {
  if (a.kind === "blur") {
    return {
      ...a,
      rect: { ...a.rect, x: clamp01(a.rect.x + dx), y: clamp01(a.rect.y + dy) },
    };
  }
  if (a.kind === "arrow") {
    return {
      ...a,
      from: { x: clamp01(a.from.x + dx), y: clamp01(a.from.y + dy) },
      to: { x: clamp01(a.to.x + dx), y: clamp01(a.to.y + dy) },
    };
  }
  return {
    ...a,
    pos: { x: clamp01(a.pos.x + dx), y: clamp01(a.pos.y + dy) },
  };
}
