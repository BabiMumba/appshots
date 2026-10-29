import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "../components/Brand/BrandMark";

/** Unsplash placeholders — replace with branded shots later */
const HERO_SHOT =
  "https://images.unsplash.com/photo-1512941937669-90a1b58d7c13?auto=format&fit=crop&w=1600&q=80";
const FEATURE_SHOT =
  "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80";

const LandingPage = () => (
  <div className="lp min-h-screen text-[var(--lp-ink)]">
    <div className="lp-mesh" aria-hidden />

    <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-5 pt-5 sm:px-6">
      <BrandMark className="text-[var(--lp-paper)] text-[15px]" size={30} />
      <nav className="flex items-center gap-2 sm:gap-3">
        <a
          href="#assets"
          className="hidden sm:inline text-sm text-[var(--lp-mist)] hover:text-[var(--lp-paper)] transition-colors px-3 py-2"
        >
          What you can make
        </a>
        <Link
          to="/editor"
          className="rounded-full bg-[var(--lp-paper)] px-4 py-2 text-sm font-medium text-[var(--lp-ink)] hover:bg-white transition-colors"
        >
          Open editor
        </Link>
      </nav>
    </header>

    <main className="relative z-10">
      {/* Hero — one composition, brand first */}
      <section className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-5xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6 sm:pb-14">
        <div className="lp-hero-copy max-w-xl">
          <p className="text-[15px] text-[var(--lp-mist)] mb-4">
            App Store &amp; Google Play assets
          </p>
          <h1 className="lp-display text-[clamp(2.75rem,8vw,4.75rem)] leading-[0.95] text-[var(--lp-paper)]">
            AppShots
          </h1>
          <p className="mt-5 max-w-md text-base sm:text-lg text-[var(--lp-mist)] leading-relaxed">
            Design store screenshots and Play feature graphics in the browser —
            then export every size you need.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/editor"
              className="inline-flex items-center rounded-full bg-[var(--lp-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-[filter]"
            >
              Start free
            </Link>
            <Link
              to="/editor"
              search={{ mode: "feature" }}
              className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm text-[var(--lp-paper)] hover:bg-white/5 transition-colors"
            >
              Feature graphic
            </Link>
          </div>
        </div>

        <div className="lp-hero-stage mt-12 sm:mt-14">
          <img
            src={HERO_SHOT}
            alt="Phone mockup placeholder for AppShots"
            className="lp-hero-photo w-full max-h-[42vh] object-cover object-center"
          />
        </div>
      </section>

      {/* One job: what the product covers */}
      <section
        id="assets"
        className="relative z-10 border-t border-white/10 bg-[var(--lp-ink)]/80"
      >
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
          <h2 className="lp-display text-3xl sm:text-4xl text-[var(--lp-paper)]">
            Built for store submission
          </h2>
          <p className="mt-3 max-w-lg text-[var(--lp-mist)]">
            Same editor. Different canvases when the store asks for a different
            shape.
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <p className="text-sm font-medium text-[var(--lp-paper)]">
                Screenshots
              </p>
              <p className="mt-2 text-sm text-[var(--lp-mist)] leading-relaxed">
                Multi-device frames, text, overlays, and the App Store / Play
                size matrix — export PNG or ZIP.
              </p>
              <Link
                to="/editor"
                className="mt-4 inline-block text-sm text-[var(--lp-accent)] hover:underline"
              >
                Open screenshot editor
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--lp-paper)]">
                Feature graphic
              </p>
              <p className="mt-2 text-sm text-[var(--lp-mist)] leading-relaxed">
                Play Console presentation image —{" "}
                <span className="text-[var(--lp-paper)]">1024 × 500</span>, PNG
                or JPEG, up to 15&nbsp;MB. Landscape canvas in the same tool.
              </p>
              <Link
                to="/editor"
                search={{ mode: "feature" }}
                className="mt-4 inline-block text-sm text-[var(--lp-accent)] hover:underline"
              >
                Open feature graphic canvas
              </Link>
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-2xl">
            <img
              src={FEATURE_SHOT}
              alt="Wide presentation image placeholder"
              className="aspect-[1024/500] w-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-[var(--lp-mist)]/70">
            Placeholder photos (Unsplash) — swap for your product shots later.
          </p>
        </div>
      </section>
    </main>

    <footer className="relative z-10 border-t border-white/10 px-5 py-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-[var(--lp-mist)]">
        <BrandMark className="text-[var(--lp-paper)] text-sm" size={22} />
        <span>Free · runs in your browser</span>
      </div>
    </footer>
  </div>
);

export const Route = createFileRoute("/")({
  component: LandingPage,
});
