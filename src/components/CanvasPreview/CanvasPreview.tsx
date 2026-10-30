/**
 * CanvasPreview — main editing surface.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../../context/EditorContext";
import {
  gapPercentFromCardWidth,
  getRenderableDevicesForScreenshot,
  getRenderableOverlaysForScreenshot,
  PREVIEW_SCREEN_GAP_PX,
} from "../../lib/device-overflow";
import { Toolbar } from "./Toolbar";
import { Filmstrip } from "./Filmstrip";
import { ScreenshotCard } from "./ScreenshotCard";
import { TextFormatBar } from "./TextFormatBar";
import {
  resolveZoomScale,
  stepZoom,
  type CanvasZoomValue,
} from "./CanvasZoomControls";
import { useResizeObserver } from "./useResizeObserver";
import { cloneDeviceInstance } from "../../lib/device-instances";
import {
  ElementContextMenu,
  type ContextMenuAction,
} from "./ElementContextMenu";
import type { SelectedElement, TextAlign, TextOverlay } from "../../types";
import { syncLegacyTextFields } from "../../lib/text-overlays";

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
    moveElementLayer,
    fileInputRef,
    applyScreenImageFile,
    inlineEditing,
    startInlineEditing,
    stopInlineEditing,
    setIsFontPickerOpen,
    suppressDeselectUntil,
    addText,
    updateText,
    removeText,
    duplicateText,
    assetKind,
  } = useEditor();

  const isFeature = assetKind === "feature";
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const screensRowRef = useRef<HTMLDivElement>(null);
  const [previewGapPercent, setPreviewGapPercent] = useState(0);
  const [canvasZoom, setCanvasZoom] = useState<CanvasZoomValue>("fit");
  const [fitScale, setFitScale] = useState(0.5);

  // Reset to fit when entering feature mode / size changes
  useEffect(() => {
    if (isFeature) setCanvasZoom("fit");
  }, [isFeature, exportSize.id]);

  // Measure viewport → fit scale for the 1024×500 artboard
  useEffect(() => {
    if (!isFeature) return;
    const el = canvasContainerRef.current;
    if (!el) return;

    const measure = () => {
      const pad = 64;
      const w = Math.max(120, el.clientWidth - pad);
      const h = Math.max(80, el.clientHeight - pad);
      const next = Math.min(
        w / exportSize.width,
        h / exportSize.height,
        1.25,
      );
      setFitScale(Math.max(0.15, next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFeature, exportSize.width, exportSize.height, canvasContainerRef]);

  // Ctrl/Meta + wheel zoom on the feature artboard
  useEffect(() => {
    if (!isFeature) return;
    const el = canvasContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const current = resolveZoomScale(canvasZoom, fitScale);
      const direction: 1 | -1 = e.deltaY < 0 ? 1 : -1;
      setCanvasZoom(stepZoom(current, direction, 0.2, 2));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isFeature, canvasZoom, fitScale, canvasContainerRef]);

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

  const safeDeselect = () => {
    if (Date.now() < suppressDeselectUntil.current) return;
    stopInlineEditing();
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
    } else if (action === "duplicate") {
      handleDuplicateElement(element);
    } else if (action === "delete") {
      handleDeleteElement(element);
    }

    setContextMenu(null);
  };

  const effectiveZoom = resolveZoomScale(canvasZoom, fitScale);
  const featureArtboardW = Math.round(exportSize.width * effectiveZoom);
  const featureArtboardH = Math.round(exportSize.height * effectiveZoom);

  // Feature mode: only the active artboard (one Play banner)
  const visibleScreenshots = isFeature
    ? screenshots.filter((s) => s.id === activeScreenshotId).slice(0, 1)
    : screenshots;
  const screensToRender =
    visibleScreenshots.length > 0
      ? visibleScreenshots
      : screenshots.slice(0, 1);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toolbar
        mode={assetKind}
        onAddScreenshot={addScreenshot}
        onAddText={addText}
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

      <div className="h-12 shrink-0 border-b border-white/10 bg-[#161616]">
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
        ) : (
          <div className="h-full flex items-center px-3 text-[11px] text-gray-600">
            Select a text · click again or double-click to edit · Enter also works
          </div>
        )}
      </div>

      <div
        ref={canvasContainerRef}
        className={
          isFeature
            ? "flex-1 overflow-auto bg-[#0a0a0a]"
            : "flex-1 overflow-x-auto overflow-y-hidden bg-[#0a0a0a] p-6"
        }
        onClick={(e) => {
          if (e.target === e.currentTarget) safeDeselect();
        }}
      >
        <div
          ref={screensRowRef}
          className={
            isFeature
              ? "min-h-full min-w-full flex items-center justify-center p-8"
              : "flex h-full min-w-max"
          }
          style={isFeature ? undefined : { gap: PREVIEW_SCREEN_GAP_PX }}
          onClick={(e) => {
            if (isFeature && e.target === e.currentTarget) safeDeselect();
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

            return (
              <ScreenshotCard
                key={screenshot.id}
                screenshot={screenshot}
                renderableDevices={renderableDevices}
                renderableOverlays={renderableOverlays}
                isActive={activeScreenshotId === screenshot.id}
                canRemove={!isFeature && screenshots.length > 1}
                selectedElement={selectedElement}
                exportSize={exportSize}
                previewRef={previewRef}
                getBackgroundStyle={getBackgroundStyle}
                artboardWidthPx={isFeature ? featureArtboardW : undefined}
                artboardHeightPx={isFeature ? featureArtboardH : undefined}
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
                onRotateStart={handleRotateStart}
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
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
