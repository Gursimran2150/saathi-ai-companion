"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_LANGUAGE, isLanguageCode, type LanguageCode } from "@/lib/i18n";
import { translate, type StringKey } from "@/lib/strings";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<LanguageCode>("app:language", DEFAULT_LANGUAGE, isLanguageCode);
  const t = useCallback((key: StringKey) => translate(language, key), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
