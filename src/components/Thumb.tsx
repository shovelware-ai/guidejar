"use client";

import { useImageUrl } from "@/lib/useImageUrl";

/** Small fixed-size screenshot thumbnail for the editor's step list. */
export function Thumb({ imageId }: { imageId: string }) {
  const url = useImageUrl(imageId);
  return (
    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
