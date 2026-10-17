"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "./LanguageProvider";

const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

/** Toggles larger text across the whole app; remembered on this device. */
export function LargeTextToggle() {
  const { t } = useLanguage();
  const [large, setLarge] = useLocalStorage<boolean>("app:large-text", false, isBoolean);

  useEffect(() => {
    document.documentElement.classList.toggle("text-large", large);
  }, [large]);

  return (
    <button
      type="button"
      aria-pressed={large}
      onClick={() => setLarge(!large)}
      className="btn-subtle aria-pressed:bg-foreground aria-pressed:text-background"
    >
      <span aria-hidden="true" className="font-black">
        A+
      </span>
      <span className="sr-only sm:not-sr-only">{t("a11y.largeText")}</span>
    </button>
  );
}
