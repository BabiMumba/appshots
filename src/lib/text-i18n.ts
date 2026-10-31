import type { Screenshot, TextOverlay } from "../types";
import { DEFAULT_LOCALE } from "./locales";

/** Resolve display content for a locale (falls back to content / en / first translation). */
export function textContentForLocale(
  text: TextOverlay,
  locale: string,
  baseLocale = DEFAULT_LOCALE,
): string {
  const t = text.translations;
  if (t?.[locale] != null && t[locale] !== "") return t[locale];
  if (locale !== baseLocale && t?.[baseLocale] != null && t[baseLocale] !== "") {
    return t[baseLocale];
  }
  return text.content ?? "";
}

/** Persist current content into translations map for a locale. */
export function withTextTranslation(
  text: TextOverlay,
  locale: string,
  html: string,
): TextOverlay {
  return {
    ...text,
    content: html,
    translations: {
      ...(text.translations ?? {}),
      [locale]: html,
    },
  };
}

/** Switch all texts on a screenshot to show `nextLocale` (writes previous into map). */
export function applyLocaleToScreenshot(
  screenshot: Screenshot,
  prevLocale: string,
  nextLocale: string,
  baseLocale = DEFAULT_LOCALE,
): Screenshot {
  const texts = (screenshot.texts ?? []).map((text) => {
    const savedPrev = {
      ...text,
      translations: {
        ...(text.translations ?? {}),
        [prevLocale]: text.content,
      },
    };
    const nextContent = textContentForLocale(savedPrev, nextLocale, baseLocale);
    return {
      ...savedPrev,
      content: nextContent,
      translations: {
        ...savedPrev.translations,
        [nextLocale]: nextContent,
      },
    };
  });
  return { ...screenshot, texts };
}

export function applyLocaleToScreenshots(
  screenshots: Screenshot[],
  prevLocale: string,
  nextLocale: string,
  baseLocale = DEFAULT_LOCALE,
): Screenshot[] {
  return screenshots.map((s) =>
    applyLocaleToScreenshot(s, prevLocale, nextLocale, baseLocale),
  );
}

/** Snapshot screens for export of a specific locale without mutating editor state. */
export function screenshotsForLocaleExport(
  screenshots: Screenshot[],
  locale: string,
  baseLocale = DEFAULT_LOCALE,
): Screenshot[] {
  return screenshots.map((s) => ({
    ...s,
    texts: (s.texts ?? []).map((t) => ({
      ...t,
      content: textContentForLocale(t, locale, baseLocale),
    })),
  }));
}
