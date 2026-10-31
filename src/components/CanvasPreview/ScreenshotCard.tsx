/**
 * ScreenshotCard — interactive preview for one export frame.
 */

import { useRef, useState, type RefObject } from "react";
import type { Screenshot, ExportSize, SelectedElement } from "../../types";
import type {
  RenderableDevice,
  RenderableOverlay,
  RenderableShape,
} from "../../lib/device-overflow";
import { RemoveButton } from "./RemoveButton";
import { OverlayImage } from "./OverlayImage";
import { ShapeBlock } from "./ShapeBlock";
import { TextElement } from "./TextElement";
import { DeviceContainer } from "./DeviceContainer";
import { ElementQuickActions } from "./ElementQuickActions";
import { SnapGuides } from "./SnapGuides";
import { isElementSelected } from "./utils";
import { ensureLayerOrder, zIndexForLayer } from "../../lib/layer-order";
import { scaleExportPxToPreview } from "../../lib/design-scale";
import { useResizeObserver } from "./useResizeObserver";
import type { ResizeHandle } from "./SelectionHandles";
import type { SnapGuide } from "../../lib/snap";

interface ScreenshotCardProps {
  screenshot: Screenshot;
  renderableDevices: RenderableDevice[];
  renderableOverlays: RenderableOverlay[];
  renderableShapes: RenderableShape[];
  isActive: boolean;
  canRemove: boolean;
  selectedElement: SelectedElement | null;
  exportSize: ExportSize;
  previewRef: RefObject<HTMLDivElement | null>;
  getBackgroundStyle: (screenshot: Screenshot) => string;
  /** Active-card snap lines while dragging */
  snapGuides?: SnapGuide[];
  onSelect: () => void;
  onRemove: () => void;
  onDeselect: () => void;
  onElementMouseDown: (
    e: React.MouseEvent,
    type: "text" | "image" | "device" | "shape",
    screenshotId: string,
    id?: string,
  ) => void;
  onElementMouseUp: () => void;
  onResizeStart: (
    e: React.MouseEvent,
    type: "text" | "image" | "device" | "shape",
    screenshotId: string,
    id: string | undefined,
    handle: ResizeHandle,
  ) => void;
  /** Migrate legacy letterboxed overlay frames (no history) */
  onCorrectOverlayFrame?: (
    screenshotId: string,
    imageId: string,
    heightPercent: number,
  ) => void;
  onRotateStart: (
    e: React.MouseEvent,
    type: "image" | "device" | "shape",
    screenshotId: string,
    id: string,
  ) => void;
  onDeviceDoubleClick: (screenshotId: string, deviceId: string) => void;
  croppingShapeId?: string | null;
  onShapeDoubleClick?: (screenshotId: string, shapeId: string) => void;
  onShapeImageOffset?: (
    screenshotId: string,
    shapeId: string,
    offsetX: number,
    offsetY: number,
  ) => void;
  onExitShapeCrop?: () => void;
  onScreenImageFile: (
    file: File,
    screenshotId: string,
    deviceId: string,
  ) => void;
  /** Drop on empty canvas (not a device) → overlay */
  onCanvasImageDrop?: (file: File, screenshotId: string) => void;
  editingTextId: string | null;
  onTextDoubleClick: (textId: string) => void;
  onTextContentChange: (textId: string, html: string) => void;
  onTextEditEnd: () => void;
  onDuplicateElement: () => void;
  onDeleteElement: () => void;
  onElementContextMenu: (
    e: React.MouseEvent,
    type: "text" | "image" | "device" | "shape",
    screenshotId: string,
    id?: string,
  ) => void;
  /**
   * When set, card uses a fixed pixel size (feature artboard + zoom)
   * instead of filling the row height.
   */
  artboardWidthPx?: number;
  artboardHeightPx?: number;
}

export const ScreenshotCard = ({
  screenshot,
  renderableDevices,
  renderableOverlays,
  renderableShapes,
  isActive,
  canRemove,
  selectedElement,
  exportSize,
  previewRef,
  getBackgroundStyle,
  snapGuides = [],
  onSelect,
  onRemove,
  onDeselect,
  onElementMouseDown,
  onElementMouseUp,
  onResizeStart,
  onCorrectOverlayFrame,
  onRotateStart,
  onDeviceDoubleClick,
  croppingShapeId = null,
  onShapeDoubleClick,
  onShapeImageOffset,
  onExitShapeCrop,
  onScreenImageFile,
  onCanvasImageDrop,
  editingTextId,
  onTextDoubleClick,
  onTextContentChange,
  onTextEditEnd,
  onDuplicateElement,
  onDeleteElement,
  onElementContextMenu,
  artboardWidthPx,
  artboardHeightPx,
}: ScreenshotCardProps) => {
  const layerOrder = ensureLayerOrder(screenshot);
  const localRef = useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [canvasDragOver, setCanvasDragOver] = useState(false);
  const texts = screenshot.texts ?? [];

  const isImageDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files");

  const takeDroppedImage = (e: React.DragEvent): File | null => {
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return null;
    return file;
  };

  const setCardRef = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (isActive) {
      (previewRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
    }
  };

  useResizeObserver({
    elementRef: localRef,
    onResize: ({ width }) => {
      if (width > 0) setCardWidth(width);
    },
    deps: [isActive, exportSize.id, screenshot.id],
  });

  const previewW = cardWidth > 0 ? cardWidth : exportSize.width / 3;
  const previewScale = previewW / Math.max(exportSize.width, 1);

  const isEmptyTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    return Boolean(
      el &&
        !el.closest("[data-draggable-element]") &&
        !el.closest("[data-floating-toolbar]"),
    );
  };

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (isActive && isEmptyTarget(e.target)) {
      onDeselect();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    onSelect();
    // Empty click always clears selection (including when switching screens).
    // Device/image/text clicks stopPropagation so they never reach here.
    if (isEmptyTarget(e.target)) {
      onDeselect();
    }
  };

  const showQuickActions =
    isActive &&
    selectedElement &&
    selectedElement.screenshotId === screenshot.id &&
    !editingTextId;

  const quickActionPos = (() => {
    if (!selectedElement || selectedElement.screenshotId !== screenshot.id) {
      return null;
    }
    if (selectedElement.type === "text" && selectedElement.id) {
      const t = texts.find((x) => x.id === selectedElement.id);
      return t
        ? {
            x: t.x,
            y: t.y,
            // Box hugs content — don't offset the chip by max-wrap width
            halfWidth: Math.min(10, t.width / 2),
            clearTopCenter: false,
          }
        : null;
    }
    if (selectedElement.type === "image" && selectedElement.id) {
      const local = renderableOverlays.find(
        (o) =>
          o.image.id === selectedElement.id &&
          o.ownerScreenshotId === selectedElement.screenshotId,
      );
      if (local) {
        return {
          x: local.localX,
          y: local.image.y,
          halfWidth: local.image.width / 2,
          clearTopCenter: true,
        };
      }
      const img = screenshot.overlayImages.find(
        (i) => i.id === selectedElement.id,
      );
      return img
        ? {
            x: img.x,
            y: img.y,
            halfWidth: img.width / 2,
            clearTopCenter: true,
          }
        : null;
    }
    if (selectedElement.type === "shape" && selectedElement.id) {
      const local = renderableShapes.find(
        (o) =>
          o.shape.id === selectedElement.id &&
          o.ownerScreenshotId === selectedElement.screenshotId,
      );
      if (local) {
        return {
          x: local.localX,
          y: local.shape.y,
          halfWidth: local.shape.width / 2,
          clearTopCenter: true,
        };
      }
      const shape = (screenshot.shapes ?? []).find(
        (s) => s.id === selectedElement.id,
      );
      return shape
        ? {
            x: shape.x,
            y: shape.y,
            halfWidth: shape.width / 2,
            clearTopCenter: true,
          }
        : null;
    }
    if (selectedElement.type === "device" && selectedElement.id) {
      // Prefer the local (clipped) fragment on this card for chip placement
      const local = renderableDevices.find(
        (d) =>
          d.device.id === selectedElement.id &&
          d.ownerScreenshotId === selectedElement.screenshotId,
      );
      if (local) {
        return {
          x: local.localX,
          y: local.device.y,
          halfWidth: local.device.scale / 2,
          clearTopCenter: true,
        };
      }
      const device = screenshot.devices.find(
        (d) => d.id === selectedElement.id,
      );
      return device
        ? {
            x: device.x,
            y: device.y,
            halfWidth: device.scale / 2,
            clearTopCenter: true,
          }
        : null;
    }
    return null;
  })();

  return (
    <div
      ref={setCardRef}
      data-screenshot-card="true"
      data-screenshot-id={screenshot.id}
      onClick={handleCardClick}
      onMouseUp={onElementMouseUp}
      onMouseDown={handleBackgroundMouseDown}
      onContextMenu={(e) => {
        if (isEmptyTarget(e.target)) {
          e.preventDefault();
          onDeselect();
        }
      }}
      onDragEnter={(e) => {
        if (!isImageDrag(e) || !onCanvasImageDrop) return;
        e.preventDefault();
        setCanvasDragOver(true);
      }}
      onDragOver={(e) => {
        if (!isImageDrag(e) || !onCanvasImageDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setCanvasDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setCanvasDragOver(false);
      }}
      onDrop={(e) => {
        // Device screens stopPropagation — this handles canvas / empty area
        setCanvasDragOver(false);
        if (!onCanvasImageDrop) return;
        const file = takeDroppedImage(e);
        if (!file) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        onCanvasImageDrop(file, screenshot.id);
      }}
      className={`relative rounded-xl cursor-pointer transition-all shrink-0 ${
        artboardWidthPx ? "" : "h-full"
      } ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"} ${
        canvasDragOver ? "ring-2 ring-sky-400/60 ring-offset-2 ring-offset-[#0a0a0a]" : ""
      }`}
      style={{
        ...(artboardWidthPx && artboardHeightPx
          ? {
              width: artboardWidthPx,
              height: artboardHeightPx,
            }
          : {
              aspectRatio: `${exportSize.width}/${exportSize.height}`,
            }),
        boxShadow: isActive
          ? "inset 0 0 0 2px rgba(255, 255, 255, 0.95)"
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{ background: getBackgroundStyle(screenshot) }}
      />

      {canRemove && <RemoveButton onRemove={onRemove} />}

      {/* Clip everything to the screen frame — devices enter adjacent screens from the inside */}
      <div className="absolute inset-0 select-none overflow-hidden rounded-xl">
        {isActive && (
          <div
            className="absolute inset-0 z-[1]"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (editingTextId) onTextEditEnd();
              onDeselect();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {renderableOverlays.map(
          ({ image, localX, ownerScreenshotId, layerZIndex }) => {
            if (image.hidden) return null;
            const selected = isElementSelected(
              selectedElement,
              "image",
              ownerScreenshotId,
              image.id,
            );
            return (
              <OverlayImage
                key={`${ownerScreenshotId}-${image.id}`}
                image={image}
                renderX={localX}
                canvasAspect={
                  exportSize.width / Math.max(exportSize.height, 1)
                }
                zIndex={layerZIndex}
                isSelected={selected}
                isInteractive
                showHandles={selected}
                shadowScale={previewScale}
                onMouseDown={(e) =>
                  onElementMouseDown(e, "image", ownerScreenshotId, image.id)
                }
                onResizeStart={(e, handle) =>
                  onResizeStart(
                    e,
                    "image",
                    ownerScreenshotId,
                    image.id,
                    handle,
                  )
                }
                onRotateStart={(e) =>
                  onRotateStart(e, "image", ownerScreenshotId, image.id)
                }
                onContextMenu={(e) =>
                  onElementContextMenu(e, "image", ownerScreenshotId, image.id)
                }
                onCorrectFrame={
                  onCorrectOverlayFrame
                    ? (heightPercent) =>
                        onCorrectOverlayFrame(
                          ownerScreenshotId,
                          image.id,
                          heightPercent,
                        )
                    : undefined
                }
              />
            );
          },
        )}

        {renderableShapes.map(
          ({ shape, localX, ownerScreenshotId, layerZIndex }) => {
            if (shape.hidden) return null;
            const selected = isElementSelected(
              selectedElement,
              "shape",
              ownerScreenshotId,
              shape.id,
            );
            return (
              <ShapeBlock
                key={`${ownerScreenshotId}-${shape.id}`}
                shape={{
                  ...shape,
                  imageOffsetX: shape.imageOffsetX ?? 0,
                  imageOffsetY: shape.imageOffsetY ?? 0,
                }}
                renderX={localX}
                zIndex={layerZIndex}
                isSelected={selected}
                isInteractive
                showHandles={selected}
                isCropping={croppingShapeId === shape.id}
                shadowScale={previewScale}
                onMouseDown={(e) =>
                  onElementMouseDown(e, "shape", ownerScreenshotId, shape.id)
                }
                onResizeStart={(e, handle) =>
                  onResizeStart(
                    e,
                    "shape",
                    ownerScreenshotId,
                    shape.id,
                    handle,
                  )
                }
                onRotateStart={(e) =>
                  onRotateStart(e, "shape", ownerScreenshotId, shape.id)
                }
                onContextMenu={(e) =>
                  onElementContextMenu(e, "shape", ownerScreenshotId, shape.id)
                }
                onDoubleClick={() => {
                  if (shape.fillMode === "image" && shape.fillImage) {
                    onShapeDoubleClick?.(ownerScreenshotId, shape.id);
                  }
                }}
                onImageOffsetChange={(ox, oy) =>
                  onShapeImageOffset?.(ownerScreenshotId, shape.id, ox, oy)
                }
                onExitCrop={onExitShapeCrop}
              />
            );
          },
        )}

        {texts.map((text) => {
          if (text.hidden) return null;
          const selected =
            isActive &&
            isElementSelected(selectedElement, "text", screenshot.id, text.id);
          const editing = isActive && editingTextId === text.id;
          const fontPx = scaleExportPxToPreview(
            text.fontSize,
            previewW,
            exportSize.width,
          );
          return (
            <TextElement
              key={text.id}
              content={text.content}
              x={text.x}
              y={text.y}
              width={text.width}
              fontSize={fontPx}
              color={text.color}
              fontFamily={text.fontFamily}
              align={text.align}
              uppercase={text.uppercase}
              fontWeight={text.fontWeight}
              zIndex={
                editing
                  ? 280
                  : Math.max(
                      20,
                      zIndexForLayer(layerOrder, `text:${text.id}`),
                    )
              }
              paddingPx={4 * (previewW / 400)}
              isSelected={selected}
              isInteractive
              isEditing={editing}
              onMouseDown={(e) =>
                onElementMouseDown(e, "text", screenshot.id, text.id)
              }
              onDoubleClick={() => onTextDoubleClick(text.id)}
              onContentChange={(html) => onTextContentChange(text.id, html)}
              onEditEnd={onTextEditEnd}
              onResizeStart={(e, handle) =>
                onResizeStart(e, "text", screenshot.id, text.id, handle)
              }
              onContextMenu={(e) =>
                onElementContextMenu(e, "text", screenshot.id, text.id)
              }
            />
          );
        })}

        {renderableDevices.map(
          ({ device, localX, ownerScreenshotId, layerZIndex }) => {
            if (device.hidden) return null;
            const selected = isElementSelected(
              selectedElement,
              "device",
              ownerScreenshotId,
              device.id,
            );
            // Handles on every visible fragment so the overflow half (B) can
            // resize/rotate — owner-only handles were clipped/unreachable.
            return (
              <DeviceContainer
                key={`${ownerScreenshotId}-${device.id}`}
                device={device}
                ownerScreenshotId={ownerScreenshotId}
                renderX={localX}
                zIndex={layerZIndex}
                isSelected={selected}
                isInteractive
                showHandles={selected}
                shadowScale={previewScale}
                onMouseDown={(e) =>
                  onElementMouseDown(e, "device", ownerScreenshotId, device.id)
                }
                onResizeStart={(e, handle) =>
                  onResizeStart(
                    e,
                    "device",
                    ownerScreenshotId,
                    device.id,
                    handle,
                  )
                }
                onRotateStart={(e) =>
                  onRotateStart(e, "device", ownerScreenshotId, device.id)
                }
                onDoubleClick={() =>
                  onDeviceDoubleClick(ownerScreenshotId, device.id)
                }
                onScreenImageFile={(file) =>
                  onScreenImageFile(file, ownerScreenshotId, device.id)
                }
                onContextMenu={(e) =>
                  onElementContextMenu(
                    e,
                    "device",
                    ownerScreenshotId,
                    device.id,
                  )
                }
              />
            );
          },
        )}

        {isActive && <SnapGuides guides={snapGuides} />}
      </div>

      {/* Chrome outside the clip: remove + quick actions stay readable */}
      {showQuickActions && quickActionPos && selectedElement && (
        <ElementQuickActions
          xPercent={quickActionPos.x}
          yPercent={Math.max(quickActionPos.y, 8)}
          halfWidthPercent={quickActionPos.halfWidth}
          clearTopCenter={quickActionPos.clearTopCenter}
          showDuplicate
          onDuplicate={onDuplicateElement}
          onDelete={onDeleteElement}
        />
      )}
    </div>
  );
};
