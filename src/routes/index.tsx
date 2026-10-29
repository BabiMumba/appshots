import { createFileRoute, Link } from "@tanstack/react-router";
import { templateCatalog } from "../lib/templates";

const LandingPage = () => (
  <div className="landing-root min-h-screen text-zinc-100">
    <div className="landing-atmosphere" aria-hidden />

    <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <span className="landing-brand text-xl tracking-tight">AppShots</span>
      <Link
        to="/editor"
        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 transition-colors"
      >
        Open editor
      </Link>
    </header>

    <main className="relative z-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 lg:grid-cols-2 lg:gap-14">
        <div className="landing-hero-copy">
          <h1 className="landing-brand text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
            AppShots
          </h1>
          <p className="mt-5 max-w-md text-lg text-zinc-300 leading-relaxed">
            Store screenshots that look shipped — devices, type, and export sizes
            for App Store &amp; Play, in the browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/editor"
              className="inline-flex items-center rounded-full bg-[#c8f542] px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#d6ff6a] transition-colors"
            >
              Start editing
            </Link>
            <a
              href="#templates"
              className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
            >
              Browse templates
            </a>
          </div>
        </div>

        <div className="landing-hero-visual relative">
          <img
            src="/demo-image.png"
            alt="AppShots editor preview"
            className="landing-hero-image w-full max-w-xl justify-self-end object-cover"
          />
        </div>
      </section>

      <section id="templates" className="relative z-10 border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="landing-brand text-3xl sm:text-4xl">Start from a layout</h2>
          <p className="mt-2 max-w-xl text-zinc-400">
            Pick a composition, then drop in your screens and export.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templateCatalog.map((t) => (
              <Link
                key={t.id}
                to="/editor"
                search={{ template: t.id }}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#c8f542]/40 hover:bg-white/[0.06] transition-colors"
              >
                <div
                  className="mb-4 h-28 rounded-xl border border-white/10"
                  style={{
                    background:
                      t.id === "minimal"
                        ? "linear-gradient(180deg,#f4f4f5,#d4d4d8)"
                        : t.id === "social"
                          ? "linear-gradient(160deg,#14532d,#4ade80)"
                          : t.id === "dual"
                            ? "linear-gradient(160deg,#0f172a,#2b5876)"
                            : "linear-gradient(160deg,#111827,#243B55)",
                  }}
                />
                <h3 className="text-sm font-semibold text-white group-hover:text-[#c8f542]">
                  {t.label}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  {t.blurb}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  </div>
);

export const Route = createFileRoute("/")({
  component: LandingPage,
});
