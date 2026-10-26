/**
 * BackgroundPicker Component
 *
 * Solid / gradient backgrounds with presets + custom Photoshop-like stops.
 */

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
  const custom: CustomGradient =
    screenshot.customGradient ?? DEFAULT_CUSTOM_GRADIENT;
  const usingCustom = Boolean(screenshot.customGradient);

  const setCustom = (updates: Partial<CustomGradient>) => {
    onUpdateScreenshot({
      backgroundMode: "gradient",
      customGradient: { ...custom, ...updates },
      gradientPresetId: null,
    });
  };

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">Background</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() =>
              onUpdateScreenshot({
                backgroundMode: "solid",
                customGradient: null,
              })
            }
            className={`${STYLES.modeButton} ${
              screenshot.backgroundMode === "solid"
                ? STYLES.modeButtonActive
                : STYLES.modeButtonInactive
            }`}
          >
            Solid
          </button>
          <button
            onClick={() =>
              onUpdateScreenshot({
                backgroundMode: "gradient",
                gradientPresetId:
                  screenshot.gradientPresetId ?? gradientPresets[0].id,
              })
            }
            className={`${STYLES.modeButton} ${
              screenshot.backgroundMode === "gradient"
                ? STYLES.modeButtonActive
                : STYLES.modeButtonInactive
            }`}
          >
            Gradient
          </button>
        </div>

        {screenshot.backgroundMode === "solid" ? (
          <input
            type="color"
            value={screenshot.backgroundColor}
            onChange={(e) =>
              onUpdateScreenshot({ backgroundColor: e.target.value })
            }
            className={STYLES.colorInput}
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.id}
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
      </div>
    </div>
  );
};
