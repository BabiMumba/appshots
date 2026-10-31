/**
 * Overlay frame sizing: width/height are % of canvas axes (different units).
 * Pixel frame aspect = (width% × canvasW) / (height% × canvasH).
 */

/** Height % so the frame matches a natural image aspect at the given width %. */
export function overlayHeightForImageAspect(
  widthPercent: number,
  imageAspect: number,
  canvasAspect: number,
): number {
  if (imageAspect <= 0 || canvasAspect <= 0) return widthPercent;
  return (canvasAspect * widthPercent) / imageAspect;
}

/**
 * Legacy create used `height = width / imageAspect` (ignored canvas aspect),
 * which letterboxed wide frames on landscape canvases (e.g. feature graphic).
 */
export function looksLikeLegacyOverlayHeight(
  widthPercent: number,
  heightPercent: number,
  imageAspect: number,
): boolean {
  if (imageAspect <= 0) return false;
  const legacy = widthPercent / imageAspect;
  return Math.abs(heightPercent - legacy) < 0.8;
}
