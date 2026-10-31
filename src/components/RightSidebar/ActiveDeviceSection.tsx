/**
 * Active device model + color (moved from left sidebar).
 */

import type { DeviceSpec } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ActiveDeviceSectionProps {
  devices: DeviceSpec[];
  selectedDeviceId: string;
  selectedColorId: string;
  selectedDevice: DeviceSpec;
  onDeviceSelect: (deviceId: string, defaultColorId: string) => void;
  onColorSelect: (colorId: string) => void;
}

export const ActiveDeviceSection = ({
  devices,
  selectedDeviceId,
  selectedColorId,
  selectedDevice,
  onDeviceSelect,
  onColorSelect,
}: ActiveDeviceSectionProps) => (
  <SidebarSection title="Active device">
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
          <button
            key={color.id}
            type="button"
            title={color.label}
            onClick={() => onColorSelect(color.id)}
            className={`${STYLES.colorButton} ${
              selectedColorId === color.id
                ? STYLES.colorButtonActive
                : STYLES.colorButtonInactive
            }`}
            style={{ backgroundColor: color.frame }}
          />
        ))}
      </div>
    </div>

  </SidebarSection>
);
