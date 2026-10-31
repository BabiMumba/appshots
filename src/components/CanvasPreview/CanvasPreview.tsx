/**
 * CanvasPreview — main editing surface.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../context/EditorContext";
import {
  gapPercentFromCardWidth,
  getRenderableDevicesForScreenshot,
  getRenderableOverlaysForScreenshot,
  getRenderableShapesForScreenshot,
  PREVIEW_SCREEN_GAP_PX,
} from "../../lib/device-overflow";
import { Toolbar } from "./Toolbar";
import { Filmstrip } from "./Filmstrip";
import { ScreenshotCard } from "./ScreenshotCard";
import { TextFormatBar } from "./TextFormatBar";
import { ShapeFormatBar } from "./ShapeFormatBar";
import { CanvasFormatBar } from "./CanvasFormatBar";
import {
  resolveZoomScale,
  wheelZoom,
  type CanvasZoomValue,
} from "./CanvasZoomControls";
import { useResizeObserver } from "./useResizeObserver";
import { cloneDeviceInstance } from "../../lib/device-instances";
import { ensureLayerOrder } from "../../lib/layer-order";
import {
  ElementContextMenu,
  type ContextMenuAction,
} from "./ElementContextMenu";
import type { SelectedElement, TextAlign, TextOverlay } from "../../types";
import { syncLegacyTextFields } from "../../lib/text-overlays";
import { gradientPresets } from "../../constants";

const withSyncedTexts = (texts: TextOverlay[]) => ({
  texts,
  ...syncLegacyTextFields(texts),
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

type ContextMenuState = {
  x: number;
  y: number;
  element: SelectedElement;
};

export const CanvasPreview = () => {
  const {
    screenshots,
    activeScreenshotId,
    setActiveScreenshotId,
    setSelectedElement,
    selectedElement,
    removeScreenshot,
    handleElementMouseDown,
    handleElementMouseUp,
    handleResizeStart,
    handleRotateStart,
    getBackgroundStyle,
    addScreenshot,
    duplicateScreenshot,
    moveScreenshot,
    undo,
    redo,
    canUndo,
    canRedo,
    previewRef,
    canvasContainerRef,
    setPreviewDimensions,
    exportSize,
    updateActiveScreenshot,
    updateScreenshotById,
    removeOverlayImage,
    removeDevice,
    activeScreenshot,
    snapGuides,
    snapEnabled,
    setSnapEnabled,
    locales,
    activeLocale,
    setActiveLocale,
    addLocale,
    removeLocale,
    replacePrimaryLocale,
    moveElementLayer,
    fileInputRef,
    applyScreenImageFile,
    addOverlayImageToScreenshot,
    promoteOverlayToBackground,
    inlineEditing,
    startInlineEditing,
    stopInlineEditing,
    setIsFontPickerOpen,
    suppressDeselectUntil,
    addText,
    updateText,
    removeText,
    duplicateText,
    addShape,
    removeShape,
    updateShape,
    setShapeFillImage,
    ingestImageFile,
    assetKind,
  } = useEditor();

  const isFeature = assetKind === "feature";
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [croppingShapeId, setCroppingShapeId] = useState<string | null>(null);

  useEffect(() => {
    if (!croppingShapeId) return;
    if (
      selectedElement?.type !== "shape" ||
      selectedElement.id !== croppingShapeId
    ) {
      setCroppingShapeId(null);
    }
  }, [selectedElement, croppingShapeId]);
  const screensRowRef = useRef<HTMLDivElement>(null);
  const [previewGapPercent, setPreviewGapPercent] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState<CanvasZoomValue>("fit");
  const [fitScale, setFitScale] = useState(0.5);
  const ZOOM_MIN = 0.15;
  const ZOOM_MAX = 3;

  // Reset to fit when project kind / export size changes
  useEffect(() => {
    setCanvasZoom("fit");
  }, [assetKind, exportSize.id]);

  // Measure viewport → fit scale (one artboard in view)
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const measure = () => {
      const pad = 64;
      const w = Math.max(120, el.clientWidth - pad);
      const h = Math.max(80, el.clientHeight - pad);
      const next = Math.min(
        w / exportSize.width,
        h / exportSize.height,
        isFeature ? 1.25 : 1,
      );
      setFitScale(Math.max(ZOOM_MIN, next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [
    isFeature,
    exportSize.width,
    exportSize.height,
    canvasContainerRef,
  ]);

  // Ctrl/Meta + wheel → smooth continuous zoom; plain wheel scrolls/pans
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const current = resolveZoomScale(canvasZoom, fitScale);
      setCanvasZoom(wheelZoom(current, e.deltaY, ZOOM_MIN, ZOOM_MAX));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [canvasZoom, fitScale, canvasContainerRef]);

  useResizeObserver({
    elementRef: previewRef,
    onResize: setPreviewDimensions,
    deps: [activeScreenshotId, exportSize.id],
  });

  const updatePreviewGap = useCallback(() => {
    const card = screensRowRef.current?.querySelector(
      "[data-screenshot-card='true']",
    );
    if (card instanceof HTMLElement && card.offsetWidth > 0) {
      setPreviewGapPercent(
        gapPercentFromCardWidth(card.offsetWidth, PREVIEW_SCREEN_GAP_PX),
      );
    }
  }, []);

  useResizeObserver({
    elementRef: screensRowRef,
    onResize: updatePreviewGap,
    deps: [exportSize.id, screenshots.length],
  });

  // Keep the active screenshot card in view when switching via filmstrip / keys
  useEffect(() => {
    if (isFeature) return;
    const card = screensRowRef.current?.querySelector<HTMLElement>(
      `[data-screenshot-id="${activeScreenshotId}"]`,
    );
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeScreenshotId, isFeature]);

  const activeIndex = screenshots.findIndex((s) => s.id === activeScreenshotId);

  const selectedTextId =
    selectedElement?.type === "text" ? selectedElement.id : undefined;

  const selectedTextScreenshot = selectedElement
    ? (screenshots.find((s) => s.id === selectedElement.screenshotId) ??
      activeScreenshot)
    : activeScreenshot;

  const selectedText: TextOverlay | null =
    selectedTextId
      ? ((selectedTextScreenshot.texts ?? []).find(
          (t) => t.id === selectedTextId,
        ) ?? null)
      : null;

  const selectedShape =
    selectedElement?.type === "shape" && selectedElement.id
      ? ((screenshots.find((s) => s.id === selectedElement.screenshotId) ??
          activeScreenshot
        ).shapes ?? []
        ).find((s) => s.id === selectedElement.id) ?? null
      : null;

  const safeDeselect = () => {
    if (Date.now() < suppressDeselectUntil.current) return;
    stopInlineEditing();
    setCroppingShapeId(null);
    setSelectedElement(null);
    setContextMenu(null);
  };

  const handleDuplicateElement = (element?: SelectedElement | null) => {
    const target = element ?? selectedElement;
    if (!target || target.screenshotId !== activeScreenshotId) {
      duplicateScreenshot();
      return;
    }
    if (target.type === "text" && target.id) {
      duplicateText(target.id);
      return;
    }
    if (target.type === "image" && target.id) {
      const image = activeScreenshot.overlayImages.find(
        (img) => img.id === target.id,
      );
      if (!image) return;
      const clone = {
        ...structuredClone(image),
        id: generateId(),
        x: Math.min(image.x + 4, 90),
        y: Math.min(image.y + 4, 90),
      };
      updateActiveScreenshot({
        overlayImages: [...activeScreenshot.overlayImages, clone],
      });
      setSelectedElement({
        type: "image",
        id: clone.id,
        screenshotId: activeScreenshotId,
      });
      return;
    }
    if (target.type === "shape" && target.id) {
      const shape = (activeScreenshot.shapes ?? []).find(
        (s) => s.id === target.id,
      );
      if (!shape) return;
      const clone = {
        ...structuredClone(shape),
        id: generateId(),
        x: Math.min(shape.x + 4, 90),
        y: Math.min(shape.y + 4, 90),
      };
      const shapes = [...(activeScreenshot.shapes ?? []), clone];
      updateActiveScreenshot({
        shapes,
        layerOrder: [
          ...ensureLayerOrder({ ...activeScreenshot, shapes }).filter(
            (k) => k !== `shape:${clone.id}`,
          ),
          `shape:${clone.id}`,
        ],
      });
      setSelectedElement({
        type: "shape",
        id: clone.id,
        screenshotId: activeScreenshotId,
      });
      return;
    }
    if (target.type === "device" && target.id) {
      const device = activeScreenshot.devices.find((d) => d.id === target.id);
      if (!device) return;
      const clone = cloneDeviceInstance(device, {
        id: generateId(),
        x: Math.min(device.x + 8, 88),
        y: Math.min(device.y + 4, 70),
      });
      updateActiveScreenshot({
        devices: [...activeScreenshot.devices, clone],
        activeDeviceId: clone.id,
      });
      setSelectedElement({
        type: "device",
        id: clone.id,
        screenshotId: activeScreenshotId,
      });
      return;
    }
    duplicateScreenshot();
  };

  const handleDeleteElement = (element?: SelectedElement | null) => {
    const target = element ?? selectedElement;
    if (!target || target.screenshotId !== activeScreenshotId) return;
    if (target.type === "image" && target.id) {
      removeOverlayImage(target.id);
      return;
    }
    if (target.type === "shape" && target.id) {
      removeShape(target.id);
      return;
    }
    if (target.type === "device" && target.id) {
      removeDevice(target.id);
      setSelectedElement(null);
      return;
    }
    if (target.type === "text" && target.id) {
      removeText(target.id);
    }
  };

  const handleContextMenuAction = (action: ContextMenuAction) => {
    if (!contextMenu) return;
    const { element } = contextMenu;
    const id = element.id;

    const layerAction =
      action === "bring-forward"
        ? "forward"
        : action === "send-backward"
          ? "backward"
          : action === "bring-to-front"
            ? "front"
            : action === "send-to-back"
              ? "back"
              : null;

    if (layerAction) {
      moveElementLayer(element.type, id, layerAction);
    } else if (action === "use-as-background") {
      if (element.type === "image" && id) {
        promoteOverlayToBackground(id, element.screenshotId);
      }
    } else if (action === "duplicate") {
      handleDuplicateElement(element);
    } else if (action === "delete") {
      handleDeleteElement(element);
    }

    setContextMenu(null);
  };

  const effectiveZoom = resolveZoomScale(canvasZoom, fitScale);
  const artboardW = Math.round(exportSize.width * effectiveZoom);
  const artboardH = Math.round(exportSize.height * effectiveZoom);

  // Feature mode: only the active artboard (one Play banner)
  const visibleScreenshots = isFeature
    ? screenshots.filter((s) => s.id === activeScreenshotId).slice(0, 1)
    : screenshots;
  const screensToRender =
    visibleScreenshots.length > 0
      ? visibleScreenshots
      : screenshots.slice(0, 1);

  return (
    <div className="@container/canvas flex-1 flex flex-col overflow-hidden min-w-0">
      <Toolbar
        mode={assetKind}
        onAddScreenshot={addScreenshot}
        onAddText={addText}
        onAddShape={() => addShape("rounded")}
        onDuplicateScreenshot={() => duplicateScreenshot()}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onMoveLeft={() => moveScreenshot(activeScreenshotId, -1)}
        onMoveRight={() => moveScreenshot(activeScreenshotId, 1)}
        canMoveLeft={activeIndex > 0}
        canMoveRight={activeIndex >= 0 && activeIndex < screenshots.length - 1}
        screenshotCount={screenshots.length}
        zoom={canvasZoom}
        fitScale={fitScale}
        onZoomChange={setCanvasZoom}
        snapEnabled={snapEnabled}
        onSnapEnabledChange={setSnapEnabled}
        locales={locales}
        activeLocale={activeLocale}
        onSelectLocale={setActiveLocale}
        onAddLocale={addLocale}
        onRemoveLocale={removeLocale}
        onReplacePrimaryLocale={replacePrimaryLocale}
      />

      {!isFeature && (
        <Filmstrip
          screenshots={screenshots}
          activeScreenshotId={activeScreenshotId}
          exportAspect={exportSize.width / exportSize.height}
          onSelect={(id) => {
            if (id === activeScreenshotId) return;
            stopInlineEditing();
            setActiveScreenshotId(id);
            setContextMenu(null);
          }}
        />
      )}

      <div className="h-12 shrink-0 border-b border-[var(--ed-border)] bg-[var(--ed-chip)]">
        {selectedText && selectedElement && selectedTextId ? (
          <TextFormatBar
            label="Text"
            content={selectedText.content}
            fontFamily={selectedText.fontFamily}
            fontSize={selectedText.fontSize}
            fontWeight={selectedText.fontWeight}
            textColor={selectedText.color}
            align={selectedText.align}
            uppercase={selectedText.uppercase}
            isEditing={
              inlineEditing?.screenshotId === selectedElement.screenshotId &&
              inlineEditing.textId === selectedTextId
            }
            onEditText={() =>
              startInlineEditing(selectedElement.screenshotId, selectedTextId)
            }
            onAlign={(align: TextAlign) =>
              updateText(selectedTextId, { align }, selectedElement.screenshotId)
            }
            onFontSizeChange={(size) =>
              updateText(
                selectedTextId,
                { fontSize: size },
                selectedElement.screenshotId,
              )
            }
            onFontWeightChange={(weight) =>
              updateText(
                selectedTextId,
                { fontWeight: weight },
                selectedElement.screenshotId,
              )
            }
            onContentChange={(html) =>
              updateText(
                selectedTextId,
                { content: html },
                selectedElement.screenshotId,
              )
            }
            onTextColorChange={(color) =>
              updateText(
                selectedTextId,
                { color },
                selectedElement.screenshotId,
              )
            }
            onToggleUppercase={() =>
              updateText(
                selectedTextId,
                { uppercase: !selectedText.uppercase },
                selectedElement.screenshotId,
              )
            }
            onOpenFontPicker={() => setIsFontPickerOpen(true)}
          />
        ) : selectedShape && selectedElement?.id ? (
          <ShapeFormatBar
            shape={selectedShape}
            onUpdate={(updates) => updateShape(selectedShape.id, updates)}
            onSetFillImage={(file) => setShapeFillImage(selectedShape.id, file)}
            onEnterCrop={() => {
              if (selectedShape.fillMode === "image" && selectedShape.fillImage) {
                setCroppingShapeId(selectedShape.id);
              }
            }}
          />
        ) : (
          <CanvasFormatBar
            screenshot={activeScreenshot}
            gradientPresets={gradientPresets}
            onUpdate={updateActiveScreenshot}
            onIngestImage={ingestImageFile}
          />
        )}
      </div>

      <div
        ref={canvasContainerRef}
        className="flex-1 overflow-auto bg-[var(--ed-canvas)] overscroll-contain"
        onClick={(e) => {
          if (e.target === e.currentTarget) safeDeselect();
        }}
      >
        {/*
          safe center: when zoomed past the viewport, align to start so
          all edges stay reachable via scroll (classic flex center trap).
        */}
        <div
          ref={screensRowRef}
          className="flex p-8"
          style={{
            gap: isFeature ? undefined : PREVIEW_SCREEN_GAP_PX,
            minWidth: "100%",
            minHeight: "100%",
            width: "max-content",
            height: "max-content",
            alignItems: "safe center",
            justifyContent: "safe center",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) safeDeselect();
          }}
        >
          {screensToRender.map((screenshot) => {
            const index = screenshots.findIndex((s) => s.id === screenshot.id);
            const renderableDevices = getRenderableDevicesForScreenshot(
              screenshots,
              Math.max(0, index),
              isFeature ? 0 : previewGapPercent,
            );
            const renderableOverlays = getRenderableOverlaysForScreenshot(
              screenshots,
              Math.max(0, index),
              isFeature ? 0 : previewGapPercent,
            );
            const renderableShapes = getRenderableShapesForScreenshot(
              screenshots,
              Math.max(0, index),
              isFeature ? 0 : previewGapPercent,
            );

            return (
              <ScreenshotCard
                key={screenshot.id}
                screenshot={screenshot}
                renderableDevices={renderableDevices}
                renderableOverlays={renderableOverlays}
                renderableShapes={renderableShapes}
                isActive={activeScreenshotId === screenshot.id}
                canRemove={!isFeature && screenshots.length > 1}
                selectedElement={selectedElement}
                exportSize={exportSize}
                previewRef={previewRef}
                getBackgroundStyle={getBackgroundStyle}
                snapGuides={
                  activeScreenshotId === screenshot.id ? snapGuides : []
                }
                artboardWidthPx={artboardW}
                artboardHeightPx={artboardH}
                onSelect={() => {
                  if (activeScreenshotId !== screenshot.id) {
                    stopInlineEditing();
                    setActiveScreenshotId(screenshot.id);
                    setContextMenu(null);
                  }
                }}
                onRemove={() => removeScreenshot(screenshot.id)}
                onDeselect={safeDeselect}
                onElementMouseDown={handleElementMouseDown}
                onElementMouseUp={handleElementMouseUp}
                onResizeStart={handleResizeStart}
                onCorrectOverlayFrame={(screenshotId, imageId, heightPercent) => {
                  const shot = screenshots.find((s) => s.id === screenshotId);
                  if (!shot) return;
                  updateScreenshotById(
                    screenshotId,
                    {
                      overlayImages: (shot.overlayImages ?? []).map((img) =>
                        img.id === imageId
                          ? { ...img, height: heightPercent }
                          : img,
                      ),
                    },
                    false,
                  );
                }}
                onRotateStart={handleRotateStart}
                croppingShapeId={croppingShapeId}
                onShapeDoubleClick={(screenshotId, shapeId) => {
                  if (activeScreenshotId !== screenshotId) {
                    setActiveScreenshotId(screenshotId);
                  }
                  setSelectedElement({
                    type: "shape",
                    id: shapeId,
                    screenshotId,
                  });
                  setCroppingShapeId(shapeId);
                }}
                onShapeImageOffset={(screenshotId, shapeId, ox, oy) => {
                  const shot =
                    screenshots.find((s) => s.id === screenshotId) ??
                    activeScreenshot;
                  updateScreenshotById(
                    screenshotId,
                    {
                      shapes: (shot.shapes ?? []).map((s) =>
                        s.id === shapeId
                          ? { ...s, imageOffsetX: ox, imageOffsetY: oy }
                          : s,
                      ),
                    },
                    false,
                  );
                }}
                onExitShapeCrop={() => setCroppingShapeId(null)}
                onDeviceDoubleClick={(screenshotId, deviceId) => {
                  if (activeScreenshotId !== screenshotId) {
                    setActiveScreenshotId(screenshotId);
                  }
                  updateScreenshotById(screenshotId, {
                    activeDeviceId: deviceId,
                  });
                  setSelectedElement({
                    type: "device",
                    id: deviceId,
                    screenshotId,
                  });
                  // Wait for sidebar file input to mount/sync with activeDevice
                  window.setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 50);
                }}
                onScreenImageFile={(file, screenshotId, deviceId) => {
                  applyScreenImageFile(file, { screenshotId, deviceId });
                }}
                onCanvasImageDrop={(file, screenshotId) => {
                  addOverlayImageToScreenshot(file, screenshotId);
                }}
                editingTextId={
                  inlineEditing?.screenshotId === screenshot.id
                    ? inlineEditing.textId
                    : null
                }
                onTextDoubleClick={(textId) => {
                  startInlineEditing(screenshot.id, textId);
                }}
                onTextContentChange={(textId, html) => {
                  const texts = (screenshot.texts ?? []).map((t) =>
                    t.id === textId ? { ...t, content: html } : t,
                  );
                  updateScreenshotById(
                    screenshot.id,
                    withSyncedTexts(texts),
                    false,
                  );
                }}
                onTextEditEnd={() => stopInlineEditing()}
                onDuplicateElement={() => handleDuplicateElement()}
                onDeleteElement={() => handleDeleteElement()}
                onElementContextMenu={(e, type, screenshotId, id) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopInlineEditing();
                  if (activeScreenshotId !== screenshotId) {
                    setActiveScreenshotId(screenshotId);
                  }
                  const element: SelectedElement = { type, screenshotId, id };
                  setSelectedElement(element);
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    element,
                  });
                }}
              />
            );
          })}
        </div>
      </div>

      {contextMenu && (
        <ElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          showLayerActions
          showUseAsBackground={contextMenu.element.type === "image"}
          hasBackgroundImage={(() => {
            const shot =
              screenshots.find(
                (s) => s.id === contextMenu.element.screenshotId,
              ) ?? activeScreenshot;
            return (
              shot.backgroundMode === "image" && Boolean(shot.backgroundImage)
            );
          })()}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
