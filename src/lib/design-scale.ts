/**
 * Design scale helpers — keep preview and export visually identical.
 *
 * Editor font sizes (e.g. 72) are defined in **export pixels**
 * (size at the selected export resolution). Preview scales them down
 * by previewWidth / exportWidth so WYSIWYG holds regardless of window size.
 */

/** Stroke / shadow tuning reference (historical ~preview CSS width). */
export const UI_STROKE_REFERENCE_WIDTH = 400;

export function scaleExportPxToPreview(
  exportPx: number,
  previewWidth: number,
  exportWidth: number,
): number {
  if (exportWidth <= 0) return exportPx / 3;
  if (previewWidth <= 0) return exportPx * (UI_STROKE_REFERENCE_WIDTH / exportWidth);
  return exportPx * (previewWidth / exportWidth);
}

/** Scale factor for hairlines / shadow blur from UI values → export canvas. */
export function exportUiScale(exportWidth: number): number {
  return exportWidth / UI_STROKE_REFERENCE_WIDTH;
}
