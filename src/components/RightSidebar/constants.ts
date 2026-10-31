/**
 * RightSidebar Constants
 *
 * Style constants used across RightSidebar components.
 */

/**
 * CSS classes for consistent styling (theme via --ed-* tokens)
 */
export const STYLES = {
  /** Sidebar container */
  sidebar:
    "w-96 shrink-0 border-l border-[var(--ed-border)] bg-[var(--ed-panel)] text-[var(--ed-fg)] overflow-y-auto",

  /** Content wrapper */
  content: "p-4 space-y-6",

  /** Section container */
  section: "rounded-lg bg-[var(--ed-surface)] p-3",

  /** Section title */
  sectionTitle:
    "text-xs font-medium text-[var(--ed-fg-muted)] uppercase tracking-wider mb-3",

  /** Section content */
  sectionContent: "space-y-3",

  /** Label text */
  label: "text-xs text-[var(--ed-fg-muted)]",

  /** Small label text */
  labelSmall: "text-xs text-[var(--ed-fg-muted)] opacity-80",

  /** Range slider */
  rangeSlider: "w-full mt-1 accent-[var(--ed-inverse)]",

  /** Color input */
  colorInput: "w-full h-8 rounded-md cursor-pointer",

  /** Small color input */
  colorInputSmall: "w-6 h-6 rounded cursor-pointer",

  /** Toggle button container */
  toggle: "w-8 h-4 rounded-full transition-colors",

  /** Toggle button active */
  toggleActive: "bg-[var(--ed-inverse)]",

  /** Toggle button inactive */
  toggleInactive: "bg-[var(--ed-muted-hover)]",

  /** Toggle knob */
  toggleKnob:
    "w-3 h-3 rounded-full bg-[var(--ed-inverse-fg)] transition-transform",

  /** Toggle knob active position */
  toggleKnobActive: "translate-x-4",

  /** Toggle knob inactive position */
  toggleKnobInactive: "translate-x-0.5",

  /** Mode button */
  modeButton: "flex-1 text-xs py-1.5 rounded-md",

  /** Mode button active */
  modeButtonActive: "bg-[var(--ed-inverse)] text-[var(--ed-inverse-fg)]",

  /** Mode button inactive */
  modeButtonInactive: "bg-[var(--ed-muted)] text-[var(--ed-fg-muted)]",

  /** Upload button */
  uploadButton:
    "w-full bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)] text-[var(--ed-fg-muted)] text-sm py-2 rounded-md transition-colors",

  /** Dropdown button */
  dropdownButton:
    "w-full flex items-center justify-between bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)] text-[var(--ed-fg)] text-sm rounded-md px-3 py-2 transition-colors border border-transparent hover:border-[var(--ed-border)] outline-none focus:ring-1 focus:ring-[var(--ed-fg)]",

  /** Native select */
  select:
    "w-full bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)] text-[var(--ed-fg)] text-sm rounded-md px-3 py-2 border border-transparent hover:border-[var(--ed-border)] outline-none focus:ring-1 focus:ring-[var(--ed-fg)] cursor-pointer",

  /** Color swatch row */
  colorPicker: "flex flex-wrap gap-2",

  /** Color swatch button */
  colorButton: "w-7 h-7 rounded-full border-2 transition-all",
  colorButtonActive: "border-[var(--ed-fg)] scale-110",
  colorButtonInactive: "border-transparent hover:border-[var(--ed-border)]",

  /** Gradient preset button */
  gradientButton: "h-6 rounded-md",

  /** Gradient preset active */
  gradientButtonActive: "ring-2 ring-[var(--ed-fg)]",

  /** Overlay item */
  overlayItem: "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",

  /** Overlay item active */
  overlayItemActive: "bg-[var(--ed-muted)] ring-1 ring-[var(--ed-fg)]",

  /** Overlay item inactive */
  overlayItemInactive: "bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)]",

  /** Overlay thumbnail */
  overlayThumbnail: "w-10 h-10 object-cover rounded",

  /** Icon button */
  iconButton:
    "p-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] disabled:opacity-30 disabled:cursor-not-allowed",

  /** Delete icon button */
  iconButtonDelete: "p-1 text-[var(--ed-fg-muted)] hover:text-red-400",

  /** Properties panel */
  propertiesPanel:
    "p-3 bg-[var(--ed-muted)] rounded-lg border border-[var(--ed-border)] space-y-3 mt-2",
} as const;

/**
 * Slider range configurations
 */
export const SLIDER_RANGES = {
  /** Width % of canvas — low min for feature-graphic clusters */
  deviceScale: { min: 12, max: 120 },
  devicePosition: { min: 0, max: 100 },
  deviceRotation: { min: -180, max: 180 },
  headlineSize: { min: 32, max: 120 },
  subheadlineSize: { min: 20, max: 72 },
  textWidth: { min: 20, max: 120, step: 5 },
  shadowBlur: { min: 0, max: 100 },
  shadowOffset: { min: -50, max: 50 },
  imageSize: { min: 5, max: 100 },
  imageRotation: { min: 0, max: 360 },
  device3dRotateY: { min: -60, max: 60 },
  device3dRotateX: { min: -40, max: 40 },
} as const;
