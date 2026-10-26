/**
 * CanvasPreview — main editing surface.
 */

import { useState } from "react";
import { useEditor } from "../../context/EditorContext";
import { getRenderableDevicesForScreenshot } from "../../lib/device-overflow";
import { Toolbar } from "./Toolbar";
import { ScreenshotCard } from "./ScreenshotCard";
import { TextFormatBar } from "./TextFormatBar";
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
    inlineEditing,
    startInlineEditing,
    stopInlineEditing,
    setIsFontPickerOpen,
    suppressDeselectUntil,
    addText,
    updateText,
    removeText,
    duplicateText,
  } = useEditor();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useResizeObserver({
    elementRef: previewRef,
    onResize: setPreviewDimensions,
    deps: [activeScreenshotId, exportSize.id],
  });

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toolbar
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
      />

      <div className="h-12 shrink-0 border-b border-white/10 bg-[#161616]">
        {selectedText && selectedElement && selectedTextId ? (
          <TextFormatBar
            label="Text"
            fontFamily={selectedText.fontFamily}
            fontSize={selectedText.fontSize}
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
            Select a text to format · Add Text in the toolbar · double-click to
            edit
          </div>
        )}
      </div>

      <div
        ref={canvasContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden bg-[#0a0a0a] p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) safeDeselect();
        }}
      >
        <div className="flex gap-1 h-full min-w-max">
          {screenshots.map((screenshot, index) => {
            const renderableDevices = getRenderableDevicesForScreenshot(
              screenshots,
              index,
            );

            return (
              <ScreenshotCard
                key={screenshot.id}
                screenshot={screenshot}
                renderableDevices={renderableDevices}
                isActive={activeScreenshotId === screenshot.id}
                canRemove={screenshots.length > 1}
                selectedElement={selectedElement}
                exportSize={exportSize}
                previewRef={previewRef}
                getBackgroundStyle={getBackgroundStyle}
                onSelect={() => {
                  if (activeScreenshotId !== screenshot.id) {
                    stopInlineEditing();
                    setActiveScreenshotId(screenshot.id);
                    setSelectedElement(null);
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
