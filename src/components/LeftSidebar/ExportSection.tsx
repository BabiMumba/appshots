/**
 * ExportSection Component
 *
 * Store-aware export size selection with multi-size export support.
 */

import type { ExportSize } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ExportSectionProps {
  exportSizes: ExportSize[];
  selectedSizeId: string;
  selectedSizeIds: string[];
  screenshotCount: number;
  onSizeSelect: (sizeId: string) => void;
  onToggleExtraSize: (sizeId: string) => void;
  onExport: () => void;
}

function groupSizes(sizes: ExportSize[]): Map<string, ExportSize[]> {
  const map = new Map<string, ExportSize[]>();
  for (const size of sizes) {
    const list = map.get(size.group) ?? [];
    list.push(size);
    map.set(size.group, list);
  }
  return map;
}

export const ExportSection = ({
  exportSizes,
  selectedSizeId,
  selectedSizeIds,
  screenshotCount,
  onSizeSelect,
  onToggleExtraSize,
  onExport,
}: ExportSectionProps) => {
  const groups = groupSizes(exportSizes);
  const selected = exportSizes.find((s) => s.id === selectedSizeId);
  const exportCount = Math.max(selectedSizeIds.length, 1);

  return (
    <SidebarSection title="Export">
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {Array.from(groups.entries()).map(([group, sizes]) => (
          <div key={group}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              {group}
            </p>
            <div className={STYLES.buttonList}>
              {sizes.map((size) => {
                const isPrimary = selectedSizeId === size.id;
                const isChecked = selectedSizeIds.includes(size.id);
                return (
                  <div key={size.id} className="flex items-stretch gap-1">
                    <button
                      type="button"
                      className={`${STYLES.selectionButton} flex-1 ${
                        isPrimary
                          ? STYLES.selectionButtonActive
                          : STYLES.selectionButtonInactive
                      }`}
                      onClick={() => onSizeSelect(size.id)}
                    >
                      <span className="block text-xs leading-snug">
                        {size.shortLabel}
                      </span>
                      <span
                        className={`block text-[10px] mt-0.5 ${
                          isPrimary ? "text-black/60" : "text-gray-500"
                        }`}
                      >
                        {size.width}×{size.height}
                        {size.required ? " · required" : ""}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Include in multi-export"
                      onClick={() => onToggleExtraSize(size.id)}
                      className={`w-8 shrink-0 rounded-md text-xs font-bold transition-colors ${
                        isChecked
                          ? "bg-emerald-500 text-black"
                          : "bg-[#2a2a2a] text-gray-500 hover:bg-[#333]"
                      }`}
                    >
                      {isChecked ? "✓" : "+"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <p className="mt-2 text-[11px] text-gray-400">
          Preview:{" "}
          <span className="text-gray-200">
            {selected.width}×{selected.height}
          </span>
          {selected.store === "appstore" && (
            <span className="ml-1 text-emerald-400">· App Store OK</span>
          )}
          {selected.store === "play" && (
            <span className="ml-1 text-emerald-400">· Play OK</span>
          )}
        </p>
      )}

      <button onClick={onExport} className={STYLES.primaryButton}>
        Export {screenshotCount} shot{screenshotCount !== 1 ? "s" : ""}
        {exportCount > 1 ? ` × ${exportCount} sizes` : ""}
      </button>
    </SidebarSection>
  );
};
