/**
 * RightSidebar — devices, layout, content, background, overlays.
 */

import { useEffect, useRef } from "react";
import { useEditor } from "../../context/EditorContext";
import { devices, gradientPresets } from "../../constants";
import type { DeviceInstance } from "../../types";
import { DeviceInstancesSection } from "./DeviceInstancesSection";
import { ActiveDeviceSection } from "./ActiveDeviceSection";
import { ScreenshotImageSection } from "./ScreenshotImageSection";
import { LayoutSection } from "./LayoutSection";
import { ContentSection } from "./ContentSection";
import { AppearanceSection } from "./AppearanceSection";
import { OverlayImagesSection } from "./OverlayImagesSection";
import { ShapesSection } from "./ShapesSection";
import { LayersPanel } from "./LayersPanel";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

function sectionIdForSelection(
  type: "text" | "image" | "device" | "shape" | undefined,
): string | null {
  if (type === "shape") return "shapes";
  if (type === "image") return "overlays";
  if (type === "text") return "content";
  if (type === "device") return "layout";
  return null;
}

export const RightSidebar = () => {
  const {
    activeScreenshot,
    activeDevice,
    updateActiveScreenshot,
    fileInputRef,
    handleFileUpload,
    addIcon,
    overlayImageInputRef,
    addOverlayImage,
    selectedElement,
    setSelectedElement,
    removeOverlayImage,
    updateOverlayImageSize,
    updateOverlayImageOpacity,
    updateOverlayImageLayer,
    updateOverlayImageShadow,
    addShape,
    removeShape,
    updateShape,
    setShapeFillImage,
    bringShapeForward,
    sendShapeBackward,
    addDevice,
    selectDevice,
    removeDevice,
    bringDeviceForward,
    sendDeviceBackward,
    bringImageForward,
    sendImageBackward,
    moveElementLayer,
    toggleElementHidden,
    toggleElementLocked,
    screenshots,
    applyStyleToAllScreens,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedColorId,
    setSelectedColorId,
    selectedDevice,
  } = useEditor();

  const canApplyToAll = screenshots.length > 1;
  const sidebarRef = useRef<HTMLElement>(null);
  const lastScrolledKey = useRef<string | null>(null);

  useEffect(() => {
    const sectionId = sectionIdForSelection(selectedElement?.type);
    if (!sectionId || !sidebarRef.current) return;

    const key = `${selectedElement?.type}:${selectedElement?.id ?? ""}:${selectedElement?.screenshotId ?? ""}`;
    if (lastScrolledKey.current === key) return;
    lastScrolledKey.current = key;

    const target = sidebarRef.current.querySelector(
      `[data-sidebar-section="${sectionId}"]`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedElement]);

  const patchActiveDevice = (updates: Partial<DeviceInstance>) => {
    if (!activeDevice) return;
    updateActiveScreenshot({
      devices: activeScreenshot.devices.map((device) =>
        device.id === activeDevice.id ? { ...device, ...updates } : device,
      ),
    });
  };

  const handleDeviceSelect = (deviceId: string, defaultColorId: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedColorId(defaultColorId);
  };

  return (
    <aside ref={sidebarRef} className={STYLES.sidebar}>
      <div className={STYLES.content}>
        <DeviceInstancesSection
          screenshot={activeScreenshot}
          onAddDevice={addDevice}
          onSelectDevice={selectDevice}
          onRemoveDevice={removeDevice}
          onBringForward={bringDeviceForward}
          onSendBackward={sendDeviceBackward}
        />

        {activeDevice ? (
          <>
            <ActiveDeviceSection
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              selectedColorId={selectedColorId}
              selectedDevice={selectedDevice}
              onDeviceSelect={handleDeviceSelect}
              onColorSelect={setSelectedColorId}
            />

            <ScreenshotImageSection
              device={activeDevice}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onUpdateDevice={patchActiveDevice}
            />

            <LayoutSection
              device={activeDevice}
              onUpdateDevice={patchActiveDevice}
              canApplyToAll={canApplyToAll}
              onApplyToAll={() => applyStyleToAllScreens("layout")}
            />
          </>
        ) : (
          <SidebarSection title="Device">
            <p className="text-xs text-gray-400 mb-3">
              No device on this screen — space for text & overlays.
            </p>
            <button onClick={addDevice} className={STYLES.uploadButton}>
              + Add Device
            </button>
          </SidebarSection>
        )}

        <ContentSection
          screenshot={activeScreenshot}
          onUpdateScreenshot={updateActiveScreenshot}
          canApplyToAll={canApplyToAll}
          onApplyToAll={() => applyStyleToAllScreens("textStyle")}
        />

        <AppearanceSection
          screenshot={activeScreenshot}
          gradientPresets={gradientPresets}
          onUpdateScreenshot={updateActiveScreenshot}
          canApplyToAll={canApplyToAll}
          onApplyToAll={() => applyStyleToAllScreens("background")}
        />

        <ShapesSection
          screenshot={activeScreenshot}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onAddShape={addShape}
          onRemoveShape={removeShape}
          onUpdateShape={updateShape}
          onSetFillImage={setShapeFillImage}
          onBringForward={bringShapeForward}
          onSendBackward={sendShapeBackward}
        />

        <OverlayImagesSection
          screenshot={activeScreenshot}
          selectedElement={selectedElement}
          overlayImageInputRef={overlayImageInputRef}
          onSelectElement={setSelectedElement}
          onAddImage={addOverlayImage}
          onAddIcon={addIcon}
          onRemoveImage={removeOverlayImage}
          onUpdateSize={updateOverlayImageSize}
          onUpdateOpacity={updateOverlayImageOpacity}
          onUpdateLayer={updateOverlayImageLayer}
          onUpdateShadow={updateOverlayImageShadow}
          onBringForward={bringImageForward}
          onSendBackward={sendImageBackward}
        />

        <LayersPanel
          screenshot={activeScreenshot}
          selectedElement={selectedElement}
          onSelect={setSelectedElement}
          onReorder={(key, action) => {
            const parsed = key.includes(":")
              ? {
                  type: key.split(":")[0] as
                    | "text"
                    | "image"
                    | "device"
                    | "shape",
                  id: key.slice(key.indexOf(":") + 1),
                }
              : null;
            if (!parsed) return;
            moveElementLayer(parsed.type, parsed.id, action);
          }}
          onToggleHidden={toggleElementHidden}
          onToggleLocked={toggleElementLocked}
        />
      </div>
    </aside>
  );
};
