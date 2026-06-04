"use client";

import { useEffect, useState } from "react";
import type { Step, StepTranslation } from "@/lib/types";

/**
 * Per-step translations editor: one row per language in `guide.languages`.
 * Each row has an inline-editable title + description and a Generate button
 * that hits /api/translate.  Edits are written back via `onChange`.
 */
export function TranslationsPanel({
  step,
  languages,
  onChange,
}: {
  step: Step;
  languages: string[];
  onChange: (translations: Step["translations"]) => void;
}) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // language code being generated
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/translate")
      .then((r) => r.json())
      .then((d) => setConfigured((d as { configured: boolean }).configured))
      .catch(() => setConfigured(false));
  }, []);

  if (languages.length === 0) return null;

  function patch(code: string, p: StepTranslation) {
    const next = { ...(step.translations ?? {}) };
    const merged = { ...(next[code] ?? {}), ...p };
    // Drop empty entries so guides stay tidy.
    if (!merged.title && !merged.description) delete next[code];
    else next[code] = merged;
    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  async function generate(code: string) {
    if (!step.title.trim() && !step.description.trim()) {
      setError("Add a title or description first.");
      return;
    }
    setBusy(code);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: code,
          title: step.title,
          description: step.description,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Translation failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as { title: string; description: string };
      patch(code, { title: data.title, description: data.description });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Translations
        </span>
        {configured === false && (
          <span className="text-xs text-slate-400">
            Set OPENAI_API_KEY to auto-translate
          </span>
        )}
      </div>
      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {languages.map((code) => {
          const t = step.translations?.[code] ?? {};
          return (
            <li key={code} className="rounded-md bg-white p-3 ring-1 ring-slate-200">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] uppercase text-slate-700">
                  {code}
                </span>
                {configured && (
                  <button
                    onClick={() => generate(code)}
                    disabled={busy !== null}
                    className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {busy === code
                      ? "Translating…"
                      : t.title || t.description
                        ? "Regenerate"
                        : "Generate"}
                  </button>
                )}
              </div>
              <input
                value={t.title ?? ""}
                onChange={(e) => patch(code, { title: e.target.value })}
                placeholder={`Title (${code})`}
                className="mb-1.5 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
              <textarea
                value={t.description ?? ""}
                onChange={(e) => patch(code, { description: e.target.value })}
                placeholder={`Description (${code})`}
                rows={2}
                className="w-full resize-y rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Guide-level language list editor — small chip row in the editor toolbar. */
export function LanguagesEditor({
  languages,
  onChange,
}: {
  languages: string[];
  onChange: (next: string[]) => void;
}) {
  function add() {
    const code = prompt(
      "Language code to add (e.g. es, fr-CA, ja, pt-BR)",
    )?.trim().toLowerCase();
    if (!code) return;
    if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/i.test(code)) {
      alert("Please enter a valid BCP-47 language code (e.g. es, fr-CA).");
      return;
    }
    if (languages.includes(code)) return;
    onChange([...languages, code]);
  }
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="font-semibold uppercase tracking-wide text-slate-500">
        Langs
      </span>
      {languages.map((code) => (
        <span
          key={code}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono uppercase text-slate-700"
        >
          {code}
          <button
            onClick={() => onChange(languages.filter((c) => c !== code))}
            className="text-slate-400 hover:text-red-600"
            aria-label={`Remove ${code}`}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={add}
        className="rounded-full bg-white px-2 py-0.5 font-medium text-indigo-600 ring-1 ring-slate-200 hover:bg-slate-50"
      >
        + Add
      </button>
    </div>
  );
}
