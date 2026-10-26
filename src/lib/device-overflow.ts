import type { DeviceInstance, Screenshot } from "../types";
import { ensureLayerOrder, zIndexForLayer } from "./layer-order";

const SCREEN_WIDTH_PERCENT = 100;
/** How far outside a screen a device can still contribute a clipped fragment */
const VISIBILITY_BUFFER_PERCENT = 35;

/** Must match the flex `gap-*` between screenshot cards in CanvasPreview */
export const PREVIEW_SCREEN_GAP_PX = 12;

export interface RenderableDevice {
  device: DeviceInstance;
  ownerScreenshotId: string;
  ownerScreenshotIndex: number;
  targetScreenshotIndex: number;
  /** Device X expressed in the target screenshot's coordinate space */
  localX: number;
  /** Stacking from the owner screenshot's layerOrder (same rules as text/overlays) */
  layerZIndex: number;
  /** True when this paint is on the device's home screen */
  isOwner: boolean;
}

/**
 * @param gapPercent - Preview-only: gap between cards as % of card width.
 *   Export must pass 0 (frames are abutted). Non-zero keeps rotated clips aligned.
 */
export const getDeviceLocalXForScreenshot = (
  deviceX: number,
  ownerScreenshotIndex: number,
  targetScreenshotIndex: number,
  gapPercent = 0,
): number =>
  deviceX +
  (ownerScreenshotIndex - targetScreenshotIndex) *
    (SCREEN_WIDTH_PERCENT + gapPercent);

export const gapPercentFromCardWidth = (
  cardWidthPx: number,
  gapPx: number = PREVIEW_SCREEN_GAP_PX,
): number => (cardWidthPx > 0 ? (gapPx / cardWidthPx) * 100 : 0);

export const isDeviceVisibleInScreenshot = (
  device: DeviceInstance,
  localX: number,
): boolean => {
  const halfWidth = device.scale / 2;

  return (
    localX + halfWidth > -VISIBILITY_BUFFER_PERCENT &&
    localX - halfWidth < SCREEN_WIDTH_PERCENT + VISIBILITY_BUFFER_PERCENT
  );
};

export const getRenderableDevicesForScreenshot = (
  screenshots: Screenshot[],
  targetScreenshotIndex: number,
  gapPercent = 0,
): RenderableDevice[] =>
  screenshots.flatMap((screenshot, ownerScreenshotIndex) => {
    const ownerOrder = ensureLayerOrder(screenshot);
    return screenshot.devices
      .map((device) => {
        const localX = getDeviceLocalXForScreenshot(
          device.x,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          gapPercent,
        );

        return {
          device,
          ownerScreenshotId: screenshot.id,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          localX,
          layerZIndex: zIndexForLayer(ownerOrder, `device:${device.id}`),
          isOwner: ownerScreenshotIndex === targetScreenshotIndex,
        };
      })
      .filter(({ device, localX }) =>
        isDeviceVisibleInScreenshot(device, localX),
      );
  });
