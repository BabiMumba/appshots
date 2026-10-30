/**
 * Pick a store template — used on landing and in the editor.
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  templateCatalog,
  templatesForCategory,
  type TemplateCategory,
  type TemplateId,
  type TemplateMeta,
} from "../../lib/templates";

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "ios", label: "App Store" },
  { id: "play", label: "Google Play" },
  { id: "feature", label: "Feature graphic" },
];

interface TemplatePickerProps {
  /** Modal mode when onSelect is provided */
  onSelect?: (id: TemplateId) => void;
  onClose?: () => void;
  /** Landing uses links instead of callbacks */
  asLinks?: boolean;
  title?: string;
}

function TemplateCard({
  template,
  asLinks,
  onSelect,
}: {
  template: TemplateMeta;
  asLinks?: boolean;
  onSelect?: (id: TemplateId) => void;
}) {
  const body = (
    <>
      <div
        className="mb-3 h-24 rounded-xl"
        style={{ background: template.swatch }}
      />
      <p className="text-sm font-medium text-inherit">{template.label}</p>
      <p className="mt-1 text-xs opacity-70 leading-relaxed">{template.blurb}</p>
      <p className="mt-2 text-[10px] opacity-50">
        {template.screenCount} screen{template.screenCount !== 1 ? "s" : ""}
        {template.category === "feature" ? " · 1024×500" : ""}
      </p>
    </>
  );

  if (asLinks) {
    return (
      <Link
        to="/editor"
        search={{
          template: template.id,
          ...(template.category === "feature" ? { mode: "feature" as const } : {}),
        }}
        className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[var(--lp-paper)] hover:border-[var(--lp-accent)]/50 hover:bg-white/[0.06] transition-colors"
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(template.id)}
      className="text-left rounded-xl border border-white/10 bg-[#1a1a1a] p-3 hover:border-sky-400/40 hover:bg-[#222] transition-colors"
    >
      {body}
    </button>
  );
}

export const TemplatePicker = ({
  onSelect,
  onClose,
  asLinks = false,
  title = "Start from a template",
}: TemplatePickerProps) => {
  const [category, setCategory] = useState<TemplateCategory>("ios");
  const list = templatesForCategory(category);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-inherit">{title}</h2>
          <p className="mt-1 text-xs opacity-60">
            Layouts for store screenshots and Play feature graphics.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 opacity-60 hover:opacity-100 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c.id
                ? asLinks
                  ? "bg-[var(--lp-paper)] text-[var(--lp-ink)]"
                  : "bg-white text-black"
                : asLinks
                  ? "text-[var(--lp-mist)] hover:text-[var(--lp-paper)] border border-white/15"
                  : "text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className={
          asLinks
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2 max-h-[55vh] overflow-y-auto pr-1"
        }
      >
        {list.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            asLinks={asLinks}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );

  if (asLinks) {
    return <div>{inner}</div>;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#141414] text-zinc-100 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    </div>
  );
};

/** Landing section wrapper */
export const LandingTemplatesSection = () => (
  <section
    id="templates"
    className="relative z-10 border-t border-white/10 bg-[var(--lp-ink)]/90"
  >
    <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 text-[var(--lp-paper)]">
      <TemplatePicker asLinks title="Templates" />
      <p className="mt-6 text-xs text-[var(--lp-mist)]/70">
        {templateCatalog.length} layouts · replace copy and drop in your screens
      </p>
    </div>
  </section>
);
