/**
 * AppearanceSection — background only (text color/font live in the format bar).
 */

import type { Screenshot, GradientPreset } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { BackgroundPicker } from "./BackgroundPicker";

interface AppearanceSectionProps {
  screenshot: Screenshot;
  gradientPresets: GradientPreset[];
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
}

export const AppearanceSection = ({
  screenshot,
  gradientPresets,
  onUpdateScreenshot,
}: AppearanceSectionProps) => (
  <SidebarSection title="Background">
    <BackgroundPicker
      screenshot={screenshot}
      gradientPresets={gradientPresets}
      onUpdateScreenshot={onUpdateScreenshot}
    />
  </SidebarSection>
);
