/**
 * Fit / zoom controls for the feature-graphic artboard (Canva-like).
 */

import { Minus, Plus, Maximize2 } from "lucide-react";

export type CanvasZoomValue = "fit" | number;

interface CanvasZoomControlsProps {
  zoom: CanvasZoomValue;
  /** Resolved scale when zoom === "fit" */
  fitScale: number;
  onChange: (zoom: CanvasZoomValue) => void;
  min?: number;
  max?: number;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2];

export const resolveZoomScale = (
  zoom: CanvasZoomValue,
  fitScale: number,
): number => (zoom === "fit" ? fitScale : zoom);

export const stepZoom = (
  current: number,
  direction: 1 | -1,
  min: number,
  max: number,
): number => {
  if (direction > 0) {
    const next = ZOOM_STEPS.find((s) => s > current + 0.001);
    return clamp(next ?? current * 1.25, min, max);
  }
  const prev = [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001);
  return clamp(prev ?? current / 1.25, min, max);
};

export const CanvasZoomControls = ({
  zoom,
  fitScale,
  onChange,
  min = 0.2,
  max = 2,
}: CanvasZoomControlsProps) => {
  const scale = resolveZoomScale(zoom, fitScale);
  const label =
    zoom === "fit" ? `Fit · ${Math.round(scale * 100)}%` : `${Math.round(scale * 100)}%`;

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-black/30 p-0.5">
      <button
        type="button"
        title="Zoom out"
        className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-white/10 hover:text-white"
        onClick={() =>
          onChange(stepZoom(scale, -1, min, max))
        }
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Toggle fit / 100%"
        className="min-w-[5.5rem] px-2 h-7 rounded text-[11px] font-medium text-gray-200 hover:bg-white/10"
        onClick={() => onChange(zoom === "fit" ? 1 : "fit")}
      >
        {label}
      </button>
      <button
        type="button"
        title="Zoom in"
        className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-white/10 hover:text-white"
        onClick={() =>
          onChange(stepZoom(scale, 1, min, max))
        }
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Fit artboard in view"
        className={`inline-flex h-7 w-7 items-center justify-center rounded ${
          zoom === "fit"
            ? "bg-white/15 text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => onChange("fit")}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
