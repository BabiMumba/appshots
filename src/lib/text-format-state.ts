/**
 * Bold / italic / underline state for the canvas text format bar.
 * Supports whole-block weight and partial inline markup (mixed).
 */

import { parseRichText } from "./rich-text-canvas";

export type FormatTriState = "on" | "off" | "mixed";

export type InlineFormatState = {
  bold: FormatTriState;
  italic: FormatTriState;
  underline: FormatTriState;
};

const triFromFlags = (flags: boolean[]): FormatTriState => {
  if (flags.length === 0) return "off";
  const all = flags.every(Boolean);
  const none = flags.every((f) => !f);
  if (all) return "on";
  if (none) return "off";
  return "mixed";
};

/**
 * Derive format state from stored HTML + base fontWeight (when not editing).
 * Base weight ≥ 700 counts as block-level bold.
 */
export function getContentFormatState(
  html: string,
  fontWeight: number = 700,
): InlineFormatState {
  const segments = parseRichText(html || "", "#ffffff").filter(
    (s) => s.text.length > 0 && s.text !== "\n",
  );
  const baseBold = fontWeight >= 700;

  if (segments.length === 0) {
    return {
      bold: baseBold ? "on" : "off",
      italic: "off",
      underline: "off",
    };
  }

  return {
    bold: triFromFlags(segments.map((s) => s.bold || baseBold)),
    italic: triFromFlags(segments.map((s) => s.italic)),
    underline: triFromFlags(segments.map((s) => s.underline)),
  };
}

/**
 * Live format state from the current selection (contentEditable).
 * Falls back to content analysis when there is no usable selection.
 */
export function getSelectionFormatState(
  editorRoot?: HTMLElement | null,
): InlineFormatState {
  const selection = window.getSelection();
  if (
    !selection ||
    selection.rangeCount === 0 ||
    (editorRoot &&
      selection.anchorNode &&
      !editorRoot.contains(selection.anchorNode))
  ) {
    if (editorRoot) {
      return getContentFormatState(editorRoot.innerHTML, 400);
    }
    return { bold: "off", italic: "off", underline: "off" };
  }

  // Collapsed caret or uniform queryCommandState
  const bold = document.queryCommandState("bold");
  const italic = document.queryCommandState("italic");
  const underline = document.queryCommandState("underline");

  // Detect mixed selection by sampling text nodes in the range
  if (!selection.isCollapsed && editorRoot) {
    try {
      const range = selection.getRangeAt(0);
      const frag = range.cloneContents();
      const wrap = document.createElement("div");
      wrap.appendChild(frag);
      const mixed = getContentFormatState(wrap.innerHTML, 400);
      // Prefer mixed detection when the fragment disagrees with queryCommand
      return {
        bold: mixed.bold === "mixed" ? "mixed" : bold ? "on" : "off",
        italic: mixed.italic === "mixed" ? "mixed" : italic ? "on" : "off",
        underline:
          mixed.underline === "mixed" ? "mixed" : underline ? "on" : "off",
      };
    } catch {
      // fall through
    }
  }

  return {
    bold: bold ? "on" : "off",
    italic: italic ? "on" : "off",
    underline: underline ? "on" : "off",
  };
}

/** Strip inline bold tags / font-weight bold styles from HTML. */
export function stripInlineBold(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return html;

  const unwrap = (el: Element) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  };

  root.querySelectorAll("b, strong").forEach((el) => unwrap(el));
  root.querySelectorAll("[style]").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const weight = htmlEl.style.fontWeight;
    if (
      weight === "bold" ||
      weight === "700" ||
      weight === "800" ||
      weight === "900"
    ) {
      htmlEl.style.fontWeight = "";
      if (!htmlEl.getAttribute("style")?.trim()) {
        htmlEl.removeAttribute("style");
      }
    }
  });

  return root.innerHTML;
}
