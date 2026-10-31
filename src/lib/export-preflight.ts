/**
 * Blocking-only checks before export (soft tips are intentionally omitted).
 */

import type { ExportSize, Screenshot } from "../types";

export type PreflightLevel = "info" | "warn" | "error";

export type PreflightIssue = {
  id: string;
  level: PreflightLevel;
  message: string;
};

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

  return issues;
}
