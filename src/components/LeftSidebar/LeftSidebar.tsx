/**
 * LeftSidebar — projects + export only (device controls live on the right).
 */

import { useEditor } from "../../context/EditorContext";
import { exportPacks, exportSizes } from "../../constants";
import { SidebarHeader } from "./SidebarHeader";
import { ExportSection } from "./ExportSection";
import { ProjectSwitcher } from "../ProjectSwitcher";
import { STYLES } from "./constants";

export const LeftSidebar = () => {
  const {
    exportSizeId,
    setExportSizeId,
    exportSizeIds,
    toggleExportSizeId,
    applyExportPack,
    projectKind,
    createProjectOfKind,
    handleExport,
    screenshots,
    isExporting,
    exportError,
    dismissExportError,
  } = useEditor();

  return (
    <aside className={STYLES.sidebar}>
      <SidebarHeader />

      <div className="px-4 pb-4 border-b border-zinc-800">
        <ProjectSwitcher />
      </div>

      <div className={STYLES.content}>
        <ExportSection
          exportSizes={exportSizes}
          exportPacks={exportPacks}
          selectedSizeId={exportSizeId}
          selectedSizeIds={exportSizeIds}
          screenshots={screenshots}
          projectKind={projectKind}
          isExporting={isExporting}
          exportError={exportError}
          onCreateProjectOfKind={createProjectOfKind}
          onSizeSelect={setExportSizeId}
          onToggleExtraSize={toggleExportSizeId}
          onApplyPack={applyExportPack}
          onExport={handleExport}
          onDismissError={dismissExportError}
        />
      </div>
    </aside>
  );
};
