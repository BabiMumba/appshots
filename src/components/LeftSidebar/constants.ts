/**
 * LeftSidebar Constants
 *
 * Style constants used across LeftSidebar components.
 */

/**
 * CSS classes for consistent styling (theme via --ed-* tokens)
 */
export const STYLES = {
  /** Sidebar container */
  sidebar:
    "w-72 shrink-0 border-r border-[var(--ed-border)] bg-[var(--ed-panel)] text-[var(--ed-fg)] flex flex-col",

  /** Header section */
  header: "p-4 border-b border-[var(--ed-border)]",

  /** Content area */
  content: "flex-1 overflow-y-auto p-4 space-y-4",

  /** Section container */
  section: "rounded-lg bg-[var(--ed-surface)] p-3",

  /** Section title */
  sectionTitle:
    "text-xs font-medium text-[var(--ed-fg-muted)] uppercase tracking-wider mb-3",

  /** Button list container */
  buttonList: "space-y-2",

  /** Selection button base */
  selectionButton: "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",

  /** Selection button active state */
  selectionButtonActive: "bg-[var(--ed-inverse)] text-[var(--ed-inverse-fg)]",

  /** Selection button inactive state */
  selectionButtonInactive:
    "bg-[var(--ed-muted)] text-[var(--ed-fg-muted)] hover:bg-[var(--ed-muted-hover)]",

  /** Color picker container */
  colorPicker: "flex flex-wrap gap-2",

  /** Color button base */
  colorButton: "w-7 h-7 rounded-full border-2 transition-all",

  /** Color button active state */
  colorButtonActive: "border-[var(--ed-fg)] scale-110",

  /** Color button inactive state */
  colorButtonInactive: "border-transparent",

  /** Primary action button */
  primaryButton:
    "w-full mt-3 bg-[var(--ed-inverse)] hover:opacity-90 text-[var(--ed-inverse-fg)] font-medium py-2.5 rounded-lg transition-opacity",

  /** Native select */
  select:
    "w-full bg-[var(--ed-muted)] hover:bg-[var(--ed-muted-hover)] text-[var(--ed-fg)] text-sm rounded-md px-3 py-2 border border-transparent hover:border-[var(--ed-border)] outline-none focus:ring-1 focus:ring-[var(--ed-fg)] cursor-pointer",
} as const;
