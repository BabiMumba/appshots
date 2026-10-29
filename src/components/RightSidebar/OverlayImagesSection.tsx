/**
 * OverlayImagesSection — upload + laurel presets + list.
 */

import type { RefObject } from "react";
import type { Screenshot, ShadowConfig } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { OverlayImageItem } from "./OverlayImageItem";
import { OverlayImageProperties } from "./OverlayImageProperties";
import { STYLES } from "./constants";
import type { SelectedElement } from "./types";

const LAUREL_PRESETS = [
  {
    name: "Laurel left",
    src: "/icons/laurel-left.png",
  },
  {
    name: "Laurel right",
    src: "/icons/laurel-right.png",
  },
] as const;

interface OverlayImagesSectionProps {
  screenshot: Screenshot;
  selectedElement: SelectedElement | null;
  overlayImageInputRef: RefObject<HTMLInputElement | null>;
  onSelectElement: (element: SelectedElement | null) => void;
  onAddImage: (file: File) => void;
  onAddIcon: (src: string, name: string) => void;
  onRemoveImage: (id: string) => void;
  onUpdateSize: (id: string, size: number) => void;
  onUpdateLayer: (id: string, layer: "behind" | "front") => void;
  onUpdateShadow: (id: string, shadow: Partial<ShadowConfig>) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const OverlayImagesSection = ({
  screenshot,
  selectedElement,
  overlayImageInputRef,
  onSelectElement,
  onAddImage,
  onAddIcon,
  onRemoveImage,
  onUpdateSize,
  onUpdateLayer,
  onUpdateShadow,
  onBringForward,
  onSendBackward,
}: OverlayImagesSectionProps) => {
  const selectedImage =
    selectedElement?.type === "image" &&
    selectedElement.screenshotId === screenshot.id &&
    selectedElement.id
      ? screenshot.overlayImages.find((img) => img.id === selectedElement.id)
      : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddImage(file);
    e.target.value = "";
  };

  return (
    <SidebarSection title="Overlays">
      <div className="space-y-3">
        <input
          ref={overlayImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => overlayImageInputRef.current?.click()}
          className={STYLES.uploadButton}
        >
          + Add image
        </button>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Laurels</p>
          <div className="grid grid-cols-2 gap-2">
            {LAUREL_PRESETS.map((preset) => (
              <button
                key={preset.src}
                type="button"
                onClick={() => onAddIcon(preset.src, preset.name)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-[#2a2418] p-2 hover:border-white/25 hover:bg-[#3a3220] transition-colors"
                title={`Add ${preset.name}`}
              >
                <img
                  src={preset.src}
                  alt=""
                  className="h-14 w-auto object-contain"
                />
                <span className="text-[10px] text-gray-400 group-hover:text-gray-200">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-gray-500 leading-relaxed">
            Place left + right around a download count. Drag across screens.
          </p>
        </div>

        {screenshot.overlayImages.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-white/10">
            {screenshot.overlayImages.map((img, index) => (
              <OverlayImageItem
                key={img.id}
                image={img}
                index={index}
                totalCount={screenshot.overlayImages.length}
                isSelected={
                  selectedElement?.type === "image" &&
                  selectedElement?.screenshotId === screenshot.id &&
                  selectedElement?.id === img.id
                }
                onSelect={() =>
                  onSelectElement({
                    type: "image",
                    id: img.id,
                    screenshotId: screenshot.id,
                  })
                }
                onRemove={() => onRemoveImage(img.id)}
                onMoveForward={() => onBringForward(img.id)}
                onMoveBackward={() => onSendBackward(img.id)}
              />
            ))}

            {selectedImage && (
              <OverlayImageProperties
                image={selectedImage}
                onSizeChange={(size) => onUpdateSize(selectedImage.id, size)}
                onLayerChange={(layer) =>
                  onUpdateLayer(selectedImage.id, layer)
                }
                onShadowToggle={() =>
                  onUpdateShadow(selectedImage.id, {
                    enabled: !selectedImage.shadow?.enabled,
                  })
                }
                onShadowBlurChange={(blur) =>
                  onUpdateShadow(selectedImage.id, { blur })
                }
              />
            )}
          </div>
        )}
      </div>
    </SidebarSection>
  );
};
