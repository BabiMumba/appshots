/**
 * LeftSidebar Component
 *
 * Main sidebar containing project switcher, device selection and export options.
 */

import { useEditor } from "../../context/EditorContext";
import { devices, exportSizes } from "../../constants";
import { SidebarHeader } from "./SidebarHeader";
import { DeviceSection } from "./DeviceSection";
import { ExportSection } from "./ExportSection";
import { ProjectSwitcher } from "../ProjectSwitcher";
import { STYLES } from "./constants";

export const LeftSidebar = () => {
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    selectedColorId,
    setSelectedColorId,
    selectedDevice,
    exportSizeId,
    setExportSizeId,
    exportSizeIds,
    toggleExportSizeId,
    handleExport,
    screenshots,
  } = useEditor();

  const handleDeviceSelect = (deviceId: string, defaultColorId: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedColorId(defaultColorId);
  };

  return (
    <aside className={STYLES.sidebar}>
      <SidebarHeader />

      <div className="px-4 pb-4 border-b border-zinc-800">
        <ProjectSwitcher />
      </div>

      <div className={STYLES.content}>
        <DeviceSection
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          selectedColorId={selectedColorId}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
          onColorSelect={setSelectedColorId}
        />

        <ExportSection
          exportSizes={exportSizes}
          selectedSizeId={exportSizeId}
          selectedSizeIds={exportSizeIds}
          screenshotCount={screenshots.length}
          onSizeSelect={setExportSizeId}
          onToggleExtraSize={toggleExportSizeId}
          onExport={handleExport}
        />
      </div>
    </aside>
  );
};
