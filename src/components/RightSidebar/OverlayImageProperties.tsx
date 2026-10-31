/**
 * OverlayImageProperties — essentials only (size + layer; rotate on canvas).
 */

import { RangeSlider } from "./RangeSlider";
import { Toggle } from "./Toggle";
import { STYLES, SLIDER_RANGES } from "./constants";
import type { OverlayImagePropertiesProps } from "./types";

export const OverlayImageProperties = ({
  image,
  onSizeChange,
  onOpacityChange,
  onLayerChange,
  onShadowToggle,
  onShadowBlurChange,
}: OverlayImagePropertiesProps) => (
  <div className={STYLES.propertiesPanel}>
    <RangeSlider
      label="Size"
      value={image.width}
      min={SLIDER_RANGES.imageSize.min}
      max={SLIDER_RANGES.imageSize.max}
      onChange={onSizeChange}
      showValue={false}
    />

    <RangeSlider
      label="Opacity"
      value={image.opacity ?? 100}
      min={0}
      max={100}
      unit="%"
      onChange={onOpacityChange}
    />

    <label className="block">
      <span className="text-xs text-gray-400 mb-1.5 block">Layer</span>
      <select
        value={image.layer ?? "front"}
        onChange={(e) =>
          onLayerChange(e.target.value === "behind" ? "behind" : "front")
        }
        className={STYLES.select}
      >
        <option value="front">In front of device</option>
        <option value="behind">Behind device</option>
      </select>
    </label>

    <div className="pt-1 border-t border-white/10 space-y-2">
      <Toggle
        label="Shadow"
        enabled={Boolean(image.shadow?.enabled)}
        onChange={onShadowToggle}
      />
      {image.shadow?.enabled && (
        <RangeSlider
          label="Blur"
          value={image.shadow.blur}
          min={SLIDER_RANGES.shadowBlur.min}
          max={SLIDER_RANGES.shadowBlur.max}
          unit="px"
          onChange={onShadowBlurChange}
        />
      )}
    </div>
  </div>
);
