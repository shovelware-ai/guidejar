"use client";

import { useEffect, useState } from "react";
import { deleteAudio, putAudio } from "@/lib/db";
import { useAudioUrl } from "@/lib/useAudioUrl";

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = (typeof VOICES)[number];

/**
 * Per-step voiceover controls.
 * Calls /api/voiceover with the step text and chosen voice, stores the
 * returned MP3 in IndexedDB, and surfaces an audio preview.
 */
export function VoiceoverPanel({
  text,
  voice,
  audioId,
  onAssign,
}: {
  text: string;
  voice: Voice;
  audioId?: string;
  onAssign: (audioId: string | null) => void;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioUrl = useAudioUrl(audioId);

  useEffect(() => {
    fetch("/api/voiceover", { method: "GET" })
      .then((r) => r.json())
      .then((d) => setConfigured((d as { configured: boolean }).configured))
      .catch(() => setConfigured(false));
  }, []);

  async function generate() {
    if (!text.trim()) {
      setError("Add a title or description first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Generation failed (${res.status})`);
        return;
      }
      const blob = await res.blob();
      // Replace any previous audio so we don't accumulate orphans.
      if (audioId) {
        await deleteAudio(audioId);
      }
      const newId = await putAudio(blob);
      onAssign(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!audioId) return;
    await deleteAudio(audioId);
    onAssign(null);
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Voiceover
        </span>
        {audioId && (
          <button
            onClick={remove}
            className="text-xs text-slate-400 hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      {configured === false && (
        <p className="text-xs text-slate-500">
          Voiceover is disabled — set <code className="rounded bg-slate-100 px-1">OPENAI_API_KEY</code>{" "}
          on the server to enable.
        </p>
      )}

      {configured && (
        <>
          {audioUrl ? (
            <audio src={audioUrl} controls className="block w-full" />
          ) : (
            <p className="text-xs text-slate-500">
              Generate spoken narration for this step from its title and
              description.
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={generate}
              disabled={busy}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy
                ? "Generating…"
                : audioId
                  ? "Regenerate"
                  : "Generate voiceover"}
            </button>
            {error && (
              <span className="text-xs text-red-600">{error}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Voice dropdown for the guide-level setting in the editor toolbar. */
export function VoicePicker({
  voice,
  onChange,
}: {
  voice: Voice;
  onChange: (v: Voice) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Voice
      </span>
      <select
        value={voice}
        onChange={(e) => onChange(e.target.value as Voice)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
      >
        {VOICES.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

export { VOICES };
export type { Voice };
