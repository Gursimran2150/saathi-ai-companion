"use client";

import { useId } from "react";
import { LANGUAGES, isLanguageCode } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export function LanguageSelect() {
  const id = useId();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Language
      </label>
      <select
        id={id}
        value={language}
        onChange={(e) => isLanguageCode(e.target.value) && setLanguage(e.target.value)}
        className="min-h-11 rounded-lg border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
