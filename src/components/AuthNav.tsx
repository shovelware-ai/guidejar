"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";

/** Compact auth widget for page headers. */
export function AuthNav() {
  const { user, loading, refresh } = useCurrentUser();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <span className="text-xs text-slate-300">…</span>;
  }
  if (!user) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/login"
          className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white transition hover:bg-slate-800"
        >
          Sign up
        </Link>
      </div>
    );
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    setOpen(false);
  }

  return (
    <div className="relative text-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-slate-50"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-100 text-xs text-indigo-700">
          {user.email[0]?.toUpperCase()}
        </span>
        <span className="max-w-[140px] truncate">{user.email}</span>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <Link
              href="/me"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 hover:bg-slate-50"
            >
              My published guides
            </Link>
            <button
              onClick={signOut}
              className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
