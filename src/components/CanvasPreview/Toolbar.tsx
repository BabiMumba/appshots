/**
 * Toolbar — screenshot strip tools, or feature-graphic artboard tools.
 */

import {
  Plus,
  Copy,
  Undo2,
  Redo2,
  ChevronLeft,
  ChevronRight,
  Type,
} from "lucide-react";
import {
  CanvasZoomControls,
  type CanvasZoomValue,
} from "./CanvasZoomControls";

interface ToolbarProps {
  mode?: "screenshot" | "feature";
  onAddScreenshot: () => void;
  onAddText: () => void;
  onDuplicateScreenshot: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  screenshotCount: number;
  zoom?: CanvasZoomValue;
  fitScale?: number;
  onZoomChange?: (zoom: CanvasZoomValue) => void;
}

export const Toolbar = ({
  mode = "screenshot",
  onAddScreenshot,
  onAddText,
  onDuplicateScreenshot,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  screenshotCount,
  zoom = "fit",
  fitScale = 1,
  onZoomChange,
}: ToolbarProps) => {
  const isFeature = mode === "feature";

  return (
    <div className="h-14 border-b border-white/10 bg-[#141414] flex items-center px-4 gap-3">
      {!isFeature && (
        <>
          <button
            onClick={onAddScreenshot}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Screen
          </button>
        </>
      )}

      <button
        onClick={onAddText}
        className="flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
        title="Add text"
      >
        <Type className="w-4 h-4" />
        Text
      </button>

      {!isFeature && (
        <button
          onClick={onDuplicateScreenshot}
          title="Duplicate the active screen"
          className="flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate screen
        </button>
      )}

      <div className="w-px h-6 bg-white/10" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-300 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:pointer-events-none"
      >
        <Undo2 className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Undo</span>
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-300 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:pointer-events-none"
      >
        <Redo2 className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Redo</span>
      </button>

      {!isFeature && (
        <>
          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            title="Move screenshot left"
            className="p-1.5 rounded-md text-gray-300 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={!canMoveRight}
            title="Move screenshot right"
            className="p-1.5 rounded-md text-gray-300 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="flex-1" />

      {isFeature && onZoomChange && (
        <CanvasZoomControls
          zoom={zoom}
          fitScale={fitScale}
          onChange={onZoomChange}
        />
      )}

      <span className="text-xs text-gray-400">
        {isFeature
          ? "Feature graphic · 1024×500"
          : `${screenshotCount} screenshot${screenshotCount !== 1 ? "s" : ""}`}
      </span>
    </div>
  );
};
