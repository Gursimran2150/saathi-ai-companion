"use client";

import { Languages } from "lucide-react";
import { useId } from "react";
import { LANGUAGES, isLanguageCode } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export function LanguageSelect() {
  const id = useId();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex items-center">
      <label htmlFor={id} className="sr-only">
        Language
      </label>
      <Languages className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
      <select
        id={id}
        value={language}
        onChange={(e) => isLanguageCode(e.target.value) && setLanguage(e.target.value)}
        className="min-h-11 cursor-pointer appearance-none rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm font-medium hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
