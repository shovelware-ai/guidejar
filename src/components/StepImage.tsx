"use client";

import { useImageUrl } from "@/lib/useImageUrl";
import type { Hotspot } from "@/lib/types";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Renders a step's screenshot with an optional hotspot marker.
 * In `editable` mode, clicking the image reports the click position back as
 * relative (0..1) coordinates so the caller can store/move the hotspot.
 */
export function StepImage({
  imageId,
  src,
  hotspot,
  editable = false,
  pulse = false,
  onPlaceHotspot,
  alt = "Step screenshot",
}: {
  /** Local image id resolved via IndexedDB.  Ignored when `src` is given. */
  imageId?: string;
  /** Direct URL — used by the public viewer to point at the API. */
  src?: string;
  hotspot?: Hotspot;
  editable?: boolean;
  pulse?: boolean;
  onPlaceHotspot?: (h: Hotspot) => void;
  alt?: string;
}) {
  const resolved = useImageUrl(src ? undefined : imageId);
  const url = src ?? resolved;

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!editable || !onPlaceHotspot) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onPlaceHotspot({
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    });
  }

  return (
    <div className="relative inline-block max-w-full leading-none">
      {url ? (
        // Object URLs from IndexedDB can't use next/image; plain img is correct here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          onClick={handleClick}
          className={`block h-auto max-w-full rounded-lg border border-slate-200 ${
            editable ? "cursor-crosshair" : ""
          }`}
          draggable={false}
        />
      ) : (
        <div className="grid h-64 w-96 max-w-full place-items-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-400">
          Loading image…
        </div>
      )}

      {hotspot && url && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
        >
          <span
            className={`block h-5 w-5 rounded-full border-2 border-white bg-indigo-600 shadow-md ${
              pulse ? "hotspot-pulse" : ""
            }`}
          />
        </span>
      )}
    </div>
  );
}
