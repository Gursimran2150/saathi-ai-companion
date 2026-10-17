"use client";

import { Square, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "./styles";

/**
 * Primary-action row. On phones it sticks to the bottom of the viewport while its form is on screen
 * (thumb reach), leaving room on the right for the floating SOS button; on larger screens it sits inline.
 * Must be placed as the last child of a <Panel> (it bleeds into the panel's padding).
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-5 -mb-5 flex flex-wrap items-center gap-3 rounded-b-3xl border-t border-border bg-card/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-24 backdrop-blur",
        "sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SubmitOrStopProps {
  streaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  icon: LucideIcon;
  children: ReactNode;
}

/** Submit button that turns into a Stop button while the AI is streaming. */
export function SubmitOrStop({ streaming, onStop, disabled, icon: Icon, children }: SubmitOrStopProps) {
  const { t } = useLanguage();
  return streaming ? (
    <Button type="button" variant="outline" onClick={onStop} className={cn(SECONDARY_BUTTON, "max-sm:flex-1")}>
      <Square className="size-4 fill-current" aria-hidden />
      {t("common.stop")}
    </Button>
  ) : (
    <Button type="submit" disabled={disabled} className={cn(PRIMARY_BUTTON, "max-sm:flex-1")}>
      <Icon aria-hidden />
      {children}
    </Button>
  );
}
