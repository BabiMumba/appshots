/**
 * PositionPresets — one dropdown for common device layouts.
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
    settings: { scale: 65, y: 35, rotation: 0, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "bleed-bottom",
    label: "Bleed bottom",
    settings: { scale: 70, y: 45, rotation: 0, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "bleed-top",
    label: "Bleed top",
    settings: { scale: 70, y: 15, rotation: 0, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "float-center",
    label: "Float center",
    settings: { scale: 55, y: 30, rotation: 0, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "tilt-left",
    label: "Tilt left",
    settings: { scale: 60, y: 35, rotation: -15, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "tilt-right",
    label: "Tilt right",
    settings: { scale: 60, y: 35, rotation: 15, style: "flat", rotateY: 0, rotateX: 0 },
  },
  {
    id: "perspective",
    label: "Perspective (3D)",
    settings: {
      scale: 60,
      y: 35,
      rotation: 0,
      style: "3d",
      rotateY: -20,
      rotateX: 5,
    },
  },
  {
    id: "float-bottom",
    label: "Float bottom",
    settings: { scale: 50, y: 50, rotation: 0, style: "flat", rotateY: 0, rotateX: 0 },
  },
];

function matchPreset(device: DeviceInstance): string {
  for (const preset of PRESETS) {
    const s = preset.settings;
    if (
      device.scale === s.scale &&
      device.y === s.y &&
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
