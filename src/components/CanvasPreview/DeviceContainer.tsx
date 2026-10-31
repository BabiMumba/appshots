/**
 * DeviceContainer Component
 *
 * Wrapper for the device frame with positioning, rotation, and shadow effects.
 * Supports both flat (2D) and 3D device rendering styles.
 */

import type { DeviceInstance } from "../../types";
import { SelectionHandles, type ResizeHandle } from "./SelectionHandles";
import { DeviceFrame } from "../DeviceFrame";
import { DeviceFrame3D } from "../DeviceFrame/DeviceFrame3D";
import { getDeviceSelectionStyles, getDropShadowFilter } from "./utils";
import { getDeviceColorById, getDeviceSpecById } from "../../lib/device-instances";

interface DeviceContainerProps {
  /** Device instance data containing render settings */
  device: DeviceInstance;
  /** Owner screenshot id (for overlay→screen drop hit-testing) */
  ownerScreenshotId?: string;
  /** Horizontal position override in screenshot-local percent */
  renderX?: number;
  /** Z-index for stacking order */
  zIndex: number;
  /** Whether this device is selected */
  isSelected: boolean;
  /** Whether mouse interactions are enabled */
  isInteractive: boolean;
  /** Show resize/rotate handles (all visible fragments when selected) */
  showHandles?: boolean;
  /** Handler for mouse down event */
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onRotateStart?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onScreenImageFile?: (file: File) => void;
  shadowScale?: number;
}

const hasImageFileDrag = (e: React.DragEvent) =>
  Array.from(e.dataTransfer.types).includes("Files");

/**
 * DeviceContainer - Positioned device frame wrapper
 *
 * Handles device positioning, scale, rotation/3D perspective, and shadow effects.
 * Renders either a flat DeviceFrame or a 3D DeviceFrame3D based on the device instance style.
 */
export const DeviceContainer = ({
  device,
  ownerScreenshotId,
  renderX = device.x,
  zIndex,
  isSelected,
  isInteractive,
  showHandles = true,
  onMouseDown,
  onResizeStart,
  onRotateStart,
  onContextMenu,
  onDoubleClick,
  onScreenImageFile,
  shadowScale = 1,
}: DeviceContainerProps) => {
  const is3D = device.style === "3d";
  const selectedDevice = getDeviceSpecById(device.deviceId);
  const selectedColor = getDeviceColorById(selectedDevice.id, device.colorId);

  // Single transform stack (translate + rotate) so owner/guest clips share the
  // same origin — nested translate then rotate was drifting halves when tilted.
  const transform = is3D
    ? `translateX(-50%) rotateY(${device.rotateY}deg) rotateX(${device.rotateX}deg)`
    : `translateX(-50%) rotate(${device.rotation}deg)`;

  return (
    <div
      data-draggable-element="device"
      data-device-instance={device.id}
      data-owner-screenshot-id={ownerScreenshotId}
      className="absolute cursor-move select-none"
      style={{
        left: `${renderX}%`,
        width: `${device.scale}%`,
        top: `${device.y}%`,
        transform,
        transformOrigin: "center center",
        transformStyle: is3D ? "preserve-3d" : undefined,
        zIndex,
        filter: getDropShadowFilter(device.shadow, shadowScale),
        perspective: is3D ? `${1200 * shadowScale}px` : undefined,
        ...getDeviceSelectionStyles(isSelected),
      }}
      onMouseDown={isInteractive ? onMouseDown : undefined}
      onContextMenu={isInteractive ? onContextMenu : undefined}
      onDoubleClick={
        isInteractive
          ? (e) => {
              e.stopPropagation();
              onDoubleClick?.(e);
            }
          : undefined
      }
      onClick={(e) => e.stopPropagation()}
      onDragOver={
        isInteractive && onScreenImageFile
          ? (e) => {
              if (!hasImageFileDrag(e)) return;
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
            }
          : undefined
      }
      onDrop={
        isInteractive && onScreenImageFile
          ? (e) => {
              if (!hasImageFileDrag(e)) return;
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file?.type.startsWith("image/")) onScreenImageFile(file);
            }
          : undefined
      }
    >
      <div className="relative">
        {is3D ? (
          <DeviceFrame3D
            device={device}
            selectedDevice={selectedDevice}
            selectedColor={selectedColor}
            onScreenImageFile={
              isInteractive ? onScreenImageFile : undefined
            }
          />
        ) : (
          <DeviceFrame
            device={device}
            selectedDevice={selectedDevice}
            selectedColor={selectedColor}
            onScreenImageFile={
              isInteractive ? onScreenImageFile : undefined
            }
          />
        )}
        {isSelected && isInteractive && showHandles && (
          <SelectionHandles
            showCorners
            showRotation={!is3D}
            onResizeStart={onResizeStart}
            onRotateStart={onRotateStart}
          />
        )}
      </div>
    </div>
  );
};
