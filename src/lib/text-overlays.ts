/**
 * Free-form text overlays on a screenshot (Canva-like).
 */

import type { TextAlign, TextOverlay } from "../types";

export const createTextOverlay = (
  overrides: Partial<TextOverlay> = {},
): TextOverlay => ({
  id: overrides.id ?? Math.random().toString(36).substring(2, 9),
  content: overrides.content ?? "Double-click to edit",
  x: overrides.x ?? 50,
  y: overrides.y ?? 12,
  width: overrides.width ?? 80,
  fontSize: overrides.fontSize ?? 56,
  color: overrides.color ?? "#ffffff",
  fontFamily: overrides.fontFamily ?? "Inter",
  align: overrides.align ?? "center",
  uppercase: overrides.uppercase ?? false,
  fontWeight: overrides.fontWeight ?? 700,
});

/** Build the two default texts from legacy headline / subheadline fields. */
export const createDefaultTexts = (opts?: {
  headline?: string;
  subheadline?: string;
  color?: string;
  fontFamily?: string;
  headlineFontSize?: number;
  subheadlineFontSize?: number;
}): TextOverlay[] => [
  createTextOverlay({
    content: opts?.headline ?? "Showcase Your App",
    x: 50,
    y: 10,
    width: 80,
    fontSize: opts?.headlineFontSize ?? 72,
    color: opts?.color ?? "#ffffff",
    fontFamily: opts?.fontFamily ?? "Inter",
    align: "center",
    fontWeight: 700,
  }),
  createTextOverlay({
    content:
      opts?.subheadline ??
      "Create stunning App Store screenshots in minutes. Devices, backgrounds, and overlays — ready for the store.",
    x: 50,
    y: 18,
    width: 80,
    fontSize: opts?.subheadlineFontSize ?? 42,
    color: opts?.color ?? "#ffffff",
    fontFamily: opts?.fontFamily ?? "Inter",
    align: "center",
    fontWeight: 600,
  }),
];

type LegacyTextFields = {
  headline?: string;
  subheadline?: string;
  textColor?: string;
  headlineColor?: string;
  subheadlineColor?: string;
  headlineX?: number;
  headlineY?: number;
  headlineWidth?: number;
  headlineAlign?: TextAlign;
  subheadlineX?: number;
  subheadlineY?: number;
  subheadlineWidth?: number;
  subheadlineAlign?: TextAlign;
  fontFamily?: string;
  headlineFontFamily?: string;
  subheadlineFontFamily?: string;
  headlineFontSize?: number;
  subheadlineFontSize?: number;
  headlineUppercase?: boolean;
  subheadlineUppercase?: boolean;
  texts?: TextOverlay[];
};

/**
 * Prefer `texts[]`. If missing/empty, migrate from legacy headline/subheadline.
 */
export const resolveTexts = (shot: LegacyTextFields): TextOverlay[] => {
  if (Array.isArray(shot.texts) && shot.texts.length > 0) {
    return shot.texts.map((t) =>
      createTextOverlay({
        ...t,
        id: t.id || Math.random().toString(36).substring(2, 9),
      }),
    );
  }

  const hasHeadline =
    typeof shot.headline === "string" && shot.headline.trim().length > 0;
  const hasSub =
    typeof shot.subheadline === "string" && shot.subheadline.trim().length > 0;

  // Empty project that wiped both — start with no texts (user can Add Text).
  if (!hasHeadline && !hasSub && shot.texts && shot.texts.length === 0) {
    return [];
  }

  // Brand-new / legacy project without texts array
  if (!shot.texts) {
    return createDefaultTexts({
      headline: shot.headline,
      subheadline: shot.subheadline,
      color: shot.textColor,
      fontFamily: shot.fontFamily,
      headlineFontSize: shot.headlineFontSize,
      subheadlineFontSize: shot.subheadlineFontSize,
    }).map((t, i) => {
      if (i === 0) {
        return createTextOverlay({
          ...t,
          content: shot.headline ?? t.content,
          x: shot.headlineX ?? t.x,
          y: shot.headlineY ?? t.y,
          width: shot.headlineWidth ?? t.width,
          align: shot.headlineAlign ?? t.align,
          color: shot.headlineColor ?? shot.textColor ?? t.color,
          fontFamily: shot.headlineFontFamily ?? shot.fontFamily ?? t.fontFamily,
          fontSize: shot.headlineFontSize ?? t.fontSize,
          uppercase: Boolean(shot.headlineUppercase),
          fontWeight: 700,
        });
      }
      return createTextOverlay({
        ...t,
        content: shot.subheadline ?? t.content,
        x: shot.subheadlineX ?? t.x,
        y: shot.subheadlineY ?? t.y,
        width: shot.subheadlineWidth ?? t.width,
        align: shot.subheadlineAlign ?? t.align,
        color: shot.subheadlineColor ?? shot.textColor ?? t.color,
        fontFamily:
          shot.subheadlineFontFamily ?? shot.fontFamily ?? t.fontFamily,
        fontSize: shot.subheadlineFontSize ?? t.fontSize,
        uppercase: Boolean(shot.subheadlineUppercase),
        fontWeight: 600,
      });
    });
  }

  // Explicit empty texts[]
  return [];
};

type LegacySyncFields = {
  headline: string;
  subheadline: string;
  textColor: string;
  headlineColor: string;
  subheadlineColor: string;
  headlineX: number;
  headlineY: number;
  headlineWidth: number;
  headlineAlign: TextAlign;
  subheadlineX: number;
  subheadlineY: number;
  subheadlineWidth: number;
  subheadlineAlign: TextAlign;
  fontFamily: string;
  headlineFontFamily: string;
  subheadlineFontFamily: string;
  headlineFontSize: number;
  subheadlineFontSize: number;
  headlineUppercase: boolean;
  subheadlineUppercase: boolean;
};

/** Keep legacy headline/subheadline mirrors in sync (first two texts). */
export const syncLegacyTextFields = (
  texts: TextOverlay[],
): LegacySyncFields => {
  const a = texts[0];
  const b = texts[1];
  return {
    headline: a?.content ?? "",
    subheadline: b?.content ?? "",
    textColor: a?.color ?? "#ffffff",
    headlineColor: a?.color ?? "#ffffff",
    subheadlineColor: b?.color ?? a?.color ?? "#ffffff",
    headlineX: a?.x ?? 50,
    headlineY: a?.y ?? 10,
    headlineWidth: a?.width ?? 80,
    headlineAlign: a?.align ?? "center",
    subheadlineX: b?.x ?? 50,
    subheadlineY: b?.y ?? 18,
    subheadlineWidth: b?.width ?? 80,
    subheadlineAlign: b?.align ?? "center",
    fontFamily: a?.fontFamily ?? "Inter",
    headlineFontFamily: a?.fontFamily ?? "Inter",
    subheadlineFontFamily: b?.fontFamily ?? a?.fontFamily ?? "Inter",
    headlineFontSize: a?.fontSize ?? 72,
    subheadlineFontSize: b?.fontSize ?? 42,
    headlineUppercase: Boolean(a?.uppercase),
    subheadlineUppercase: Boolean(b?.uppercase),
  };
};
