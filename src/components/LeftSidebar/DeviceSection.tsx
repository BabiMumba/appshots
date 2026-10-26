/**
 * DeviceSection — pick device model + color (minimal).
 */

import type { DeviceSpec } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { ColorButton } from "./ColorButton";
import { STYLES } from "./constants";

interface DeviceSectionProps {
  devices: DeviceSpec[];
  selectedDeviceId: string;
  selectedColorId: string;
  selectedDevice: DeviceSpec;
  onDeviceSelect: (deviceId: string, defaultColorId: string) => void;
  onColorSelect: (colorId: string) => void;
}

export const DeviceSection = ({
  devices,
  selectedDeviceId,
  selectedColorId,
  selectedDevice,
  onDeviceSelect,
  onColorSelect,
}: DeviceSectionProps) => (
  <SidebarSection title="Device">
    <label className="block">
      <span className="text-xs text-gray-400 mb-1.5 block">Model</span>
      <select
        value={selectedDeviceId}
        onChange={(e) => {
          const next = devices.find((d) => d.id === e.target.value);
          if (next) onDeviceSelect(next.id, next.colors[0].id);
        }}
        className={STYLES.select}
      >
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.label}
          </option>
        ))}
      </select>
    </label>

    <div className="mt-3">
      <p className="text-xs text-gray-400 mb-2">Color</p>
      <div className={STYLES.colorPicker}>
        {selectedDevice.colors.map((color) => (
          <ColorButton
            key={color.id}
            color={color.frame}
            label={color.label}
            isSelected={selectedColorId === color.id}
            onClick={() => onColorSelect(color.id)}
          />
        ))}
      </div>
    </div>
  </SidebarSection>
);
