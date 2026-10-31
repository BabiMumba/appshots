import type { Screenshot, SelectedElement } from "../types";

export type LayerKey = string;

export const layerKeyFor = (
  type: SelectedElement["type"],
  id?: string,
): LayerKey => {
  if (type === "text" && id) return `text:${id}`;
  if (type === "device" && id) return `device:${id}`;
  if (type === "image" && id) return `image:${id}`;
  if (type === "shape" && id) return `shape:${id}`;
  return type;
};

export const parseLayerKey = (
  key: LayerKey,
): { type: SelectedElement["type"]; id?: string } | null => {
  if (key.startsWith("text:")) return { type: "text", id: key.slice(5) };
  if (key.startsWith("device:")) return { type: "device", id: key.slice(7) };
  if (key.startsWith("image:")) return { type: "image", id: key.slice(6) };
  if (key.startsWith("shape:")) return { type: "shape", id: key.slice(6) };
  // Legacy keys — callers should remap via ensureLayerOrder
  if (key === "headline" || key === "subheadline") return null;
  return null;
};

/** Default stack: behind overlays/shapes → devices → texts → front overlays/shapes */
export function buildDefaultLayerOrder(screenshot: {
  devices: { id: string }[];
  overlayImages: { id: string; layer?: "behind" | "front" }[];
  shapes?: { id: string; layer?: "behind" | "front" }[];
  texts?: { id: string }[];
}): LayerKey[] {
  const shapes = screenshot.shapes ?? [];
  const behindImages = screenshot.overlayImages
    .filter((img) => img.layer === "behind")
    .map((img) => `image:${img.id}`);
  const frontImages = screenshot.overlayImages
    .filter((img) => img.layer !== "behind")
    .map((img) => `image:${img.id}`);
  const behindShapes = shapes
    .filter((s) => s.layer === "behind")
    .map((s) => `shape:${s.id}`);
  const frontShapes = shapes
    .filter((s) => s.layer !== "behind")
    .map((s) => `shape:${s.id}`);
  const texts = (screenshot.texts ?? []).map((t) => `text:${t.id}`);
  return [
    ...behindImages,
    ...behindShapes,
    ...screenshot.devices.map((d) => `device:${d.id}`),
    ...texts,
    ...frontImages,
    ...frontShapes,
  ];
}

export function ensureLayerOrder(screenshot: Screenshot): LayerKey[] {
  const textKeys = (screenshot.texts ?? []).map((t) => `text:${t.id}`);
  const shapes = screenshot.shapes ?? [];
  const expected = new Set<LayerKey>([
    ...textKeys,
    ...screenshot.devices.map((d) => `device:${d.id}`),
    ...screenshot.overlayImages.map((img) => `image:${img.id}`),
    ...shapes.map((s) => `shape:${s.id}`),
  ]);

  // Remap legacy headline/subheadline → first/second text ids when present
  const legacyMap: Record<string, string | undefined> = {
    headline: textKeys[0],
    subheadline: textKeys[1],
  };

  // Remap + dedupe (legacy headline + text:id0 would otherwise paint twice)
  const seen = new Set<LayerKey>();
  const existing: LayerKey[] = [];
  for (const raw of screenshot.layerOrder ?? []) {
    const key = legacyMap[raw] ?? raw;
    if (!expected.has(key) || seen.has(key)) continue;
    seen.add(key);
    existing.push(key);
  }

  const missing = [...expected].filter((key) => !seen.has(key));

  if (existing.length === 0) {
    return buildDefaultLayerOrder(screenshot);
  }
  return [...existing, ...missing];
}

export function moveLayerKey(
  order: LayerKey[],
  key: LayerKey,
  action: "forward" | "backward" | "front" | "back",
): LayerKey[] {
  const next = [...order];
  const index = next.indexOf(key);
  if (index === -1) return next;

  if (action === "forward" && index < next.length - 1) {
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
  } else if (action === "backward" && index > 0) {
    [next[index], next[index - 1]] = [next[index - 1], next[index]];
  } else if (action === "front") {
    next.splice(index, 1);
    next.push(key);
  } else if (action === "back") {
    next.splice(index, 1);
    next.unshift(key);
  }
  return next;
}

export function zIndexForLayer(order: LayerKey[], key: LayerKey): number {
  const index = order.indexOf(key);
  return 10 + (index === -1 ? 0 : index);
}
