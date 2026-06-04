import { useEffect, useState } from "react";
import { getImage } from "./db";

/** Loads a stored screenshot Blob and exposes it as an object URL,
 *  revoking the URL on change/unmount to avoid leaks. */
export function useImageUrl(imageId?: string): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!imageId) {
      setUrl(undefined);
      return;
    }
    let objectUrl: string | undefined;
    let cancelled = false;

    getImage(imageId).then((blob) => {
      if (blob && !cancelled) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  return url;
}
