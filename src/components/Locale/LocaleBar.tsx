/**
 * Language combobox — one compact trigger (flag + name), full dropdown.
 * Fixed-position menu so toolbar overflow never clips “Add language”.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import {
  formatLocaleOption,
  formatLocaleTrigger,
  getLocaleInfo,
  STORE_LOCALES,
} from "../../lib/locales";
import { LocaleFlag } from "./LocaleFlag";

interface LocaleBarProps {
  locales: string[];
  activeLocale: string;
  onSelect: (code: string) => void;
  onAdd: (code: string) => void;
  onRemove: (code: string) => void;
  onReplacePrimary?: (code: string) => void;
}

type MenuMode = "main" | "add";

export const LocaleBar = ({
  locales,
  activeLocale,
  onSelect,
  onAdd,
  onRemove,
  onReplacePrimary,
}: LocaleBarProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>("main");
  const [query, setQuery] = useState("");
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 280,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const active = getLocaleInfo(activeLocale);

  const placeMenu = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 300;
    const left = Math.min(
      Math.max(8, r.right - width),
      window.innerWidth - width - 8,
    );
    setMenuPos({
      top: r.bottom + 6,
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
    const onWin = () => placeMenu();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
      setMode("main");
      setQuery("");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMode("main");
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const available = STORE_LOCALES.filter((l) => {
    if (locales.includes(l.code)) return false;
    if (!q) return true;
    return (
      l.label.toLowerCase().includes(q) ||
      l.nativeLabel.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Languages"
          className="fixed z-[10000] rounded-xl border border-[var(--ed-border)] bg-[var(--ed-panel)] text-[var(--ed-fg)] shadow-2xl overflow-hidden"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
          }}
        >
          {mode === "main" ? (
            <>
              <div className="px-3 pt-3 pb-2 border-b border-[var(--ed-border)]">
                <p className="text-[11px] font-medium text-[var(--ed-fg)]">
                  Listing language
                </p>
                <p className="text-[10px] text-[var(--ed-fg-muted)] mt-0.5 leading-snug">
                  Same layout for every language — only the text changes.
                </p>
              </div>

              <ul className="max-h-52 overflow-y-auto py-1">
                {locales.map((code) => {
                  const info = getLocaleInfo(code);
                  const selected = code === activeLocale;
                  return (
                    <li key={code} className="px-1">
                      <div
                        className={`flex items-center gap-1 rounded-lg ${
                          selected ? "bg-[var(--ed-muted)]" : ""
                        }`}
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className="flex flex-1 items-center gap-2.5 min-w-0 px-2.5 py-2 text-left text-sm hover:bg-[var(--ed-muted)] rounded-lg"
                          onClick={() => {
                            onSelect(code);
                            setOpen(false);
                            setMode("main");
                          }}
                        >
                          <LocaleFlag
                            countryCode={info.flag}
                            title={info.label}
                          />
                          <span className="flex-1 truncate">
                            {formatLocaleOption(code)}
                            <span className="text-[var(--ed-fg-muted)]">
                              {" "}
                              ({code})
                            </span>
                          </span>
                          {selected && (
                            <Check className="w-4 h-4 shrink-0 text-sky-500" />
                          )}
                        </button>
                        {locales.length > 1 && (
                          <button
                            type="button"
                            title={`Remove ${info.label}`}
                            aria-label={`Remove ${info.label}`}
                            className="p-2 mr-1 rounded-md text-[var(--ed-fg-muted)] hover:text-red-400 hover:bg-[var(--ed-muted)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(code);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="p-2 border-t border-[var(--ed-border)] space-y-1.5">
                {locales.length === 1 && onReplacePrimary && (
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-[var(--ed-border)] text-[var(--ed-fg)] text-sm font-medium hover:bg-[var(--ed-muted)] transition-colors"
                    onClick={() => {
                      setMode("add");
                      setQuery("");
                    }}
                  >
                    Change language…
                  </button>
                )}
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors"
                  onClick={() => {
                    setMode("add");
                    setQuery("");
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add language
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-[var(--ed-border)]">
                <button
                  type="button"
                  className="text-xs text-sky-500 hover:underline shrink-0"
                  onClick={() => {
                    setMode("main");
                    setQuery("");
                  }}
                >
                  ← Back
                </button>
                <p className="text-[11px] font-medium text-[var(--ed-fg)] truncate">
                  {locales.length === 1 && onReplacePrimary
                    ? "Choose language"
                    : "Add language"}
                </p>
              </div>

              <div className="p-2 border-b border-[var(--ed-border)]">
                <label className="relative block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ed-fg-muted)]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search French, Deutsch, 日本語…"
                    className="w-full rounded-lg border border-[var(--ed-border)] bg-[var(--ed-muted)] pl-8 pr-3 py-2 text-sm text-[var(--ed-fg)] outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </label>
              </div>

              <ul className="max-h-64 overflow-y-auto py-1">
                {available.length === 0 && (
                  <li className="px-3 py-6 text-center text-xs text-[var(--ed-fg-muted)]">
                    No matching language
                  </li>
                )}
                {available.map((l) => (
                  <li key={l.code} className="px-1">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[var(--ed-muted)]"
                      onClick={() => {
                        if (locales.length === 1 && onReplacePrimary) {
                          onReplacePrimary(l.code);
                        } else {
                          onAdd(l.code);
                        }
                        setOpen(false);
                        setMode("main");
                        setQuery("");
                      }}
                    >
                      <LocaleFlag countryCode={l.flag} title={l.label} />
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">
                          {l.label}
                        </span>
                        <span className="block truncate text-[11px] text-[var(--ed-fg-muted)]">
                          {l.nativeLabel} · {l.code}
                        </span>
                      </span>
                      {locales.length === 1 && onReplacePrimary ? (
                        <Check className="w-3.5 h-3.5 text-[var(--ed-fg-muted)] shrink-0 opacity-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[var(--ed-fg-muted)] shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Listing language — click to switch or add"
        onClick={() => {
          setOpen((v) => !v);
          setMode("main");
          setQuery("");
        }}
        className={`inline-flex h-8 max-w-[11.5rem] items-center gap-2 rounded-lg border px-2 text-xs font-medium transition-colors ${
          open
            ? "border-sky-500 bg-sky-500/10 text-[var(--ed-fg)]"
            : "border-[var(--ed-border)] bg-[var(--ed-muted)] text-[var(--ed-fg)] hover:bg-[var(--ed-muted-hover)]"
        }`}
      >
        <LocaleFlag countryCode={active.flag} title={active.label} />
        <span className="truncate">{formatLocaleTrigger(activeLocale)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-[var(--ed-fg-muted)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {menu}
    </div>
  );
};
