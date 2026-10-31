/**
 * Store listing templates — App Store, Play screenshots, feature graphics.
 */

import {
  DEFAULT_EXPORT_SIZE_ID,
  FEATURE_GRAPHIC_SIZE_ID,
  devices,
} from "../constants";
import type {
  CustomGradient,
  ImageOverlay,
  Project,
  ProjectKind,
  Screenshot,
  TextOverlay,
} from "../types";
import { createDeviceInstance } from "./device-instances";
import { buildDefaultLayerOrder } from "./layer-order";
import { detectDefaultLocale } from "./locales";
import {
  createDefaultTexts,
  createTextOverlay,
  syncLegacyTextFields,
} from "./text-overlays";

const uid = () => Math.random().toString(36).substring(2, 9);

export type TemplateCategory = "ios" | "play" | "feature";

export type TemplateId =
  | "ios-hero-set"
  | "ios-walkthrough"
  | "ios-dual"
  | "ios-minimal"
  | "ios-social"
  | "play-hero-set"
  | "play-bold"
  | "play-dual"
  | "feature-hero"
  | "feature-split"
  | "feature-device"
  /** @deprecated aliases kept for deep links */
  | "hero"
  | "dual"
  | "minimal"
  | "social";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  blurb: string;
  category: TemplateCategory;
  /** CSS preview for catalog cards */
  swatch: string;
  screenCount: number;
};

const LEGACY_MAP: Record<string, TemplateId> = {
  hero: "ios-hero-set",
  dual: "ios-dual",
  minimal: "ios-minimal",
  social: "ios-social",
};

export const templateCatalog: TemplateMeta[] = [
  {
    id: "ios-hero-set",
    label: "iOS hero set",
    blurb: "3 portrait frames — cover, feature, proof.",
    category: "ios",
    swatch: "linear-gradient(160deg,#0f172a,#1d4ed8)",
    screenCount: 3,
  },
  {
    id: "ios-walkthrough",
    label: "iOS walkthrough",
    blurb: "5 screens for a full App Store story.",
    category: "ios",
    swatch: "linear-gradient(160deg,#111827,#4c1d95)",
    screenCount: 5,
  },
  {
    id: "ios-dual",
    label: "iOS dual device",
    blurb: "Two phones for before/after or compare.",
    category: "ios",
    swatch: "linear-gradient(160deg,#0c4a6e,#0369a1)",
    screenCount: 1,
  },
  {
    id: "ios-minimal",
    label: "iOS minimal",
    blurb: "Light canvas, one line — product first.",
    category: "ios",
    swatch: "linear-gradient(180deg,#f8fafc,#e2e8f0)",
    screenCount: 1,
  },
  {
    id: "ios-social",
    label: "iOS social proof",
    blurb: "Ratings space + 3D phone + laurels.",
    category: "ios",
    swatch: "linear-gradient(160deg,#14532d,#22c55e)",
    screenCount: 1,
  },
  {
    id: "play-hero-set",
    label: "Play hero set",
    blurb: "3 Play phone screens ready to export.",
    category: "play",
    swatch: "linear-gradient(160deg,#064e3b,#059669)",
    screenCount: 3,
  },
  {
    id: "play-bold",
    label: "Play bold type",
    blurb: "High-contrast type over a deep canvas.",
    category: "play",
    swatch: "linear-gradient(160deg,#18181b,#f97316)",
    screenCount: 3,
  },
  {
    id: "play-dual",
    label: "Play dual",
    blurb: "Side-by-side phones on one Play frame.",
    category: "play",
    swatch: "linear-gradient(160deg,#1e1b4b,#6366f1)",
    screenCount: 1,
  },
  {
    id: "feature-hero",
    label: "Feature — hero",
    blurb: "1024×500: big claim + device on the right.",
    category: "feature",
    swatch: "linear-gradient(90deg,#0f172a,#3b82f6)",
    screenCount: 1,
  },
  {
    id: "feature-split",
    label: "Feature — split",
    blurb: "1024×500: text left, visual field right.",
    category: "feature",
    swatch: "linear-gradient(90deg,#0c4a6e,#38bdf8)",
    screenCount: 1,
  },
  {
    id: "feature-device",
    label: "Feature — device focus",
    blurb: "1024×500: centered phone, short tagline.",
    category: "feature",
    swatch: "linear-gradient(120deg,#1e293b,#64748b)",
    screenCount: 1,
  },
];

export function templatesForCategory(
  category: TemplateCategory,
): TemplateMeta[] {
  return templateCatalog.filter((t) => t.category === category);
}

export function resolveTemplateId(
  value: string | undefined | null,
): TemplateId | null {
  if (!value) return null;
  if (LEGACY_MAP[value]) return LEGACY_MAP[value];
  return templateCatalog.some((t) => t.id === value)
    ? (value as TemplateId)
    : null;
}

export function isTemplateId(
  value: string | undefined | null,
): value is TemplateId {
  return resolveTemplateId(value) !== null;
}

function phoneSpec() {
  return devices.find((d) => d.id === "iphone-17-pro") ?? devices[0];
}

function androidSpec() {
  return (
    devices.find((d) => d.id === "samsung-galaxy-s24-ultra") ??
    devices.find((d) => d.id.startsWith("pixel")) ??
    devices[0]
  );
}

function makeShot(opts: {
  backgroundColor: string;
  backgroundMode?: Screenshot["backgroundMode"];
  gradientPresetId?: string | null;
  customGradient?: CustomGradient | null;
  texts: TextOverlay[];
  devices: ReturnType<typeof createDeviceInstance>[];
  overlayImages?: ImageOverlay[];
}): Screenshot {
  const texts = opts.texts;
  const devicesList = opts.devices;
  const overlayImages = opts.overlayImages ?? [];
  return {
    id: uid(),
    texts,
    ...syncLegacyTextFields(texts),
    backgroundColor: opts.backgroundColor,
    backgroundMode: opts.backgroundMode ?? "solid",
    gradientPresetId: opts.gradientPresetId ?? null,
    customGradient: opts.customGradient ?? null,
    backgroundImage: null,
    overlayImages,
    shapes: [],
    devices: devicesList,
    activeDeviceId: devicesList[0]?.id ?? "",
    layerOrder: buildDefaultLayerOrder({
      devices: devicesList,
      overlayImages,
      shapes: [],
      texts,
    }),
  };
}

function pair(
  headline: string,
  subheadline: string,
  font = "Sora",
  color = "#ffffff",
  headlineSize = 68,
  subSize = 36,
): TextOverlay[] {
  return createDefaultTexts({
    headline,
    subheadline,
    fontFamily: font,
    color,
    headlineFontSize: headlineSize,
    subheadlineFontSize: subSize,
  });
}

function laurelOverlays(): ImageOverlay[] {
  return [
    {
      id: uid(),
      src: "/icons/laurel-left.png",
      name: "Laurel left",
      x: 18,
      y: 14,
      width: 14,
      height: 18,
      rotation: 0,
      layer: "front",
      opacity: 100,
      shadow: { enabled: false, color: "#000", blur: 0, offsetX: 0, offsetY: 0 },
    },
    {
      id: uid(),
      src: "/icons/laurel-right.png",
      name: "Laurel right",
      x: 82,
      y: 14,
      width: 14,
      height: 18,
      rotation: 0,
      layer: "front",
      opacity: 100,
      shadow: { enabled: false, color: "#000", blur: 0, offsetX: 0, offsetY: 0 },
    },
  ];
}

function buildIosHeroSet(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  const frames: [string, string, string][] = [
    ["Meet your next favorite app", "Designed for everyday clarity.", "royal"],
    ["Everything in one place", "Fast flows. Fewer taps.", "ocean"],
    ["Loved by people like you", "Join makers shipping this week.", "mint"],
  ];
  return {
    name: "iOS hero set",
    screenshots: frames.map(([h, s, g], i) =>
      makeShot({
        backgroundColor: "#0f172a",
        backgroundMode: "gradient",
        gradientPresetId: g,
        texts: pair(h, s, "Sora", "#ffffff", 64, 34),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[i % phone.colors.length].id,
            y: 34,
            scale: 84,
          }),
        ],
      }),
    ),
  };
}

function buildIosWalkthrough(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  const steps = [
    ["Welcome aboard", "Start in seconds — no clutter."],
    ["Capture what matters", "Your screen, framed for the store."],
    ["Speak clearly", "Headlines that sell the moment."],
    ["Polish the details", "Shadows, type, and overlays."],
    ["Ship the set", "Export every size App Store needs."],
  ];
  const grads = ["royal", "ocean", "berry", "sunset", "mint"];
  return {
    name: "iOS walkthrough",
    screenshots: steps.map(([h, s], i) =>
      makeShot({
        backgroundColor: "#111827",
        backgroundMode: "gradient",
        gradientPresetId: grads[i],
        texts: pair(h, s, "Outfit", "#ffffff", 62, 34),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[i % phone.colors.length].id,
            y: 36,
            scale: 82,
          }),
        ],
      }),
    ),
  };
}

function buildIosDual(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  return {
    name: "iOS dual device",
    screenshots: [
      makeShot({
        backgroundColor: "#0c4a6e",
        backgroundMode: "gradient",
        gradientPresetId: "ocean",
        texts: pair(
          "Two screens. One story.",
          "Compare flows side by side.",
          "DM Sans",
        ),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            x: 32,
            y: 36,
            scale: 70,
            rotation: -7,
          }),
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[1]?.id ?? phone.colors[0].id,
            x: 68,
            y: 36,
            scale: 70,
            rotation: 7,
          }),
        ],
      }),
    ],
  };
}

function buildIosMinimal(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  return {
    name: "iOS minimal",
    screenshots: [
      makeShot({
        backgroundColor: "#f8fafc",
        texts: [
          createTextOverlay({
            content: "Less noise. More product.",
            y: 8,
            fontSize: 52,
            color: "#0f172a",
            fontFamily: "Fraunces",
          }),
        ],
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            y: 30,
            scale: 88,
            shadow: {
              enabled: true,
              color: "#000000",
              blur: 36,
              offsetX: 0,
              offsetY: 16,
            },
          }),
        ],
      }),
    ],
  };
}

function buildIosSocial(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  return {
    name: "iOS social proof",
    screenshots: [
      makeShot({
        backgroundColor: "#14532d",
        backgroundMode: "gradient",
        gradientPresetId: "mint",
        texts: pair(
          "4.9 · Loved by makers",
          "Add your rating or review line.",
          "Outfit",
        ),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            y: 38,
            scale: 76,
            style: "3d",
            rotateY: -16,
            rotateX: 5,
          }),
        ],
        overlayImages: laurelOverlays(),
      }),
    ],
  };
}

function buildPlayHeroSet(): { name: string; screenshots: Screenshot[] } {
  const phone = androidSpec();
  const frames: [string, string, string][] = [
    ["Built for Android", "Fast. Familiar. Ready for Play.", "mint"],
    ["Your best features first", "Lead with the moment that matters.", "ocean"],
    ["Ready when they are", "Export Play sizes in one click.", "royal"],
  ];
  return {
    name: "Play hero set",
    screenshots: frames.map(([h, s, g], i) =>
      makeShot({
        backgroundColor: "#064e3b",
        backgroundMode: "gradient",
        gradientPresetId: g,
        texts: pair(h, s, "Sora", "#ffffff", 60, 32),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[i % phone.colors.length].id,
            y: 34,
            scale: 82,
          }),
        ],
      }),
    ),
  };
}

function buildPlayBold(): { name: string; screenshots: Screenshot[] } {
  const phone = androidSpec();
  const frames = [
    ["Make it bold", "Type that stops the scroll."],
    ["Show the product", "Keep the UI front and center."],
    ["Close the loop", "CTA-ready store frames."],
  ];
  return {
    name: "Play bold type",
    screenshots: frames.map(([h, s], i) =>
      makeShot({
        backgroundColor: "#18181b",
        customGradient: {
          from: "#18181b",
          via: "#431407",
          to: "#ea580c",
          angle: 160,
        },
        backgroundMode: "gradient",
        texts: pair(h, s, "Outfit", "#fff7ed", 66, 34),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            y: 36,
            scale: 80,
            x: 52 + (i - 1) * 2,
          }),
        ],
      }),
    ),
  };
}

function buildPlayDual(): { name: string; screenshots: Screenshot[] } {
  const phone = androidSpec();
  return {
    name: "Play dual",
    screenshots: [
      makeShot({
        backgroundColor: "#1e1b4b",
        backgroundMode: "gradient",
        gradientPresetId: "royal",
        texts: pair("See both sides", "Two flows, one listing card.", "Sora"),
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            x: 30,
            y: 38,
            scale: 68,
            rotation: -6,
          }),
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[1]?.id ?? phone.colors[0].id,
            x: 70,
            y: 38,
            scale: 68,
            rotation: 6,
          }),
        ],
      }),
    ],
  };
}

function buildFeatureHero(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  return {
    name: "Feature graphic — hero",
    screenshots: [
      makeShot({
        backgroundColor: "#0f172a",
        backgroundMode: "gradient",
        gradientPresetId: "royal",
        texts: [
          createTextOverlay({
            content: "Your app, featured",
            x: 28,
            y: 32,
            width: 48,
            fontSize: 72,
            color: "#f8fafc",
            fontFamily: "Sora",
            align: "left",
          }),
          createTextOverlay({
            content: "Play Console · 1024 × 500",
            x: 28,
            y: 58,
            width: 48,
            fontSize: 28,
            color: "#94a3b8",
            fontFamily: "Sora",
            align: "left",
            fontWeight: 600,
          }),
        ],
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            x: 78,
            y: 52,
            scale: 42,
            style: "3d",
            rotateY: -22,
            rotateX: 4,
          }),
        ],
      }),
    ],
  };
}

function buildFeatureSplit(): { name: string; screenshots: Screenshot[] } {
  const phone = androidSpec();
  return {
    name: "Feature graphic — split",
    screenshots: [
      makeShot({
        backgroundColor: "#0c4a6e",
        customGradient: {
          from: "#0c4a6e",
          via: null,
          to: "#38bdf8",
          angle: 90,
        },
        backgroundMode: "gradient",
        texts: [
          createTextOverlay({
            content: "Ship listings that convert",
            x: 26,
            y: 38,
            width: 42,
            fontSize: 56,
            color: "#f0f9ff",
            fontFamily: "Outfit",
            align: "left",
          }),
          createTextOverlay({
            content: "Screenshots + feature graphic in one editor",
            x: 26,
            y: 62,
            width: 42,
            fontSize: 24,
            color: "#e0f2fe",
            fontFamily: "Outfit",
            align: "left",
            fontWeight: 600,
          }),
        ],
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            x: 78,
            y: 50,
            scale: 48,
          }),
        ],
      }),
    ],
  };
}

function buildFeatureDevice(): { name: string; screenshots: Screenshot[] } {
  const phone = phoneSpec();
  return {
    name: "Feature graphic — device",
    screenshots: [
      makeShot({
        backgroundColor: "#1e293b",
        backgroundMode: "gradient",
        gradientPresetId: "ocean",
        texts: [
          createTextOverlay({
            content: "Get it on Google Play",
            x: 50,
            y: 14,
            width: 70,
            fontSize: 40,
            color: "#f8fafc",
            fontFamily: "Sora",
            align: "center",
          }),
        ],
        devices: [
          createDeviceInstance({
            deviceId: phone.id,
            colorId: phone.colors[0].id,
            x: 50,
            y: 58,
            scale: 55,
          }),
        ],
      }),
    ],
  };
}

function materialize(
  templateId: TemplateId,
): {
  name: string;
  screenshots: Screenshot[];
  exportSizeId: string;
  exportSizeIds: string[];
  deviceId: string;
  colorId: string;
} {
  const resolved = resolveTemplateId(templateId) ?? "ios-hero-set";
  let built: { name: string; screenshots: Screenshot[] };
  let exportSizeId = DEFAULT_EXPORT_SIZE_ID;

  switch (resolved) {
    case "ios-walkthrough":
      built = buildIosWalkthrough();
      break;
    case "ios-dual":
    case "dual":
      built = buildIosDual();
      break;
    case "ios-minimal":
    case "minimal":
      built = buildIosMinimal();
      break;
    case "ios-social":
    case "social":
      built = buildIosSocial();
      break;
    case "play-hero-set":
      built = buildPlayHeroSet();
      exportSizeId = "play-phone-1080";
      break;
    case "play-bold":
      built = buildPlayBold();
      exportSizeId = "play-phone-1080";
      break;
    case "play-dual":
      built = buildPlayDual();
      exportSizeId = "play-phone-1080";
      break;
    case "feature-hero":
      built = buildFeatureHero();
      exportSizeId = FEATURE_GRAPHIC_SIZE_ID;
      break;
    case "feature-split":
      built = buildFeatureSplit();
      exportSizeId = FEATURE_GRAPHIC_SIZE_ID;
      break;
    case "feature-device":
      built = buildFeatureDevice();
      exportSizeId = FEATURE_GRAPHIC_SIZE_ID;
      break;
    case "ios-hero-set":
    case "hero":
    default:
      built = buildIosHeroSet();
      break;
  }

  const firstDevice = built.screenshots[0]?.devices[0];
  return {
    ...built,
    exportSizeId,
    exportSizeIds: [exportSizeId],
    deviceId: firstDevice?.deviceId ?? phoneSpec().id,
    colorId: firstDevice?.colorId ?? phoneSpec().colors[0].id,
  };
}

function kindForTemplate(templateId: TemplateId): ProjectKind {
  const resolved = resolveTemplateId(templateId) ?? templateId;
  const meta = templateCatalog.find((t) => t.id === resolved);
  if (meta?.category === "feature") return "feature";
  if (meta?.category === "play" || meta?.category === "ios") return "phone";
  return "phone";
}

export function buildTemplateProject(templateId: TemplateId): Project {
  const built = materialize(templateId);
  const primaryLocale = detectDefaultLocale();
  return {
    id: uid(),
    name: built.name,
    kind: kindForTemplate(templateId),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshots: built.screenshots,
    selectedDeviceId: built.deviceId,
    selectedColorId: built.colorId,
    exportSizeId: built.exportSizeId,
    exportSizeIds: built.exportSizeIds,
    activeScreenshotId: built.screenshots[0]?.id ?? "",
    locales: [primaryLocale],
    activeLocale: primaryLocale,
  };
}

export function getTemplateMeta(id: TemplateId): TemplateMeta | undefined {
  const resolved = resolveTemplateId(id);
  return templateCatalog.find((t) => t.id === resolved);
}
