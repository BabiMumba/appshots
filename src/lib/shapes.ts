/**
 * Shape / floating-block helpers (marketing cards over devices).
 */

import type { ShapeForm, ShapeOverlay, ShadowConfig } from "../types";
import { overlayHeightForImageAspect } from "./overlay-frame";

export const SHAPE_FORMS: { id: ShapeForm; label: string }[] = [
  { id: "rounded", label: "Rounded" },
  { id: "rectangle", label: "Rectangle" },
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
];

export const isLockedAspectShape = (form: ShapeForm): boolean =>
  form === "circle" || form === "square";

export const defaultCornerRadius = (form: ShapeForm): number => {
  if (form === "circle") return 50;
  if (form === "rounded") return 22;
  if (form === "square") return 10;
  return 4;
};

export const shapeBorderRadiusCss = (shape: ShapeOverlay): string => {
  if (shape.form === "circle") return "9999px";
  const r = Math.max(0, Math.min(50, shape.cornerRadius));
  return `${r}%`;
};

const defaultShadow = (): ShadowConfig => ({
  enabled: true,
  color: "rgba(0,0,0,0.25)",
  blur: 28,
  offsetX: 0,
  offsetY: 12,
});

export function createDefaultShape(
  form: ShapeForm,
  canvasAspect: number,
): Omit<ShapeOverlay, "id"> {
  const width = form === "circle" || form === "square" ? 22 : 34;
  const imageAspect =
    form === "circle" || form === "square" ? 1 : form === "rounded" ? 1.7 : 1.4;
  const height = overlayHeightForImageAspect(width, imageAspect, canvasAspect);

  return {
    form,
    x: 50,
    y: 42,
    width,
    height,
    rotation: 0,
    cornerRadius: defaultCornerRadius(form),
    fillMode: "color",
    fillColor: "#ffffff",
    fillImage: null,
    imageOffsetX: 0,
    imageOffsetY: 0,
    opacity: 100,
    layer: "front",
    shadow: defaultShadow(),
  };
}

/** Apply form change with correct radius + aspect (fixes circle→rect leftover). */
export function applyShapeForm(
  shape: ShapeOverlay,
  form: ShapeForm,
  canvasAspect: number,
): ShapeOverlay {
  const next: ShapeOverlay = {
    ...shape,
    form,
    cornerRadius: defaultCornerRadius(form),
  };
  if (isLockedAspectShape(form)) {
    next.height = overlayHeightForImageAspect(next.width, 1, canvasAspect);
  }
  return next;
}
