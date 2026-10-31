/**
 * ExportSection — sizes & packs for the *current project kind* only.
 * Phone / tablet / feature are separate projects (no shared-canvas toggle).
 */

import { useState } from "react";
import type { ExportSize, ProjectKind, Screenshot } from "../../types";
import type { ExportPack } from "../../constants";
import {
  exportPacksForProjectKind,
  exportSizesForProjectKind,
  projectKindLabel,
} from "../../constants";
import { runExportPreflight } from "../../lib/export-preflight";
import { ConfirmDialog } from "../ConfirmDialog";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ExportSectionProps {
  exportSizes: ExportSize[];
  exportPacks: ExportPack[];
  selectedSizeId: string;
  selectedSizeIds: string[];
  screenshots: Screenshot[];
  projectKind: ProjectKind;
  isExporting?: boolean;
  exportError?: string | null;
  onCreateProjectOfKind: (kind: ProjectKind) => void;
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
  selectedSizeId,
  selectedSizeIds,
  screenshots,
  projectKind,
  isExporting = false,
  exportError = null,
  onCreateProjectOfKind,
  onSizeSelect,
  onToggleExtraSize,
  onApplyPack,
  onExport,
  onDismissError,
}: ExportSectionProps) => {
  const [pendingKind, setPendingKind] = useState<ProjectKind | null>(null);
  const sizesForMode = exportSizesForProjectKind(projectKind);
  const packsForMode = exportPacksForProjectKind(projectKind);
  const groups = groupSizes(sizesForMode);
  const selected = sizesForMode.find((s) => s.id === selectedSizeId) ??
    sizesForMode[0];
  const exportCount = Math.max(selectedSizeIds.length, 1);
  const screenshotCount = screenshots.length;
  const fileCount =
    projectKind === "feature" ? exportCount : screenshotCount * exportCount;
  const selectedSizes = sizesForMode.filter((s) =>
    selectedSizeIds.includes(s.id),
  );
  const preflight = runExportPreflight({
    screenshots,
    exportSizes:
      selectedSizes.length > 0 ? selectedSizes : selected ? [selected] : [],
  });
  const blocking = preflight.some((i) => i.level === "error");

  const otherKinds = (
    [
      ["phone", "Phone screenshots"],
      ["tablet", "Tablet screenshots"],
      ["feature", "Feature graphic"],
    ] as const
  ).filter(([k]) => k !== projectKind);

  const pendingLabel = pendingKind ? projectKindLabel(pendingKind) : "";

  return (
    <SidebarSection title="Export">
      <ConfirmDialog
        open={pendingKind !== null}
        title={`Start a separate “${pendingLabel}” project?`}
        description="Your current project stays in the list — nothing is overwritten. You can switch back anytime."
        confirmLabel="Create project"
        cancelLabel="Cancel"
        onCancel={() => setPendingKind(null)}
        onConfirm={() => {
          if (!pendingKind) return;
          const kind = pendingKind;
          setPendingKind(null);
          onCreateProjectOfKind(kind);
        }}
      />

      <div className="mb-3 rounded-lg border border-[var(--ed-border)] bg-[var(--ed-muted)] px-3 py-2">
        <p className="text-[10px] uppercase tracking-wide text-[var(--ed-fg-muted)]">
          This project
        </p>
        <p className="mt-0.5 text-sm font-medium text-[var(--ed-fg)]">
          {projectKindLabel(projectKind)}
        </p>
        <p className="mt-1 text-[10px] text-[var(--ed-fg-muted)] leading-relaxed">
          {projectKind === "feature"
            ? "One Play banner artboard (1024×500). Screenshots live in a separate project."
            : projectKind === "tablet"
              ? "Tablet frames & store sizes — not a stretched phone layout."
              : "Phone screenshot strip. Feature graphic & tablet are other projects."}
        </p>
      </div>

      {otherKinds.length > 0 && (
        <div className="mb-3 space-y-1">
          <p className="text-[10px] text-[var(--ed-fg-muted)]">
            Start a separate project
          </p>
          {otherKinds.map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              disabled={isExporting}
              onClick={() => setPendingKind(kind)}
              className="w-full rounded-md border border-[var(--ed-border)] bg-transparent px-2.5 py-1.5 text-left text-[11px] text-[var(--ed-fg-muted)] hover:border-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted)] disabled:opacity-50"
            >
              + {label}
            </button>
          ))}
        </div>
      )}

      <label className="block">
        <span className="text-xs text-gray-400 mb-1.5 block">Preview size</span>
        <select
          value={selected?.id ?? selectedSizeId}
          onChange={(e) => onSizeSelect(e.target.value)}
          disabled={isExporting || sizesForMode.length === 0}
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
          {projectKind === "feature" && (
            <span className="ml-1 text-sky-400">· Feature</span>
          )}
        </p>
      )}

      {packsForMode.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1.5">Store packs</p>
          <div className="flex flex-wrap gap-1.5">
            {packsForMode.map((pack) => {
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
                      : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
                  }`}
                >
                  {pack.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {projectKind !== "feature" && sizesForMode.length > 1 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1.5">Also export</p>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {sizesForMode.map((size) => {
              const checked = selectedSizeIds.includes(size.id);
              return (
                <label
                  key={size.id}
                  className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isExporting}
                    onChange={() => onToggleExtraSize(size.id)}
                    className="rounded border-zinc-600"
                  />
                  <span className="truncate">
                    {size.shortLabel} · {size.width}×{size.height}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {preflight.filter((i) => i.level === "error").length > 0 && (
        <ul className="mt-3 space-y-1">
          {preflight
            .filter((i) => i.level === "error")
            .map((item) => (
              <li key={item.id} className="text-[10px] leading-relaxed text-red-400">
                {item.message}
              </li>
            ))}
        </ul>
      )}

      {exportError && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-2">
          <p className="text-[11px] text-red-300">{exportError}</p>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="mt-1 text-[10px] text-red-200/80 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={isExporting || blocking}
        onClick={onExport}
        className="mt-4 w-full rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 transition-colors"
      >
        {isExporting
          ? "Exporting…"
          : `Export ${fileCount} file${fileCount !== 1 ? "s" : ""}`}
      </button>
    </SidebarSection>
  );
};
