import { gradientPresets } from "../constants";
import type { CustomGradient, Screenshot } from "../types";

export const DEFAULT_CUSTOM_GRADIENT: CustomGradient = {
  from: "#ff7e5f",
  via: "#feb47b",
  to: "#ff7e5f",
  angle: 180,
};

export function resolveGradientColors(screenshot: Screenshot): {
  from: string;
  via: string | null;
  to: string;
  angle: number;
} {
  // Preset id wins when set; otherwise use saved custom (kept across solid/image).
  if (!screenshot.gradientPresetId && screenshot.customGradient) {
    return {
      from: screenshot.customGradient.from,
      via: screenshot.customGradient.via,
      to: screenshot.customGradient.to,
      angle: screenshot.customGradient.angle,
    };
  }

  const preset =
    gradientPresets.find((p) => p.id === screenshot.gradientPresetId) ??
    gradientPresets[0];

  return {
    from: preset.from,
    via: preset.via ?? null,
    to: preset.to,
    angle: 180,
  };
}

export function getBackgroundCss(screenshot: Screenshot): string {
  if (screenshot.backgroundMode === "image" && screenshot.backgroundImage) {
    return `center / cover no-repeat url(${JSON.stringify(screenshot.backgroundImage)}), ${screenshot.backgroundColor}`;
  }
  if (screenshot.backgroundMode === "gradient") {
    const { from, via, to, angle } = resolveGradientColors(screenshot);
    if (via) {
      return `linear-gradient(${angle}deg, ${from}, ${via}, ${to})`;
    }
    return `linear-gradient(${angle}deg, ${from}, ${to})`;
  }
  return screenshot.backgroundColor;
}

/** Convert CSS angle to canvas linear-gradient endpoints. */
export function gradientEndpoints(
  width: number,
  height: number,
  angleDeg: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const angle = ((angleDeg % 360) + 360) % 360;
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const length = Math.sqrt(width * width + height * height) / 2;
  const dx = Math.cos(rad) * length;
  const dy = Math.sin(rad) * length;
  return {
    x0: cx - dx,
    y0: cy - dy,
    x1: cx + dx,
    y1: cy + dy,
  };
}
