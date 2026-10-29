/**
 * RightSidebar — devices, layout, content, background, overlays.
 */

import { useEditor } from "../../context/EditorContext";
import { devices, gradientPresets } from "../../constants";
import type { DeviceInstance } from "../../types";
import { getDeviceSpecById } from "../../lib/device-instances";
import { DeviceInstancesSection } from "./DeviceInstancesSection";
import { ActiveDeviceSection } from "./ActiveDeviceSection";
import { ScreenshotImageSection } from "./ScreenshotImageSection";
import { LayoutSection } from "./LayoutSection";
import { ContentSection } from "./ContentSection";
import { AppearanceSection } from "./AppearanceSection";
import { OverlayImagesSection } from "./OverlayImagesSection";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

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
    updateOverlayImageLayer,
    updateOverlayImageShadow,
    addDevice,
    selectDevice,
    removeDevice,
    bringDeviceForward,
    sendDeviceBackward,
    bringImageForward,
    sendImageBackward,
    screenshots,
    applyStyleToAllScreens,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedColorId,
    setSelectedColorId,
    selectedDevice,
    exportSize,
  } = useEditor();

  const canApplyToAll = screenshots.length > 1;

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

  const deviceSpec = activeDevice
    ? getDeviceSpecById(activeDevice.deviceId)
    : selectedDevice;
  const exportAspect = exportSize.width / exportSize.height;
  const deviceAspect = deviceSpec.width / deviceSpec.height;
  const aspectDelta = Math.abs(exportAspect - deviceAspect) / exportAspect;
  const exportAspectHint =
    aspectDelta > 0.12
      ? `Preview export is ${exportSize.width}×${exportSize.height}. This frame’s aspect differs — scale/position may look different at export.`
      : null;

  return (
    <aside className={STYLES.sidebar}>
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
              exportAspectHint={exportAspectHint}
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

        <OverlayImagesSection
          screenshot={activeScreenshot}
          selectedElement={selectedElement}
          overlayImageInputRef={overlayImageInputRef}
          onSelectElement={setSelectedElement}
          onAddImage={addOverlayImage}
          onAddIcon={addIcon}
          onRemoveImage={removeOverlayImage}
          onUpdateSize={updateOverlayImageSize}
          onUpdateLayer={updateOverlayImageLayer}
          onUpdateShadow={updateOverlayImageShadow}
          onBringForward={bringImageForward}
          onSendBackward={sendImageBackward}
        />
      </div>
    </aside>
  );
};
