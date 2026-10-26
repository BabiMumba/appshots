/**
 * Canva-style text format bar — lives outside the screenshot frame.
 */

import type { MouseEvent as ReactMouseEvent } from "react";
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

interface TextFormatBarProps {
  label: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  align: TextAlign;
  uppercase: boolean;
  isEditing: boolean;
  onEditText: () => void;
  onAlign: (align: TextAlign) => void;
  onFontSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onToggleUppercase: () => void;
  onOpenFontPicker: () => void;
}

const btn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors";
const btnActive = "bg-white/15 text-white";

export const TextFormatBar = ({
  label,
  fontFamily,
  fontSize,
  textColor,
  align,
  uppercase,
  isEditing,
  onEditText,
  onAlign,
  onFontSizeChange,
  onTextColorChange,
  onToggleUppercase,
  onOpenFontPicker,
}: TextFormatBarProps) => {
  const keepFocus = (e: ReactMouseEvent) => e.preventDefault();

  const runFormat = (command: string, value?: string) => {
    if (!isEditing) {
      onEditText();
      window.setTimeout(() => executeCommand(command, value), 0);
      return;
    }
    executeCommand(command, value);
  };

  const safeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(textColor)
    ? textColor
    : "#ffffff";

  return (
    <div
      className="flex items-center gap-1 px-3 h-12 border-b border-white/10 bg-[#161616] overflow-x-auto"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="text-[11px] uppercase tracking-wide text-gray-500 mr-2 shrink-0">
        {label}
      </span>

      <button
        type="button"
        title={isEditing ? "Editing on canvas" : "Edit on canvas (double-click or Enter)"}
        className={`${btn} ${isEditing ? btnActive : ""} gap-1 w-auto px-2`}
        onClick={onEditText}
      >
        <Type className="w-3.5 h-3.5" />
        <span className="text-xs">{isEditing ? "Editing" : "Edit"}</span>
      </button>

      <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

      <button
        type="button"
        title="Change font"
        className={`${btn} w-auto max-w-[160px] px-2.5 gap-1.5 border border-white/10`}
        onClick={onOpenFontPicker}
      >
        <CaseSensitive className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-medium truncate">{fontFamily}</span>
      </button>

      <div className="flex items-center rounded-md border border-white/10 bg-black/20 shrink-0">
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
          className="w-12 h-8 text-xs text-center bg-transparent text-gray-100 border-x border-white/10 outline-none"
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

      <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

      <button
        type="button"
        title="Bold"
        className={btn}
        onMouseDown={keepFocus}
        onClick={() => runFormat("bold")}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Italic"
        className={btn}
        onMouseDown={keepFocus}
        onClick={() => runFormat("italic")}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Underline"
        className={btn}
        onMouseDown={keepFocus}
        onClick={() => runFormat("underline")}
      >
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Uppercase"
        className={`${btn} w-auto px-2 text-[11px] font-semibold ${uppercase ? btnActive : ""}`}
        onClick={onToggleUppercase}
      >
        AA
      </button>

      <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

      <button
        type="button"
        title="Align left"
        className={`${btn} ${align === "left" ? btnActive : ""}`}
        onClick={() => onAlign("left")}
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Align center"
        className={`${btn} ${align === "center" ? btnActive : ""}`}
        onClick={() => onAlign("center")}
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Align right"
        className={`${btn} ${align === "right" ? btnActive : ""}`}
        onClick={() => onAlign("right")}
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
