/**
 * Canva-style text format bar — lives outside the screenshot frame.
 */

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Type,
  CaseSensitive,
} from "lucide-react";
import type { TextAlign } from "../../types";
import { executeCommand } from "../RichTextEditor/utils";
import {
  getContentFormatState,
  getSelectionFormatState,
  stripInlineBold,
  type FormatTriState,
  type InlineFormatState,
} from "../../lib/text-format-state";
import {
  formatBarBtn,
  formatBarBtnActive,
  formatBarLabel,
  formatBarRoot,
  formatBarSep,
  formatBarWell,
} from "./format-bar-styles";

interface TextFormatBarProps {
  label: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 600 | 700;
  textColor: string;
  align: TextAlign;
  uppercase: boolean;
  isEditing: boolean;
  onEditText: () => void;
  onAlign: (align: TextAlign) => void;
  onFontSizeChange: (size: number) => void;
  onFontWeightChange: (weight: 600 | 700) => void;
  onContentChange: (html: string) => void;
  onTextColorChange: (color: string) => void;
  onToggleUppercase: () => void;
  onOpenFontPicker: () => void;
}

const btn = formatBarBtn;
const btnActive = formatBarBtnActive;
const btnMixed =
  "bg-[var(--ed-accent-soft)] text-[var(--ed-accent-fg)] ring-1 ring-dashed ring-sky-500/40";

const formatClass = (state: FormatTriState) => {
  if (state === "on") return btnActive;
  if (state === "mixed") return btnMixed;
  return "";
};

export const TextFormatBar = ({
  label,
  content,
  fontFamily,
  fontSize,
  fontWeight,
  textColor,
  align,
  uppercase,
  isEditing,
  onEditText,
  onAlign,
  onFontSizeChange,
  onFontWeightChange,
  onContentChange,
  onTextColorChange,
  onToggleUppercase,
  onOpenFontPicker,
}: TextFormatBarProps) => {
  const keepFocus = (e: ReactMouseEvent) => e.preventDefault();
  const pendingCommandRef = useRef<{ command: string; value?: string } | null>(
    null,
  );
  const [liveFormat, setLiveFormat] = useState<InlineFormatState>(() =>
    getContentFormatState(content, fontWeight),
  );

  const blockFormat = getContentFormatState(content, fontWeight);
  const format = isEditing ? liveFormat : blockFormat;

  // Track caret / selection styles while editing on canvas
  useEffect(() => {
    if (!isEditing) {
      setLiveFormat(getContentFormatState(content, fontWeight));
      return;
    }

    const update = () => {
      const editor = document.querySelector(
        '[data-inline-editing="true"] [contenteditable="true"]',
      ) as HTMLElement | null;
      setLiveFormat(getSelectionFormatState(editor));
    };

    update();
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [isEditing, content, fontWeight]);

  // Apply format commands queued before contentEditable mounted
  useEffect(() => {
    if (!isEditing || !pendingCommandRef.current) return;
    const pending = pendingCommandRef.current;
    pendingCommandRef.current = null;
    const id = window.requestAnimationFrame(() => {
      const editor = document.querySelector(
        '[data-inline-editing="true"] [contenteditable="true"]',
      ) as HTMLElement | null;
      editor?.focus();
      executeCommand(pending.command, pending.value);
      setLiveFormat(getSelectionFormatState(editor));
    });
    return () => window.cancelAnimationFrame(id);
  }, [isEditing]);

  const runInlineFormat = (command: string, value?: string) => {
    if (!isEditing) {
      pendingCommandRef.current = { command, value };
      onEditText();
      return;
    }
    const editor = document.querySelector(
      '[data-inline-editing="true"] [contenteditable="true"]',
    ) as HTMLElement | null;
    editor?.focus();
    executeCommand(command, value);
    setLiveFormat(getSelectionFormatState(editor));
  };

  /** Block-level bold when not editing; selection bold when editing. */
  const toggleBold = () => {
    if (isEditing) {
      runInlineFormat("bold");
      return;
    }
    // Whole block: base weight drives the B highlight; strip inline marks when off
    if (format.bold === "on") {
      onFontWeightChange(600);
      onContentChange(stripInlineBold(content));
    } else {
      onFontWeightChange(700);
    }
  };

  const safeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(textColor)
    ? textColor
    : "#ffffff";

  return (
    <div className={formatBarRoot} onMouseDown={(e) => e.stopPropagation()}>
      <span className={formatBarLabel}>{label}</span>

      <button
        type="button"
        title={
          isEditing
            ? "Editing on canvas — Esc to finish"
            : "Edit text (click again on canvas, or press Enter)"
        }
        aria-pressed={isEditing}
        className={`${btn} ${isEditing ? btnActive : ""} gap-1 w-auto px-2`}
        onClick={onEditText}
      >
        <Type className="w-3.5 h-3.5" />
        <span className="text-xs">{isEditing ? "Editing" : "Edit"}</span>
      </button>

      <div className={formatBarSep} />

      <button
        type="button"
        title="Change font"
        className={`${btn} w-auto max-w-[160px] px-2.5 gap-1.5 border border-[var(--ed-border)]`}
        onClick={onOpenFontPicker}
      >
        <CaseSensitive className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-medium truncate">{fontFamily}</span>
      </button>

      <div className={formatBarWell}>
        <button
          type="button"
          title="Smaller"
          className={btn}
          onClick={() => onFontSizeChange(Math.max(24, fontSize - 4))}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          min={24}
          max={200}
          value={Math.round(fontSize)}
          onChange={(e) =>
            onFontSizeChange(Number(e.target.value) || fontSize)
          }
          className="w-12 h-8 text-xs text-center bg-transparent text-[var(--ed-fg)] border-x border-[var(--ed-border)] outline-none"
          title="Font size"
        />
        <button
          type="button"
          title="Larger"
          className={btn}
          onClick={() => onFontSizeChange(Math.min(200, fontSize + 4))}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <label
        className={`${btn} relative cursor-pointer`}
        title="Text color"
        onMouseDown={keepFocus}
      >
        <span
          className="text-sm font-bold leading-none"
          style={{ color: safeColor }}
        >
          A
        </span>
        <span
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full"
          style={{ background: safeColor }}
        />
        <input
          type="color"
          value={safeColor}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const color = e.target.value;
            onTextColorChange(color);
            if (isEditing) executeCommand("foreColor", color);
          }}
        />
      </label>

      <div className={formatBarSep} />

      <button
        type="button"
        title={
          format.bold === "mixed"
            ? "Bold (mixed — some characters bold)"
            : "Bold"
        }
        aria-pressed={format.bold === "on"}
        aria-label="Bold"
        className={`${btn} ${formatClass(format.bold)}`}
        onMouseDown={keepFocus}
        onClick={toggleBold}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title={
          format.italic === "mixed" ? "Italic (mixed)" : "Italic"
        }
        aria-pressed={format.italic === "on"}
        aria-label="Italic"
        className={`${btn} ${formatClass(format.italic)}`}
        onMouseDown={keepFocus}
        onClick={() => runInlineFormat("italic")}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title={
          format.underline === "mixed" ? "Underline (mixed)" : "Underline"
        }
        aria-pressed={format.underline === "on"}
        aria-label="Underline"
        className={`${btn} ${formatClass(format.underline)}`}
        onMouseDown={keepFocus}
        onClick={() => runInlineFormat("underline")}
      >
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Uppercase"
        aria-pressed={uppercase}
        className={`${btn} w-auto px-2 text-[11px] font-semibold ${uppercase ? btnActive : ""}`}
        onClick={onToggleUppercase}
      >
        AA
      </button>

      <div className={formatBarSep} />

      <button
        type="button"
        title="Align left"
        aria-pressed={align === "left"}
        className={`${btn} ${align === "left" ? btnActive : ""}`}
        onClick={() => onAlign("left")}
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Align center"
        aria-pressed={align === "center"}
        className={`${btn} ${align === "center" ? btnActive : ""}`}
        onClick={() => onAlign("center")}
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Align right"
        aria-pressed={align === "right"}
        className={`${btn} ${align === "right" ? btnActive : ""}`}
        onClick={() => onAlign("right")}
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
