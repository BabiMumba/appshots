/**
 * ExportSection — preview size + optional multi-export, then export.
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
      <label className="block">
        <span className="text-xs text-gray-400 mb-1.5 block">Preview size</span>
        <select
          value={selectedSizeId}
          onChange={(e) => onSizeSelect(e.target.value)}
          className={STYLES.select}
        >
          {Array.from(groups.entries()).map(([group, sizes]) => (
            <optgroup key={group} label={group}>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.shortLabel} · {size.width}×{size.height}
                  {size.required ? " (required)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {selected && (
        <p className="mt-2 text-[11px] text-gray-400">
          {selected.width}×{selected.height}
          {selected.store === "appstore" && (
            <span className="ml-1 text-emerald-400">· App Store</span>
          )}
          {selected.store === "play" && (
            <span className="ml-1 text-emerald-400">· Play</span>
          )}
        </p>
      )}

      <details className="mt-3 group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-200 list-none flex items-center justify-between">
          <span>Also export other sizes</span>
          <span className="text-gray-500 group-open:rotate-180 transition-transform">
            ▾
          </span>
        </summary>
        <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
          {exportSizes.map((size) => {
            const checked = selectedSizeIds.includes(size.id);
            return (
              <label
                key={size.id}
                className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleExtraSize(size.id)}
                  className="rounded border-white/20 bg-[#2a2a2a] accent-white"
                />
                <span className="truncate">
                  {size.shortLabel}
                  <span className="text-gray-500 ml-1">
                    {size.width}×{size.height}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </details>

      <button onClick={onExport} className={STYLES.primaryButton}>
        Export {screenshotCount} shot{screenshotCount !== 1 ? "s" : ""}
        {exportCount > 1 ? ` × ${exportCount} sizes` : ""}
      </button>
    </SidebarSection>
  );
};
