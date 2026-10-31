/**
 * Toolbar — screenshot strip tools, or feature-graphic artboard tools.
 * Compact + container-aware so phone mode fits beside both sidebars.
 */

import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  Type,
  Square,
  Sun,
  Moon,
  Magnet,
} from "lucide-react";
import {
  CanvasZoomControls,
  type CanvasZoomValue,
} from "./CanvasZoomControls";
import {
  applyUiTheme,
  readUiTheme,
  toggleUiTheme,
  type UiTheme,
} from "../../lib/ui-theme";
import { LocaleBar } from "../Locale/LocaleBar";

interface ToolbarProps {
  mode?: "screenshot" | "feature";
  onAddScreenshot: () => void;
  onAddText: () => void;
  onAddShape?: () => void;
  onDuplicateScreenshot: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  screenshotCount: number;
  zoom?: CanvasZoomValue;
  fitScale?: number;
  onZoomChange?: (zoom: CanvasZoomValue) => void;
  snapEnabled?: boolean;
  onSnapEnabledChange?: (enabled: boolean) => void;
  locales?: string[];
  activeLocale?: string;
  onSelectLocale?: (code: string) => void;
  onAddLocale?: (code: string) => void;
  onRemoveLocale?: (code: string) => void;
  onReplacePrimaryLocale?: (code: string) => void;
}

export const Toolbar = ({
  mode = "screenshot",
  onAddScreenshot,
  onAddText,
  onAddShape,
  onDuplicateScreenshot,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  screenshotCount,
  zoom = "fit",
  fitScale = 1,
  onZoomChange,
  snapEnabled = true,
  onSnapEnabledChange,
  locales = ["en"],
  activeLocale = "en",
  onSelectLocale,
  onAddLocale,
  onRemoveLocale,
  onReplacePrimaryLocale,
}: ToolbarProps) => {
  const isFeature = mode === "feature";
  const [theme, setTheme] = useState<UiTheme>(() => readUiTheme());

  useEffect(() => {
    applyUiTheme(theme);
  }, [theme]);

  const chip =
    "inline-flex items-center gap-1.5 bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)] text-[var(--ed-fg)] text-sm font-medium px-2.5 @[820px]/canvas:px-3 py-1.5 rounded-md transition-colors shrink-0";
  const iconBtn =
    "inline-flex items-center gap-1 px-1.5 @[820px]/canvas:px-2 py-1.5 rounded-md text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] disabled:opacity-30 disabled:pointer-events-none shrink-0";
  const labelClass = "hidden @[720px]/canvas:inline";

  return (
    <div className="h-14 shrink-0 border-b border-[var(--ed-border)] bg-[var(--ed-toolbar)] text-[var(--ed-fg)] min-w-0">
      <div className="h-full flex items-center gap-1.5 @[820px]/canvas:gap-2.5 px-2 @[820px]/canvas:px-3 overflow-x-auto overflow-y-hidden [scrollbar-width:thin]">
        {!isFeature && (
          <button
            onClick={onAddScreenshot}
            className="inline-flex items-center gap-1.5 bg-[var(--ed-inverse)] hover:opacity-90 text-[var(--ed-inverse-fg)] text-sm font-medium px-2.5 @[820px]/canvas:px-3 py-1.5 rounded-md transition-opacity shrink-0"
            title="Add screen"
          >
            <Plus className="w-4 h-4" />
            <span className={labelClass}>Screen</span>
          </button>
        )}

        <button onClick={onAddText} className={chip} title="Add text (T)">
          <Type className="w-4 h-4" />
          <span className={labelClass}>Text</span>
        </button>

        {onAddShape && (
          <button
            onClick={onAddShape}
            className={chip}
            title="Add floating shape block"
          >
            <Square className="w-4 h-4" />
            <span className={labelClass}>Shape</span>
          </button>
        )}

        {!isFeature && (
          <button
            onClick={onDuplicateScreenshot}
            title="Duplicate the active screen"
            className={chip}
          >
            <Copy className="w-4 h-4" />
            <span className={labelClass}>Duplicate</span>
          </button>
        )}

        <div className="w-px h-6 bg-[var(--ed-border)] shrink-0" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={iconBtn}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={iconBtn}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {!isFeature && (
          <>
            <div className="w-px h-6 bg-[var(--ed-border)] shrink-0" />
            <button
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              title="Move screenshot left"
              className="p-1.5 rounded-md text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] disabled:opacity-30 disabled:pointer-events-none shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onMoveRight}
              disabled={!canMoveRight}
              title="Move screenshot right"
              className="p-1.5 rounded-md text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] disabled:opacity-30 disabled:pointer-events-none shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="flex-1 min-w-2" />

        {/* Right cluster — shrink-0 so lang never collides with zoom */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onSelectLocale && onAddLocale && onRemoveLocale && (
            <LocaleBar
              locales={locales}
              activeLocale={activeLocale}
              onSelect={onSelectLocale}
              onAdd={onAddLocale}
              onRemove={onRemoveLocale}
              onReplacePrimary={onReplacePrimaryLocale}
            />
          )}

          {onSnapEnabledChange && (
            <button
              type="button"
              title={
                snapEnabled
                  ? "Snap on — hold Alt to move freely"
                  : "Snap off — click to align to edges & centers"
              }
              aria-pressed={snapEnabled}
              onClick={() => onSnapEnabledChange(!snapEnabled)}
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
                snapEnabled
                  ? "border-sky-500/60 bg-sky-500/10 text-sky-400"
                  : "border-[var(--ed-border)] text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] hover:text-[var(--ed-fg)]"
              }`}
            >
              <Magnet className="w-4 h-4" />
            </button>
          )}

          {onZoomChange && (
            <CanvasZoomControls
              zoom={zoom}
              fitScale={fitScale}
              onChange={onZoomChange}
            />
          )}

          <button
            type="button"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--ed-border)] text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] hover:text-[var(--ed-fg)] transition-colors"
            onClick={() => setTheme((t) => toggleUiTheme(t))}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <span className="hidden @[960px]/canvas:inline text-xs text-[var(--ed-fg-muted)] whitespace-nowrap shrink-0 pr-0.5">
            {isFeature
              ? "Feature · 1024×500"
              : `${screenshotCount} screen${screenshotCount !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
    </div>
  );
};
