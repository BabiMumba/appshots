import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { CanvasPreview } from "./CanvasPreview";
import { FontPicker } from "./FontPicker";
import { GitHubStarModal } from "./GitHubStarModal";
import { useEditor } from "../context/EditorContext";
import { GITHUB_REPO_URL } from "../constants";
import { Star, X } from "lucide-react";
import { useState } from "react";

export const EditorLayout = () => {
  const {
    isFontPickerOpen,
    setIsFontPickerOpen,
    isStarModalOpen,
    setIsStarModalOpen,
    activeScreenshot,
    selectedElement,
    updateActiveScreenshot,
    updateText,
  } = useEditor();

  const [showBanner, setShowBanner] = useState(true);

  const selectedText =
    selectedElement?.type === "text" && selectedElement.id
      ? (activeScreenshot.texts ?? []).find((t) => t.id === selectedElement.id)
      : null;

  const selectedFontFamily =
    selectedText?.fontFamily ?? activeScreenshot.fontFamily ?? "Inter";

  const handleFontSelect = (fontFamily: string) => {
    if (selectedElement?.type === "text" && selectedElement.id) {
      updateText(selectedElement.id, { fontFamily }, selectedElement.screenshotId);
      return;
    }
    // No text selected — apply to all texts on the active screen
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
      {showBanner && (
        <div className="flex items-center justify-center gap-2 bg-zinc-800 px-4 py-1.5 text-xs text-zinc-300 relative shrink-0">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span>
            AppShots is open source —{" "}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-zinc-100"
            >
              Star us on GitHub
            </a>
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-3 text-zinc-500 hover:text-zinc-300"
          >
            <X size={14} />
          </button>
        </div>
      )}
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
        <GitHubStarModal
          isOpen={isStarModalOpen}
          onClose={() => setIsStarModalOpen(false)}
        />
      </div>
    </div>
  );
};
