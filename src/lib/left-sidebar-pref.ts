/** Persist left sidebar open/collapsed for editor chrome. */

export const LEFT_SIDEBAR_OPEN_KEY = "appshots-left-sidebar-open";

export function readLeftSidebarOpen(): boolean {
  try {
    const v = localStorage.getItem(LEFT_SIDEBAR_OPEN_KEY);
    if (v === "0" || v === "false") return false;
    if (v === "1" || v === "true") return true;
  } catch {
    /* ignore */
  }
  return true;
}

export function writeLeftSidebarOpen(open: boolean) {
  try {
    localStorage.setItem(LEFT_SIDEBAR_OPEN_KEY, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}
