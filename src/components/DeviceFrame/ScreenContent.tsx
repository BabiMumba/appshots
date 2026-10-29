/**
 * ScreenContent Component
 *
 * Renders the content displayed on the device screen with cover-fit + zoom/pan.
 * Empty state offers upload CTA + drag-and-drop when interactive.
 */

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

interface ScreenContentProps {
  screenshotSrc: string | null;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  /** When set, empty screen shows upload CTA and accepts drops */
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

  if (screenshotSrc) {
    const zoom = Math.max(0.5, Math.min(3, imageZoom || 1));
    return (
      <div className="w-full h-full overflow-hidden relative bg-black">
        <img
          src={screenshotSrc}
          alt="Screenshot"
          className="absolute left-1/2 top-1/2 max-w-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(calc(-50% + ${imageOffsetX}%), calc(-50% + ${imageOffsetY}%)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />
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

  const takeImageFile = (list: FileList | null | undefined) => {
    const file = list?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onScreenImageFile(file);
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1c1c1e] px-3 text-center transition-colors ${
        isDragOver ? "bg-white/10 ring-2 ring-inset ring-white/40" : ""
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        takeImageFile(e.dataTransfer.files);
      }}
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
