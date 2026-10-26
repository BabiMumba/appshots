import type { TextAlign } from "../types";

/**
 * Detect text alignment from rich-text HTML produced by execCommand justify*.
 */
export function getTextAlignFromHtml(html: string): TextAlign {
  if (/text-align:\s*right/i.test(html) || /align=["']?right/i.test(html)) {
    return "right";
  }
  if (/text-align:\s*left/i.test(html) || /align=["']?left/i.test(html)) {
    return "left";
  }
  if (/text-align:\s*center/i.test(html) || /align=["']?center/i.test(html)) {
    return "center";
  }
  return "center";
}

export function textAlignClass(align: TextAlign): string {
  if (align === "left") return "text-left";
  if (align === "right") return "text-right";
  return "text-center";
}
