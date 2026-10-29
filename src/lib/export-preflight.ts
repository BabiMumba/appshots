/**
 * Lightweight store-readiness checks before export.
 */

import type { ExportSize, Screenshot } from "../types";

export type PreflightLevel = "info" | "warn" | "error";

export type PreflightIssue = {
  id: string;
  level: PreflightLevel;
  message: string;
};

const MIN_TEXT_EXPORT_PX = 28;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function runExportPreflight(opts: {
  screenshots: Screenshot[];
  exportSizes: ExportSize[];
}): PreflightIssue[] {
  const { screenshots, exportSizes } = opts;
  const issues: PreflightIssue[] = [];

  if (screenshots.length === 0) {
    issues.push({
      id: "no-screens",
      level: "error",
      message: "Add at least one screenshot before exporting.",
    });
    return issues;
  }

  if (exportSizes.length === 0) {
    issues.push({
      id: "no-sizes",
      level: "error",
      message: "Select at least one export size.",
    });
    return issues;
  }

  const emptyDevices = screenshots.filter((s) =>
    s.devices.some((d) => !d.screenshotSrc),
  ).length;
  if (emptyDevices > 0) {
    issues.push({
      id: "empty-screens",
      level: "warn",
      message: `${emptyDevices} screen${emptyDevices !== 1 ? "s have" : " has"} a device without an image.`,
    });
  }

  const exportingRequired = exportSizes.some((s) => s.required);
  if (!exportingRequired) {
    issues.push({
      id: "no-required-size",
      level: "info",
      message:
        "No required store size selected — pack may be incomplete for App Store / Play.",
    });
  }

  if (screenshots.length < 3) {
    issues.push({
      id: "few-screens",
      level: "info",
      message:
        "Stores usually expect several screenshots — consider adding more screens.",
    });
  }

  let smallTextCount = 0;
  for (const shot of screenshots) {
    for (const text of shot.texts ?? []) {
      const plain = stripHtml(text.content);
      if (!plain) continue;
      if (text.fontSize < MIN_TEXT_EXPORT_PX) smallTextCount += 1;
    }
  }
  if (smallTextCount > 0) {
    issues.push({
      id: "small-text",
      level: "warn",
      message: `${smallTextCount} text block${smallTextCount !== 1 ? "s are" : " is"} under ${MIN_TEXT_EXPORT_PX}px — may be hard to read on device.`,
    });
  }

  const landscape = exportSizes.filter((s) => s.width > s.height);
  if (landscape.length > 0) {
    issues.push({
      id: "landscape",
      level: "info",
      message: `Exporting ${landscape.length} landscape size${landscape.length !== 1 ? "s" : ""} — check framing.`,
    });
  }

  if (exportSizes.some((s) => s.id === "play-feature-graphic")) {
    issues.push({
      id: "feature-graphic",
      level: "warn",
      message:
        "Play feature graphic is 1024×500 — phone layouts won’t fill it the same way.",
    });
  }

  // Device overflow past canvas (very far off-screen owner fragments)
  let overflowRisk = 0;
  for (const shot of screenshots) {
    for (const device of shot.devices) {
      if (device.x < -5 || device.x > 105) overflowRisk += 1;
    }
  }
  if (overflowRisk > 0) {
    issues.push({
      id: "overflow",
      level: "info",
      message:
        "Some devices sit past the screen edge — confirm cross-screen overflow looks right.",
    });
  }

  return issues;
}
