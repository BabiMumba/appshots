import { describe, expect, it } from "vitest";
import { runExportPreflight } from "./export-preflight";
import type { ExportSize, Screenshot } from "../types";
import { createDeviceInstance } from "./device-instances";
import { createDefaultTexts, syncLegacyTextFields } from "./text-overlays";
import { buildDefaultLayerOrder } from "./layer-order";

const size = (partial: Partial<ExportSize> & Pick<ExportSize, "id">): ExportSize => ({
  label: partial.id,
  shortLabel: partial.id,
  width: 1206,
  height: 2622,
  store: "appstore",
  group: "test",
  ...partial,
});

const blankShot = (): Screenshot => {
  const device = createDeviceInstance();
  const texts = createDefaultTexts();
  return {
    id: "s1",
    texts,
    ...syncLegacyTextFields(texts),
    backgroundColor: "#000",
    backgroundMode: "solid",
    gradientPresetId: null,
    customGradient: null,
    backgroundImage: null,
    overlayImages: [],
    devices: [device],
    activeDeviceId: device.id,
    layerOrder: buildDefaultLayerOrder({
      devices: [device],
      overlayImages: [],
      texts,
    }),
  };
};

describe("runExportPreflight", () => {
  it("errors when there are no screenshots", () => {
    const issues = runExportPreflight({
      screenshots: [],
      exportSizes: [size({ id: "a", required: true })],
    });
    expect(issues.some((i) => i.id === "no-screens" && i.level === "error")).toBe(
      true,
    );
  });

  it("warns when a device has no image", () => {
    const issues = runExportPreflight({
      screenshots: [blankShot()],
      exportSizes: [size({ id: "a", required: true })],
    });
    expect(issues.some((i) => i.id === "empty-screens")).toBe(true);
  });
});
