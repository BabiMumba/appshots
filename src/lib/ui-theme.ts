export type UiTheme = "dark" | "light";

export const UI_THEME_KEY = "appshots-ui-theme";

export function readUiTheme(): UiTheme {
  try {
    const v = localStorage.getItem(UI_THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function applyUiTheme(theme: UiTheme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(UI_THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleUiTheme(current: UiTheme): UiTheme {
  return current === "dark" ? "light" : "dark";
}
