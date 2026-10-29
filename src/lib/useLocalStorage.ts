/**
 * useLocalStorage — persist editor state with visible failure + flush on teardown.
 * Images should be idb: refs (see image-store) so this payload stays small.
 */

import { useEffect, useCallback, useRef } from "react";
import type { Project } from "../types";
import { prepareProjectsForPersist } from "./image-store";

export interface PersistedEditorState {
  version: number;
  projects: Project[];
  activeProjectId: string;
  lastSaved: number;
}

/** Current schema version for migration support */
const CURRENT_VERSION = 3;

const STORAGE_KEY = "app-screenshot-editor-state";
const AUTO_SAVE_DELAY = 1000;
const WARNING_DISMISS_KEY = "appshots-storage-warning-dismissed";

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "error"; message: string };

export const loadPersistedState = (): PersistedEditorState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedEditorState;

    if (!parsed.projects || !Array.isArray(parsed.projects)) {
      return null;
    }

    if (parsed.version !== CURRENT_VERSION) {
      console.warn(
        `Editor state version ${parsed.version} → ${CURRENT_VERSION} (migrating).`,
      );
      return {
        ...parsed,
        version: CURRENT_VERSION,
      };
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load editor state from localStorage:", error);
    return null;
  }
};

const quotaMessage =
  "Browser storage is full. Your edits stay in this tab — Save a .appshots file so you don’t lose them. Images are kept separately so this should free up after a refresh.";

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException) && !(error instanceof Error)) {
    return /quota/i.test(String(error));
  }
  const message = error.message ?? "";
  return (
    (error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")) ||
    /quota/i.test(message)
  );
}

/**
 * Write state. On quota: remove the old (often huge) blob first, then retry —
 * Safari/Chrome often fail updates when the key is already near the limit.
 */
export const savePersistedState = (
  state: PersistedEditorState,
): SaveResult => {
  const payload = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (error) {
    if (isQuotaError(error)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, payload);
        return { ok: true };
      } catch (retryError) {
        console.error("Quota persist failed after clear+retry:", retryError);
        return { ok: false, reason: "quota", message: quotaMessage };
      }
    }
    const message =
      error instanceof Error ? error.message : "Failed to save editor state";
    console.error("Failed to save editor state to localStorage:", error);
    return { ok: false, reason: "error", message };
  }
};

export const clearPersistedState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear editor state from localStorage:", error);
  }
};

/** Approximate JSON size of current localStorage editor blob (bytes). */
export const getPersistedStateByteLength = (): number => {
  try {
    return (localStorage.getItem(STORAGE_KEY) ?? "").length * 2;
  } catch {
    return 0;
  }
};

export const wasStorageWarningDismissed = (): boolean => {
  try {
    return sessionStorage.getItem(WARNING_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

export const markStorageWarningDismissed = (): void => {
  try {
    sessionStorage.setItem(WARNING_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
};

export const clearStorageWarningDismissed = (): void => {
  try {
    sessionStorage.removeItem(WARNING_DISMISS_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Move embedded data:/blob: images into IndexedDB, then rewrite localStorage
 * with compact idb: refs. Call once after load / when user clicks “Free space”.
 */
export async function compactPersistedStorage(
  projects: Project[],
  activeProjectId: string,
): Promise<SaveResult> {
  const prepared = await prepareProjectsForPersist(projects);
  return savePersistedState({
    version: CURRENT_VERSION,
    projects: prepared,
    activeProjectId,
    lastSaved: Date.now(),
  });
}

interface UseEditorPersistenceOptions {
  projects: Project[];
  activeProjectId: string;
  onSaveResult?: (result: SaveResult) => void;
}

export const useEditorPersistence = ({
  projects,
  activeProjectId,
  onSaveResult,
}: UseEditorPersistenceOptions): void => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const latestRef = useRef({ projects, activeProjectId });
  latestRef.current = { projects, activeProjectId };
  const onSaveResultRef = useRef(onSaveResult);
  onSaveResultRef.current = onSaveResult;

  const flushSave = useCallback(async () => {
    const { projects: p, activeProjectId: id } = latestRef.current;
    try {
      const prepared = await prepareProjectsForPersist(p);
      const result = savePersistedState({
        version: CURRENT_VERSION,
        projects: prepared,
        activeProjectId: id,
        lastSaved: Date.now(),
      });
      onSaveResultRef.current?.(result);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to prepare images";
      const result: SaveResult = {
        ok: false,
        reason: isQuotaError(error) ? "quota" : "error",
        message: isQuotaError(error) ? quotaMessage : message,
      };
      onSaveResultRef.current?.(result);
      return result;
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void flushSave();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        void flushSave();
      }
    };
  }, [projects, activeProjectId, flushSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      void flushSave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flushSave]);
};
