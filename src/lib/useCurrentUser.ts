"use client";

import { useCallback, useEffect, useState } from "react";

export type CurrentUser = { id: string; email: string; createdAt: number };

/** Polls /api/auth/me once on mount; exposes a `refresh` so callers can
 *  re-fetch after a login/logout. */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: CurrentUser | null };
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
}
