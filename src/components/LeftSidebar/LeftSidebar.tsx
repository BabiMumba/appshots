/**
 * LeftSidebar — projects + export only (device controls live on the right).
 * Collapses to a slim rail so the canvas toolbar has more room.
 */

import { Link } from "@tanstack/react-router";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { exportPacks, exportSizes } from "../../constants";
import { BrandMark } from "../Brand/BrandMark";
import { SidebarHeader } from "./SidebarHeader";
import { ExportSection } from "./ExportSection";
import { ProjectSwitcher } from "../ProjectSwitcher";
import { STYLES } from "./constants";

interface LeftSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const LeftSidebar = ({ open, onToggle }: LeftSidebarProps) => {
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

  if (!open) {
    return (
      <aside
        className="w-12 shrink-0 border-r border-[var(--ed-border)] bg-[var(--ed-panel)] text-[var(--ed-fg)] flex flex-col items-center gap-3 py-3"
        aria-label="Projects panel collapsed"
      >
        <button
          type="button"
          title="Show projects & export"
          aria-expanded={false}
          aria-label="Show left sidebar"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ed-border)] text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] hover:text-[var(--ed-fg)] transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <Link
          to="/"
          title="AppShots home"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <BrandMark
            className="text-[var(--ed-fg)]"
            size={22}
            withWordmark={false}
          />
        </Link>
      </aside>
    );
  }

  return (
    <aside className={STYLES.sidebar} aria-label="Projects & export">
      <div className="relative">
        <SidebarHeader />
        <button
          type="button"
          title="Hide projects & export"
          aria-expanded={true}
          aria-label="Hide left sidebar"
          onClick={onToggle}
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] hover:text-[var(--ed-fg)] transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-4 border-b border-[var(--ed-border)]">
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
