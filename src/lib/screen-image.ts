/**
 * Cover-fit + zoom/pan for device screen images (preview + canvas export).
 */

export type ScreenImageFit = {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
};

/**
 * Compute draw rect so the image covers the screen (object-cover),
 * then apply zoom and % offsets.
 */
export function getCoverFitRect(
  imgWidth: number,
  imgHeight: number,
  screenW: number,
  screenH: number,
  zoom: number = 1,
  offsetXPercent: number = 0,
  offsetYPercent: number = 0,
): ScreenImageFit {
  const imgAspect = imgWidth / imgHeight || 1;
  const screenAspect = screenW / screenH || 1;

  let drawWidth: number;
  let drawHeight: number;

  if (imgAspect > screenAspect) {
    drawHeight = screenH;
    drawWidth = screenH * imgAspect;
  } else {
    drawWidth = screenW;
    drawHeight = screenW / imgAspect;
  }

  const z = Math.max(0.5, Math.min(3, zoom || 1));
  drawWidth *= z;
  drawHeight *= z;

  const baseX = screenW / 2 - drawWidth / 2;
  const baseY = screenH / 2 - drawHeight / 2;
  const drawX = baseX + (offsetXPercent / 100) * screenW;
  const drawY = baseY + (offsetYPercent / 100) * screenH;

  return { drawWidth, drawHeight, drawX, drawY };
}

export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgWidth: number,
  imgHeight: number,
  screenX: number,
  screenY: number,
  screenW: number,
  screenH: number,
  zoom: number = 1,
  offsetXPercent: number = 0,
  offsetYPercent: number = 0,
): void {
  const fit = getCoverFitRect(
    imgWidth,
    imgHeight,
    screenW,
    screenH,
    zoom,
    offsetXPercent,
    offsetYPercent,
  );
  ctx.drawImage(
    img,
    screenX + fit.drawX,
    screenY + fit.drawY,
    fit.drawWidth,
    fit.drawHeight,
  );
}
