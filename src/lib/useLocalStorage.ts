/**
 * useLocalStorage — persist editor state with visible failure + flush on teardown.
 */

import { useEffect, useCallback, useRef } from "react";
import type { Project } from "../types";

export interface PersistedEditorState {
  version: number;
  projects: Project[];
  activeProjectId: string;
  lastSaved: number;
}

/** Current schema version for migration support */
const CURRENT_VERSION = 2;

const STORAGE_KEY = "app-screenshot-editor-state";
const AUTO_SAVE_DELAY = 1000;

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "error"; message: string };

export const loadPersistedState = (): PersistedEditorState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedEditorState;

    // Soft migrate: keep data when version is older but shape is valid
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

export const savePersistedState = (
  state: PersistedEditorState,
): SaveResult => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save editor state";
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        /quota/i.test(message));
    console.error("Failed to save editor state to localStorage:", error);
    return {
      ok: false,
      reason: isQuota ? "quota" : "error",
      message: isQuota
        ? "Storage full — export a .appshots backup. Images are too large for the browser."
        : message,
    };
  }
};

export const clearPersistedState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear editor state from localStorage:", error);
  }
};

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

  const flushSave = useCallback(() => {
    const { projects: p, activeProjectId: id } = latestRef.current;
    const result = savePersistedState({
      version: CURRENT_VERSION,
      projects: p,
      activeProjectId: id,
      lastSaved: Date.now(),
    });
    onSaveResultRef.current?.(result);
    return result;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(flushSave, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        // Flush pending edits so remount / Strict Mode does not drop pages
        flushSave();
      }
    };
  }, [projects, activeProjectId, flushSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      flushSave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flushSave]);
};
