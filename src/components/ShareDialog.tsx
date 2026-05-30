"use client";

import { useEffect, useState } from "react";
import {
  embedSnippet,
  publishGuide,
  shareUrl,
  unpublishGuide,
} from "@/lib/publish";
import type { Guide, PublishInfo } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "publishing" }
  | { kind: "error"; message: string };

export function ShareDialog({
  guide,
  onClose,
  onUpdated,
}: {
  guide: Guide;
  onClose: () => void;
  onUpdated: (info: PublishInfo | undefined) => void;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const info = guide.publishedAs;

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function doPublish() {
    setStatus({ kind: "publishing" });
    try {
      const updated = await publishGuide(guide);
      onUpdated(updated);
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Publish failed",
      });
    }
  }

  async function doUnpublish() {
    if (!info) return;
    if (!confirm("Unpublish this guide? The share link will stop working.")) return;
    setStatus({ kind: "publishing" });
    try {
      await unpublishGuide(info);
      onUpdated(undefined);
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Unpublish failed",
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Share guide</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {info
                ? "This guide is published. Anyone with the link can view it."
                : "Publish to get a public share link. Drafts stay private in your browser."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status.kind === "error" && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {status.message}
          </p>
        )}

        {info ? <PublishedPanel info={info} /> : <UnpublishedNote />}

        <div className="mt-5 flex items-center justify-end gap-2">
          {info && (
            <button
              onClick={doUnpublish}
              disabled={status.kind === "publishing"}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              Unpublish
            </button>
          )}
          <button
            onClick={doPublish}
            disabled={status.kind === "publishing"}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {status.kind === "publishing"
              ? "Publishing…"
              : info
                ? "Update published guide"
                : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnpublishedNote() {
  return (
    <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
      Anyone with the share link will be able to view it — there are no
      accounts in this MVP. You can unpublish at any time.
    </p>
  );
}

function PublishedPanel({ info }: { info: PublishInfo }) {
  const url = shareUrl(info.publicId);
  const embed = embedSnippet(info.publicId);
  return (
    <div className="space-y-4">
      <CopyField label="Share link" value={url} />
      <CopyField label="Embed snippet" value={embed} multiline />
      <p className="text-xs text-slate-400">
        Published {new Date(info.publishedAt).toLocaleString()}
      </p>
    </div>
  );
}

function CopyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can still select manually */
    }
  }
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <button
          onClick={copy}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={3}
          className="w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs"
          onFocus={(e) => e.currentTarget.select()}
        />
      ) : (
        <input
          readOnly
          value={value}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  );
}
