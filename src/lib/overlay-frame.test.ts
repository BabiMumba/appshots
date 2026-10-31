import { describe, expect, it } from "vitest";
import {
  looksLikeLegacyOverlayHeight,
  overlayHeightForImageAspect,
} from "./overlay-frame";

describe("overlayHeightForImageAspect", () => {
  it("matches image pixels on a square canvas", () => {
    // 30% of W, image 2:1 → height % = 15 on square canvas
    expect(overlayHeightForImageAspect(30, 2, 1)).toBeCloseTo(15);
  });

  it("accounts for landscape feature canvas (1024×500)", () => {
    const canvasAspect = 1024 / 500;
    // Portrait-ish image 0.75 → taller frame % than legacy formula
    const h = overlayHeightForImageAspect(30, 0.75, canvasAspect);
    expect(h).toBeCloseTo(canvasAspect * 30 / 0.75);
    expect(h).toBeGreaterThan(30 / 0.75);
  });
});

describe("looksLikeLegacyOverlayHeight", () => {
  it("detects width/imageAspect legacy store", () => {
    expect(looksLikeLegacyOverlayHeight(30, 30 / 1.5, 1.5)).toBe(true);
  });

  it("rejects correctly sized frames", () => {
    const canvasAspect = 1024 / 500;
    const h = overlayHeightForImageAspect(30, 1.5, canvasAspect);
    expect(looksLikeLegacyOverlayHeight(30, h, 1.5)).toBe(false);
  });
});
