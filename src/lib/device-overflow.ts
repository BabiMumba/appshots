import type {
  DeviceInstance,
  ImageOverlay,
  Screenshot,
  ShapeOverlay,
} from "../types";
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

export interface RenderableOverlay {
  image: ImageOverlay;
  ownerScreenshotId: string;
  ownerScreenshotIndex: number;
  targetScreenshotIndex: number;
  localX: number;
  layerZIndex: number;
  isOwner: boolean;
}

export interface RenderableShape {
  shape: ShapeOverlay;
  ownerScreenshotId: string;
  ownerScreenshotIndex: number;
  targetScreenshotIndex: number;
  localX: number;
  layerZIndex: number;
  isOwner: boolean;
}

export const isOverlayVisibleInScreenshot = (
  image: ImageOverlay,
  localX: number,
): boolean => {
  const halfWidth = image.width / 2;
  return (
    localX + halfWidth > -VISIBILITY_BUFFER_PERCENT &&
    localX - halfWidth < SCREEN_WIDTH_PERCENT + VISIBILITY_BUFFER_PERCENT
  );
};

/** Same cross-screen clipping as devices — drag an overlay from A into B. */
export const getRenderableOverlaysForScreenshot = (
  screenshots: Screenshot[],
  targetScreenshotIndex: number,
  gapPercent = 0,
): RenderableOverlay[] =>
  screenshots.flatMap((screenshot, ownerScreenshotIndex) => {
    const ownerOrder = ensureLayerOrder(screenshot);
    return screenshot.overlayImages
      .map((image) => {
        const localX = getDeviceLocalXForScreenshot(
          image.x,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          gapPercent,
        );
        return {
          image,
          ownerScreenshotId: screenshot.id,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          localX,
          layerZIndex: zIndexForLayer(ownerOrder, `image:${image.id}`),
          isOwner: ownerScreenshotIndex === targetScreenshotIndex,
        };
      })
      .filter(({ image, localX }) =>
        isOverlayVisibleInScreenshot(image, localX),
      );
  });

export const isShapeVisibleInScreenshot = (
  shape: ShapeOverlay,
  localX: number,
): boolean => {
  const halfWidth = shape.width / 2;
  return (
    localX + halfWidth > -VISIBILITY_BUFFER_PERCENT &&
    localX - halfWidth < SCREEN_WIDTH_PERCENT + VISIBILITY_BUFFER_PERCENT
  );
};

export const getRenderableShapesForScreenshot = (
  screenshots: Screenshot[],
  targetScreenshotIndex: number,
  gapPercent = 0,
): RenderableShape[] =>
  screenshots.flatMap((screenshot, ownerScreenshotIndex) => {
    const ownerOrder = ensureLayerOrder(screenshot);
    return (screenshot.shapes ?? [])
      .map((shape) => {
        const localX = getDeviceLocalXForScreenshot(
          shape.x,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          gapPercent,
        );
        return {
          shape,
          ownerScreenshotId: screenshot.id,
          ownerScreenshotIndex,
          targetScreenshotIndex,
          localX,
          layerZIndex: zIndexForLayer(ownerOrder, `shape:${shape.id}`),
          isOwner: ownerScreenshotIndex === targetScreenshotIndex,
        };
      })
      .filter(({ shape, localX }) => isShapeVisibleInScreenshot(shape, localX));
  });
