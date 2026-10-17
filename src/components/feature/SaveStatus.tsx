"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { SaveState } from "@/features/shared/useProfileEditor";

/** Quiet inline "Saved" indicator for auto-saving forms (errors are toasted instead). */
export function SaveStatus({ state }: { state: SaveState }) {
  const { t } = useLanguage();
  return (
    <span role="status" className="inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-muted-foreground">
      {state === "saving" && <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden />}
      {state === "saved" && (
        <>
          <Check className="size-4 text-success" aria-hidden />
          {t("toast.saved")}
        </>
      )}
    </span>
  );
}
