/**
 * AppearanceSection — background + selected-text color/font fallbacks.
 */

import { ChevronDown } from "lucide-react";
import type { Screenshot, GradientPreset } from "../../types";
import { useEditor } from "../../context/EditorContext";
import { SidebarSection } from "./SidebarSection";
import { BackgroundPicker } from "./BackgroundPicker";
import { STYLES } from "./constants";

interface AppearanceSectionProps {
  screenshot: Screenshot;
  gradientPresets: GradientPreset[];
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
  onOpenFontPicker: () => void;
}

export const AppearanceSection = ({
  screenshot,
  gradientPresets,
  onUpdateScreenshot,
  onOpenFontPicker,
}: AppearanceSectionProps) => {
  const { selectedElement, updateText } = useEditor();

  const textId =
    selectedElement?.screenshotId === screenshot.id &&
    selectedElement.type === "text"
      ? selectedElement.id
      : null;

  const text = textId
    ? (screenshot.texts ?? []).find((t) => t.id === textId)
    : null;

  const currentColor = text?.color ?? screenshot.textColor ?? "#ffffff";
  const currentFont = text?.fontFamily ?? screenshot.fontFamily ?? "Inter";

  return (
    <SidebarSection title="Appearance">
      <div className="space-y-4">
        <BackgroundPicker
          screenshot={screenshot}
          gradientPresets={gradientPresets}
          onUpdateScreenshot={onUpdateScreenshot}
        />

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Text Color{text ? " · selected" : ""}
          </label>
          <input
            type="color"
            value={
              /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(currentColor)
                ? currentColor
                : "#ffffff"
            }
            onChange={(e) => {
              const color = e.target.value;
              if (textId) updateText(textId, { color });
              else onUpdateScreenshot({ textColor: color });
            }}
            className={STYLES.colorInput}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Font{text ? " · selected" : " (select text)"}
          </label>
          <button onClick={onOpenFontPicker} className={STYLES.dropdownButton}>
            <span style={{ fontFamily: `'${currentFont}', sans-serif` }}>
              {currentFont}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <p className="mt-1 text-[10px] text-gray-500">
            Opens the font library — also in the top format bar.
          </p>
        </div>
      </div>
    </SidebarSection>
  );
};
