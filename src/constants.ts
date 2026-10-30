import type {
  DeviceSpec,
  GradientPreset,
  ExportSize,
  ProjectKind,
} from "./types";

export const devices: DeviceSpec[] = [
  {
    id: "iphone-17-pro-max",
    label: "iPhone 17 Pro Max",
    width: 1320,
    height: 2868,
    screenInset: { top: 20, right: 20, bottom: 20, left: 20 },
    cornerRadius: 112,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 250,
    notchHeight: 70,
    hasIsland: true,
    colors: [
      {
        id: "cosmic-orange",
        label: "Cosmic Orange",
        frame: "#C45C2A",
        frameColors: ["#D97845", "#C45C2A", "#A34820", "#C45C2A", "#D97845"],
        screen: "#000",
      },
      {
        id: "deep-blue",
        label: "Deep Blue",
        frame: "#2A3A55",
        frameColors: ["#3D5070", "#2A3A55", "#1C283C", "#2A3A55", "#3D5070"],
        screen: "#000",
      },
      {
        id: "silver",
        label: "Silver",
        frame: "#D4D4D8",
        frameColors: ["#E8E8EC", "#D4D4D8", "#B8B8BE", "#D4D4D8", "#E8E8EC"],
        screen: "#000",
      },
      {
        id: "black",
        label: "Black",
        frame: "#1c1c1e",
        frameColors: ["#3a3a3c", "#1c1c1e", "#0a0a0a", "#1c1c1e", "#3a3a3c"],
        screen: "#000",
      },
    ],
  },
  {
    id: "iphone-17-pro",
    label: "iPhone 17 Pro",
    width: 1206,
    height: 2622,
    screenInset: { top: 18, right: 18, bottom: 18, left: 18 },
    cornerRadius: 100,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 230,
    notchHeight: 65,
    hasIsland: true,
    colors: [
      {
        id: "cosmic-orange",
        label: "Cosmic Orange",
        frame: "#C45C2A",
        frameColors: ["#D97845", "#C45C2A", "#A34820", "#C45C2A", "#D97845"],
        screen: "#000",
      },
      {
        id: "deep-blue",
        label: "Deep Blue",
        frame: "#2A3A55",
        frameColors: ["#3D5070", "#2A3A55", "#1C283C", "#2A3A55", "#3D5070"],
        screen: "#000",
      },
      {
        id: "silver",
        label: "Silver",
        frame: "#D4D4D8",
        frameColors: ["#E8E8EC", "#D4D4D8", "#B8B8BE", "#D4D4D8", "#E8E8EC"],
        screen: "#000",
      },
      {
        id: "black",
        label: "Black",
        frame: "#1c1c1e",
        frameColors: ["#3a3a3c", "#1c1c1e", "#0a0a0a", "#1c1c1e", "#3a3a3c"],
        screen: "#000",
      },
    ],
  },
  {
    id: "iphone-17",
    label: "iPhone 17",
    width: 1206,
    height: 2622,
    screenInset: { top: 18, right: 18, bottom: 18, left: 18 },
    cornerRadius: 100,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 230,
    notchHeight: 65,
    hasIsland: true,
    colors: [
      {
        id: "black",
        label: "Black",
        frame: "#1c1c1e",
        frameColors: ["#3a3a3c", "#1c1c1e", "#0a0a0a", "#1c1c1e", "#3a3a3c"],
        screen: "#000",
      },
      {
        id: "white",
        label: "White",
        frame: "#E8E8EA",
        frameColors: ["#F5F5F7", "#E8E8EA", "#D1D1D6", "#E8E8EA", "#F5F5F7"],
        screen: "#000",
      },
      {
        id: "mist-blue",
        label: "Mist Blue",
        frame: "#A8C0D4",
        frameColors: ["#BED2E4", "#A8C0D4", "#8FA9BF", "#A8C0D4", "#BED2E4"],
        screen: "#000",
      },
      {
        id: "sage",
        label: "Sage",
        frame: "#A8B5A0",
        frameColors: ["#BCC8B5", "#A8B5A0", "#8F9C87", "#A8B5A0", "#BCC8B5"],
        screen: "#000",
      },
    ],
  },
  {
    id: "iphone-15-pro-max",
    label: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    screenInset: { top: 20, right: 20, bottom: 20, left: 20 },
    cornerRadius: 110,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 250,
    notchHeight: 70,
    hasIsland: true,
    colors: [
      {
        id: "black",
        label: "Black Titanium",
        frame: "#282828",
        frameColors: ["#4a4a4a", "#282828", "#1c1c1e", "#282828", "#4a4a4a"],
        screen: "#000",
      },
      {
        id: "natural",
        label: "Natural",
        frame: "#8C8883",
        frameColors: ["#AAA59E", "#8C8883", "#75726D", "#8C8883", "#AAA59E"],
        screen: "#000",
      },
      {
        id: "blue",
        label: "Blue",
        frame: "#2F3846",
        frameColors: ["#455163", "#2F3846", "#202630", "#2F3846", "#455163"],
        screen: "#000",
      },
      {
        id: "white",
        label: "White",
        frame: "#E3E3E4",
        frameColors: ["#F2F2F2", "#E3E3E4", "#D1D1D2", "#E3E3E4", "#F2F2F2"],
        screen: "#000",
      },
    ],
  },
  {
    id: "iphone-15-pro",
    label: "iPhone 15 Pro",
    width: 1179,
    height: 2556,
    screenInset: { top: 18, right: 18, bottom: 18, left: 18 },
    cornerRadius: 100,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 230,
    notchHeight: 65,
    hasIsland: true,
    colors: [
      {
        id: "black",
        label: "Black Titanium",
        frame: "#282828",
        frameColors: ["#4a4a4a", "#282828", "#1c1c1e", "#282828", "#4a4a4a"],
        screen: "#000",
      },
      {
        id: "natural",
        label: "Natural",
        frame: "#8C8883",
        frameColors: ["#AAA59E", "#8C8883", "#75726D", "#8C8883", "#AAA59E"],
        screen: "#000",
      },
      {
        id: "blue",
        label: "Blue",
        frame: "#2F3846",
        frameColors: ["#455163", "#2F3846", "#202630", "#2F3846", "#455163"],
        screen: "#000",
      },
      {
        id: "white",
        label: "White",
        frame: "#E3E3E4",
        frameColors: ["#F2F2F2", "#E3E3E4", "#D1D1D2", "#E3E3E4", "#F2F2F2"],
        screen: "#000",
      },
    ],
  },
  {
    id: "iphone-14",
    label: "iPhone 14",
    width: 1170,
    height: 2532,
    screenInset: { top: 18, right: 18, bottom: 18, left: 18 },
    cornerRadius: 95,
    frameRadius: { outer: "14%/6.5%", inner: "12.5%/5.8%" },
    notchWidth: 210,
    notchHeight: 60,
    hasIsland: false,
    colors: [
      {
        id: "midnight",
        label: "Midnight",
        frame: "#2B3037",
        frameColors: ["#3A414A", "#2B3037", "#1E2227", "#2B3037", "#3A414A"],
        screen: "#000",
      },
      {
        id: "purple",
        label: "Purple",
        frame: "#E5DDEA",
        frameColors: ["#F0EAF5", "#E5DDEA", "#D5CDDA", "#E5DDEA", "#F0EAF5"],
        screen: "#000",
      },
      {
        id: "blue",
        label: "Blue",
        frame: "#A7C1D9",
        frameColors: ["#BDD3E8", "#A7C1D9", "#92AAC0", "#A7C1D9", "#BDD3E8"],
        screen: "#000",
      },
      {
        id: "red",
        label: "Red",
        frame: "#FC0324",
        frameColors: ["#FF3B55", "#FC0324", "#D4001A", "#FC0324", "#FF3B55"],
        screen: "#000",
      },
    ],
  },
  {
    id: "ipad-pro-12-9",
    label: 'iPad Pro 12.9"',
    width: 2048,
    height: 2732,
    screenInset: { top: 40, right: 40, bottom: 40, left: 40 },
    cornerRadius: 50,
    frameRadius: { outer: "3%/2.5%", inner: "2.5%/2%" },
    notchWidth: 0,
    notchHeight: 0,
    hasIsland: false,
    colors: [
      {
        id: "black",
        label: "Black",
        frame: "#1c1c1e",
        frameColors: ["#2c2c2e", "#1c1c1e", "#0d0d0d", "#1c1c1e", "#2c2c2e"],
        screen: "#000",
      },
      {
        id: "space-gray",
        label: "Space Gray",
        frame: "#4e4e50",
        frameColors: ["#636365", "#4e4e50", "#3a3a3c", "#4e4e50", "#636365"],
        screen: "#000",
      },
      {
        id: "silver",
        label: "Silver",
        frame: "#e0e0e0",
        frameColors: ["#ffffff", "#e0e0e0", "#d1d1d6", "#e0e0e0", "#ffffff"],
        screen: "#000",
      },
    ],
  },
  {
    id: "pixel-9-pro",
    label: "Google Pixel 9 Pro",
    width: 1280,
    height: 2856,
    screenInset: { top: 14, right: 14, bottom: 14, left: 14 },
    cornerRadius: 48,
    frameRadius: { outer: "5%/2.4%", inner: "4.2%/2%" },
    notchWidth: 0,
    notchHeight: 0,
    hasIsland: false,
    colors: [
      {
        id: "obsidian",
        label: "Obsidian",
        frame: "#1a1a1a",
        frameColors: ["#2e2e2e", "#1a1a1a", "#0d0d0d", "#1a1a1a", "#2e2e2e"],
        screen: "#000",
      },
      {
        id: "porcelain",
        label: "Porcelain",
        frame: "#E8E4DE",
        frameColors: ["#F5F2ED", "#E8E4DE", "#D4CFC7", "#E8E4DE", "#F5F2ED"],
        screen: "#000",
      },
      {
        id: "hazel",
        label: "Hazel",
        frame: "#8B7E6A",
        frameColors: ["#A39682", "#8B7E6A", "#726656", "#8B7E6A", "#A39682"],
        screen: "#000",
      },
    ],
  },
  {
    id: "pixel-9",
    label: "Google Pixel 9",
    width: 1080,
    height: 2424,
    screenInset: { top: 14, right: 14, bottom: 14, left: 14 },
    cornerRadius: 48,
    frameRadius: { outer: "5.5%/2.6%", inner: "4.5%/2.2%" },
    notchWidth: 0,
    notchHeight: 0,
    hasIsland: false,
    colors: [
      {
        id: "obsidian",
        label: "Obsidian",
        frame: "#1a1a1a",
        frameColors: ["#2e2e2e", "#1a1a1a", "#0d0d0d", "#1a1a1a", "#2e2e2e"],
        screen: "#000",
      },
      {
        id: "porcelain",
        label: "Porcelain",
        frame: "#E8E4DE",
        frameColors: ["#F5F2ED", "#E8E4DE", "#D4CFC7", "#E8E4DE", "#F5F2ED"],
        screen: "#000",
      },
      {
        id: "peony",
        label: "Peony",
        frame: "#E8B4C0",
        frameColors: ["#F2C8D2", "#E8B4C0", "#D49AAB", "#E8B4C0", "#F2C8D2"],
        screen: "#000",
      },
      {
        id: "wintergreen",
        label: "Wintergreen",
        frame: "#5A7A6E",
        frameColors: ["#6E9084", "#5A7A6E", "#466258", "#5A7A6E", "#6E9084"],
        screen: "#000",
      },
    ],
  },
  {
    id: "samsung-galaxy-s24-ultra",
    label: "Samsung Galaxy S24 Ultra",
    width: 1440,
    height: 3120,
    screenInset: { top: 16, right: 16, bottom: 16, left: 16 },
    cornerRadius: 40,
    frameRadius: { outer: "4%/2%", inner: "3.5%/1.8%" },
    notchWidth: 0,
    notchHeight: 0,
    hasIsland: false,
    colors: [
      {
        id: "titanium-black",
        label: "Titanium Black",
        frame: "#1a1a1a",
        frameColors: ["#2d2d2d", "#1a1a1a", "#0f0f0f", "#1a1a1a", "#2d2d2d"],
        screen: "#000",
      },
      {
        id: "titanium-gray",
        label: "Titanium Gray",
        frame: "#7a7a7a",
        frameColors: ["#8f8f8f", "#7a7a7a", "#656565", "#7a7a7a", "#8f8f8f"],
        screen: "#000",
      },
      {
        id: "titanium-violet",
        label: "Titanium Violet",
        frame: "#9b8aa5",
        frameColors: ["#b0a0ba", "#9b8aa5", "#867590", "#9b8aa5", "#b0a0ba"],
        screen: "#000",
      },
      {
        id: "titanium-yellow",
        label: "Titanium Yellow",
        frame: "#d4c87a",
        frameColors: ["#e5da90", "#d4c87a", "#c3b664", "#d4c87a", "#e5da90"],
        screen: "#000",
      },
    ],
  },
  {
    id: "samsung-galaxy-tab-s9",
    label: "Samsung Galaxy Tab S9",
    width: 1600,
    height: 2560,
    screenInset: { top: 35, right: 35, bottom: 35, left: 35 },
    cornerRadius: 40,
    frameRadius: { outer: "3%/2%", inner: "2.5%/1.5%" },
    notchWidth: 0,
    notchHeight: 0,
    hasIsland: false,
    colors: [
      {
        id: "graphite",
        label: "Graphite",
        frame: "#3c3c3c",
        frameColors: ["#4f4f4f", "#3c3c3c", "#292929", "#3c3c3c", "#4f4f4f"],
        screen: "#000",
      },
      {
        id: "beige",
        label: "Beige",
        frame: "#d9d0c5",
        frameColors: ["#ebe3d9", "#d9d0c5", "#c7beb3", "#d9d0c5", "#ebe3d9"],
        screen: "#000",
      },
    ],
  },
];

export const gradientPresets: GradientPreset[] = [
  { id: "sunset", label: "Sunset", from: "#ff7e5f", to: "#feb47b" },
  { id: "ocean", label: "Ocean", from: "#2b5876", to: "#4e4376" },
  { id: "mint", label: "Mint", from: "#00b09b", to: "#96c93d" },
  { id: "berry", label: "Berry", from: "#e1eec3", to: "#f05053" },
  { id: "royal", label: "Royal", from: "#141E30", to: "#243B55" },
  { id: "rose", label: "Rose", from: "#f4c4f3", to: "#fc67fa" },
];

/** Legacy export size IDs → current App Store / Play presets */
export const LEGACY_EXPORT_SIZE_MAP: Record<string, string> = {
  "6.7": "ios-di-medium-1206",
  "6.5": "ios-faceid-large-1284",
  "5.5": "ios-home-large-1242",
  ipad: "ios-ipad-13-2048",
};

export const exportSizes: ExportSize[] = [
  // App Store — required 2026 slot
  {
    id: "ios-di-medium-1206",
    label: "iPhone Dynamic Island medium — 1206×2622 (required)",
    shortLabel: "iOS DI medium 1206×2622",
    width: 1206,
    height: 2622,
    store: "appstore",
    group: "App Store — iPhone (required)",
    required: true,
  },
  {
    id: "ios-di-medium-1179",
    label: "iPhone Dynamic Island medium — 1179×2556",
    shortLabel: "iOS DI medium 1179×2556",
    width: 1179,
    height: 2556,
    store: "appstore",
    group: "App Store — iPhone (required)",
    required: true,
  },
  {
    id: "ios-di-medium-1206-land",
    label: "iPhone DI medium landscape — 2622×1206",
    shortLabel: "iOS DI medium land 2622×1206",
    width: 2622,
    height: 1206,
    store: "appstore",
    group: "App Store — iPhone landscape",
  },
  // App Store — optional large
  {
    id: "ios-di-large-1320",
    label: "iPhone Dynamic Island large — 1320×2868",
    shortLabel: "iOS DI large 1320×2868",
    width: 1320,
    height: 2868,
    store: "appstore",
    group: "App Store — iPhone (optional)",
  },
  {
    id: "ios-di-large-1290",
    label: "iPhone Dynamic Island large — 1290×2796",
    shortLabel: "iOS DI large 1290×2796",
    width: 1290,
    height: 2796,
    store: "appstore",
    group: "App Store — iPhone (optional)",
  },
  {
    id: "ios-faceid-large-1284",
    label: "iPhone Face ID large — 1284×2778",
    shortLabel: "iOS Face ID 1284×2778",
    width: 1284,
    height: 2778,
    store: "appstore",
    group: "App Store — iPhone (optional)",
  },
  {
    id: "ios-home-large-1242",
    label: "iPhone Home Button — 1242×2208",
    shortLabel: "iOS Home 1242×2208",
    width: 1242,
    height: 2208,
    store: "appstore",
    group: "App Store — iPhone (optional)",
  },
  // App Store — iPad
  {
    id: "ios-ipad-13-2064",
    label: "iPad 13″ — 2064×2752",
    shortLabel: "iPad 13″ 2064×2752",
    width: 2064,
    height: 2752,
    store: "appstore",
    group: "App Store — iPad",
  },
  {
    id: "ios-ipad-13-2048",
    label: "iPad 13″ — 2048×2732",
    shortLabel: "iPad 13″ 2048×2732",
    width: 2048,
    height: 2732,
    store: "appstore",
    group: "App Store — iPad",
  },
  // Google Play
  {
    id: "play-phone-1080",
    label: "Play phone — 1080×1920 (recommended)",
    shortLabel: "Play phone 1080×1920",
    width: 1080,
    height: 1920,
    store: "play",
    group: "Google Play",
    required: true,
  },
  {
    id: "play-phone-1080-land",
    label: "Play phone landscape — 1920×1080",
    shortLabel: "Play phone land 1920×1080",
    width: 1920,
    height: 1080,
    store: "play",
    group: "Google Play",
  },
  {
    id: "play-tablet-7",
    label: "Play tablet 7″ — 1080×1920",
    shortLabel: "Play tablet 7″ 1080×1920",
    width: 1080,
    height: 1920,
    store: "play",
    group: "Google Play",
  },
  {
    id: "play-tablet-10",
    label: "Play tablet 10″ — 1200×1920",
    shortLabel: "Play tablet 10″ 1200×1920",
    width: 1200,
    height: 1920,
    store: "play",
    group: "Google Play",
  },
  {
    id: "play-feature-graphic",
    label: "Play feature graphic — 1024×500",
    shortLabel: "Play feature 1024×500",
    width: 1024,
    height: 500,
    store: "play",
    group: "Play — Feature graphic",
    kind: "feature",
  },
];

export const DEFAULT_EXPORT_SIZE_ID = "ios-di-medium-1206";
export const FEATURE_GRAPHIC_SIZE_ID = "play-feature-graphic";

/** One-click sets of export sizes for common store workflows */
export type ExportPack = {
  id: string;
  label: string;
  description: string;
  sizeIds: string[];
};

export const exportPacks: ExportPack[] = [
  {
    id: "ios-required",
    label: "iOS required",
    description: "App Store required iPhone slots",
    sizeIds: ["ios-di-medium-1206", "ios-di-medium-1179"],
  },
  {
    id: "play-phone",
    label: "Play phone",
    description: "Google Play phone recommended",
    sizeIds: ["play-phone-1080"],
  },
  {
    id: "ios-ipad",
    label: "iOS + iPad",
    description: "Required iPhone + iPad 13″",
    sizeIds: ["ios-di-medium-1206", "ios-di-medium-1179", "ios-ipad-13-2064"],
  },
  {
    id: "play-feature",
    label: "Feature graphic",
    description: "Play Console 1024×500 presentation image",
    sizeIds: [FEATURE_GRAPHIC_SIZE_ID],
  },
  {
    id: "play-tablet",
    label: "Play tablet",
    description: "Play 7″ + 10″ tablet slots",
    sizeIds: ["play-tablet-7", "play-tablet-10"],
  },
];

export function resolveExportSizeId(id: string | undefined | null): string {
  if (!id) return DEFAULT_EXPORT_SIZE_ID;
  const mapped = LEGACY_EXPORT_SIZE_MAP[id] ?? id;
  return exportSizes.some((s) => s.id === mapped)
    ? mapped
    : DEFAULT_EXPORT_SIZE_ID;
}

export function getAssetKindForSizeId(
  id: string | undefined | null,
): "screenshot" | "feature" {
  const resolved = resolveExportSizeId(id);
  const size = exportSizes.find((s) => s.id === resolved);
  return size?.kind === "feature" ? "feature" : "screenshot";
}

export function isTabletExportSize(size: {
  id: string;
  group: string;
}): boolean {
  const id = size.id.toLowerCase();
  const group = size.group.toLowerCase();
  return (
    id.includes("ipad") ||
    id.includes("tablet") ||
    group.includes("ipad") ||
    group.includes("tablet")
  );
}

export function inferProjectKindFromExportSizeId(
  id: string | undefined | null,
): ProjectKind {
  const resolved = resolveExportSizeId(id);
  if (getAssetKindForSizeId(resolved) === "feature") return "feature";
  const size = exportSizes.find((s) => s.id === resolved);
  if (size && isTabletExportSize(size)) return "tablet";
  return "phone";
}

export function exportSizesForProjectKind(kind: ProjectKind) {
  if (kind === "feature") {
    return exportSizes.filter((s) => s.kind === "feature");
  }
  if (kind === "tablet") {
    return exportSizes.filter(
      (s) => s.kind !== "feature" && isTabletExportSize(s),
    );
  }
  return exportSizes.filter(
    (s) => s.kind !== "feature" && !isTabletExportSize(s),
  );
}

export function defaultExportSizeIdForKind(kind: ProjectKind): string {
  if (kind === "feature") return FEATURE_GRAPHIC_SIZE_ID;
  if (kind === "tablet") return "ios-ipad-13-2064";
  return DEFAULT_EXPORT_SIZE_ID;
}

export function projectKindLabel(kind: ProjectKind): string {
  if (kind === "feature") return "Feature graphic";
  if (kind === "tablet") return "Tablet screenshots";
  return "Phone screenshots";
}

export const PROJECT_KIND_OPTIONS: {
  id: ProjectKind;
  label: string;
  blurb: string;
}[] = [
  {
    id: "phone",
    label: "Phone screenshots",
    blurb: "App Store / Play phone slots",
  },
  {
    id: "tablet",
    label: "Tablet screenshots",
    blurb: "iPad & Play tablet sizes + tablet frame",
  },
  {
    id: "feature",
    label: "Feature graphic",
    blurb: "Play presentation image 1024×500",
  },
];

// Keep pack list useful per kind
export function exportPacksForProjectKind(kind: ProjectKind) {
  if (kind === "feature") {
    return exportPacks.filter((p) => p.id === "play-feature");
  }
  if (kind === "tablet") {
    return exportPacks.filter(
      (p) => p.id === "ios-ipad" || p.id === "play-tablet",
    );
  }
  return exportPacks.filter(
    (p) =>
      p.id !== "play-feature" &&
      p.id !== "ios-ipad" &&
      p.id !== "play-tablet",
  );
}

export function getExportFilename(
  size: ExportSize,
  index: number,
  total: number,
): string {
  const prefix = size.store === "play" ? "play" : size.store === "appstore" ? "ios" : "export";
  const dims = `${size.width}x${size.height}`;
  const n = String(index + 1).padStart(2, "0");
  if (total === 1) return `${prefix}-${dims}.png`;
  return `${prefix}-${dims}-${n}.png`;
}

export function getExportZipName(sizes: ExportSize[]): string {
  if (sizes.length === 1) {
    const s = sizes[0];
    const prefix = s.store === "play" ? "play" : "ios";
    return `${prefix}-screenshots-${s.width}x${s.height}.zip`;
  }
  const stores = new Set(sizes.map((s) => s.store));
  if (stores.size === 1 && stores.has("play")) return "play-screenshots.zip";
  if (stores.size === 1 && stores.has("appstore")) return "ios-screenshots.zip";
  return "store-screenshots.zip";
}
