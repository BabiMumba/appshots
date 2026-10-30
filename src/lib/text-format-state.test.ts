/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import {
  getContentFormatState,
  stripInlineBold,
} from "./text-format-state";

describe("getContentFormatState", () => {
  it("treats base weight 700 as bold", () => {
    expect(getContentFormatState("Hello", 700).bold).toBe("on");
    expect(getContentFormatState("Hello", 600).bold).toBe("off");
  });

  it("detects mixed inline bold", () => {
    expect(getContentFormatState("H<b>i</b>", 600).bold).toBe("mixed");
    expect(getContentFormatState("<b>Hi</b>", 600).bold).toBe("on");
  });

  it("detects italic and underline", () => {
    const state = getContentFormatState("<i>a</i><u>b</u>", 600);
    expect(state.italic).toBe("mixed");
    expect(state.underline).toBe("mixed");
  });
});

describe("stripInlineBold", () => {
  it("unwraps b/strong tags", () => {
    expect(stripInlineBold("A<strong>B</strong>C")).toBe("ABC");
    expect(stripInlineBold("<b>All</b>")).toBe("All");
  });
});
