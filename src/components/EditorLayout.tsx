import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { CanvasPreview } from "./CanvasPreview";
import { FontPicker } from "./FontPicker";
import { ExportSuccessModal } from "./ExportSuccessModal";
import { useEditor } from "../context/EditorContext";

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
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
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
