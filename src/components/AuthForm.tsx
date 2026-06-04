"use client";

import { Logo } from "@/components/Logo";

/** Centred card shell shared by /login and /signup. */
export function AuthFormShell({
  title,
  footer,
  children,
}: {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-md flex-1 place-items-center px-6 py-10">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-5 text-lg font-semibold">{title}</h1>
          {children}
          <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        required
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
      />
    </label>
  );
}
