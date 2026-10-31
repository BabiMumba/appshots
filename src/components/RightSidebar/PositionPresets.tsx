/**
 * PositionPresets — common phone layouts (incl. small feature-graphic sizes).
 */

import type { DeviceInstance } from "../../types";
import { STYLES } from "./constants";

interface PositionPresetsProps {
  device: DeviceInstance;
  onUpdateDevice: (updates: Partial<DeviceInstance>) => void;
}

const PRESETS: {
  id: string;
  label: string;
  settings: Partial<DeviceInstance>;
}[] = [
  {
    id: "centered",
    label: "Centered",
    settings: {
      scale: 65,
      y: 35,
      x: 50,
      rotation: 0,
      style: "flat",
      rotateY: 0,
      rotateX: 0,
    },
  },
  {
    id: "bleed-bottom",
    label: "Bleed bottom",
    settings: {
      scale: 70,
      y: 48,
      x: 50,
      rotation: 0,
      style: "flat",
      rotateY: 0,
      rotateX: 0,
    },
  },
  {
    id: "feature-hero",
    label: "Feature — hero phone",
    settings: {
      scale: 32,
      x: 78,
      y: 52,
      rotation: 0,
      style: "3d",
      rotateY: -22,
      rotateX: 4,
      shadow: { enabled: false, color: "#000", blur: 40, offsetX: 0, offsetY: 20 },
    },
  },
  {
    id: "feature-small",
    label: "Feature — small phone",
    settings: {
      scale: 22,
      x: 75,
      y: 50,
      rotation: 0,
      style: "3d",
      rotateY: -16,
      rotateX: 3,
      shadow: { enabled: false, color: "#000", blur: 40, offsetX: 0, offsetY: 20 },
    },
  },
  {
    id: "feature-cluster",
    label: "Feature — cluster size",
    settings: {
      scale: 18,
      x: 70,
      y: 50,
      rotation: 0,
      style: "3d",
      rotateY: -12,
      rotateX: 4,
      shadow: { enabled: false, color: "#000", blur: 40, offsetX: 0, offsetY: 20 },
    },
  },
  {
    id: "tilt-left",
    label: "Tilt left (flat)",
    settings: {
      scale: 55,
      y: 40,
      rotation: -12,
      style: "flat",
      rotateY: 0,
      rotateX: 0,
    },
  },
  {
    id: "tilt-right",
    label: "Tilt right (flat)",
    settings: {
      scale: 55,
      y: 40,
      rotation: 12,
      style: "flat",
      rotateY: 0,
      rotateX: 0,
    },
  },
  {
    id: "perspective",
    label: "Perspective (3D)",
    settings: {
      scale: 48,
      y: 40,
      rotation: 0,
      style: "3d",
      rotateY: -24,
      rotateX: 6,
    },
  },
  {
    id: "perspective-right",
    label: "Perspective right (3D)",
    settings: {
      scale: 48,
      y: 40,
      rotation: 0,
      style: "3d",
      rotateY: 24,
      rotateX: 6,
    },
  },
];

function matchPreset(device: DeviceInstance): string {
  for (const preset of PRESETS) {
    const s = preset.settings;
    if (
      device.scale === s.scale &&
      device.y === s.y &&
      (s.x === undefined || device.x === s.x) &&
      device.rotation === s.rotation &&
      device.style === s.style
    ) {
      return preset.id;
    }
  }
  return "";
}

export const PositionPresets = ({
  device,
  onUpdateDevice,
}: PositionPresetsProps) => {
  const active = matchPreset(device);

  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1.5 block">Layout preset</span>
      <select
        value={active || "__custom__"}
        onChange={(e) => {
          const preset = PRESETS.find((p) => p.id === e.target.value);
          if (preset) onUpdateDevice(preset.settings);
        }}
        className={STYLES.select}
      >
        <option value="__custom__" disabled>
          Custom
        </option>
        {PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
};
