import { describe, expect, it } from "vitest";
import { ensureLayerOrder } from "./layer-order";
import type { Screenshot } from "../types";

const baseShot = {
  id: "s1",
  texts: [
    { id: "t0", content: "A" },
    { id: "t1", content: "B" },
  ],
  devices: [{ id: "d1" }],
  overlayImages: [],
} as unknown as Screenshot;

describe("ensureLayerOrder", () => {
  it("dedupes legacy headline remapped onto the same text id", () => {
    const order = ensureLayerOrder({
      ...baseShot,
      layerOrder: ["headline", "text:t0", "device:d1", "subheadline"],
    });
    expect(order.filter((k) => k === "text:t0")).toHaveLength(1);
    expect(order).toEqual(
      expect.arrayContaining(["text:t0", "text:t1", "device:d1"]),
    );
  });
});
