/**
 * ScreenshotImageSection Component
 *
 * Screenshot image upload + crop/zoom/pan controls.
 */

import type { RefObject } from "react";
import type { DeviceInstance } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { RangeSlider } from "./RangeSlider";
import { STYLES } from "./constants";

interface ScreenshotImageSectionProps {
  device: DeviceInstance;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateDevice: (updates: Partial<DeviceInstance>) => void;
}

export const ScreenshotImageSection = ({
  device,
  fileInputRef,
  onFileUpload,
  onUpdateDevice,
}: ScreenshotImageSectionProps) => (
  <SidebarSection title="Device Screen Image">
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={onFileUpload}
      className="hidden"
    />
    <button
      onClick={() => fileInputRef.current?.click()}
      className={STYLES.uploadButton}
    >
      {device.screenshotSrc ? "Change Image" : "Upload Image"}
    </button>

    {device.screenshotSrc && (
      <div className="mt-3 space-y-2">
        <RangeSlider
          label="Zoom"
          value={Math.round((device.imageZoom ?? 1) * 100)}
          min={50}
          max={250}
          unit="%"
          onChange={(v) => onUpdateDevice({ imageZoom: v / 100 })}
        />
        <RangeSlider
          label="Pan X"
          value={Math.round(device.imageOffsetX ?? 0)}
          min={-40}
          max={40}
          unit="%"
          onChange={(v) => onUpdateDevice({ imageOffsetX: v })}
        />
        <RangeSlider
          label="Pan Y"
          value={Math.round(device.imageOffsetY ?? 0)}
          min={-40}
          max={40}
          unit="%"
          onChange={(v) => onUpdateDevice({ imageOffsetY: v })}
        />
        <button
          type="button"
          className="w-full text-xs text-gray-400 hover:text-white py-1"
          onClick={() =>
            onUpdateDevice({ imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0 })
          }
        >
          Reset crop
        </button>
      </div>
    )}
  </SidebarSection>
);
