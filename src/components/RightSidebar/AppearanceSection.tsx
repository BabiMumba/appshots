/**
 * AppearanceSection — background only (text color/font live in the format bar).
 */

import type { Screenshot, GradientPreset } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { BackgroundPicker } from "./BackgroundPicker";
import { ApplyToAllButton } from "./ApplyToAllButton";

interface AppearanceSectionProps {
  screenshot: Screenshot;
  gradientPresets: GradientPreset[];
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
  canApplyToAll?: boolean;
  onApplyToAll?: () => void;
}

export const AppearanceSection = ({
  screenshot,
  gradientPresets,
  onUpdateScreenshot,
  canApplyToAll = false,
  onApplyToAll,
}: AppearanceSectionProps) => (
  <SidebarSection title="Background" sectionId="appearance">
    <BackgroundPicker
      screenshot={screenshot}
      gradientPresets={gradientPresets}
      onUpdateScreenshot={onUpdateScreenshot}
    />
    {onApplyToAll && (
      <ApplyToAllButton
        label="Apply background to all screens"
        disabled={!canApplyToAll}
        onClick={onApplyToAll}
      />
    )}
  </SidebarSection>
);
