/**
 * ShapeBlock — floating marketing card / circle / rect on the artboard.
 * Double-click image fill → Canva-style reposition inside the mask.
 */

import { useEffect, useRef } from "react";
import type React from "react";
import type { ShapeOverlay } from "../../types";
import {
  isLockedAspectShape,
  shapeBorderRadiusCss,
} from "../../lib/shapes";
import { SelectionHandles, type ResizeHandle } from "./SelectionHandles";
import { getDropShadowFilter, getImageSelectionStyles } from "./utils";

interface ShapeBlockProps {
  shape: ShapeOverlay;
  renderX?: number;
  zIndex: number;
  isSelected: boolean;
  isInteractive: boolean;
  showHandles?: boolean;
  /** Crop / reposition mode for image fill */
  isCropping?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onImageOffsetChange?: (offsetX: number, offsetY: number) => void;
  onExitCrop?: () => void;
  shadowScale?: number;
}

export const ShapeBlock = ({
  shape,
  renderX = shape.x,
  zIndex,
  isSelected,
  isInteractive,
  showHandles = true,
  isCropping = false,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onContextMenu,
  onDoubleClick,
  onImageOffsetChange,
  onExitCrop,
  shadowScale = 1,
}: ShapeBlockProps) => {
  const radius = shapeBorderRadiusCss(shape);
  const locked = isLockedAspectShape(shape.form);
  const panRef = useRef<{
    startX: number;
    startY: number;
    originOx: number;
    originOy: number;
  } | null>(null);

  useEffect(() => {
    if (!isCropping) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExitCrop?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCropping, onExitCrop]);

  const offsetX = shape.imageOffsetX ?? 0;
  const offsetY = shape.imageOffsetY ?? 0;
  const objectPosition = `${50 + offsetX}% ${50 + offsetY}%`;

  const handleCropPointerDown = (e: React.MouseEvent) => {
    if (!isCropping || !onImageOffsetChange) return;
    e.stopPropagation();
    e.preventDefault();
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originOx: offsetX,
      originOy: offsetY,
    };

    const onMove = (ev: MouseEvent) => {
      if (!panRef.current) return;
      const dx = ((ev.clientX - panRef.current.startX) / 3);
      const dy = ((ev.clientY - panRef.current.startY) / 3);
      const nextX = Math.min(50, Math.max(-50, panRef.current.originOx + dx));
      const nextY = Math.min(50, Math.max(-50, panRef.current.originOy + dy));
      onImageOffsetChange(nextX, nextY);
    };
    const onUp = () => {
      panRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      data-draggable-element="shape"
      className={`absolute select-none ${isCropping ? "cursor-grab active:cursor-grabbing" : "cursor-move"}`}
      style={{
        left: `${renderX}%`,
        top: `${shape.y}%`,
        transform: `translate(-50%, -50%) rotate(${shape.rotation ?? 0}deg)`,
        width: `${shape.width}%`,
        height: `${shape.height}%`,
        zIndex: isCropping ? zIndex + 50 : zIndex,
        outline: isCropping
          ? "2px solid rgb(14, 165, 233)"
          : undefined,
        outlineOffset: isCropping ? "2px" : undefined,
        ...(!isCropping ? getImageSelectionStyles(isSelected) : {}),
      }}
      onMouseDown={
        isInteractive
          ? isCropping
            ? handleCropPointerDown
            : onMouseDown
          : undefined
      }
      onDoubleClick={
        isInteractive
          ? (e) => {
              e.stopPropagation();
              onDoubleClick?.(e);
            }
          : undefined
      }
      onContextMenu={isInteractive ? onContextMenu : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          borderRadius: radius,
          backgroundColor:
            shape.fillMode === "color" ? shape.fillColor : "#111827",
          opacity: Math.min(1, Math.max(0, (shape.opacity ?? 100) / 100)),
          filter: getDropShadowFilter(shape.shadow, shadowScale),
        }}
      >
        {shape.fillMode === "image" && shape.fillImage && (
          <img
            src={shape.fillImage}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition }}
            draggable={false}
          />
        )}
      </div>

      {isCropping && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-sky-500 px-2 py-0.5 text-[10px] font-medium text-white shadow pointer-events-none z-30">
          Drag to reposition · Esc when done
        </div>
      )}

      {isSelected && isInteractive && showHandles && !isCropping && (
        <SelectionHandles
          showCorners
          showSideHandles={!locked}
          showRotation
          onResizeStart={onResizeStart}
          onRotateStart={onRotateStart}
        />
      )}
    </div>
  );
};
