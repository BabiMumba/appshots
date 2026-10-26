/**
 * OverlayImagesSection — list + essentials when one is selected.
 */

import type { RefObject } from "react";
import type { Screenshot, ShadowConfig } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { OverlayImageItem } from "./OverlayImageItem";
import { OverlayImageProperties } from "./OverlayImageProperties";
import { STYLES } from "./constants";
import type { SelectedElement } from "./types";

interface OverlayImagesSectionProps {
  screenshot: Screenshot;
  selectedElement: SelectedElement | null;
  overlayImageInputRef: RefObject<HTMLInputElement | null>;
  onSelectElement: (element: SelectedElement | null) => void;
  onAddImage: (file: File) => void;
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
      <div className="space-y-2">
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

        {screenshot.overlayImages.length > 0 && (
          <div className="space-y-2 mt-3">
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
