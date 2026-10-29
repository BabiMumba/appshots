import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  DeviceSpec,
  DeviceColor,
  DeviceInstance,
  ExportSize,
  Screenshot,
  ImageOverlay,
  ShadowConfig,
  Project,
  SelectedElement,
  TextAlign,
} from "../types";
import {
  devices,
  exportSizes,
  DEFAULT_EXPORT_SIZE_ID,
  resolveExportSizeId,
} from "../constants";
import { exportScreenshots } from "../lib/export-utils";
import {
  cloneDeviceInstance,
  createDeviceInstance,
  ensureDeviceInstances,
  getDeviceColorById,
  getDeviceSpecById,
} from "../lib/device-instances";
import { getBackgroundCss } from "../lib/gradient-style";
import {
  buildDefaultLayerOrder,
  ensureLayerOrder,
  layerKeyFor,
  moveLayerKey,
} from "../lib/layer-order";
import {
  createDefaultTexts,
  createTextOverlay,
  resolveTexts,
  syncLegacyTextFields,
} from "../lib/text-overlays";
import type { TextOverlay } from "../types";
import {
  loadPersistedState,
  useEditorPersistence,
  clearPersistedState,
  type SaveResult,
} from "../lib/useLocalStorage";
import {
  downloadProjectFile,
  openProjectWithPicker,
  parseProjectFile,
  saveProjectAsWithPicker,
  supportsFileSystemAccess,
  writeProjectToHandle,
  type AppshotsFileHandle,
} from "../lib/project-file";

const withSyncedTexts = (
  texts: TextOverlay[],
  extra: Partial<Screenshot> = {},
) => ({
  texts,
  ...syncLegacyTextFields(texts),
  ...extra,
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface EditorContextType {
  // Project state
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  /** Linked .appshots file name (if opened/saved on disk) */
  linkedFileName: string | null;
  /** Unsaved changes since last open/save */
  isProjectDirty: boolean;
  canOverwriteLinkedFile: boolean;
  saveProject: () => Promise<void>;
  saveProjectAs: () => Promise<void>;
  openProjectFile: () => Promise<void>;
  /** Fallback when File System Access is unavailable (input[type=file]) */
  importProjectFile: (file: File) => Promise<void>;
  /** @deprecated prefer saveProjectAs — kept as alias */
  exportProjectFile: () => Promise<void>;
  storageWarning: string | null;
  dismissStorageWarning: () => void;

  // State
  isFontPickerOpen: boolean;
  setIsFontPickerOpen: (open: boolean) => void;
  isExportSuccessOpen: boolean;
  setIsExportSuccessOpen: (open: boolean) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  selectedColorId: string;
  setSelectedColorId: (id: string) => void;
  exportSizeId: string;
  setExportSizeId: (id: string) => void;
  exportSizeIds: string[];
  toggleExportSizeId: (id: string) => void;
  screenshots: Screenshot[];
  setScreenshots: (screenshots: Screenshot[]) => void;
  activeScreenshotId: string;
  setActiveScreenshotId: (id: string) => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  isDragging: boolean;
  headlineFontSize: number;
  setHeadlineFontSize: (size: number) => void;
  subheadlineFontSize: number;
  setSubheadlineFontSize: (size: number) => void;
  previewDimensions: { width: number; height: number };
  setPreviewDimensions: (dim: { width: number; height: number }) => void;
  contentFocusRequest: string | null;
  clearContentFocusRequest: () => void;
  /** Inline canvas text editing target */
  inlineEditing: {
    screenshotId: string;
    textId: string;
  } | null;
  startInlineEditing: (screenshotId: string, textId: string) => void;
  stopInlineEditing: () => void;
  addText: () => void;
  updateText: (
    textId: string,
    updates: Partial<TextOverlay>,
    screenshotId?: string,
  ) => void;
  removeText: (textId: string) => void;
  duplicateText: (textId: string) => void;
  /** Ignore canvas deselect briefly after selecting an element (layout shift guard) */
  suppressDeselectUntil: React.MutableRefObject<number>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Refs
  previewRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  overlayImageInputRef: React.RefObject<HTMLInputElement | null>;

  // Derived
  selectedDevice: DeviceSpec;
  selectedColor: DeviceColor;
  activeScreenshot: Screenshot;
  activeDevice: DeviceInstance | null;
  exportSize: ExportSize;

  // Actions
  updateActiveScreenshot: (updates: Partial<Screenshot>) => void;
  addScreenshot: () => void;
  duplicateScreenshot: (id?: string) => void;
  removeScreenshot: (id: string) => void;
  reorderScreenshots: (fromIndex: number, toIndex: number) => void;
  moveScreenshot: (id: string, direction: -1 | 1) => void;
  handleElementMouseDown: (
    e: React.MouseEvent,
    type: "text" | "image" | "device",
    screenshotId: string,
    id?: string,
  ) => void;
  handleElementMouseMove: (e: MouseEvent) => void;
  handleElementMouseUp: () => void;
  handleResizeStart: (
    e: React.MouseEvent,
    type: "text" | "image" | "device",
    screenshotId: string,
    id: string | undefined,
    handle: "e" | "w" | "se" | "sw" | "ne" | "nw",
  ) => void;
  handleRotateStart: (
    e: React.MouseEvent,
    type: "image" | "device",
    screenshotId: string,
    id: string,
  ) => void;
  requestContentFocus: (textId: string) => void;
  updateScreenshotById: (
    screenshotId: string,
    updates: Partial<Screenshot>,
    recordHistory?: boolean,
  ) => void;
  updateTextAlign: (textId: string, align: TextAlign) => void;
  addOverlayImage: (file: File) => void;
  addIcon: (src: string, name: string) => void;
  removeOverlayImage: (imageId: string) => void;
  updateOverlayImageSize: (imageId: string, widthPercent: number) => void;
  updateOverlayImageLayer: (imageId: string, layer: "behind" | "front") => void;
  updateOverlayImageRotation: (imageId: string, rotation: number) => void;
  updateOverlayImageShadow: (
    imageId: string,
    shadow: Partial<ShadowConfig>,
  ) => void;
  addDevice: () => void;
  selectDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  bringDeviceForward: (deviceId: string) => void;
  sendDeviceBackward: (deviceId: string) => void;
  bringDeviceToFront: (deviceId: string) => void;
  sendDeviceToBack: (deviceId: string) => void;
  bringImageForward: (imageId: string) => void;
  sendImageBackward: (imageId: string) => void;
  bringImageToFront: (imageId: string) => void;
  sendImageToBack: (imageId: string) => void;
  moveElementLayer: (
    type: SelectedElement["type"],
    id: string | undefined,
    action: "forward" | "backward" | "front" | "back",
  ) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
  getBackgroundStyle: (screenshot: Screenshot) => string;
  resetEditor: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type LegacyScreenshotFields = {
  screenshotSrc?: string | null;
  deviceScale?: number;
  deviceOffsetY?: number;
  deviceRotation?: number;
  deviceShadow?: ShadowConfig;
  deviceStyle?: "flat" | "3d";
  device3dRotateY?: number;
  device3dRotateX?: number;
};

// Default screenshot for new editors
const createDefaultScreenshot = (
  defaultDeviceId: string = devices[0].id,
  defaultColorId: string = devices[0].colors[0].id,
): Screenshot => {
  const defaultDevice = createDeviceInstance({
    deviceId: defaultDeviceId,
    colorId: defaultColorId,
  });
  const texts = createDefaultTexts();

  return {
    id: generateId(),
    texts,
    ...syncLegacyTextFields(texts),
    backgroundColor: "#8b5cf6",
    backgroundMode: "solid",
    gradientPresetId: null,
    customGradient: null,
    backgroundImage: null,
    overlayImages: [],
    devices: [defaultDevice],
    activeDeviceId: defaultDevice.id,
    layerOrder: buildDefaultLayerOrder({
      devices: [defaultDevice],
      overlayImages: [],
      texts,
    }),
  };
};

const normalizeScreenshot = (
  screenshot: Partial<Screenshot> & LegacyScreenshotFields,
  fallbackDeviceId: string,
  fallbackColorId: string,
  fallbackHeadlineFontSize: number = 72,
  fallbackSubheadlineFontSize: number = 42,
): Screenshot => {
  const {
    screenshotSrc: _legacyScreenshotSrc,
    deviceScale: _legacyDeviceScale,
    deviceOffsetY: _legacyDeviceOffsetY,
    deviceRotation: _legacyDeviceRotation,
    deviceShadow: _legacyDeviceShadow,
    deviceStyle: _legacyDeviceStyle,
    device3dRotateY: _legacyDevice3dRotateY,
    device3dRotateX: _legacyDevice3dRotateX,
    ...rest
  } = screenshot;
  const baseScreenshot = createDefaultScreenshot(fallbackDeviceId, fallbackColorId);
  const { devices: deviceInstances, activeDeviceId } = ensureDeviceInstances(
    screenshot,
    fallbackDeviceId,
    fallbackColorId,
  );

  const overlayImages = screenshot.overlayImages ?? [];
  const texts = resolveTexts({
    ...screenshot,
    headlineFontSize:
      typeof screenshot.headlineFontSize === "number"
        ? screenshot.headlineFontSize
        : fallbackHeadlineFontSize,
    subheadlineFontSize:
      typeof screenshot.subheadlineFontSize === "number"
        ? screenshot.subheadlineFontSize
        : fallbackSubheadlineFontSize,
  });

  const partial: Screenshot = {
    ...baseScreenshot,
    ...rest,
    ...syncLegacyTextFields(texts),
    texts,
    customGradient: screenshot.customGradient ?? null,
    backgroundImage: screenshot.backgroundImage ?? null,
    overlayImages,
    devices: deviceInstances,
    activeDeviceId,
    layerOrder: [],
  };
  return {
    ...partial,
    layerOrder: ensureLayerOrder(partial),
  };
};

const normalizeProject = (project: Project): Project => {
  const fallbackDeviceId = project.selectedDeviceId ?? devices[0].id;
  const fallbackColorId =
    project.selectedColorId ?? getDeviceSpecById(fallbackDeviceId).colors[0].id;
  const legacyHeadline = project.headlineFontSize ?? 72;
  const legacySub = project.subheadlineFontSize ?? 42;
  const normalizedScreenshots = project.screenshots.map((screenshot) =>
    normalizeScreenshot(
      screenshot,
      fallbackDeviceId,
      fallbackColorId,
      legacyHeadline,
      legacySub,
    ),
  );
  const exportSizeId = resolveExportSizeId(project.exportSizeId);
  const rawIds = Array.isArray(project.exportSizeIds)
    ? project.exportSizeIds
    : [exportSizeId];
  const exportSizeIds = Array.from(
    new Set(rawIds.map(resolveExportSizeId).concat(exportSizeId)),
  );

  return {
    ...project,
    selectedDeviceId: fallbackDeviceId,
    selectedColorId: fallbackColorId,
    exportSizeId,
    exportSizeIds,
    screenshots: normalizedScreenshots,
    activeScreenshotId:
      normalizedScreenshots.find((s) => s.id === project.activeScreenshotId)?.id ??
      normalizedScreenshots[0].id,
  };
};

// Create a default project
const createDefaultProject = (name: string = "My Project"): Project => {
  const defaultDeviceId = devices[0].id;
  const defaultColorId = devices[0].colors[0].id;
  const defaultScreenshot = createDefaultScreenshot(defaultDeviceId, defaultColorId);
  return {
    id: generateId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshots: [defaultScreenshot],
    selectedDeviceId: defaultDeviceId,
    selectedColorId: defaultColorId,
    exportSizeId: DEFAULT_EXPORT_SIZE_ID,
    exportSizeIds: [DEFAULT_EXPORT_SIZE_ID],
    activeScreenshotId: defaultScreenshot.id,
  };
};

// Load persisted state once on module load
const persistedState = loadPersistedState();

// Initialize projects from persisted state or create default
const getInitialProjects = (): Project[] => {
  if (persistedState?.projects && persistedState.projects.length > 0) {
    return persistedState.projects.map(normalizeProject);
  }
  return [createDefaultProject()];
};

const getInitialActiveProjectId = (projects: Project[]): string => {
  if (persistedState?.activeProjectId) {
    // Verify the project exists
    const exists = projects.some((p) => p.id === persistedState.activeProjectId);
    if (exists) return persistedState.activeProjectId;
  }
  return projects[0]?.id || generateId();
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  // Project state
  const [projects, setProjects] = useState<Project[]>(getInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState(() =>
    getInitialActiveProjectId(projects),
  );

  // Get active project
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  // Initialize state from persisted values or defaults
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isExportSuccessOpen, setIsExportSuccessOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceIdState] = useState(
    activeProject.selectedDeviceId,
  );
  const [selectedColorId, setSelectedColorIdState] = useState(
    activeProject.selectedColorId,
  );
  const [exportSizeId, setExportSizeIdState] = useState(
    resolveExportSizeId(activeProject.exportSizeId),
  );
  const [exportSizeIds, setExportSizeIdsState] = useState<string[]>(
    activeProject.exportSizeIds?.length
      ? activeProject.exportSizeIds.map(resolveExportSizeId)
      : [resolveExportSizeId(activeProject.exportSizeId)],
  );
  const [screenshots, setScreenshotsState] = useState<Screenshot[]>(
    activeProject.screenshots,
  );
  const [contentFocusRequest, setContentFocusRequest] = useState<string | null>(
    null,
  );
  const [inlineEditing, setInlineEditing] = useState<{
    screenshotId: string;
    textId: string;
  } | null>(null);
  const suppressDeselectUntil = useRef(0);
  const dragHistoryPushed = useRef(false);
  const historyPast = useRef<{ screenshots: Screenshot[] }[]>([]);
  const historyFuture = useRef<{ screenshots: Screenshot[] }[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const skipHistory = useRef(false);
  const interactionMode = useRef<"none" | "drag" | "resize" | "rotate">("none");
  const resizeMeta = useRef<{
    handle: "e" | "w" | "se" | "sw" | "ne" | "nw";
    startWidth: number;
    startHeight: number;
    startScale: number;
    startX: number;
    startRotation: number;
  } | null>(null);
  const [activeScreenshotId, setActiveScreenshotIdState] = useState(
    activeProject.activeScreenshotId,
  );
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(
    null,
  );

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartElementPos = useRef({ x: 0, y: 0 });
  const dragContainerSize = useRef({ width: 0, height: 0 });
  const rafId = useRef<number | null>(null);
  const pendingUpdate = useRef<{ x: number; y: number } | null>(null);

  const overlayImageInputRef = useRef<HTMLInputElement>(null);

  const [previewDimensions, setPreviewDimensions] = useState({
    width: 0,
    height: 0,
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback(
    (_nextScreenshots?: Screenshot[]) => {
      if (skipHistory.current) return;
      historyPast.current.push({
        screenshots: structuredClone(screenshots),
      });
      if (historyPast.current.length > 50) historyPast.current.shift();
      historyFuture.current = [];
      setHistoryTick((t) => t + 1);
      void _nextScreenshots;
    },
    [screenshots],
  );

  // Sync project state when local state changes
  const updateProjectState = useCallback(() => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              screenshots,
              selectedDeviceId,
              selectedColorId,
              exportSizeId,
              exportSizeIds,
              activeScreenshotId,
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
  }, [
    activeProjectId,
    screenshots,
    selectedDeviceId,
    selectedColorId,
    exportSizeId,
    exportSizeIds,
    activeScreenshotId,
  ]);

  // Update project whenever state changes
  useEffect(() => {
    updateProjectState();
  }, [updateProjectState]);

  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const dismissStorageWarning = () => setStorageWarning(null);

  const linkedFileHandleRef = useRef<AppshotsFileHandle | null>(null);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);
  const [canOverwriteLinkedFile, setCanOverwriteLinkedFile] = useState(false);
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const skipDirtyRef = useRef(false);
  const saveProjectRef = useRef<() => Promise<void>>(async () => undefined);

  const linkFile = (handle: AppshotsFileHandle | null, name: string | null) => {
    linkedFileHandleRef.current = handle;
    setLinkedFileName(name);
    setCanOverwriteLinkedFile(Boolean(handle));
  };

  const clearLinkedFile = () => linkFile(null, null);

  const markClean = () => {
    skipDirtyRef.current = true;
    setIsProjectDirty(false);
  };

  // Dirty when working copy changes (skip first mount + one tick after open/save)
  const dirtyReadyRef = useRef(false);
  useEffect(() => {
    if (!dirtyReadyRef.current) {
      dirtyReadyRef.current = true;
      return;
    }
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }
    setIsProjectDirty(true);
  }, [screenshots, selectedDeviceId, selectedColorId, exportSizeId, exportSizeIds]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isProjectDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isProjectDirty]);

  // Auto-save projects to localStorage
  useEditorPersistence({
    projects,
    activeProjectId,
    onSaveResult: (result: SaveResult) => {
      if (!result.ok) setStorageWarning(result.message);
      else setStorageWarning(null);
    },
  });

  // Wrapper functions that update both local state and project
  const setSelectedDeviceId = (id: string) => {
    setSelectedDeviceIdState(id);
    const nextColorId = getDeviceColorById(id, selectedColorId).id;
    setSelectedColorIdState(nextColorId);
    setScreenshotsState((prev) =>
      prev.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? {
              ...screenshot,
              devices: screenshot.devices.map((device) =>
                device.id === screenshot.activeDeviceId
                  ? { ...device, deviceId: id, colorId: nextColorId }
                  : device,
              ),
            }
          : screenshot,
      ),
    );
  };
  const setSelectedColorId = (id: string) => {
    setSelectedColorIdState(id);
    setScreenshotsState((prev) =>
      prev.map((screenshot) =>
        screenshot.id === activeScreenshotId
          ? {
              ...screenshot,
              devices: screenshot.devices.map((device) =>
                device.id === screenshot.activeDeviceId
                  ? { ...device, colorId: id }
                  : device,
              ),
            }
          : screenshot,
      ),
    );
  };
  const setExportSizeId = (id: string) => {
    const resolved = resolveExportSizeId(id);
    setExportSizeIdState(resolved);
    setExportSizeIdsState((prev) =>
      prev.includes(resolved) ? prev : [...prev, resolved],
    );
  };
  const toggleExportSizeId = (id: string) => {
    const resolved = resolveExportSizeId(id);
    setExportSizeIdsState((prev) => {
      if (prev.includes(resolved)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== resolved);
      }
      return [...prev, resolved];
    });
  };
  const setScreenshots = (newScreenshots: Screenshot[]) => {
    pushHistory(newScreenshots);
    setScreenshotsState(newScreenshots);
  };
  const setActiveScreenshotId = (id: string) => {
    setActiveScreenshotIdState(id);
  };
  const patchTextsOnActive = (
    mapFn: (texts: TextOverlay[]) => TextOverlay[],
  ) => {
    pushHistory();
    setScreenshotsState((prev) =>
      prev.map((s) => {
        if (s.id !== activeScreenshotId) return s;
        const texts = mapFn(s.texts ?? []);
        return {
          ...s,
          ...withSyncedTexts(texts),
          layerOrder: ensureLayerOrder({ ...s, texts }),
        };
      }),
    );
  };

  const setHeadlineFontSize = (size: number) => {
    patchTextsOnActive((texts) => {
      const targetId =
        selectedElement?.type === "text" && selectedElement.id
          ? selectedElement.id
          : texts[0]?.id;
      return texts.map((t) =>
        t.id === targetId ? { ...t, fontSize: size } : t,
      );
    });
  };
  const setSubheadlineFontSize = (size: number) => {
    patchTextsOnActive((texts) => {
      const targetId =
        selectedElement?.type === "text" && selectedElement.id
          ? selectedElement.id
          : (texts[1]?.id ?? texts[0]?.id);
      return texts.map((t) =>
        t.id === targetId ? { ...t, fontSize: size } : t,
      );
    });
  };

  const undo = useCallback(() => {
    const prev = historyPast.current.pop();
    if (!prev) return;
    historyFuture.current.push({
      screenshots: structuredClone(screenshots),
    });
    skipHistory.current = true;
    setScreenshotsState(prev.screenshots);
    skipHistory.current = false;
    setHistoryTick((t) => t + 1);
  }, [screenshots]);

  const redo = useCallback(() => {
    const next = historyFuture.current.pop();
    if (!next) return;
    historyPast.current.push({
      screenshots: structuredClone(screenshots),
    });
    skipHistory.current = true;
    setScreenshotsState(next.screenshots);
    skipHistory.current = false;
    setHistoryTick((t) => t + 1);
  }, [screenshots]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      // Ctrl+S always saves the project (even from text fields)
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        void saveProjectRef.current();
        return;
      }

      if (inField) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  // Project management functions
  const createProject = (name: string) => {
    const newProject = createDefaultProject(name);
    // Flush current working copy, then append — avoid switchProject race
    // where React state has not yet included the new project.
    const flushed = projects.map((p) =>
      p.id === activeProjectId
        ? {
            ...p,
            screenshots,
            selectedDeviceId,
            selectedColorId,
            exportSizeId,
            exportSizeIds,
            activeScreenshotId,
            updatedAt: Date.now(),
          }
        : p,
    );
    setProjects([...flushed, newProject]);
    setActiveProjectId(newProject.id);
    setSelectedDeviceIdState(newProject.selectedDeviceId);
    setSelectedColorIdState(newProject.selectedColorId);
    setExportSizeIdState(resolveExportSizeId(newProject.exportSizeId));
    setExportSizeIdsState(newProject.exportSizeIds);
    setScreenshotsState(newProject.screenshots);
    setActiveScreenshotIdState(newProject.activeScreenshotId);
    setSelectedElement(null);
    historyPast.current = [];
    historyFuture.current = [];
    setHistoryTick((t) => t + 1);
    clearLinkedFile();
    markClean();
  };

  const renameProject = (id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
      ),
    );
  };

  const deleteProject = (id: string) => {
    // Don't delete the last project
    if (projects.length <= 1) return;

    setProjects((prev) => prev.filter((p) => p.id !== id));

    // If deleting active project, switch to another
    if (id === activeProjectId) {
      const remaining = projects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        switchProject(remaining[0].id);
      }
    }
  };

  const switchProject = (id: string) => {
    if (id === activeProjectId) return;

    // Flush working copy into projects BEFORE loading the other project
    // (async useEffect sync can race and drop screenshots).
    const flushed = projects.map((p) =>
      p.id === activeProjectId
        ? {
            ...p,
            screenshots,
            selectedDeviceId,
            selectedColorId,
            exportSizeId,
            exportSizeIds,
            activeScreenshotId,
            updatedAt: Date.now(),
          }
        : p,
    );
    const project = flushed.find((p) => p.id === id);
    if (!project) return;

    setProjects(flushed);
    setActiveProjectId(id);
    setSelectedDeviceIdState(project.selectedDeviceId);
    setSelectedColorIdState(project.selectedColorId);
    setExportSizeIdState(resolveExportSizeId(project.exportSizeId));
    setExportSizeIdsState(
      project.exportSizeIds?.length
        ? project.exportSizeIds.map(resolveExportSizeId)
        : [resolveExportSizeId(project.exportSizeId)],
    );
    setScreenshotsState(project.screenshots);
    setActiveScreenshotIdState(project.activeScreenshotId);
    setSelectedElement(null);
    historyPast.current = [];
    historyFuture.current = [];
    setHistoryTick((t) => t + 1);
    clearLinkedFile();
    markClean();
  };

  const snapshotActiveProject = (): Project => ({
    ...activeProject,
    screenshots,
    selectedDeviceId,
    selectedColorId,
    exportSizeId,
    exportSizeIds,
    activeScreenshotId,
    updatedAt: Date.now(),
  });

  const loadIncomingProject = (
    raw: Project,
    opts: { renameAsImport?: boolean; fileName?: string | null } = {},
  ) => {
    const baseName = raw.name?.trim() || "Untitled";
    const stem = opts.fileName
      ?.replace(/\.appshots$/i, "")
      .replace(/\.json$/i, "")
      .trim();
    const incoming = normalizeProject({
      ...raw,
      id: generateId(),
      name: opts.renameAsImport
        ? `${baseName} (import)`
        : stem || baseName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const flushed = projects.map((p) =>
      p.id === activeProjectId
        ? {
            ...p,
            screenshots,
            selectedDeviceId,
            selectedColorId,
            exportSizeId,
            exportSizeIds,
            activeScreenshotId,
            updatedAt: Date.now(),
          }
        : p,
    );
    setProjects([...flushed, incoming]);
    setActiveProjectId(incoming.id);
    setSelectedDeviceIdState(incoming.selectedDeviceId);
    setSelectedColorIdState(incoming.selectedColorId);
    setExportSizeIdState(resolveExportSizeId(incoming.exportSizeId));
    setExportSizeIdsState(
      incoming.exportSizeIds?.length
        ? incoming.exportSizeIds.map(resolveExportSizeId)
        : [resolveExportSizeId(incoming.exportSizeId)],
    );
    skipDirtyRef.current = true;
    setScreenshotsState(incoming.screenshots);
    setActiveScreenshotIdState(incoming.activeScreenshotId);
    setSelectedElement(null);
    historyPast.current = [];
    historyFuture.current = [];
    setHistoryTick((t) => t + 1);
    markClean();
    return incoming;
  };

  const saveProjectAs = async () => {
    const project = snapshotActiveProject();
    const handle = await saveProjectAsWithPicker(project, linkedFileName ?? project.name);
    if (handle) {
      linkFile(handle, handle.name);
      // Align project name with file stem
      const stem = handle.name.replace(/\.appshots$/i, "");
      if (stem) renameProject(activeProjectId, stem);
    }
    markClean();
  };

  const saveProject = async () => {
    const project = snapshotActiveProject();
    const handle = linkedFileHandleRef.current;
    if (handle) {
      try {
        await writeProjectToHandle(handle, project);
        markClean();
        return;
      } catch (err) {
        console.warn("Overwrite failed, falling back to Save As:", err);
        clearLinkedFile();
      }
    }
    // No linked file (or write failed) → Save As / download
    if (supportsFileSystemAccess()) {
      await saveProjectAs();
    } else {
      await downloadProjectFile(project, linkedFileName ?? project.name);
      markClean();
    }
  };
  saveProjectRef.current = saveProject;

  const openProjectFile = async () => {
    if (isProjectDirty) {
      const ok = window.confirm(
        "You have unsaved changes. Open another project anyway?",
      );
      if (!ok) return;
    }

    if (supportsFileSystemAccess()) {
      const opened = await openProjectWithPicker();
      if (!opened) return;
      loadIncomingProject(opened.data.project, {
        renameAsImport: false,
        fileName: opened.fileName,
      });
      linkFile(opened.handle, opened.fileName);
      markClean();
      return;
    }

    // Firefox / Safari: caller should use <input type=file> → importProjectFile
    throw new Error("FILE_INPUT_FALLBACK");
  };

  const importProjectFile = async (file: File) => {
    if (isProjectDirty) {
      const ok = window.confirm(
        "You have unsaved changes. Open another project anyway?",
      );
      if (!ok) return;
    }
    const data = await parseProjectFile(file);
    loadIncomingProject(data.project, {
      renameAsImport: false,
      fileName: file.name,
    });
    // <input> cannot grant a writable handle — Save will ask for location
    clearLinkedFile();
    setLinkedFileName(file.name);
    markClean();
  };

  const exportProjectFile = async () => {
    await saveProjectAs();
  };

  const selectedDevice =
    getDeviceSpecById(selectedDeviceId);
  const selectedColor =
    getDeviceColorById(selectedDevice.id, selectedColorId);
  const activeScreenshot =
    screenshots.find((s) => s.id === activeScreenshotId) || screenshots[0];
  const activeDevice =
    activeScreenshot.devices.find(
      (device) => device.id === activeScreenshot.activeDeviceId,
    ) ||
    activeScreenshot.devices[0] ||
    null;
  const exportSize =
    exportSizes.find((s) => s.id === exportSizeId) || exportSizes[0];
  const headlineFontSize = activeScreenshot.headlineFontSize ?? 72;
  const subheadlineFontSize = activeScreenshot.subheadlineFontSize ?? 42;

  const updateScreenshotById = useCallback(
    (screenshotId: string, updates: Partial<Screenshot>, recordHistory = true) => {
      setScreenshotsState((prev) => {
        if (recordHistory && !skipHistory.current) {
          historyPast.current.push({
            screenshots: structuredClone(prev),
          });
          if (historyPast.current.length > 50) historyPast.current.shift();
          historyFuture.current = [];
          setHistoryTick((t) => t + 1);
        }
        return prev.map((s) => (s.id === screenshotId ? { ...s, ...updates } : s));
      });
    },
    [],
  );

  const updateActiveScreenshot = useCallback(
    (updates: Partial<Screenshot>) => {
      updateScreenshotById(activeScreenshotId, updates);
    },
    [activeScreenshotId, updateScreenshotById],
  );

  useEffect(() => {
    if (!activeDevice) return;
    if (selectedDeviceId !== activeDevice.deviceId) {
      setSelectedDeviceIdState(activeDevice.deviceId);
    }
    if (selectedColorId !== activeDevice.colorId) {
      setSelectedColorIdState(activeDevice.colorId);
    }
    if (activeScreenshot.activeDeviceId !== activeDevice.id) {
      updateActiveScreenshot({ activeDeviceId: activeDevice.id });
    }
  }, [
    activeDevice,
    activeScreenshot.activeDeviceId,
    selectedColorId,
    selectedDeviceId,
    updateActiveScreenshot,
  ]);

  const addScreenshot = () => {
    const newDevices = activeScreenshot.devices.map((device) =>
      cloneDeviceInstance(device, { id: generateId() }),
    );
    const texts = createDefaultTexts({
      headline: "New Screenshot",
      subheadline: "Add your description here",
      color: activeScreenshot.textColor,
      fontFamily: activeScreenshot.fontFamily,
      headlineFontSize: activeScreenshot.headlineFontSize ?? 72,
      subheadlineFontSize: activeScreenshot.subheadlineFontSize ?? 42,
    });
    const legacy = syncLegacyTextFields(texts);
    const newScreenshot: Screenshot = {
      id: generateId(),
      texts,
      ...legacy,
      backgroundColor: activeScreenshot.backgroundColor,
      backgroundMode: activeScreenshot.backgroundMode,
      gradientPresetId: activeScreenshot.gradientPresetId,
      customGradient: activeScreenshot.customGradient
        ? { ...activeScreenshot.customGradient }
        : null,
      backgroundImage: activeScreenshot.backgroundImage,
      overlayImages: [],
      devices: newDevices,
      activeDeviceId: newDevices[0]?.id ?? "",
      layerOrder: buildDefaultLayerOrder({
        devices: newDevices,
        overlayImages: [],
        texts,
      }),
    };
    setScreenshots([...screenshots, newScreenshot]);
    setActiveScreenshotId(newScreenshot.id);
  };

  const duplicateScreenshot = (id?: string) => {
    const sourceId = id ?? activeScreenshotId;
    const source = screenshots.find((s) => s.id === sourceId);
    if (!source) return;

    const deviceIdMap = new Map<string, string>();
    const devicesClone = source.devices.map((device) => {
      const newId = generateId();
      deviceIdMap.set(device.id, newId);
      return cloneDeviceInstance(device, { id: newId });
    });

    const imageIdMap = new Map<string, string>();
    const overlaysClone = source.overlayImages.map((img) => {
      const newId = generateId();
      imageIdMap.set(img.id, newId);
      return { ...structuredClone(img), id: newId };
    });
    const remapKey = (key: string) => {
      if (key.startsWith("device:")) {
        const mapped = deviceIdMap.get(key.slice(7));
        return mapped ? `device:${mapped}` : key;
      }
      if (key.startsWith("image:")) {
        const mapped = imageIdMap.get(key.slice(6));
        return mapped ? `image:${mapped}` : key;
      }
      return key;
    };
    const clone: Screenshot = {
      ...structuredClone(source),
      id: generateId(),
      devices: devicesClone,
      activeDeviceId:
        deviceIdMap.get(source.activeDeviceId) ?? devicesClone[0]?.id ?? "",
      overlayImages: overlaysClone,
      layerOrder: ensureLayerOrder({
        ...source,
        devices: devicesClone,
        overlayImages: overlaysClone,
        layerOrder: (source.layerOrder ?? []).map(remapKey),
      }),
    };

    const index = screenshots.findIndex((s) => s.id === sourceId);
    const next = [...screenshots];
    next.splice(index + 1, 0, clone);
    setScreenshots(next);
    setActiveScreenshotId(clone.id);
  };

  const reorderScreenshots = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= screenshots.length ||
      toIndex >= screenshots.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const next = [...screenshots];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    setScreenshots(next);
  };

  const moveScreenshot = (id: string, direction: -1 | 1) => {
    const index = screenshots.findIndex((s) => s.id === id);
    if (index < 0) return;
    reorderScreenshots(index, index + direction);
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    type: "text" | "image" | "device",
    screenshotId: string,
    id?: string,
  ) => {
    e.stopPropagation();
    // Keep default for text so double-click → edit still works.
    if (type !== "text") {
      e.preventDefault();
    }

    const screenshotElement = (e.currentTarget as HTMLElement).closest(
      "[data-screenshot-card='true']",
    );
    if (screenshotElement instanceof HTMLElement) {
      const rect = screenshotElement.getBoundingClientRect();
      dragContainerSize.current = { width: rect.width, height: rect.height };
    } else if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      dragContainerSize.current = { width: rect.width, height: rect.height };
    }

    const targetScreenshot =
      screenshots.find((screenshot) => screenshot.id === screenshotId) ??
      activeScreenshot;

    // Select immediately; only start a real drag after a small move threshold.
    suppressDeselectUntil.current = Date.now() + 400;
    interactionMode.current = "none";
    dragHistoryPushed.current = false;
    setIsDragging(true);
    setSelectedElement({ type, id, screenshotId });
    if (activeScreenshotId !== screenshotId) {
      setActiveScreenshotIdState(screenshotId);
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    if (type === "device" && id) {
      updateScreenshotById(screenshotId, { activeDeviceId: id });
      const device = targetScreenshot.devices.find((item) => item.id === id);
      if (device) {
        dragStartElementPos.current = { x: device.x, y: device.y };
      }
    } else if (type === "text" && id) {
      const text = (targetScreenshot.texts ?? []).find((t) => t.id === id);
      if (text) {
        dragStartElementPos.current = { x: text.x, y: text.y };
      }
    } else if (type === "image" && id) {
      const image = targetScreenshot.overlayImages.find((img) => img.id === id);
      if (image) {
        dragStartElementPos.current = { x: image.x, y: image.y };
      }
    }
  };

  const applyDragUpdate = useCallback(() => {
    if (!pendingUpdate.current || !selectedElement) return;

    const { x: newX, y: newY } = pendingUpdate.current;

    if (selectedElement.type === "text" && selectedElement.id) {
      const targetScreenshot = screenshots.find(
        (screenshot) => screenshot.id === selectedElement.screenshotId,
      );
      if (!targetScreenshot) return;
      const texts = (targetScreenshot.texts ?? []).map((t) =>
        t.id === selectedElement.id ? { ...t, x: newX, y: newY } : t,
      );
      updateScreenshotById(
        selectedElement.screenshotId,
        withSyncedTexts(texts),
        false,
      );
    } else if (selectedElement.type === "image" && selectedElement.id) {
      const targetScreenshot = screenshots.find(
        (screenshot) => screenshot.id === selectedElement.screenshotId,
      );
      if (!targetScreenshot) return;

      const updatedImages = targetScreenshot.overlayImages.map((img) =>
        img.id === selectedElement.id ? { ...img, x: newX, y: newY } : img,
      );
      updateScreenshotById(
        selectedElement.screenshotId,
        { overlayImages: updatedImages },
        false,
      );
    } else if (selectedElement.type === "device" && selectedElement.id) {
      const targetScreenshot = screenshots.find(
        (screenshot) => screenshot.id === selectedElement.screenshotId,
      );
      if (!targetScreenshot) return;

      const updatedDevices = targetScreenshot.devices.map((device) =>
        device.id === selectedElement.id ? { ...device, x: newX, y: newY } : device,
      );
      updateScreenshotById(
        selectedElement.screenshotId,
        { devices: updatedDevices },
        false,
      );
    }

    pendingUpdate.current = null;
    rafId.current = null;
  }, [screenshots, selectedElement, updateScreenshotById]);

  const handleElementMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedElement) return;

      const { width, height } = dragContainerSize.current;
      if (width === 0 || height === 0) return;

      // Click vs drag: ignore tiny movements so a click only selects.
      if (interactionMode.current === "none") {
        const dist = Math.hypot(
          e.clientX - dragStartPos.current.x,
          e.clientY - dragStartPos.current.y,
        );
        if (dist < 5) return;
        interactionMode.current = "drag";
        if (!dragHistoryPushed.current) {
          pushHistory();
          dragHistoryPushed.current = true;
        }
      }

      if (interactionMode.current === "resize" && resizeMeta.current) {
        const meta = resizeMeta.current;
        const deltaX = ((e.clientX - dragStartPos.current.x) / width) * 100;
        const deltaY = ((e.clientY - dragStartPos.current.y) / height) * 100;
        // Handles sit in the element's rotated local space — project screen
        // deltas so "drag left" still means left relative to the tilted frame.
        const rad = (-(meta.startRotation || 0) * Math.PI) / 180;
        const localDeltaX =
          deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
        const localDeltaY =
          deltaX * Math.sin(rad) + deltaY * Math.cos(rad);
        // Canva-like: drag handle inward (toward center) = shrink
        const isWest = meta.handle === "w" || meta.handle === "nw" || meta.handle === "sw";
        const isNorth = meta.handle === "nw" || meta.handle === "ne";
        const isCorner =
          meta.handle === "nw" ||
          meta.handle === "ne" ||
          meta.handle === "sw" ||
          meta.handle === "se";
        const signedX = (isWest ? -1 : 1) * localDeltaX;
        const signedY = (isNorth ? -1 : 1) * localDeltaY;
        const growDelta = isCorner ? (signedX + signedY) / 2 : signedX;

        const target = screenshots.find(
          (s) => s.id === selectedElement.screenshotId,
        );
        if (!target) return;

        if (selectedElement.type === "text" && selectedElement.id) {
          const nextWidth = Math.min(
            100,
            Math.max(20, meta.startWidth + growDelta),
          );
          const texts = (target.texts ?? []).map((t) =>
            t.id === selectedElement.id ? { ...t, width: nextWidth } : t,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            withSyncedTexts(texts),
            false,
          );
        } else if (selectedElement.type === "image" && selectedElement.id) {
          const image = target.overlayImages.find(
            (img) => img.id === selectedElement.id,
          );
          if (!image) return;
          const aspect = image.width / image.height || 1;
          const nextWidth = Math.min(
            90,
            Math.max(5, meta.startWidth + growDelta),
          );
          const updatedImages = target.overlayImages.map((img) =>
            img.id === selectedElement.id
              ? { ...img, width: nextWidth, height: nextWidth / aspect }
              : img,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { overlayImages: updatedImages },
            false,
          );
        } else if (selectedElement.type === "device" && selectedElement.id) {
          const nextScale = Math.min(
            120,
            Math.max(30, meta.startScale + growDelta),
          );
          const updatedDevices = target.devices.map((device) =>
            device.id === selectedElement.id
              ? { ...device, scale: nextScale }
              : device,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { devices: updatedDevices },
            false,
          );
        }
        return;
      }

      if (interactionMode.current === "rotate" && resizeMeta.current) {
        const target = screenshots.find(
          (s) => s.id === selectedElement.screenshotId,
        );
        if (!target || !selectedElement.id) return;
        const deltaX = e.clientX - dragStartPos.current.x;
        const nextRotation = resizeMeta.current.startRotation + deltaX * 0.5;

        if (selectedElement.type === "image") {
          const updatedImages = target.overlayImages.map((img) =>
            img.id === selectedElement.id
              ? { ...img, rotation: nextRotation }
              : img,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { overlayImages: updatedImages },
            false,
          );
        } else if (selectedElement.type === "device") {
          const updatedDevices = target.devices.map((device) =>
            device.id === selectedElement.id
              ? { ...device, rotation: nextRotation }
              : device,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { devices: updatedDevices },
            false,
          );
        }
        return;
      }

      const deltaX = ((e.clientX - dragStartPos.current.x) / width) * 100;
      const deltaY = ((e.clientY - dragStartPos.current.y) / height) * 100;

      const newX = dragStartElementPos.current.x + deltaX;
      const newY = dragStartElementPos.current.y + deltaY;

      if (interactionMode.current !== "drag") return;

      pendingUpdate.current = { x: newX, y: newY };

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(applyDragUpdate);
      }
    },
    [
      isDragging,
      selectedElement,
      applyDragUpdate,
      screenshots,
      updateScreenshotById,
      pushHistory,
    ],
  );

  const handleElementMouseUp = useCallback(() => {
    setIsDragging(false);
    interactionMode.current = "none";
    resizeMeta.current = null;
    dragHistoryPushed.current = false;
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (pendingUpdate.current) {
      applyDragUpdate();
    }
  }, [applyDragUpdate]);

  const handleResizeStart = (
    e: React.MouseEvent,
    type: "text" | "image" | "device",
    screenshotId: string,
    id: string | undefined,
    handle: "e" | "w" | "se" | "sw" | "ne" | "nw",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const screenshotElement = (e.currentTarget as HTMLElement).closest(
      "[data-screenshot-card='true']",
    );
    if (screenshotElement instanceof HTMLElement) {
      const rect = screenshotElement.getBoundingClientRect();
      dragContainerSize.current = { width: rect.width, height: rect.height };
    }

    const target =
      screenshots.find((s) => s.id === screenshotId) ?? activeScreenshot;

    pushHistory(screenshots);
    interactionMode.current = "resize";
    setIsDragging(true);
    setSelectedElement({ type, id, screenshotId });
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    if (type === "text" && id) {
      const text = (target.texts ?? []).find((t) => t.id === id);
      if (!text) return;
      resizeMeta.current = {
        handle,
        startWidth: text.width,
        startHeight: 0,
        startScale: 0,
        startX: text.x,
        startRotation: 0,
      };
    } else if (type === "image" && id) {
      const image = target.overlayImages.find((img) => img.id === id);
      if (!image) return;
      resizeMeta.current = {
        handle,
        startWidth: image.width,
        startHeight: image.height,
        startScale: 0,
        startX: image.x,
        startRotation: image.rotation,
      };
    } else if (type === "device" && id) {
      const device = target.devices.find((d) => d.id === id);
      if (!device) return;
      resizeMeta.current = {
        handle,
        startWidth: 0,
        startHeight: 0,
        startScale: device.scale,
        startX: device.x,
        startRotation: device.rotation,
      };
    }
  };

  const handleRotateStart = (
    e: React.MouseEvent,
    type: "image" | "device",
    screenshotId: string,
    id: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const target =
      screenshots.find((s) => s.id === screenshotId) ?? activeScreenshot;

    pushHistory(screenshots);
    interactionMode.current = "rotate";
    setIsDragging(true);
    setSelectedElement({ type, id, screenshotId });
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    if (type === "image") {
      const image = target.overlayImages.find((img) => img.id === id);
      if (!image) return;
      resizeMeta.current = {
        handle: "se",
        startWidth: image.width,
        startHeight: image.height,
        startScale: 0,
        startX: image.x,
        startRotation: image.rotation ?? 0,
      };
    } else {
      const device = target.devices.find((d) => d.id === id);
      if (!device) return;
      resizeMeta.current = {
        handle: "se",
        startWidth: 0,
        startHeight: 0,
        startScale: device.scale,
        startX: device.x,
        startRotation: device.rotation,
      };
    }
  };

  const requestContentFocus = (textId: string) => {
    setContentFocusRequest(textId);
  };

  const clearContentFocusRequest = () => setContentFocusRequest(null);

  const startInlineEditing = (screenshotId: string, textId: string) => {
    if (activeScreenshotId !== screenshotId) {
      setActiveScreenshotIdState(screenshotId);
    }
    setSelectedElement({ type: "text", screenshotId, id: textId });
    pushHistory();
    setInlineEditing({ screenshotId, textId });
  };

  const stopInlineEditing = () => {
    setInlineEditing(null);
  };

  // Leave inline edit when selection moves away
  useEffect(() => {
    if (!inlineEditing) return;
    if (
      !selectedElement ||
      selectedElement.screenshotId !== inlineEditing.screenshotId ||
      selectedElement.type !== "text" ||
      selectedElement.id !== inlineEditing.textId
    ) {
      setInlineEditing(null);
    }
  }, [selectedElement, inlineEditing]);

  const updateText = (
    textId: string,
    updates: Partial<TextOverlay>,
    screenshotId: string = activeScreenshotId,
  ) => {
    const shot =
      screenshots.find((s) => s.id === screenshotId) ?? activeScreenshot;
    const texts = (shot.texts ?? []).map((t) =>
      t.id === textId ? { ...t, ...updates } : t,
    );
    updateScreenshotById(screenshotId, {
      ...withSyncedTexts(texts),
      layerOrder: ensureLayerOrder({ ...shot, texts }),
    });
  };

  const addText = () => {
    const offset = (activeScreenshot.texts?.length ?? 0) * 6;
    const text = createTextOverlay({
      content: "New text",
      y: Math.min(80, 12 + offset),
      fontFamily: activeScreenshot.fontFamily ?? "Inter",
      color: activeScreenshot.textColor ?? "#ffffff",
    });
    const texts = [...(activeScreenshot.texts ?? []), text];
    updateActiveScreenshot({
      ...withSyncedTexts(texts),
      layerOrder: ensureLayerOrder({ ...activeScreenshot, texts }),
    });
    setSelectedElement({
      type: "text",
      screenshotId: activeScreenshotId,
      id: text.id,
    });
    setInlineEditing({ screenshotId: activeScreenshotId, textId: text.id });
  };

  const removeText = (textId: string) => {
    const texts = (activeScreenshot.texts ?? []).filter((t) => t.id !== textId);
    updateActiveScreenshot({
      ...withSyncedTexts(texts),
      layerOrder: ensureLayerOrder({ ...activeScreenshot, texts }),
    });
    if (selectedElement?.type === "text" && selectedElement.id === textId) {
      setSelectedElement(null);
    }
    if (inlineEditing?.textId === textId) {
      setInlineEditing(null);
    }
  };

  const duplicateText = (textId: string) => {
    const source = (activeScreenshot.texts ?? []).find((t) => t.id === textId);
    if (!source) return;
    const clone = createTextOverlay({
      ...source,
      id: generateId(),
      x: Math.min(90, source.x + 4),
      y: Math.min(90, source.y + 4),
    });
    const texts = [...(activeScreenshot.texts ?? []), clone];
    updateActiveScreenshot({
      ...withSyncedTexts(texts),
      layerOrder: ensureLayerOrder({ ...activeScreenshot, texts }),
    });
    setSelectedElement({
      type: "text",
      screenshotId: activeScreenshotId,
      id: clone.id,
    });
  };

  const updateTextAlign = (textId: string, align: TextAlign) => {
    updateText(textId, { align });
  };

  // Set up global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleElementMouseMove);
      window.addEventListener("mouseup", handleElementMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleElementMouseMove);
      window.removeEventListener("mouseup", handleElementMouseUp);
    };
  }, [isDragging, handleElementMouseMove, handleElementMouseUp]);

  const addOverlayImageSource = (src: string, name?: string) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height || 1;
      const newImage: ImageOverlay = {
        id: generateId(),
        src,
        name,
        x: 50,
        y: 50,
        width: 30,
        height: 30 / aspectRatio,
        layer: "front",
        rotation: 0,
        shadow: {
          enabled: false,
          color: "#000000",
          blur: 20,
          offsetX: 0,
          offsetY: 10,
        },
      };
      const nextOverlays = [...activeScreenshot.overlayImages, newImage];
      updateActiveScreenshot({
        overlayImages: nextOverlays,
        layerOrder: [
          ...ensureLayerOrder(activeScreenshot).filter(
            (k) => k !== `image:${newImage.id}`,
          ),
          `image:${newImage.id}`,
        ],
      });
      setSelectedElement({
        type: "image",
        id: newImage.id,
        screenshotId: activeScreenshot.id,
      });
    };
    img.src = src;
  };

  const addOverlayImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") addOverlayImageSource(result);
    };
    reader.readAsDataURL(file);
  };

  const addIcon = (src: string, name: string) => {
    addOverlayImageSource(src, name);
  };

  const removeOverlayImage = (imageId: string) => {
    const updatedImages = activeScreenshot.overlayImages.filter(
      (img) => img.id !== imageId,
    );
    updateActiveScreenshot({
      overlayImages: updatedImages,
      layerOrder: ensureLayerOrder(activeScreenshot).filter(
        (k) => k !== `image:${imageId}`,
      ),
    });
    if (
      selectedElement?.type === "image" &&
      selectedElement.screenshotId === activeScreenshot.id &&
      selectedElement.id === imageId
    ) {
      setSelectedElement(null);
    }
  };

  const updateOverlayImageSize = (imageId: string, widthPercent: number) => {
    const image = activeScreenshot.overlayImages.find(
      (img) => img.id === imageId,
    );
    if (!image) return;

    // Use current dimensions to maintain aspect ratio without reloading image
    const aspectRatio = image.width / image.height;

    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId
        ? {
            ...item,
            width: widthPercent,
            height: widthPercent / aspectRatio,
          }
        : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageLayer = (
    imageId: string,
    layer: "behind" | "front",
  ) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId ? { ...item, layer } : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageRotation = (imageId: string, rotation: number) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId ? { ...item, rotation } : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const updateOverlayImageShadow = (
    imageId: string,
    shadow: Partial<ShadowConfig>,
  ) => {
    const updatedImages = activeScreenshot.overlayImages.map((item) =>
      item.id === imageId
        ? { ...item, shadow: { ...item.shadow, ...shadow } }
        : item,
    );
    updateActiveScreenshot({ overlayImages: updatedImages });
  };

  const moveElementLayer = (
    type: SelectedElement["type"],
    id: string | undefined,
    action: "forward" | "backward" | "front" | "back",
  ) => {
    const key = layerKeyFor(type, id);
    const order = ensureLayerOrder(activeScreenshot);
    updateActiveScreenshot({
      layerOrder: moveLayerKey(order, key, action),
    });
  };

  const bringImageForward = (imageId: string) =>
    moveElementLayer("image", imageId, "forward");
  const sendImageBackward = (imageId: string) =>
    moveElementLayer("image", imageId, "backward");
  const bringImageToFront = (imageId: string) =>
    moveElementLayer("image", imageId, "front");
  const sendImageToBack = (imageId: string) =>
    moveElementLayer("image", imageId, "back");

  const addDevice = () => {
    const nextDevice = activeDevice
      ? cloneDeviceInstance(activeDevice, {
          id: generateId(),
          x: Math.min(activeDevice.x + 12, 88),
          y: Math.min(activeDevice.y + 4, 70),
        })
      : createDeviceInstance({
          deviceId: selectedDeviceId,
          colorId: selectedColorId,
        });

    const nextDevices = [...activeScreenshot.devices, nextDevice];
    updateActiveScreenshot({
      devices: nextDevices,
      activeDeviceId: nextDevice.id,
      layerOrder: [
        ...ensureLayerOrder(activeScreenshot).filter(
          (k) => k !== `device:${nextDevice.id}`,
        ),
        `device:${nextDevice.id}`,
      ],
    });
    setSelectedElement({
      type: "device",
      id: nextDevice.id,
      screenshotId: activeScreenshot.id,
    });
    setSelectedDeviceIdState(nextDevice.deviceId);
    setSelectedColorIdState(nextDevice.colorId);
  };

  const selectDevice = (deviceId: string) => {
    updateActiveScreenshot({ activeDeviceId: deviceId });
    setSelectedElement({
      type: "device",
      id: deviceId,
      screenshotId: activeScreenshot.id,
    });
  };

  const removeDevice = (deviceId: string) => {
    const nextDevices = activeScreenshot.devices.filter(
      (device) => device.id !== deviceId,
    );
    const nextActiveDeviceId =
      activeScreenshot.activeDeviceId === deviceId
        ? nextDevices[0]?.id ?? ""
        : activeScreenshot.activeDeviceId;

    updateActiveScreenshot({
      devices: nextDevices,
      activeDeviceId: nextActiveDeviceId,
      layerOrder: ensureLayerOrder(activeScreenshot).filter(
        (k) => k !== `device:${deviceId}`,
      ),
    });

    if (
      selectedElement?.type === "device" &&
      selectedElement.screenshotId === activeScreenshot.id &&
      selectedElement.id === deviceId
    ) {
      setSelectedElement(
        nextActiveDeviceId
          ? {
              type: "device",
              id: nextActiveDeviceId,
              screenshotId: activeScreenshot.id,
            }
          : null,
      );
    }
  };

  const bringDeviceForward = (deviceId: string) =>
    moveElementLayer("device", deviceId, "forward");
  const sendDeviceBackward = (deviceId: string) =>
    moveElementLayer("device", deviceId, "backward");
  const bringDeviceToFront = (deviceId: string) =>
    moveElementLayer("device", deviceId, "front");
  const sendDeviceToBack = (deviceId: string) =>
    moveElementLayer("device", deviceId, "back");

  const removeScreenshot = (id: string) => {
    if (screenshots.length <= 1) return;
    const newScreenshots = screenshots.filter((s) => s.id !== id);
    setScreenshots(newScreenshots);
    if (activeScreenshotId === id) {
      setActiveScreenshotId(newScreenshots[0].id);
    }
  };

  // Canvas keyboard UX — delete, escape, enter-to-edit, arrow nudge
  useEffect(() => {
    const isTypingTarget = (target: HTMLElement | null) =>
      Boolean(
        target &&
          (target.isContentEditable ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT"),
      );

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (e.key === "Escape") {
        if (inlineEditing) {
          e.preventDefault();
          setInlineEditing(null);
          return;
        }
        if (selectedElement && !isTypingTarget(target)) {
          e.preventDefault();
          setSelectedElement(null);
        }
        return;
      }

      if (isTypingTarget(target)) return;

      if (
        (e.key === "Enter" || e.key === "F2") &&
        selectedElement?.type === "text" &&
        selectedElement.id
      ) {
        e.preventDefault();
        startInlineEditing(selectedElement.screenshotId, selectedElement.id);
        return;
      }

      if (
        (e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown") &&
        selectedElement &&
        !inlineEditing
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 0.5 : 1;
        const dx =
          e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy =
          e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        const shot =
          screenshots.find((s) => s.id === selectedElement.screenshotId) ??
          activeScreenshot;

        if (selectedElement.type === "text" && selectedElement.id) {
          const texts = (shot.texts ?? []).map((t) =>
            t.id === selectedElement.id
              ? {
                  ...t,
                  x: Math.min(100, Math.max(0, t.x + dx)),
                  y: Math.min(100, Math.max(0, t.y + dy)),
                }
              : t,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            withSyncedTexts(texts),
            true,
          );
        } else if (selectedElement.type === "image" && selectedElement.id) {
          const updatedImages = shot.overlayImages.map((img) =>
            img.id === selectedElement.id
              ? {
                  ...img,
                  x: Math.min(100, Math.max(0, img.x + dx)),
                  y: Math.min(100, Math.max(0, img.y + dy)),
                }
              : img,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { overlayImages: updatedImages },
            true,
          );
        } else if (selectedElement.type === "device" && selectedElement.id) {
          const updatedDevices = shot.devices.map((device) =>
            device.id === selectedElement.id
              ? {
                  ...device,
                  x: device.x + dx,
                  y: Math.min(100, Math.max(0, device.y + dy)),
                }
              : device,
          );
          updateScreenshotById(
            selectedElement.screenshotId,
            { devices: updatedDevices },
            true,
          );
        }
        return;
      }

      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!selectedElement || inlineEditing) return;
      e.preventDefault();

      if (selectedElement.type === "image" && selectedElement.id) {
        removeOverlayImage(selectedElement.id);
        return;
      }
      if (selectedElement.type === "device" && selectedElement.id) {
        removeDevice(selectedElement.id);
        return;
      }
      if (selectedElement.type === "text" && selectedElement.id) {
        const shot =
          screenshots.find((s) => s.id === selectedElement.screenshotId) ??
          activeScreenshot;
        const texts = (shot.texts ?? []).filter(
          (t) => t.id !== selectedElement.id,
        );
        updateScreenshotById(selectedElement.screenshotId, {
          ...withSyncedTexts(texts),
          layerOrder: ensureLayerOrder({ ...shot, texts }),
        });
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedElement,
    inlineEditing,
    activeScreenshot,
    screenshots,
    updateScreenshotById,
    removeOverlayImage,
    removeDevice,
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeDevice) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        updateActiveScreenshot({
          devices: activeScreenshot.devices.map((device) =>
            device.id === activeDevice.id
              ? { ...device, screenshotSrc: result }
              : device,
          ),
        });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const getBackgroundStyle = (screenshot: Screenshot) =>
    getBackgroundCss(screenshot);

  const handleExport = () => {
    const sizesToExport = exportSizeIds
      .map((id) => exportSizes.find((s) => s.id === id))
      .filter((s): s is ExportSize => Boolean(s));
    const unique =
      sizesToExport.length > 0
        ? sizesToExport
        : exportSize
          ? [exportSize]
          : [];

    void exportScreenshots({
      screenshots,
      exportSizes: unique,
      designWidth: exportSize.width,
    });
    setIsExportSuccessOpen(true);
  };

  /**
   * Resets the editor to default state and clears localStorage
   */
  const resetEditor = () => {
    clearPersistedState();
    const defaultProject = createDefaultProject();
    setProjects([defaultProject]);
    setActiveProjectId(defaultProject.id);
    setSelectedDeviceIdState(defaultProject.selectedDeviceId);
    setSelectedColorIdState(defaultProject.selectedColorId);
    setExportSizeIdState(defaultProject.exportSizeId);
    setExportSizeIdsState(defaultProject.exportSizeIds);
    setScreenshotsState(defaultProject.screenshots);
    setActiveScreenshotIdState(defaultProject.activeScreenshotId);
    setSelectedElement(null);
    setIsExportSuccessOpen(false);
    historyPast.current = [];
    historyFuture.current = [];
    setHistoryTick((t) => t + 1);
  };

  return (
    <EditorContext.Provider
      value={{
        // Project state
        projects,
        activeProjectId,
        activeProject,
        createProject,
        renameProject,
        deleteProject,
        switchProject,
        linkedFileName,
        isProjectDirty,
        canOverwriteLinkedFile,
        saveProject,
        saveProjectAs,
        openProjectFile,
        importProjectFile,
        exportProjectFile,
        storageWarning,
        dismissStorageWarning,

        isFontPickerOpen,
        setIsFontPickerOpen,
        isExportSuccessOpen,
        setIsExportSuccessOpen,
        selectedDeviceId,
        setSelectedDeviceId,
        selectedColorId,
        setSelectedColorId,
        exportSizeId,
        setExportSizeId,
        exportSizeIds,
        toggleExportSizeId,
        screenshots,
        setScreenshots,
        activeScreenshotId,
        setActiveScreenshotId,
        selectedElement,
        setSelectedElement,
        isDragging,
        headlineFontSize,
        setHeadlineFontSize,
        subheadlineFontSize,
        setSubheadlineFontSize,
        previewDimensions,
        setPreviewDimensions,
        contentFocusRequest,
        clearContentFocusRequest,
        inlineEditing,
        startInlineEditing,
        stopInlineEditing,
        addText,
        updateText,
        removeText,
        duplicateText,
        suppressDeselectUntil,
        canUndo: historyTick >= 0 && historyPast.current.length > 0,
        canRedo: historyTick >= 0 && historyFuture.current.length > 0,
        undo,
        redo,
        previewRef,
        fileInputRef,
        canvasContainerRef,
        overlayImageInputRef,
        selectedDevice,
        selectedColor,
        activeScreenshot,
        activeDevice,
        exportSize,
        updateActiveScreenshot,
        updateScreenshotById,
        addScreenshot,
        duplicateScreenshot,
        removeScreenshot,
        reorderScreenshots,
        moveScreenshot,
        handleElementMouseDown,
        handleElementMouseMove,
        handleElementMouseUp,
        handleResizeStart,
        handleRotateStart,
        requestContentFocus,
        updateTextAlign,
        addOverlayImage,
        addIcon,
        removeOverlayImage,
        updateOverlayImageSize,
        updateOverlayImageLayer,
        updateOverlayImageRotation,
        updateOverlayImageShadow,
        addDevice,
        selectDevice,
        removeDevice,
        bringDeviceForward,
        sendDeviceBackward,
        bringDeviceToFront,
        sendDeviceToBack,
        bringImageForward,
        sendImageBackward,
        bringImageToFront,
        sendImageToBack,
        moveElementLayer,
        handleFileUpload,
        handleExport,
        getBackgroundStyle,
        resetEditor,
      }}
    >
      {storageWarning && (
        <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 max-w-lg w-[calc(100%-2rem)] rounded-xl border border-amber-500/40 bg-amber-950/95 px-4 py-3 text-sm text-amber-50 shadow-xl flex items-start gap-3">
          <p className="flex-1 leading-snug">{storageWarning}</p>
          <button
            type="button"
            className="shrink-0 text-amber-200/80 hover:text-white text-xs underline"
            onClick={() => {
              void exportProjectFile();
            }}
          >
            Export .appshots
          </button>
          <button
            type="button"
            className="shrink-0 text-amber-200/80 hover:text-white"
            onClick={dismissStorageWarning}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
