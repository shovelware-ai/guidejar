"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { importSession, isCapturedSession } from "@/lib/import";

type Status =
  | { kind: "waiting" }
  | { kind: "importing"; count: number }
  | { kind: "error"; message: string };

export default function ImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "waiting" });
  const fileInput = useRef<HTMLInputElement>(null);
  const handled = useRef(false);

  const runImport = useCallback(
    async (data: unknown) => {
      if (handled.current) return;
      if (!isCapturedSession(data)) {
        setStatus({ kind: "error", message: "That doesn't look like a Guidejar capture." });
        return;
      }
      handled.current = true;
      setStatus({ kind: "importing", count: data.steps.length });
      try {
        const guide = await importSession(data);
        router.push(`/guide/${guide.id}/edit`);
      } catch (err) {
        handled.current = false;
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Import failed.",
        });
      }
    },
    [router],
  );

  // Handshake with the capture extension's content-script bridge: announce we're
  // ready, and import whatever payload it posts back. (See extension/bridge.js.)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== window || !e.data || typeof e.data !== "object") return;
      const { type, payload } = e.data as { type?: string; payload?: unknown };
      if (type === "GUIDEJAR_IMPORT") {
        window.postMessage({ type: "GUIDEJAR_IMPORT_DONE" }, "*");
        runImport(payload);
      } else if (type === "GUIDEJAR_BRIDGE_READY") {
        // Bridge attached after us — re-announce so it sends the payload.
        window.postMessage({ type: "GUIDEJAR_IMPORT_READY" }, "*");
      }
    }
    window.addEventListener("message", onMessage);
    window.postMessage({ type: "GUIDEJAR_IMPORT_READY" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [runImport]);

  async function onFile(file: File) {
    try {
      const data = JSON.parse(await file.text());
      runImport(data);
    } catch {
      setStatus({ kind: "error", message: "Couldn't read that file as JSON." });
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-4">
          <Logo href="/app" />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-md flex-1 place-items-center px-6 py-10">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {status.kind === "importing" ? (
            <>
              <Spinner />
              <h1 className="mt-4 font-medium">
                Importing {status.count} {status.count === 1 ? "step" : "steps"}…
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold">Import a capture</h1>
              <p className="mt-1 text-sm text-slate-500">
                Stop a recording in the Guidejar Capture extension and it lands
                here automatically. Or import a downloaded{" "}
                <code className="rounded bg-slate-100 px-1">.json</code> capture.
              </p>

              {status.kind === "error" && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {status.message}
                </p>
              )}

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Choose .json file
                </button>
                <Link
                  href="/app"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Spinner small /> Waiting for the extension…
              </p>
            </>
          )}
        </div>
      </main>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) onFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Spinner({ small = false }: { small?: boolean }) {
  const size = small ? "h-3 w-3" : "h-8 w-8";
  return (
    <span
      className={`inline-block ${size} animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 align-middle`}
    />
  );
}
