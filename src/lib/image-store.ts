/**
 * Image assets in IndexedDB — keep localStorage lean (refs only).
 * Session UI uses object URLs; persist as `idb:<uuid>`.
 */

import type { Project, Screenshot } from "../types";

const DB_NAME = "appshots-images";
const DB_VERSION = 1;
const STORE = "blobs";
export const IDB_REF_PREFIX = "idb:";

const objectUrlToId = new Map<string, string>();
const idToObjectUrl = new Map<string, string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isIdbRef(src: string | null | undefined): boolean {
  return typeof src === "string" && src.startsWith(IDB_REF_PREFIX);
}

export function makeIdbRef(id: string): string {
  return `${IDB_REF_PREFIX}${id}`;
}

export function parseIdbRef(src: string): string | null {
  return isIdbRef(src) ? src.slice(IDB_REF_PREFIX.length) : null;
}

async function idbPut(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB put failed"));
  });
  db.close();
}

async function idbGet(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
  });
  db.close();
  return blob;
}

function registerObjectUrl(id: string, objectUrl: string) {
  idToObjectUrl.set(id, objectUrl);
  objectUrlToId.set(objectUrl, id);
}

/** Store a file in IndexedDB and return a session object URL for rendering. */
export async function ingestImageFile(file: File | Blob): Promise<string> {
  const id = newId();
  await idbPut(id, file);
  const objectUrl = URL.createObjectURL(file);
  registerObjectUrl(id, objectUrl);
  return objectUrl;
}

/** Resolve an idb: ref (or pass-through http/data/blob URL). */
export async function resolveImageSrc(
  src: string | null | undefined,
): Promise<string | null> {
  if (!src) return null;
  const id = parseIdbRef(src);
  if (!id) return src;

  const cached = idToObjectUrl.get(id);
  if (cached) return cached;

  const blob = await idbGet(id);
  if (!blob) return null;
  const objectUrl = URL.createObjectURL(blob);
  registerObjectUrl(id, objectUrl);
  return objectUrl;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Ensure src is stored in IDB; return idb: ref for persistence. */
export async function toPersistableImageSrc(
  src: string | null | undefined,
): Promise<string | null> {
  if (!src) return null;
  if (isIdbRef(src)) return src;

  const knownId = objectUrlToId.get(src);
  if (knownId) return makeIdbRef(knownId);

  if (src.startsWith("data:") || src.startsWith("blob:")) {
    try {
      const blob = src.startsWith("data:")
        ? await dataUrlToBlob(src)
        : await fetch(src).then((r) => r.blob());
      const id = newId();
      await idbPut(id, blob);
      if (src.startsWith("blob:")) {
        registerObjectUrl(id, src);
      } else {
        const objectUrl = URL.createObjectURL(blob);
        registerObjectUrl(id, objectUrl);
      }
      return makeIdbRef(id);
    } catch {
      return src;
    }
  }

  // Remote / public paths (stickers) — keep as-is
  return src;
}

/** Expand idb: refs to data URLs for .appshots / canvas export. */
export async function materializeDataUrl(
  src: string | null | undefined,
): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return src;

  const resolved = await resolveImageSrc(src);
  if (!resolved) return null;
  if (resolved.startsWith("data:")) return resolved;

  try {
    const blob = await fetch(resolved).then((r) => r.blob());
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Failed to read blob"));
      reader.onerror = () => reject(reader.error ?? new Error("read failed"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return resolved;
  }
}

async function mapScreenshotImages(
  shot: Screenshot,
  mapSrc: (src: string | null) => Promise<string | null>,
): Promise<Screenshot> {
  const devices = await Promise.all(
    shot.devices.map(async (device) => ({
      ...device,
      screenshotSrc: await mapSrc(device.screenshotSrc),
    })),
  );
  const overlayImages = await Promise.all(
    shot.overlayImages.map(async (img) => ({
      ...img,
      src: (await mapSrc(img.src)) ?? img.src,
    })),
  );
  return {
    ...shot,
    backgroundImage: await mapSrc(shot.backgroundImage),
    devices,
    overlayImages,
  };
}

export async function prepareProjectsForPersist(
  projects: Project[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      screenshots: await Promise.all(
        project.screenshots.map((s) =>
          mapScreenshotImages(s, toPersistableImageSrc),
        ),
      ),
    })),
  );
}

export async function hydrateProjectsImages(
  projects: Project[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      screenshots: await Promise.all(
        project.screenshots.map((s) => mapScreenshotImages(s, resolveImageSrc)),
      ),
    })),
  );
}

export async function materializeProjectImages(
  project: Project,
): Promise<Project> {
  return {
    ...project,
    screenshots: await Promise.all(
      project.screenshots.map((s) =>
        mapScreenshotImages(s, materializeDataUrl),
      ),
    ),
  };
}
