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
  zIndex: number;
  isSelected: boolean;
  isInteractive: boolean;
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
  zIndex,
  isSelected,
  isInteractive,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onContextMenu,
  shadowScale = 1,
}: OverlayImageProps) => (
  <div
    data-draggable-element="image"
    className="absolute cursor-move select-none"
    style={getOverlayImageStyles(image, zIndex, isSelected)}
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
    {isSelected && isInteractive && (
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
