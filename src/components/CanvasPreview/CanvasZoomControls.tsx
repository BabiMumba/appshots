/**
 * Fit / zoom controls (Canva-like) for any project artboard.
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

/** Dense steps so +/- feels less jumpy than coarse Canva-ish presets alone */
const ZOOM_STEPS = [
  0.15, 0.2, 0.25, 0.33, 0.4, 0.5, 0.6, 0.67, 0.75, 0.85, 1, 1.1, 1.25, 1.5,
  1.75, 2, 2.5, 3,
];

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
    return clamp(next ?? current * 1.15, min, max);
  }
  const prev = [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001);
  return clamp(prev ?? current / 1.15, min, max);
};

/** Continuous zoom for Ctrl/Meta + wheel (smoother than discrete steps). */
export const wheelZoom = (
  current: number,
  deltaY: number,
  min: number,
  max: number,
): number => {
  const factor = Math.exp(-deltaY * 0.0018);
  return clamp(current * factor, min, max);
};

export const CanvasZoomControls = ({
  zoom,
  fitScale,
  onChange,
  min = 0.15,
  max = 3,
}: CanvasZoomControlsProps) => {
  const scale = resolveZoomScale(zoom, fitScale);
  const label =
    zoom === "fit"
      ? `Fit · ${Math.round(scale * 100)}%`
      : `${Math.round(scale * 100)}%`;

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-muted)] p-0.5">
      <button
        type="button"
        title="Zoom out"
        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted-hover)] hover:text-[var(--ed-fg)]"
        onClick={() => onChange(stepZoom(scale, -1, min, max))}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Toggle fit / 100%"
        className="min-w-[4.75rem] px-1.5 h-7 rounded text-[11px] font-medium text-[var(--ed-fg)] hover:bg-[var(--ed-muted-hover)]"
        onClick={() => onChange(zoom === "fit" ? 1 : "fit")}
      >
        {label}
      </button>
      <button
        type="button"
        title="Zoom in"
        className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted-hover)] hover:text-[var(--ed-fg)]"
        onClick={() => onChange(stepZoom(scale, 1, min, max))}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Fit artboard in view"
        className={`inline-flex h-7 w-7 items-center justify-center rounded ${
          zoom === "fit"
            ? "bg-[var(--ed-inverse)] text-[var(--ed-inverse-fg)]"
            : "text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted-hover)] hover:text-[var(--ed-fg)]"
        }`}
        onClick={() => onChange("fit")}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
