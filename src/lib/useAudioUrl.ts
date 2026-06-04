import { useEffect, useState } from "react";
import { getAudio } from "./db";

/** Loads a stored voiceover Blob and exposes it as an object URL,
 *  revoking the URL on change/unmount to avoid leaks.  Mirrors
 *  `useImageUrl` so the player can resolve audio the same way. */
export function useAudioUrl(audioId?: string): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!audioId) {
      setUrl(undefined);
      return;
    }
    let objectUrl: string | undefined;
    let cancelled = false;

    getAudio(audioId).then((blob) => {
      if (blob && !cancelled) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioId]);

  return url;
}
