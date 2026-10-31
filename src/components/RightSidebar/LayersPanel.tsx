/**
 * Layers panel — select, reorder, hide, lock. Front → back list (top = front).
 */

import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Smartphone,
  Image as ImageIcon,
  Square,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Screenshot, SelectedElement } from "../../types";
import {
  ensureLayerOrder,
  parseLayerKey,
  type LayerKey,
} from "../../lib/layer-order";
import { STYLES } from "./constants";

interface LayersPanelProps {
  screenshot: Screenshot;
  selectedElement: SelectedElement | null;
  onSelect: (el: SelectedElement) => void;
  onReorder: (key: LayerKey, action: "forward" | "backward" | "front" | "back") => void;
  onToggleHidden: (el: SelectedElement) => void;
  onToggleLocked: (el: SelectedElement) => void;
}

function labelFor(
  screenshot: Screenshot,
  type: SelectedElement["type"],
  id?: string,
): string {
  if (type === "text" && id) {
    const t = (screenshot.texts ?? []).find((x) => x.id === id);
    const plain = (t?.content ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plain ? plain.slice(0, 28) : "Text";
  }
  if (type === "device" && id) {
    const d = screenshot.devices.find((x) => x.id === id);
    return d ? `Device` : "Device";
  }
  if (type === "image" && id) {
    const img = screenshot.overlayImages.find((x) => x.id === id);
    return img?.name?.trim() || "Overlay";
  }
  if (type === "shape" && id) {
    const s = (screenshot.shapes ?? []).find((x) => x.id === id);
    return s ? `Shape · ${s.form}` : "Shape";
  }
  return type;
}

function iconFor(type: SelectedElement["type"]) {
  if (type === "text") return <Type className="w-3.5 h-3.5" />;
  if (type === "device") return <Smartphone className="w-3.5 h-3.5" />;
  if (type === "image") return <ImageIcon className="w-3.5 h-3.5" />;
  return <Square className="w-3.5 h-3.5" />;
}

function isHidden(screenshot: Screenshot, type: SelectedElement["type"], id?: string) {
  if (type === "text" && id)
    return Boolean((screenshot.texts ?? []).find((t) => t.id === id)?.hidden);
  if (type === "device" && id)
    return Boolean(screenshot.devices.find((d) => d.id === id)?.hidden);
  if (type === "image" && id)
    return Boolean(screenshot.overlayImages.find((i) => i.id === id)?.hidden);
  if (type === "shape" && id)
    return Boolean((screenshot.shapes ?? []).find((s) => s.id === id)?.hidden);
  return false;
}

function isLocked(screenshot: Screenshot, type: SelectedElement["type"], id?: string) {
  if (type === "text" && id)
    return Boolean((screenshot.texts ?? []).find((t) => t.id === id)?.locked);
  if (type === "device" && id)
    return Boolean(screenshot.devices.find((d) => d.id === id)?.locked);
  if (type === "image" && id)
    return Boolean(screenshot.overlayImages.find((i) => i.id === id)?.locked);
  if (type === "shape" && id)
    return Boolean((screenshot.shapes ?? []).find((s) => s.id === id)?.locked);
  return false;
}

export const LayersPanel = ({
  screenshot,
  selectedElement,
  onSelect,
  onReorder,
  onToggleHidden,
  onToggleLocked,
}: LayersPanelProps) => {
  const order = ensureLayerOrder(screenshot);
  // Show front → back (top of list = drawn last)
  const rows = [...order].reverse();

  return (
    <section className={STYLES.section} data-sidebar-section="layers">
      <h2 className={STYLES.sectionTitle}>Layers</h2>
      <p className="text-[10px] text-[var(--ed-fg-muted)] mb-2 leading-relaxed">
        Top = in front. Click to select · eye to hide · lock to freeze.
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--ed-fg-muted)]">Nothing on this screen yet.</p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map((key, visualIndex) => {
            const parsed = parseLayerKey(key);
            if (!parsed) return null;
            const { type, id } = parsed;
            const selected =
              selectedElement?.type === type &&
              selectedElement?.screenshotId === screenshot.id &&
              selectedElement?.id === id;
            const hidden = isHidden(screenshot, type, id);
            const locked = isLocked(screenshot, type, id);
            const el: SelectedElement = {
              type,
              id,
              screenshotId: screenshot.id,
            };
            const canUp = visualIndex > 0;
            const canDown = visualIndex < rows.length - 1;

            return (
              <li
                key={key}
                className={`flex items-center gap-1 rounded-md px-1.5 py-1 ${
                  selected
                    ? "bg-sky-500/15 ring-1 ring-sky-500/40"
                    : "hover:bg-[var(--ed-muted)]"
                } ${hidden ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  className="flex flex-1 items-center gap-1.5 min-w-0 text-left text-xs text-[var(--ed-fg)]"
                  onClick={() => onSelect(el)}
                >
                  <span className="text-[var(--ed-fg-muted)] shrink-0">
                    {iconFor(type)}
                  </span>
                  <span className="truncate">{labelFor(screenshot, type, id)}</span>
                </button>
                <button
                  type="button"
                  title="Bring forward"
                  disabled={!canUp}
                  className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] disabled:opacity-25"
                  onClick={() => onReorder(key, "forward")}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Send backward"
                  disabled={!canDown}
                  className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] disabled:opacity-25"
                  onClick={() => onReorder(key, "backward")}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title={hidden ? "Show" : "Hide"}
                  className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
                  onClick={() => onToggleHidden(el)}
                >
                  {hidden ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  title={locked ? "Unlock" : "Lock"}
                  className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]"
                  onClick={() => onToggleLocked(el)}
                >
                  {locked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
