/**
 * LayoutSection — style / presets / 3D / shadow.
 * Move, resize, 2D rotate: use the device on the canvas (no sidebar duplicates).
 */

import type { DeviceInstance, ShadowConfig } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { RangeSlider } from "./RangeSlider";
import { PositionPresets } from "./PositionPresets";
import { Toggle } from "./Toggle";
import { ApplyToAllButton } from "./ApplyToAllButton";
import { SLIDER_RANGES, STYLES } from "./constants";

interface LayoutSectionProps {
  device: DeviceInstance;
  onUpdateDevice: (updates: Partial<DeviceInstance>) => void;
  canApplyToAll?: boolean;
  onApplyToAll?: () => void;
}

export const LayoutSection = ({
  device,
  onUpdateDevice,
  canApplyToAll = false,
  onApplyToAll,
}: LayoutSectionProps) => {
  const is3D = device.style === "3d";

  const handleShadowUpdate = (updates: Partial<ShadowConfig>) => {
    onUpdateDevice({
      shadow: { ...device.shadow, ...updates },
    });
  };

  return (
    <SidebarSection title="Layout" sectionId="layout">
      <div className="space-y-3">
        <PositionPresets device={device} onUpdateDevice={onUpdateDevice} />

        <label className="block">
          <span className="text-xs text-gray-400 mb-1.5 block">Style</span>
          <select
            value={device.style ?? "flat"}
            onChange={(e) => {
              const next = e.target.value === "3d" ? "3d" : "flat";
              if (next === "3d") {
                onUpdateDevice({
                  style: "3d",
                  rotation: 0,
                  rotateY: device.rotateY || -18,
                  rotateX: device.rotateX || 6,
                });
                return;
              }
              onUpdateDevice({ style: "flat", rotateY: 0, rotateX: 0 });
            }}
            className={STYLES.select}
          >
            <option value="flat">Flat</option>
            <option value="3d">3D</option>
          </select>
        </label>

        <p className="text-[10px] text-zinc-500 leading-relaxed">
          On the canvas: drag to move · corner handles to resize
          {is3D ? "" : " · top handle to rotate"}
        </p>

        {is3D && (
          <>
            <RangeSlider
              label="3D yaw (Y)"
              value={device.rotateY}
              min={SLIDER_RANGES.device3dRotateY.min}
              max={SLIDER_RANGES.device3dRotateY.max}
              unit="°"
              onChange={(v) => onUpdateDevice({ rotateY: v })}
            />
            <RangeSlider
              label="3D pitch (X)"
              value={device.rotateX}
              min={SLIDER_RANGES.device3dRotateX.min}
              max={SLIDER_RANGES.device3dRotateX.max}
              unit="°"
              onChange={(v) => onUpdateDevice({ rotateX: v })}
            />
          </>
        )}

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

        {onApplyToAll && (
          <ApplyToAllButton
            label="Apply layout to all screens"
            disabled={!canApplyToAll}
            onClick={onApplyToAll}
          />
        )}
      </div>
    </SidebarSection>
  );
};
