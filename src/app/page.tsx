import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Guidejar — Interactive step-by-step guides",
  description:
    "Turn screenshots into interactive walkthroughs. Capture, edit, and share step-by-step guides — with branching, voiceover, translation, and analytics.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <a
            href="#features"
            className="hidden rounded-md px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 sm:inline-block"
          >
            Features
          </a>
          <a
            href="#how"
            className="hidden rounded-md px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 sm:inline-block"
          >
            How it works
          </a>
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 font-medium text-white transition hover:bg-slate-800"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
            Open‑source interactive walkthroughs
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Turn any process into an{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              interactive guide
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Record clicks with the browser extension or drop in screenshots
            yourself. Add hotspots, annotations, voiceover and branching, then
            share a guide anyone can step through in their browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Start a guide →
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Create free account
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            No account needed for drafts — guides live in your browser until you
            publish.
          </p>
        </div>

        {/* Mini "live" preview mock */}
        <div className="mx-auto mt-14 max-w-4xl">
          <DemoMock />
        </div>
      </div>
    </section>
  );
}

function DemoMock() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/5">
      <div className="mb-2 flex items-center gap-1.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 font-mono text-[11px] text-slate-400">
          /g/onboarding · Step 2 of 5
        </span>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-indigo-100">
        {/* fake page chrome inside the screenshot */}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200/70 bg-white/80 px-3 py-2">
            <span className="font-mono text-[10px] text-slate-400">your‑app.com</span>
          </div>
          <div className="flex flex-1">
            <div className="w-1/4 border-r border-slate-200/70 bg-white/60 p-3">
              <div className="h-2 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-2 w-1/2 rounded bg-slate-200" />
              <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="flex-1 p-4">
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-2 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
              <div className="mt-6 inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">
                Continue
              </div>
            </div>
          </div>
        </div>
        {/* pulsing hotspot */}
        <span className="absolute left-[55%] top-[72%] grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center">
          <span className="absolute h-6 w-6 animate-ping rounded-full bg-indigo-500/40" />
          <span className="relative h-3 w-3 rounded-full border-2 border-white bg-indigo-600 shadow-md" />
        </span>
      </div>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
          Step 2 of 5
        </div>
        <div className="mt-1 font-medium text-slate-900">Click Continue to confirm</div>
        <p className="text-sm text-slate-500">
          The form auto-saves as you go — you can always come back to it.
        </p>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Capture",
      body: "Install the Chrome extension, hit record, and click through the process. Each click grabs a screenshot and drops a hotspot exactly where you clicked — or upload screenshots manually.",
    },
    {
      n: "02",
      title: "Edit",
      body: "Tidy up the captions, blur sensitive data, draw arrows, group steps into chapters, add branching choices, and generate voiceover or translations with AI.",
    },
    {
      n: "03",
      title: "Share",
      body: "Publish to get a public link or embed snippet. Anyone with the URL can step through the guide; you watch the analytics roll in.",
    },
  ];
  return (
    <section id="how" className="border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, one loop"
          subtitle="Capture → edit → share. The same loop scales from a one-off explainer to a full help center."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span className="absolute right-4 top-3 font-mono text-5xl font-bold text-slate-100">
                {s.n}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  const items: { icon: string; title: string; body: string }[] = [
    {
      icon: "⏺",
      title: "Browser capture",
      body: "A Manifest V3 Chrome extension records clicks + viewport screenshots; the app builds a guide automatically.",
    },
    {
      icon: "🎯",
      title: "Hotspots",
      body: "Pulsing markers show exactly where to click. Relative coordinates scale with any image size.",
    },
    {
      icon: "🖍",
      title: "Annotations",
      body: "Blur sensitive regions, drop arrows, add text callouts. Draw with the same tool palette across every step.",
    },
    {
      icon: "🌿",
      title: "Branching paths",
      body: "Decision steps become choice buttons. Viewers pick a path; Back returns to the decision step.",
    },
    {
      icon: "📚",
      title: "Chapters",
      body: "Group consecutive steps into named sections and ship a table of contents in the viewer.",
    },
    {
      icon: "🔊",
      title: "AI voiceover",
      body: "Generate spoken narration from each step's text with OpenAI TTS. Audio auto-plays in the viewer.",
    },
    {
      icon: "🌍",
      title: "AI translation",
      body: "Translate step text into any language. A language picker appears in the viewer when translations exist.",
    },
    {
      icon: "🔗",
      title: "Sharing & embedding",
      body: "Publish gets a shareable URL and an <iframe> embed snippet. Drafts stay local‑first until you're ready.",
    },
    {
      icon: "📊",
      title: "Analytics",
      body: "Anonymous funnel + completion stats on an owner‑only dashboard. No IPs, no fingerprinting.",
    },
  ];
  return (
    <section id="features" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="What's inside"
          title="Built for the full lifecycle"
          subtitle="Every piece of a real interactive‑guide product. None of the polish is bolted on."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <li
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-lg"
              >
                {f.icon}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship your first guide in 5 minutes.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Drafts work without an account. Sign in only when you want to
            publish and keep your guides across browsers.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              Start a guide →
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-slate-600">{subtitle}</p>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs">Open‑source interactive guides.</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#how" className="hover:text-slate-900">
            How it works
          </a>
          <Link href="/login" className="hover:text-slate-900">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-slate-900">
            Sign up
          </Link>
          <Link href="/app" className="hover:text-slate-900">
            Open app
          </Link>
        </nav>
      </div>
    </footer>
  );
}
