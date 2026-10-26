/**
 * LayoutSection — device size / position / style (canvas handles drag & rotate).
 */

import type { DeviceInstance, ShadowConfig } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { RangeSlider } from "./RangeSlider";
import { PositionPresets } from "./PositionPresets";
import { Toggle } from "./Toggle";
import { SLIDER_RANGES, STYLES } from "./constants";

interface LayoutSectionProps {
  device: DeviceInstance;
  onUpdateDevice: (updates: Partial<DeviceInstance>) => void;
}

export const LayoutSection = ({
  device,
  onUpdateDevice,
}: LayoutSectionProps) => {
  const is3D = device.style === "3d";

  const handleShadowUpdate = (updates: Partial<ShadowConfig>) => {
    onUpdateDevice({
      shadow: { ...device.shadow, ...updates },
    });
  };

  return (
    <SidebarSection title="Layout">
      <div className="space-y-3">
        <PositionPresets device={device} onUpdateDevice={onUpdateDevice} />

        <label className="block">
          <span className="text-xs text-gray-400 mb-1.5 block">Style</span>
          <select
            value={device.style ?? "flat"}
            onChange={(e) =>
              onUpdateDevice({
                style: e.target.value === "3d" ? "3d" : "flat",
              })
            }
            className={STYLES.select}
          >
            <option value="flat">Flat</option>
            <option value="3d">3D</option>
          </select>
        </label>

        <RangeSlider
          label="Size"
          value={device.scale}
          min={SLIDER_RANGES.deviceScale.min}
          max={SLIDER_RANGES.deviceScale.max}
          unit="%"
          onChange={(v) => onUpdateDevice({ scale: v })}
        />

        <RangeSlider
          label="Vertical position"
          value={device.y}
          min={SLIDER_RANGES.devicePosition.min}
          max={SLIDER_RANGES.devicePosition.max}
          unit="%"
          onChange={(v) => onUpdateDevice({ y: v })}
        />

        {is3D ? (
          <>
            <RangeSlider
              label="3D rotate Y"
              value={device.rotateY}
              min={SLIDER_RANGES.device3dRotateY.min}
              max={SLIDER_RANGES.device3dRotateY.max}
              unit="°"
              onChange={(v) => onUpdateDevice({ rotateY: v })}
            />
            <RangeSlider
              label="3D rotate X"
              value={device.rotateX}
              min={SLIDER_RANGES.device3dRotateX.min}
              max={SLIDER_RANGES.device3dRotateX.max}
              unit="°"
              onChange={(v) => onUpdateDevice({ rotateX: v })}
            />
          </>
        ) : null}

        <div className="pt-1 border-t border-white/10">
          <Toggle
            label="Shadow"
            enabled={device.shadow.enabled}
            onChange={() =>
              handleShadowUpdate({ enabled: !device.shadow.enabled })
            }
          />
          {device.shadow.enabled && (
            <div className="mt-2 space-y-2">
              <RangeSlider
                label="Blur"
                value={device.shadow.blur}
                min={SLIDER_RANGES.shadowBlur.min}
                max={SLIDER_RANGES.shadowBlur.max}
                unit="px"
                onChange={(blur) => handleShadowUpdate({ blur })}
              />
            </div>
          )}
        </div>
      </div>
    </SidebarSection>
  );
};
