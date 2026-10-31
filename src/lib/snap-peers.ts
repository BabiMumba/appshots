import type { Screenshot, SelectedElement } from "../types";
import type { SnapBox } from "./snap";

/** Approximate artboard boxes for snap peers (center-anchored %). */
export function collectSnapPeers(
  screenshot: Screenshot,
  selected: SelectedElement,
): { self: SnapBox; peers: SnapBox[] } {
  const selfBox = boxFor(screenshot, selected.type, selected.id) ?? {
    x: 50,
    y: 50,
    width: 20,
    height: 20,
  };

  const peers: SnapBox[] = [];
  for (const t of screenshot.texts ?? []) {
    if (selected.type === "text" && selected.id === t.id) continue;
    if (t.hidden) continue;
    peers.push({ x: t.x, y: t.y, width: t.width, height: Math.max(6, t.fontSize / 14) });
  }
  for (const img of screenshot.overlayImages ?? []) {
    if (selected.type === "image" && selected.id === img.id) continue;
    if (img.hidden) continue;
    peers.push({
      x: img.x,
      y: img.y,
      width: img.width,
      height: img.height,
    });
  }
  for (const s of screenshot.shapes ?? []) {
    if (selected.type === "shape" && selected.id === s.id) continue;
    if (s.hidden) continue;
    peers.push({
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    });
  }
  for (const d of screenshot.devices ?? []) {
    if (selected.type === "device" && selected.id === d.id) continue;
    if (d.hidden) continue;
    const scale = (d.scale ?? 100) / 100;
    peers.push({
      x: d.x,
      y: d.y,
      width: 26 * scale,
      height: 52 * scale,
    });
  }

  return { self: selfBox, peers };
}

function boxFor(
  screenshot: Screenshot,
  type: SelectedElement["type"],
  id?: string,
): SnapBox | null {
  if (type === "text" && id) {
    const t = (screenshot.texts ?? []).find((x) => x.id === id);
    if (!t) return null;
    return {
      x: t.x,
      y: t.y,
      width: t.width,
      height: Math.max(6, t.fontSize / 14),
    };
  }
  if (type === "image" && id) {
    const img = screenshot.overlayImages.find((x) => x.id === id);
    if (!img) return null;
    return { x: img.x, y: img.y, width: img.width, height: img.height };
  }
  if (type === "shape" && id) {
    const s = (screenshot.shapes ?? []).find((x) => x.id === id);
    if (!s) return null;
    return { x: s.x, y: s.y, width: s.width, height: s.height };
  }
  if (type === "device" && id) {
    const d = screenshot.devices.find((x) => x.id === id);
    if (!d) return null;
    const scale = (d.scale ?? 100) / 100;
    return { x: d.x, y: d.y, width: 26 * scale, height: 52 * scale };
  }
  return null;
}
