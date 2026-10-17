"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_LANGUAGE, isLanguageCode, type LanguageCode } from "@/lib/i18n";
import { en, loadDictionary, translate, type Dictionary, type StringKey } from "@/lib/strings";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<LanguageCode>("app:language", DEFAULT_LANGUAGE, isLanguageCode);
  const [loaded, setLoaded] = useState<{ code: LanguageCode; dict: Dictionary }>({ code: "en", dict: en });

  useEffect(() => {
    document.documentElement.lang = language;
    let cancelled = false;
    loadDictionary(language)
      .then((dict) => !cancelled && setLoaded({ code: language, dict }))
      .catch(() => undefined); // stay on English if a chunk fails to load
    return () => {
      cancelled = true;
    };
  }, [language]);

  const dict = loaded.code === language ? loaded.dict : undefined;
  const t = useCallback((key: StringKey) => translate(dict, key), [dict]);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
