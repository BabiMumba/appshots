/**
 * OverlayImage Component
 *
 * Renders a draggable overlay image with interactive handles.
 */

import type React from "react";
import type { ImageOverlay } from "../../types";
import { SelectionHandles } from "./SelectionHandles";
import { getOverlayImageStyles, getDropShadowFilter } from "./utils";

interface OverlayImageProps {
  image: ImageOverlay;
  /** Horizontal position in this card's % space (may differ from image.x for guests) */
  renderX?: number;
  zIndex: number;
  isSelected: boolean;
  isInteractive: boolean;
  showHandles?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (
    e: React.MouseEvent,
    handle: "e" | "w" | "se" | "sw" | "ne" | "nw",
  ) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Scale UI shadow px (export-space) down to preview */
  shadowScale?: number;
}

export const OverlayImage = ({
  image,
  renderX = image.x,
  zIndex,
  isSelected,
  isInteractive,
  showHandles = true,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onContextMenu,
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
    <img
      src={image.src}
      alt="Overlay"
      className="w-full h-full object-contain pointer-events-none"
      style={{ filter: getDropShadowFilter(image.shadow, shadowScale) }}
    />
    {isSelected && isInteractive && showHandles && (
      <SelectionHandles
        showCorners
        showSideHandles={false}
        showRotation
        onResizeStart={onResizeStart}
        onRotateStart={onRotateStart}
      />
    )}
  </div>
);
