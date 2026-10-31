import { useState } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { CanvasPreview } from "./CanvasPreview";
import { FontPicker } from "./FontPicker";
import { ExportSuccessModal } from "./ExportSuccessModal";
import { useEditor } from "../context/EditorContext";
import {
  readLeftSidebarOpen,
  writeLeftSidebarOpen,
} from "../lib/left-sidebar-pref";

export const EditorLayout = () => {
  const {
    isFontPickerOpen,
    setIsFontPickerOpen,
    isExportSuccessOpen,
    setIsExportSuccessOpen,
    activeScreenshot,
    activeProject,
    activeProjectId,
    screenshots,
    selectedElement,
    updateActiveScreenshot,
    updateText,
    renameProject,
  } = useEditor();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(readLeftSidebarOpen);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((open) => {
      const next = !open;
      writeLeftSidebarOpen(next);
      return next;
    });
  };

  const selectedText =
    selectedElement?.type === "text" && selectedElement.id
      ? (activeScreenshot.texts ?? []).find((t) => t.id === selectedElement.id)
      : null;

  const selectedFontFamily =
    selectedText?.fontFamily ?? activeScreenshot.fontFamily ?? "Inter";

  const handleFontSelect = (fontFamily: string) => {
    if (selectedElement?.type === "text" && selectedElement.id) {
      updateText(
        selectedElement.id,
        { fontFamily },
        selectedElement.screenshotId,
      );
      return;
    }
    const texts = (activeScreenshot.texts ?? []).map((t) => ({
      ...t,
      fontFamily,
    }));
    updateActiveScreenshot({
      texts,
      fontFamily,
      headlineFontFamily: fontFamily,
      subheadlineFontFamily: fontFamily,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)] overflow-hidden">
      <div className="flex flex-1 overflow-hidden min-w-0">
        <LeftSidebar open={leftSidebarOpen} onToggle={toggleLeftSidebar} />
        <CanvasPreview />
        <RightSidebar />
        <FontPicker
          isOpen={isFontPickerOpen}
          onClose={() => setIsFontPickerOpen(false)}
          selectedFontFamily={selectedFontFamily}
          onSelect={handleFontSelect}
        />
        <ExportSuccessModal
          isOpen={isExportSuccessOpen}
          projectName={activeProject.name}
          screenshotCount={screenshots.length}
          onClose={() => setIsExportSuccessOpen(false)}
          onRename={(name) => renameProject(activeProjectId, name)}
        />
      </div>
    </div>
  );
};
