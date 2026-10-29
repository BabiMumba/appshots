/**
 * RightSidebar — contextual controls (device, content, background, stickers).
 */

import { useEditor } from "../../context/EditorContext";
import { gradientPresets } from "../../constants";
import type { DeviceInstance } from "../../types";
import { DeviceInstancesSection } from "./DeviceInstancesSection";
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
  } = useEditor();

  const patchActiveDevice = (updates: Partial<DeviceInstance>) => {
    if (!activeDevice) return;
    updateActiveScreenshot({
      devices: activeScreenshot.devices.map((device) =>
        device.id === activeDevice.id ? { ...device, ...updates } : device,
      ),
    });
  };

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
            <ScreenshotImageSection
              device={activeDevice}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onUpdateDevice={patchActiveDevice}
            />

            <LayoutSection
              device={activeDevice}
              onUpdateDevice={patchActiveDevice}
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
        />

        <AppearanceSection
          screenshot={activeScreenshot}
          gradientPresets={gradientPresets}
          onUpdateScreenshot={updateActiveScreenshot}
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
