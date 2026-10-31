/**
 * Contextual bar when the artboard (no element) is focused — background shortcuts.
 * Gradient chips + custom colors match the right sidebar Appearance panel.
 */

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import type { CustomGradient, GradientPreset, Screenshot } from "../../types";
import { DEFAULT_CUSTOM_GRADIENT } from "../../lib/gradient-style";
import {
  formatBarBtn,
  formatBarBtnActive,
  formatBarLabel,
  formatBarRoot,
  formatBarSep,
} from "./format-bar-styles";

interface CanvasFormatBarProps {
  screenshot: Screenshot;
  gradientPresets: GradientPreset[];
  onUpdate: (updates: Partial<Screenshot>) => void;
  onIngestImage: (file: File) => Promise<string>;
}

export const CanvasFormatBar = ({
  screenshot,
  gradientPresets,
  onUpdate,
  onIngestImage,
}: CanvasFormatBarProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const mode = screenshot.backgroundMode;
  const custom: CustomGradient =
    screenshot.customGradient ?? DEFAULT_CUSTOM_GRADIENT;
  // Keep custom draft when switching solid/preset; active when no preset id
  const usingCustom =
    Boolean(screenshot.customGradient) && !screenshot.gradientPresetId;
  const safeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
    screenshot.backgroundColor,
  )
    ? screenshot.backgroundColor
    : "#8b5cf6";

  const setCustom = (updates: Partial<CustomGradient>) => {
    onUpdate({
      backgroundMode: "gradient",
      customGradient: { ...custom, ...updates },
      gradientPresetId: null,
    });
  };

  return (
    <div className={formatBarRoot} onMouseDown={(e) => e.stopPropagation()}>
      <span className={formatBarLabel}>Canvas</span>

      <div className="flex gap-0.5 p-0.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-bar-well)] shrink-0">
        {(
          [
            ["solid", "Solid"],
            ["gradient", "Gradient"],
            ["image", "Image"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`px-2.5 h-7 rounded text-[11px] font-medium ${
              mode === id
                ? formatBarBtnActive
                : "text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
            }`}
            onClick={() => {
              if (id === "solid") {
                onUpdate({ backgroundMode: "solid" });
              } else if (id === "gradient") {
                onUpdate({
                  backgroundMode: "gradient",
                  gradientPresetId:
                    screenshot.gradientPresetId ??
                    (screenshot.customGradient
                      ? null
                      : gradientPresets[0]?.id ?? null),
                });
              } else {
                onUpdate({ backgroundMode: "image" });
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={formatBarSep} />

      {mode === "solid" && (
        <label
          className={`${formatBarBtn} relative cursor-pointer`}
          title="Background color"
        >
          <span
            className="h-4 w-4 rounded-full border border-[var(--ed-border)]"
            style={{ background: safeColor }}
          />
          <input
            type="color"
            value={safeColor}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
        </label>
      )}

      {mode === "gradient" && (
        <>
          <div className="flex items-center gap-1 shrink-0">
            {gradientPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                className={`h-7 w-7 rounded-md shrink-0 border ${
                  !usingCustom && screenshot.gradientPresetId === preset.id
                    ? "ring-2 ring-sky-500 border-transparent"
                    : "border-[var(--ed-border)]"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                }}
                onClick={() =>
                  onUpdate({
                    backgroundMode: "gradient",
                    gradientPresetId: preset.id,
                  })
                }
              />
            ))}
          </div>

          <div className={formatBarSep} />

          <span className="text-[10px] text-[var(--ed-fg-muted)] shrink-0">
            Custom
          </span>
          <label className={`${formatBarBtn} relative cursor-pointer`} title="Start">
            <span
              className="h-4 w-4 rounded-full border border-[var(--ed-border)]"
              style={{ background: custom.from }}
            />
            <input
              type="color"
              value={custom.from}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setCustom({ from: e.target.value })}
            />
          </label>
          <label className={`${formatBarBtn} relative cursor-pointer`} title="Mid">
            <span
              className="h-4 w-4 rounded-full border border-[var(--ed-border)]"
              style={{ background: custom.via ?? "#ffffff" }}
            />
            <input
              type="color"
              value={custom.via ?? "#ffffff"}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setCustom({ via: e.target.value })}
            />
          </label>
          <label className={`${formatBarBtn} relative cursor-pointer`} title="End">
            <span
              className="h-4 w-4 rounded-full border border-[var(--ed-border)]"
              style={{ background: custom.to }}
            />
            <input
              type="color"
              value={custom.to}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setCustom({ to: e.target.value })}
            />
          </label>
          {usingCustom && (
            <span
              className="h-5 w-10 rounded border border-[var(--ed-border)] shrink-0"
              title="Custom preview"
              style={{
                background: custom.via
                  ? `linear-gradient(${custom.angle}deg, ${custom.from}, ${custom.via}, ${custom.to})`
                  : `linear-gradient(${custom.angle}deg, ${custom.from}, ${custom.to})`,
              }}
            />
          )}
        </>
      )}

      {mode === "image" && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void onIngestImage(file)
                .then((src) =>
                  onUpdate({ backgroundMode: "image", backgroundImage: src }),
                )
                .catch((err) =>
                  console.warn("Background image ingest failed:", err),
                );
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className={`${formatBarBtn} w-auto px-2 gap-1`}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span className="text-xs">
              {screenshot.backgroundImage ? "Replace" : "Upload"}
            </span>
          </button>
        </>
      )}
    </div>
  );
};
