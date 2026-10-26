/**
 * BackgroundPicker — solid / gradient / image.
 */

import { useRef } from "react";
import type { Screenshot, GradientPreset, CustomGradient } from "../../types";
import { DEFAULT_CUSTOM_GRADIENT } from "../../lib/gradient-style";
import { STYLES } from "./constants";

interface BackgroundPickerProps {
  screenshot: Screenshot;
  gradientPresets: GradientPreset[];
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
}

export const BackgroundPicker = ({
  screenshot,
  gradientPresets,
  onUpdateScreenshot,
}: BackgroundPickerProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const custom: CustomGradient =
    screenshot.customGradient ?? DEFAULT_CUSTOM_GRADIENT;
  const usingCustom = Boolean(screenshot.customGradient);
  const mode = screenshot.backgroundMode;

  const setCustom = (updates: Partial<CustomGradient>) => {
    onUpdateScreenshot({
      backgroundMode: "gradient",
      customGradient: { ...custom, ...updates },
      gradientPresetId: null,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpdateScreenshot({
          backgroundMode: "image",
          backgroundImage: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex gap-1 p-0.5 bg-[#2a2a2a] rounded-lg mb-2">
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
            onClick={() => {
              if (id === "solid") {
                onUpdateScreenshot({
                  backgroundMode: "solid",
                  customGradient: null,
                });
              } else if (id === "gradient") {
                onUpdateScreenshot({
                  backgroundMode: "gradient",
                  gradientPresetId:
                    screenshot.gradientPresetId ?? gradientPresets[0].id,
                });
              } else {
                onUpdateScreenshot({ backgroundMode: "image" });
              }
            }}
            className={`${STYLES.modeButton} ${
              mode === id
                ? STYLES.modeButtonActive
                : STYLES.modeButtonInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "solid" && (
        <input
          type="color"
          value={screenshot.backgroundColor}
          onChange={(e) =>
            onUpdateScreenshot({ backgroundColor: e.target.value })
          }
          className={STYLES.colorInput}
        />
      )}

      {mode === "gradient" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1">
            {gradientPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onUpdateScreenshot({
                    gradientPresetId: preset.id,
                    customGradient: null,
                  })
                }
                className={`${STYLES.gradientButton} ${
                  !usingCustom && screenshot.gradientPresetId === preset.id
                    ? STYLES.gradientButtonActive
                    : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                }}
                title={preset.label}
              />
            ))}
          </div>

          <div className="rounded-md bg-[#2a2a2a] p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-300">Custom gradient</span>
              <button
                type="button"
                className={`text-[10px] px-2 py-0.5 rounded ${
                  usingCustom
                    ? "bg-white text-black"
                    : "bg-[#3a3a3a] text-gray-300 hover:bg-[#444]"
                }`}
                onClick={() => setCustom({})}
              >
                {usingCustom ? "Active" : "Use custom"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="text-[10px] text-gray-400 space-y-1">
                Start
                <input
                  type="color"
                  value={custom.from}
                  onChange={(e) => setCustom({ from: e.target.value })}
                  className={STYLES.colorInput}
                />
              </label>
              <label className="text-[10px] text-gray-400 space-y-1">
                Mid
                <input
                  type="color"
                  value={custom.via ?? "#ffffff"}
                  onChange={(e) => setCustom({ via: e.target.value })}
                  className={STYLES.colorInput}
                />
              </label>
              <label className="text-[10px] text-gray-400 space-y-1">
                End
                <input
                  type="color"
                  value={custom.to}
                  onChange={(e) => setCustom({ to: e.target.value })}
                  className={STYLES.colorInput}
                />
              </label>
            </div>

            <label className="block text-[10px] text-gray-400">
              Angle {custom.angle}°
              <input
                type="range"
                min={0}
                max={360}
                value={custom.angle}
                onChange={(e) => setCustom({ angle: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </label>

            <div
              className="h-6 rounded"
              style={{
                background: custom.via
                  ? `linear-gradient(${custom.angle}deg, ${custom.from}, ${custom.via}, ${custom.to})`
                  : `linear-gradient(${custom.angle}deg, ${custom.from}, ${custom.to})`,
              }}
            />
          </div>
        </div>
      )}

      {mode === "image" && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={STYLES.uploadButton}
          >
            {screenshot.backgroundImage ? "Change image" : "Upload image"}
          </button>

          {screenshot.backgroundImage && (
            <>
              <div
                className="h-16 rounded-md border border-white/10 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${JSON.stringify(screenshot.backgroundImage)})`,
                }}
              />
              <label className="block text-[10px] text-gray-400">
                Fallback color
                <input
                  type="color"
                  value={screenshot.backgroundColor}
                  onChange={(e) =>
                    onUpdateScreenshot({ backgroundColor: e.target.value })
                  }
                  className={`${STYLES.colorInput} mt-1`}
                />
              </label>
              <button
                type="button"
                className="w-full text-xs text-gray-400 hover:text-white py-1"
                onClick={() =>
                  onUpdateScreenshot({
                    backgroundImage: null,
                    backgroundMode: "solid",
                  })
                }
              >
                Remove image
              </button>
            </>
          )}

          {!screenshot.backgroundImage && (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Upload a photo or texture — it fills the screen (cover).
            </p>
          )}
        </div>
      )}
    </div>
  );
};
