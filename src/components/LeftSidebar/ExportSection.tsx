/**
 * ExportSection — preview size, store packs, multi-export, then export.
 */

import type { ExportSize, Screenshot } from "../../types";
import type { ExportPack } from "../../constants";
import { runExportPreflight } from "../../lib/export-preflight";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ExportSectionProps {
  exportSizes: ExportSize[];
  exportPacks: ExportPack[];
  selectedSizeId: string;
  selectedSizeIds: string[];
  screenshots: Screenshot[];
  isExporting?: boolean;
  exportError?: string | null;
  onSizeSelect: (sizeId: string) => void;
  onToggleExtraSize: (sizeId: string) => void;
  onApplyPack: (sizeIds: string[]) => void;
  onExport: () => void;
  onDismissError?: () => void;
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
  exportPacks,
  selectedSizeId,
  selectedSizeIds,
  screenshots,
  isExporting = false,
  exportError = null,
  onSizeSelect,
  onToggleExtraSize,
  onApplyPack,
  onExport,
  onDismissError,
}: ExportSectionProps) => {
  const groups = groupSizes(exportSizes);
  const selected = exportSizes.find((s) => s.id === selectedSizeId);
  const exportCount = Math.max(selectedSizeIds.length, 1);
  const screenshotCount = screenshots.length;
  const fileCount = screenshotCount * exportCount;
  const selectedSizes = exportSizes.filter((s) =>
    selectedSizeIds.includes(s.id),
  );
  const preflight = runExportPreflight({
    screenshots,
    exportSizes: selectedSizes.length > 0 ? selectedSizes : selected ? [selected] : [],
  });
  const blocking = preflight.some((i) => i.level === "error");

  return (
    <SidebarSection title="Export">
      <label className="block">
        <span className="text-xs text-gray-400 mb-1.5 block">Preview size</span>
        <select
          value={selectedSizeId}
          onChange={(e) => onSizeSelect(e.target.value)}
          disabled={isExporting}
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

      <div className="mt-3">
        <p className="text-xs text-gray-400 mb-1.5">Store packs</p>
        <div className="flex flex-wrap gap-1.5">
          {exportPacks.map((pack) => {
            const active =
              pack.sizeIds.length === selectedSizeIds.length &&
              pack.sizeIds.every((id) => selectedSizeIds.includes(id));
            return (
              <button
                key={pack.id}
                type="button"
                disabled={isExporting}
                title={pack.description}
                onClick={() => onApplyPack(pack.sizeIds)}
                className={`rounded-md px-2 py-1 text-[11px] transition-colors disabled:opacity-50 ${
                  active
                    ? "bg-white text-black"
                    : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
                }`}
              >
                {pack.label}
              </button>
            );
          })}
        </div>
      </div>

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
                  disabled={isExporting}
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

      {preflight.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {preflight.map((issue) => (
            <li
              key={issue.id}
              className={`text-[10px] leading-relaxed ${
                issue.level === "error"
                  ? "text-red-300"
                  : issue.level === "warn"
                    ? "text-amber-200/90"
                    : "text-zinc-500"
              }`}
            >
              {issue.level === "error"
                ? "⛔ "
                : issue.level === "warn"
                  ? "⚠ "
                  : "· "}
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[10px] text-zinc-500">
        {fileCount} file{fileCount !== 1 ? "s" : ""} will download
        {exportCount > 1 ? " as a ZIP" : screenshotCount > 1 ? " as a ZIP" : ""}
      </p>

      {exportError && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/80 px-3 py-2 text-xs text-red-100 flex items-start gap-2">
          <p className="flex-1 leading-snug">{exportError}</p>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="shrink-0 text-red-200/80 hover:text-white underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onExport}
        disabled={isExporting || screenshotCount === 0 || blocking}
        aria-busy={isExporting}
        className={`${STYLES.primaryButton} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
      >
        {isExporting
          ? "Exporting…"
          : `Export ${screenshotCount} shot${screenshotCount !== 1 ? "s" : ""}${
              exportCount > 1 ? ` × ${exportCount} sizes` : ""
            }`}
      </button>
    </SidebarSection>
  );
};
