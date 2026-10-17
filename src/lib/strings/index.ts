import type { LanguageCode } from "@/lib/i18n";
import { bn } from "./bn";
import { en, type Dictionary, type StringKey } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";
import { pa } from "./pa";
import { ta } from "./ta";
import { te } from "./te";

export type { StringKey } from "./en";

export const STRINGS: Record<LanguageCode, Dictionary> = { en, hi, pa, bn, mr, ta, te };

export function translate(language: LanguageCode, key: StringKey): string {
  return STRINGS[language]?.[key] || en[key];
}
