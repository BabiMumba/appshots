/**
 * Store-oriented locales with flag country codes for country-flag-icons.
 * Language ≠ country, but flag + native name is the UX users expect.
 */

export type LocaleInfo = {
  code: string;
  /** ISO 3166-1 alpha-2 for flag (GB not UK) */
  flag: string;
  label: string;
  nativeLabel: string;
};

/** Common App Store / Play listing languages */
export const STORE_LOCALES: LocaleInfo[] = [
  { code: "en", flag: "US", label: "English (US)", nativeLabel: "English" },
  { code: "en-GB", flag: "GB", label: "English (UK)", nativeLabel: "English" },
  { code: "en-AU", flag: "AU", label: "English (Australia)", nativeLabel: "English" },
  { code: "en-CA", flag: "CA", label: "English (Canada)", nativeLabel: "English" },
  { code: "en-IN", flag: "IN", label: "English (India)", nativeLabel: "English" },
  { code: "fr", flag: "FR", label: "French", nativeLabel: "Français" },
  { code: "fr-CA", flag: "CA", label: "French (Canada)", nativeLabel: "Français" },
  { code: "de", flag: "DE", label: "German", nativeLabel: "Deutsch" },
  { code: "es", flag: "ES", label: "Spanish", nativeLabel: "Español" },
  { code: "es-MX", flag: "MX", label: "Spanish (Mexico)", nativeLabel: "Español" },
  { code: "it", flag: "IT", label: "Italian", nativeLabel: "Italiano" },
  { code: "pt", flag: "PT", label: "Portuguese", nativeLabel: "Português" },
  { code: "pt-BR", flag: "BR", label: "Portuguese (Brazil)", nativeLabel: "Português" },
  { code: "nl", flag: "NL", label: "Dutch", nativeLabel: "Nederlands" },
  { code: "pl", flag: "PL", label: "Polish", nativeLabel: "Polski" },
  { code: "ru", flag: "RU", label: "Russian", nativeLabel: "Русский" },
  { code: "ja", flag: "JP", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", flag: "KR", label: "Korean", nativeLabel: "한국어" },
  { code: "zh-Hans", flag: "CN", label: "Chinese (Simplified)", nativeLabel: "简体中文" },
  { code: "zh-Hant", flag: "TW", label: "Chinese (Traditional)", nativeLabel: "繁體中文" },
  { code: "ar", flag: "SA", label: "Arabic", nativeLabel: "العربية" },
  { code: "tr", flag: "TR", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "sv", flag: "SE", label: "Swedish", nativeLabel: "Svenska" },
  { code: "da", flag: "DK", label: "Danish", nativeLabel: "Dansk" },
  { code: "fi", flag: "FI", label: "Finnish", nativeLabel: "Suomi" },
  { code: "nb", flag: "NO", label: "Norwegian", nativeLabel: "Norsk" },
  { code: "cs", flag: "CZ", label: "Czech", nativeLabel: "Čeština" },
  { code: "hu", flag: "HU", label: "Hungarian", nativeLabel: "Magyar" },
  { code: "ro", flag: "RO", label: "Romanian", nativeLabel: "Română" },
  { code: "uk", flag: "UA", label: "Ukrainian", nativeLabel: "Українська" },
  { code: "th", flag: "TH", label: "Thai", nativeLabel: "ไทย" },
  { code: "vi", flag: "VN", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
  { code: "id", flag: "ID", label: "Indonesian", nativeLabel: "Bahasa Indonesia" },
  { code: "hi", flag: "IN", label: "Hindi", nativeLabel: "हिन्दी" },
];

const byCode = new Map(STORE_LOCALES.map((l) => [l.code, l]));

export function getLocaleInfo(code: string): LocaleInfo {
  return (
    byCode.get(code) ?? {
      code,
      flag: "US",
      label: code,
      nativeLabel: code,
    }
  );
}

/** Trigger label: "English (en)" / "Français (fr)" */
export function formatLocaleTrigger(code: string): string {
  const info = getLocaleInfo(code);
  return `${info.nativeLabel} (${code})`;
}

/** List row: "English (en-US)" style */
export function formatLocaleOption(code: string): string {
  const info = getLocaleInfo(code);
  return `${info.label}`;
}

/**
 * Pick primary locale from the browser — FR machine → fr, not forced en.
 */
export function detectDefaultLocale(): string {
  try {
    const raw =
      typeof navigator !== "undefined"
        ? navigator.language || (navigator.languages && navigator.languages[0])
        : null;
    if (!raw) return "en";
    const tag = raw.trim();
    if (byCode.has(tag)) return tag;
    const lower = tag.toLowerCase();
    const exact = STORE_LOCALES.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    const primary = tag.split("-")[0].toLowerCase();
    // Prefer bare language code (fr) over regional English variants
    const bare = STORE_LOCALES.find((l) => l.code.toLowerCase() === primary);
    if (bare) return bare.code;
    const regional = STORE_LOCALES.find((l) =>
      l.code.toLowerCase().startsWith(`${primary}-`),
    );
    if (regional) return regional.code;
  } catch {
    /* ignore */
  }
  return "en";
}

/** Fallback constant (prefer detectDefaultLocale for new projects) */
export const DEFAULT_LOCALE = "en";
