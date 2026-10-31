/**
 * OverlayImage Component
 *
 * Frame = selection box (Canva-like). Image fills with cover so side-resize crops.
 */

import type React from "react";
import type { ImageOverlay } from "../../types";
import {
  looksLikeLegacyOverlayHeight,
  overlayHeightForImageAspect,
} from "../../lib/overlay-frame";
import { SelectionHandles, type ResizeHandle } from "./SelectionHandles";
import { getOverlayImageStyles, getDropShadowFilter } from "./utils";

interface OverlayImageProps {
  image: ImageOverlay;
  /** Horizontal position in this card's % space (may differ from image.x for guests) */
  renderX?: number;
  /** Canvas width/height — needed to hug image aspect and migrate legacy frames */
  canvasAspect: number;
  zIndex: number;
  isSelected: boolean;
  isInteractive: boolean;
  showHandles?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Fix legacy letterboxed height once natural size is known */
  onCorrectFrame?: (heightPercent: number) => void;
  /** Scale UI shadow px (export-space) down to preview */
  shadowScale?: number;
}

export const OverlayImage = ({
  image,
  renderX = image.x,
  canvasAspect,
  zIndex,
  isSelected,
  isInteractive,
  showHandles = true,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onContextMenu,
  onCorrectFrame,
  shadowScale = 1,
}: OverlayImageProps) => (
  <div
    data-draggable-element="image"
    className="absolute cursor-move select-none"
    style={getOverlayImageStyles(image, zIndex, isSelected, renderX)}
    onMouseDown={isInteractive ? onMouseDown : undefined}
    onContextMenu={isInteractive ? onContextMenu : undefined}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Inner clip so cover-crop doesn't expand hit-box; shadow stays on this layer */}
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ filter: getDropShadowFilter(image.shadow, shadowScale) }}
    >
      <img
        src={image.src}
        alt="Overlay"
        className="w-full h-full object-cover"
        onLoad={(e) => {
          if (!onCorrectFrame || canvasAspect <= 0) return;
          const el = e.currentTarget;
          const imageAspect = el.naturalWidth / Math.max(el.naturalHeight, 1);
          if (
            !looksLikeLegacyOverlayHeight(
              image.width,
              image.height,
              imageAspect,
            )
          ) {
            return;
          }
          onCorrectFrame(
            overlayHeightForImageAspect(
              image.width,
              imageAspect,
              canvasAspect,
            ),
          );
        }}
      />
    </div>
    {isSelected && isInteractive && showHandles && (
      <SelectionHandles
        showCorners
        showSideHandles
        showRotation
        onResizeStart={onResizeStart}
        onRotateStart={onRotateStart}
      />
    )}
  </div>
);
