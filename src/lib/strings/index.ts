import type { LanguageCode } from "@/lib/i18n";
import { en, type Dictionary, type StringKey } from "./en";

export type { Dictionary, StringKey } from "./en";
export { en };

/**
 * Non-English dictionaries are code-split: the browser downloads only the language
 * the worker picks (English ships with the app as the fallback).
 */
const loaders: Record<Exclude<LanguageCode, "en">, () => Promise<Dictionary>> = {
  hi: () => import("./hi").then((m) => m.hi),
  pa: () => import("./pa").then((m) => m.pa),
  bn: () => import("./bn").then((m) => m.bn),
  mr: () => import("./mr").then((m) => m.mr),
  ta: () => import("./ta").then((m) => m.ta),
  te: () => import("./te").then((m) => m.te),
};

export function loadDictionary(language: LanguageCode): Promise<Dictionary> {
  return language === "en" ? Promise.resolve(en) : loaders[language]();
}

export function translate(dictionary: Dictionary | undefined, key: StringKey): string {
  return dictionary?.[key] || en[key];
}
