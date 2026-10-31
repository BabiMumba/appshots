/**
 * ScreenContent — device screen image with cover-fit + zoom/pan.
 * Always accepts drag-drop / click upload when interactive (replace too).
 */

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

interface ScreenContentProps {
  screenshotSrc: string | null;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  /** When set, screen accepts drop + click upload (empty or replace) */
  onScreenImageFile?: (file: File) => void;
}

export const ScreenContent = ({
  screenshotSrc,
  imageZoom = 1,
  imageOffsetX = 0,
  imageOffsetY = 0,
  onScreenImageFile,
}: ScreenContentProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const takeImageFile = (list: FileList | null | undefined) => {
    const file = list?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onScreenImageFile?.(file);
  };

  const dragHandlers = onScreenImageFile
    ? {
        onDragEnter: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        },
        onDragLeave: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          takeImageFile(e.dataTransfer.files);
        },
      }
    : {};

  if (screenshotSrc) {
    const zoom = Math.max(0.5, Math.min(3, imageZoom || 1));
    return (
      <div
        className={`w-full h-full overflow-hidden relative bg-black ${
          isDragOver ? "ring-2 ring-inset ring-sky-400/70" : ""
        }`}
        {...dragHandlers}
      >
        <img
          src={screenshotSrc}
          alt="Screenshot"
          className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(calc(-50% + ${imageOffsetX}%), calc(-50% + ${imageOffsetY}%)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 pointer-events-none">
            <span className="text-[10px] font-medium text-white">
              Drop to replace
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!onScreenImageFile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1c1c1e]">
        <span className="text-gray-600 text-[10px]">No image</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1c1c1e] px-3 text-center transition-colors ${
        isDragOver ? "bg-white/10 ring-2 ring-inset ring-white/40" : ""
      }`}
      {...dragHandlers}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          takeImageFile(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ImagePlus className="w-5 h-5 opacity-80" strokeWidth={1.75} />
        <span className="text-[11px] font-medium leading-tight">
          Upload screenshot
        </span>
        <span className="text-[9px] text-zinc-500 leading-tight">
          or drop an image
        </span>
      </button>
    </div>
  );
};
