export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", speechLocale: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLocale: "hi-IN" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", speechLocale: "pa-IN" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", speechLocale: "bn-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", speechLocale: "mr-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", speechLocale: "ta-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", speechLocale: "te-IN" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as [LanguageCode, ...LanguageCode[]];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function getLanguage(code: LanguageCode) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && (LANGUAGE_CODES as readonly string[]).includes(value);
}
