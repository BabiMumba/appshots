/**
 * .appshots project file — open / save / save-as (Photoshop-style on the web).
 */

import JSZip from "jszip";
import type { Project } from "../types";
import { materializeProjectImages } from "./image-store";

export const APPSHOTS_FORMAT = "appshots" as const;
export const APPSHOTS_FILE_VERSION = 1;
export const APPSHOTS_EXTENSION = ".appshots";

export type AppshotsFile = {
  format: typeof APPSHOTS_FORMAT;
  version: number;
  exportedAt: number;
  project: Project;
};

/** Minimal FS Access types (Chrome/Edge) — not in all TS libs */
export type AppshotsFileHandle = {
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: Blob | BufferSource | string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type OpenFilePickerOptions = {
  multiple?: boolean;
  types?: { description: string; accept: Record<string, string[]> }[];
};

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
};

declare global {
  interface Window {
    showOpenFilePicker?: (
      options?: OpenFilePickerOptions,
    ) => Promise<AppshotsFileHandle[]>;
    showSaveFilePicker?: (
      options?: SaveFilePickerOptions,
    ) => Promise<AppshotsFileHandle>;
  }
}

const FILE_PICKER_TYPES = [
  {
    description: "AppShots project",
    accept: {
      "application/zip": [APPSHOTS_EXTENSION],
      "application/json": [".json"],
    },
  },
];

export function supportsFileSystemAccess(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.showOpenFilePicker === "function" &&
    typeof window.showSaveFilePicker === "function"
  );
}

export function isAppshotsFile(data: unknown): data is AppshotsFile {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.format === APPSHOTS_FORMAT &&
    typeof d.version === "number" &&
    d.project !== null &&
    typeof d.project === "object"
  );
}

export function buildAppshotsPayload(project: Project): AppshotsFile {
  return {
    format: APPSHOTS_FORMAT,
    version: APPSHOTS_FILE_VERSION,
    exportedAt: Date.now(),
    project: structuredClone(project),
  };
}

export async function buildProjectBlob(project: Project): Promise<Blob> {
  const materialized = await materializeProjectImages(project);
  const payload = buildAppshotsPayload(materialized);
  const zip = new JSZip();
  zip.file("project.json", JSON.stringify(payload));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

function safeFileBaseName(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").slice(0, 60) || "project";
}

/** Fallback download (always a new file in Downloads). */
export async function downloadProjectFile(
  project: Project,
  filename?: string,
): Promise<void> {
  const blob = await buildProjectBlob(project);
  const base = safeFileBaseName(filename ?? project.name ?? "project");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}${APPSHOTS_EXTENSION}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function writeProjectToHandle(
  handle: AppshotsFileHandle,
  project: Project,
): Promise<void> {
  const blob = await buildProjectBlob(project);
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/** Save As — pick location; returns handle so later Ctrl+S can overwrite. */
export async function saveProjectAsWithPicker(
  project: Project,
  suggestedName?: string,
): Promise<AppshotsFileHandle | null> {
  if (!supportsFileSystemAccess() || !window.showSaveFilePicker) {
    await downloadProjectFile(project, suggestedName);
    return null;
  }
  try {
    const base = safeFileBaseName(suggestedName ?? project.name ?? "project");
    const handle = await window.showSaveFilePicker({
      suggestedName: `${base}${APPSHOTS_EXTENSION}`,
      types: FILE_PICKER_TYPES,
    });
    await writeProjectToHandle(handle, project);
    return handle;
  } catch (err) {
    // User cancelled
    if (err instanceof DOMException && err.name === "AbortError") return null;
    throw err;
  }
}

/** Open via File System Access (keeps a writable handle). */
export async function openProjectWithPicker(): Promise<{
  data: AppshotsFile;
  handle: AppshotsFileHandle;
  fileName: string;
} | null> {
  if (!supportsFileSystemAccess() || !window.showOpenFilePicker) {
    return null;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: FILE_PICKER_TYPES,
    });
    const file = await handle.getFile();
    const data = await parseProjectFile(file);
    return { data, handle, fileName: handle.name || file.name };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    throw err;
  }
}

/**
 * Parse a .appshots file (ZIP with project.json) or raw JSON.
 */
export async function parseProjectFile(file: File): Promise<AppshotsFile> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json")) {
    const text = await file.text();
    const data = JSON.parse(text) as unknown;
    if (!isAppshotsFile(data)) {
      throw new Error("Invalid AppShots JSON — missing format/project.");
    }
    return data;
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry =
    zip.file("project.json") ?? zip.file(/project\.json$/i)[0] ?? null;
  if (!entry) {
    throw new Error("Invalid .appshots file — project.json not found.");
  }
  const text = await entry.async("string");
  const data = JSON.parse(text) as unknown;
  if (!isAppshotsFile(data)) {
    throw new Error("Invalid .appshots contents.");
  }
  if (data.version > APPSHOTS_FILE_VERSION) {
    throw new Error(
      `This file requires a newer AppShots (v${data.version}).`,
    );
  }
  return data;
}
