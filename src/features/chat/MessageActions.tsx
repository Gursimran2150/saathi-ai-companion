"use client";

import { Check, Copy, Square, Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopy, useSpeak } from "@/hooks/useAnswerActions";

/** Read-aloud and copy actions for one assistant message. */
export function MessageActions({ text }: { text: string }) {
  const { t, language } = useLanguage();
  const { speaking, toggle: toggleSpeak } = useSpeak(text, language);
  const { copied, copy } = useCopy(text, 1500);

  const listenLabel = speaking ? t("common.stopListening") : t("common.listen");
  const copyLabel = copied ? t("common.copied") : t("common.copy");

  return (
    <div className="flex gap-1 text-muted-foreground">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            onClick={toggleSpeak}
            aria-label={listenLabel}
            aria-pressed={speaking}
          >
            {speaking ? (
              <Square className="size-4" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{listenLabel}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-10 rounded-full" onClick={copy} aria-label={copyLabel}>
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copyLabel}</TooltipContent>
      </Tooltip>
      <span role="status" className="sr-only">
        {copied ? t("common.copied") : ""}
      </span>
    </div>
  );
}
