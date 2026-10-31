export type DeviceColor = {
  id: string;
  label: string;
  frame: string;
  frameColors?: string[];
  screen: string;
};

export type ShadowConfig = {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
};

export type DeviceSpec = {
  id: string;
  label: string;
  width: number;
  height: number;
  screenInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  cornerRadius: number;
  frameRadius: {
    outer: string;
    inner: string;
  };
  notchWidth: number;
  notchHeight: number;
  hasIsland: boolean;
  colors: DeviceColor[];
};

export type GradientPreset = {
  id: string;
  label: string;
  from: string;
  to: string;
  via?: string;
};

export type CustomGradient = {
  from: string;
  via: string | null;
  to: string;
  angle: number;
};

export type ImageOverlay = {
  id: string;
  src: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: "behind" | "front";
  rotation: number;
  /** 0–100 */
  opacity: number;
  shadow: ShadowConfig;
  /** Soft-hide from canvas + export */
  hidden?: boolean;
  /** Prevent drag / resize / rotate */
  locked?: boolean;
};

/** Floating marketing block (card / pill / circle) — not a device frame */
export type ShapeForm = "rectangle" | "rounded" | "square" | "circle";

export type ShapeOverlay = {
  id: string;
  form: ShapeForm;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  /** 0–50 ≈ CSS border-radius as % of the shorter side */
  cornerRadius: number;
  fillMode: "color" | "image";
  fillColor: string;
  fillImage: string | null;
  /** Image pan inside the mask (−50…50), Canva-style crop */
  imageOffsetX: number;
  imageOffsetY: number;
  /** 0–100 */
  opacity: number;
  layer: "behind" | "front";
  shadow: ShadowConfig;
  hidden?: boolean;
  locked?: boolean;
};

export type DeviceStyle = "flat" | "3d";

export type DeviceInstance = {
  id: string;
  deviceId: string;
  colorId: string;
  screenshotSrc: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  shadow: ShadowConfig;
  style: DeviceStyle;
  rotateY: number;
  rotateX: number;
  /** Zoom of screen image (1 = cover fit) */
  imageZoom: number;
  /** Horizontal pan of screen image as % of screen (-50..50) */
  imageOffsetX: number;
  /** Vertical pan of screen image as % of screen (-50..50) */
  imageOffsetY: number;
  hidden?: boolean;
  locked?: boolean;
};

export type TextAlign = "left" | "center" | "right";

/** Free-form text block on a screenshot (any number per screen). */
export type TextOverlay = {
  id: string;
  /** HTML for the active project locale */
  content: string;
  /**
   * Translations keyed by locale code. `content` mirrors `translations[activeLocale]`.
   * Missing keys fall back to the project's base locale / content.
   */
  translations?: Record<string, string>;
  x: number;
  y: number;
  width: number;
  /** Size in export pixels */
  fontSize: number;
  color: string;
  fontFamily: string;
  align: TextAlign;
  uppercase: boolean;
  fontWeight: 600 | 700;
  hidden?: boolean;
  locked?: boolean;
};

export type Screenshot = {
  id: string;
  /**
   * Free-form texts on this screen. Prefer this over legacy headline/subheadline.
   */
  texts: TextOverlay[];
  /** @deprecated Mirrored from texts[0] for older projects */
  headline: string;
  /** @deprecated Mirrored from texts[1] for older projects */
  subheadline: string;
  backgroundColor: string;
  backgroundMode: "solid" | "gradient" | "image";
  gradientPresetId: string | null;
  /** When set, overrides preset colors for custom gradients */
  customGradient: CustomGradient | null;
  /** Data URL or path when backgroundMode is "image" */
  backgroundImage: string | null;
  /** @deprecated Prefer per-text color */
  textColor: string;
  /** @deprecated */
  headlineColor: string;
  /** @deprecated */
  subheadlineColor: string;
  /** @deprecated */
  headlineX: number;
  headlineY: number;
  headlineWidth: number;
  headlineAlign: TextAlign;
  subheadlineX: number;
  subheadlineY: number;
  subheadlineWidth: number;
  subheadlineAlign: TextAlign;
  /** @deprecated */
  fontFamily: string;
  headlineFontFamily: string;
  subheadlineFontFamily: string;
  headlineFontSize: number;
  subheadlineFontSize: number;
  headlineUppercase: boolean;
  subheadlineUppercase: boolean;
  overlayImages: ImageOverlay[];
  /** Floating shape blocks (cards, circles, etc.) */
  shapes: ShapeOverlay[];
  devices: DeviceInstance[];
  activeDeviceId: string;
  /**
   * Bottom → top stacking order.
   * Keys: "text:{id}" | "device:{id}" | "image:{id}" | "shape:{id}"
   * Legacy "headline" / "subheadline" are remapped on load.
   */
  layerOrder: string[];
};

export type SelectedElement = {
  type: "text" | "image" | "device" | "shape";
  screenshotId: string;
  id?: string;
};

export type ExportStore = "appstore" | "play" | "other";

/** Canvas export family: phone/tablet slots vs Play feature graphic */
export type ExportAssetKind = "screenshot" | "feature";

/**
 * Locked at project creation — phone screenshots, tablet screenshots, or
 * Play feature graphic are separate projects (not a toggle on the same canvas).
 */
export type ProjectKind = "phone" | "tablet" | "feature";

export type ExportSize = {
  id: string;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  store: ExportStore;
  group: string;
  required?: boolean;
  /** Defaults to screenshot when omitted */
  kind?: ExportAssetKind;
};

/**
 * Project type - groups screenshots together
 */
export type Project = {
  /** Unique project identifier */
  id: string;
  /** Project name */
  name: string;
  /**
   * What this project is for. Locked — switch kinds by creating/opening
   * another project, not by remapping the same screens.
   */
  kind: ProjectKind;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Screenshots belonging to this project */
  screenshots: Screenshot[];
  /** Selected device ID for this project */
  selectedDeviceId: string;
  /** Selected device color ID */
  selectedColorId: string;
  /** Export size ID */
  exportSizeId: string;
  /** Additional size IDs included in multi-export */
  exportSizeIds: string[];
  /** Active screenshot ID */
  activeScreenshotId: string;
  /**
   * Locales for store listing copy (shared layout). First entry is the base.
   * @default ["en"]
   */
  locales?: string[];
  /** Currently edited / previewed locale */
  activeLocale?: string;
  /**
   * @deprecated Prefer per-screenshot font sizes. Kept for migration.
   */
  headlineFontSize?: number;
  /**
   * @deprecated Prefer per-screenshot font sizes. Kept for migration.
   */
  subheadlineFontSize?: number;
};
