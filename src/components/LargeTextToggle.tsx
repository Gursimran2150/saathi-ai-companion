"use client";

import { ALargeSmall } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    <Button
      variant={large ? "default" : "ghost"}
      size="icon"
      aria-pressed={large}
      aria-label={t("a11y.largeText")}
      onClick={() => setLarge(!large)}
      className="size-11 rounded-full"
    >
      <ALargeSmall className="size-5" aria-hidden="true" />
    </Button>
  );
}
