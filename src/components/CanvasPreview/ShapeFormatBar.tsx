/**
 * Contextual format bar when a shape block is selected.
 */

import { useRef } from "react";
import { Circle, ImagePlus, Square, RectangleHorizontal } from "lucide-react";
import type { ShapeForm, ShapeOverlay } from "../../types";
import { SHAPE_FORMS } from "../../lib/shapes";
import {
  formatBarBtn,
  formatBarBtnActive,
  formatBarLabel,
  formatBarRoot,
  formatBarSep,
} from "./format-bar-styles";

interface ShapeFormatBarProps {
  shape: ShapeOverlay;
  onUpdate: (updates: Partial<ShapeOverlay>) => void;
  onSetFillImage: (file: File) => void;
  onEnterCrop?: () => void;
}

const formIcon = (form: ShapeForm) => {
  if (form === "circle") return <Circle className="w-3.5 h-3.5" />;
  if (form === "square") return <Square className="w-3.5 h-3.5" />;
  if (form === "rounded")
    return <RectangleHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />;
  return <RectangleHorizontal className="w-3.5 h-3.5" />;
};

export const ShapeFormatBar = ({
  shape,
  onUpdate,
  onSetFillImage,
  onEnterCrop,
}: ShapeFormatBarProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const safeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(shape.fillColor)
    ? shape.fillColor
    : "#ffffff";

  return (
    <div className={formatBarRoot} onMouseDown={(e) => e.stopPropagation()}>
      <span className={formatBarLabel}>Shape</span>

      <div className="flex items-center gap-0.5 shrink-0">
        {SHAPE_FORMS.map((f) => (
          <button
            key={f.id}
            type="button"
            title={f.label}
            aria-pressed={shape.form === f.id}
            className={`${formatBarBtn} ${shape.form === f.id ? formatBarBtnActive : ""}`}
            onClick={() => onUpdate({ form: f.id })}
          >
            {formIcon(f.id)}
          </button>
        ))}
      </div>

      <div className={formatBarSep} />

      <div className="flex gap-0.5 p-0.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-bar-well)] shrink-0">
        {(["color", "image"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`px-2.5 h-7 rounded text-[11px] font-medium capitalize ${
              shape.fillMode === mode
                ? formatBarBtnActive
                : "text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
            }`}
            onClick={() => onUpdate({ fillMode: mode })}
          >
            {mode}
          </button>
        ))}
      </div>

      {shape.fillMode === "color" ? (
        <label
          className={`${formatBarBtn} relative cursor-pointer`}
          title="Fill color"
        >
          <span
            className="h-4 w-4 rounded-full border border-[var(--ed-border)]"
            style={{ background: safeColor }}
          />
          <input
            type="color"
            value={safeColor}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
          />
        </label>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSetFillImage(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            title="Upload / replace fill image"
            className={`${formatBarBtn} w-auto px-2 gap-1`}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span className="text-xs">
              {shape.fillImage ? "Replace" : "Image"}
            </span>
          </button>
          {shape.fillImage && onEnterCrop && (
            <button
              type="button"
              title="Double-click shape or press to reposition image"
              className={`${formatBarBtn} w-auto px-2 text-xs`}
              onClick={onEnterCrop}
            >
              Reposition
            </button>
          )}
        </>
      )}

      {shape.form !== "circle" && (
        <>
          <div className={formatBarSep} />
          <label className="flex items-center gap-1.5 text-[11px] text-[var(--ed-fg-muted)] shrink-0">
            Radius
            <input
              type="range"
              min={0}
              max={50}
              value={shape.cornerRadius}
              onChange={(e) =>
                onUpdate({ cornerRadius: Number(e.target.value) })
              }
              className="w-20 accent-sky-500"
            />
          </label>
        </>
      )}

      <div className={formatBarSep} />
      <label className="flex items-center gap-1.5 text-[11px] text-[var(--ed-fg-muted)] shrink-0">
        Opacity
        <input
          type="range"
          min={0}
          max={100}
          value={shape.opacity ?? 100}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="w-20 accent-sky-500"
        />
      </label>
    </div>
  );
};
