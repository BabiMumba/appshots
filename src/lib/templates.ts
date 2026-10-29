/**
 * Starter layout templates for new projects / first-run.
 */

import { DEFAULT_EXPORT_SIZE_ID, devices } from "../constants";
import type { Project, Screenshot } from "../types";
import { createDeviceInstance } from "./device-instances";
import { buildDefaultLayerOrder } from "./layer-order";
import { createDefaultTexts, createTextOverlay, syncLegacyTextFields } from "./text-overlays";

const id = () => Math.random().toString(36).substring(2, 9);

export type TemplateId = "hero" | "dual" | "minimal" | "social";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  blurb: string;
};

export const templateCatalog: TemplateMeta[] = [
  {
    id: "hero",
    label: "Hero phone",
    blurb: "One centered device, bold headline — classic store cover.",
  },
  {
    id: "dual",
    label: "Dual device",
    blurb: "Two phones side by side for feature comparisons.",
  },
  {
    id: "minimal",
    label: "Minimal text",
    blurb: "Quiet background, one line of copy — product first.",
  },
  {
    id: "social",
    label: "Social proof",
    blurb: "Room for laurels / ratings above a floated phone.",
  },
];

function shot(partial: {
  nameHint?: string;
  backgroundColor: string;
  backgroundMode?: Screenshot["backgroundMode"];
  gradientPresetId?: string | null;
  texts: ReturnType<typeof createDefaultTexts>;
  devices: ReturnType<typeof createDeviceInstance>[];
}): Screenshot {
  const texts = partial.texts;
  const devicesList = partial.devices;
  return {
    id: id(),
    texts,
    ...syncLegacyTextFields(texts),
    backgroundColor: partial.backgroundColor,
    backgroundMode: partial.backgroundMode ?? "solid",
    gradientPresetId: partial.gradientPresetId ?? null,
    customGradient: null,
    backgroundImage: null,
    overlayImages: [],
    devices: devicesList,
    activeDeviceId: devicesList[0]?.id ?? "",
    layerOrder: buildDefaultLayerOrder({
      devices: devicesList,
      overlayImages: [],
      texts,
    }),
  };
}

export function buildTemplateProject(templateId: TemplateId): Project {
  const phone = devices.find((d) => d.id === "iphone-17-pro") ?? devices[0];
  const colorId = phone.colors[0].id;

  let screenshots: Screenshot[] = [];
  let name = "My Project";

  switch (templateId) {
    case "dual": {
      name = "Dual device";
      const left = createDeviceInstance({
        deviceId: phone.id,
        colorId,
        x: 32,
        y: 34,
        scale: 72,
        rotation: -8,
      });
      const right = createDeviceInstance({
        deviceId: phone.id,
        colorId: phone.colors[1]?.id ?? colorId,
        x: 68,
        y: 34,
        scale: 72,
        rotation: 8,
      });
      screenshots = [
        shot({
          backgroundColor: "#0f172a",
          backgroundMode: "gradient",
          gradientPresetId: "ocean",
          texts: createDefaultTexts({
            headline: "Two screens. One story.",
            subheadline: "Show your core flows side by side.",
            fontFamily: "DM Sans",
          }),
          devices: [left, right],
        }),
      ];
      break;
    }
    case "minimal": {
      name = "Minimal";
      screenshots = [
        shot({
          backgroundColor: "#f4f4f5",
          texts: [
            createTextOverlay({
              content: "Less noise. More product.",
              y: 8,
              fontSize: 56,
              color: "#18181b",
              fontFamily: "Fraunces",
            }),
          ],
          devices: [
            createDeviceInstance({
              deviceId: phone.id,
              colorId,
              y: 28,
              scale: 88,
              shadow: { enabled: true, color: "#000000", blur: 40, offsetX: 0, offsetY: 18 },
            }),
          ],
        }),
      ];
      break;
    }
    case "social": {
      name = "Social proof";
      screenshots = [
        shot({
          backgroundColor: "#14532d",
          backgroundMode: "gradient",
          gradientPresetId: "mint",
          texts: createDefaultTexts({
            headline: "Loved by makers",
            subheadline: "Drop a laurel or rating badge from Overlays.",
            fontFamily: "Outfit",
          }),
          devices: [
            createDeviceInstance({
              deviceId: phone.id,
              colorId,
              y: 36,
              scale: 78,
              style: "3d",
              rotateY: -18,
              rotateX: 6,
            }),
          ],
        }),
      ];
      break;
    }
    case "hero":
    default: {
      name = "Hero phone";
      screenshots = [
        shot({
          backgroundColor: "#111827",
          backgroundMode: "gradient",
          gradientPresetId: "royal",
          texts: createDefaultTexts({
            headline: "Ship store screens that convert",
            subheadline: "Upload your UI, tweak the frame, export in minutes.",
            fontFamily: "Outfit",
          }),
          devices: [
            createDeviceInstance({
              deviceId: phone.id,
              colorId,
              y: 32,
              scale: 86,
            }),
          ],
        }),
      ];
      break;
    }
  }

  return {
    id: id(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshots,
    selectedDeviceId: phone.id,
    selectedColorId: colorId,
    exportSizeId: DEFAULT_EXPORT_SIZE_ID,
    exportSizeIds: [DEFAULT_EXPORT_SIZE_ID],
    activeScreenshotId: screenshots[0]?.id ?? "",
  };
}

export function isTemplateId(value: string | undefined | null): value is TemplateId {
  return (
    value === "hero" ||
    value === "dual" ||
    value === "minimal" ||
    value === "social"
  );
}
