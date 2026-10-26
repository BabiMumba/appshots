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
  shadow: ShadowConfig;
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
};

export type TextAlign = "left" | "center" | "right";

/** Free-form text block on a screenshot (any number per screen). */
export type TextOverlay = {
  id: string;
  content: string;
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
  devices: DeviceInstance[];
  activeDeviceId: string;
  /**
   * Bottom → top stacking order.
   * Keys: "text:{id}" | "device:{id}" | "image:{id}"
   * Legacy "headline" / "subheadline" are remapped on load.
   */
  layerOrder: string[];
};

export type SelectedElement = {
  type: "text" | "image" | "device";
  screenshotId: string;
  id?: string;
};

export type ExportStore = "appstore" | "play" | "other";

export type ExportSize = {
  id: string;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  store: ExportStore;
  group: string;
  required?: boolean;
};

/**
 * Project type - groups screenshots together
 */
export type Project = {
  /** Unique project identifier */
  id: string;
  /** Project name */
  name: string;
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
   * @deprecated Prefer per-screenshot font sizes. Kept for migration.
   */
  headlineFontSize?: number;
  /**
   * @deprecated Prefer per-screenshot font sizes. Kept for migration.
   */
  subheadlineFontSize?: number;
};
