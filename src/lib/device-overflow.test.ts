import { describe, expect, it } from "vitest";
import { createDeviceInstance } from "./device-instances";
import {
  getDeviceLocalXForScreenshot,
  getRenderableDevicesForScreenshot,
  isDeviceVisibleInScreenshot,
} from "./device-overflow";

describe("getDeviceLocalXForScreenshot", () => {
  it("translates a device position into a neighboring screenshot", () => {
    expect(getDeviceLocalXForScreenshot(125, 0, 1)).toBe(25);
    expect(getDeviceLocalXForScreenshot(-20, 2, 1)).toBe(80);
  });

  it("shifts by the preview gap so clipped halves stay aligned", () => {
    expect(getDeviceLocalXForScreenshot(125, 0, 1, 3)).toBe(22);
    expect(getDeviceLocalXForScreenshot(125, 0, 1, 0)).toBe(25);
  });
});

describe("isDeviceVisibleInScreenshot", () => {
  it("keeps nearby overflowed devices renderable", () => {
    const device = createDeviceInstance({ scale: 60 });

    expect(isDeviceVisibleInScreenshot(device, 20)).toBe(true);
    expect(isDeviceVisibleInScreenshot(device, 130)).toBe(true);
    expect(isDeviceVisibleInScreenshot(device, 180)).toBe(false);
  });
});

describe("getRenderableDevicesForScreenshot", () => {
  it("includes visible overflow devices from adjacent screenshots", () => {
    const screenshots = [
      {
        id: "screen-1",
        devices: [createDeviceInstance({ id: "device-a", x: 125, scale: 50 })],
      },
      {
        id: "screen-2",
        devices: [createDeviceInstance({ id: "device-b", x: 50, scale: 50 })],
      },
    ].map((screenshot) => ({
      headline: "",
      subheadline: "",
      backgroundColor: "#000000",
      backgroundMode: "solid" as const,
      gradientPresetId: null,
      customGradient: null,
      backgroundImage: null,
      textColor: "#ffffff",
      headlineX: 50,
      headlineY: 10,
      headlineWidth: 80,
      headlineAlign: "center" as const,
      subheadlineX: 50,
      subheadlineY: 20,
      subheadlineWidth: 80,
      subheadlineAlign: "center" as const,
      fontFamily: "Inter",
      headlineFontFamily: "Inter",
      subheadlineFontFamily: "Inter",
      headlineColor: "#ffffff",
      subheadlineColor: "#ffffff",
      headlineFontSize: 72,
      subheadlineFontSize: 42,
      headlineUppercase: false,
      subheadlineUppercase: false,
      texts: [],
      overlayImages: [],
      shapes: [],
      activeDeviceId: screenshot.devices[0].id,
      layerOrder: [`device:${screenshot.devices[0].id}`],
      ...screenshot,
    }));

    const renderables = getRenderableDevicesForScreenshot(screenshots, 1);

    expect(renderables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerScreenshotId: "screen-1",
          localX: 25,
          isOwner: false,
          layerZIndex: expect.any(Number),
          device: expect.objectContaining({ id: "device-a" }),
        }),
        expect.objectContaining({
          ownerScreenshotId: "screen-2",
          localX: 50,
          isOwner: true,
          layerZIndex: expect.any(Number),
          device: expect.objectContaining({ id: "device-b" }),
        }),
      ]),
    );

    const guest = renderables.find((r) => r.device.id === "device-a");
    const owner = renderables.find((r) => r.device.id === "device-b");
    expect(guest?.isOwner).toBe(false);
    expect(owner?.isOwner).toBe(true);
  });
});
