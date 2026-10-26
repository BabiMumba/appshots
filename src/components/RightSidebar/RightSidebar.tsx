/**
 * RightSidebar Component
 *
 * Main sidebar containing position presets, layout, content, appearance, and overlay image controls.
 */

import { useEditor } from "../../context/EditorContext";
import { gradientPresets } from "../../constants";
import { DeviceInstancesSection } from "./DeviceInstancesSection";
import { ScreenshotImageSection } from "./ScreenshotImageSection";
import { PositionPresets } from "./PositionPresets";
import { LayoutSection } from "./LayoutSection";
import { ContentSection } from "./ContentSection";
import { AppearanceSection } from "./AppearanceSection";
import { OverlayImagesSection } from "./OverlayImagesSection";
import { IconLibrarySection } from "./IconLibrarySection";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

export const RightSidebar = () => {
  const {
    activeScreenshot,
    activeDevice,
    updateActiveScreenshot,
    headlineFontSize,
    setHeadlineFontSize,
    subheadlineFontSize,
    setSubheadlineFontSize,
    setIsFontPickerOpen,
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
    updateOverlayImageRotation,
    updateOverlayImageShadow,
    addDevice,
    selectDevice,
    removeDevice,
    bringDeviceForward,
    sendDeviceBackward,
    bringImageForward,
    sendImageBackward,
  } = useEditor();

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
              onUpdateDevice={(updates) =>
                updateActiveScreenshot({
                  devices: activeScreenshot.devices.map((device) =>
                    device.id === activeDevice.id
                      ? { ...device, ...updates }
                      : device,
                  ),
                })
              }
            />

            <PositionPresets
              device={activeDevice}
              onUpdateDevice={(updates) =>
                updateActiveScreenshot({
                  devices: activeScreenshot.devices.map((device) =>
                    device.id === activeDevice.id
                      ? { ...device, ...updates }
                      : device,
                  ),
                })
              }
            />

            <LayoutSection
              device={activeDevice}
              screenshot={activeScreenshot}
              headlineFontSize={headlineFontSize}
              subheadlineFontSize={subheadlineFontSize}
              onUpdateDevice={(updates) =>
                updateActiveScreenshot({
                  devices: activeScreenshot.devices.map((device) =>
                    device.id === activeDevice.id
                      ? { ...device, ...updates }
                      : device,
                  ),
                })
              }
              onUpdateScreenshot={updateActiveScreenshot}
              onHeadlineSizeChange={setHeadlineFontSize}
              onSubheadlineSizeChange={setSubheadlineFontSize}
            />
          </>
        ) : (
          <SidebarSection title="Device">
            <p className="text-xs text-gray-400 mb-2">
              No device on this screenshot — free space for text & overlays.
            </p>
            <button onClick={addDevice} className={STYLES.uploadButton}>
              + Add Device
            </button>
            <div className="mt-3 space-y-2">
              <label className="block text-xs text-gray-400">
                Headline size: {headlineFontSize}px
              </label>
              <input
                type="range"
                min={24}
                max={160}
                value={headlineFontSize}
                onChange={(e) => setHeadlineFontSize(Number(e.target.value))}
                className="w-full"
              />
              <label className="block text-xs text-gray-400">
                Subheadline size: {subheadlineFontSize}px
              </label>
              <input
                type="range"
                min={16}
                max={96}
                value={subheadlineFontSize}
                onChange={(e) => setSubheadlineFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
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
          onOpenFontPicker={() => setIsFontPickerOpen(true)}
        />

        <IconLibrarySection onAddIcon={addIcon} />

        <OverlayImagesSection
          screenshot={activeScreenshot}
          selectedElement={selectedElement}
          overlayImageInputRef={overlayImageInputRef}
          onSelectElement={setSelectedElement}
          onAddImage={addOverlayImage}
          onRemoveImage={removeOverlayImage}
          onUpdateSize={updateOverlayImageSize}
          onUpdateLayer={updateOverlayImageLayer}
          onUpdateRotation={updateOverlayImageRotation}
          onUpdateShadow={updateOverlayImageShadow}
          onBringForward={bringImageForward}
          onSendBackward={sendImageBackward}
        />
      </div>
    </aside>
  );
};
