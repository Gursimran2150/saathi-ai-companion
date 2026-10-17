"use client";

import { Check, Copy, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLanguage } from "@/lib/i18n";

/** Read-aloud and copy actions for one assistant message. */
export function MessageActions({ text }: { text: string }) {
  const { t, language } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const plain = text.replaceAll("**", "");

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggleSpeak() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    if (speaking) return setSpeaking(false);
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = getLanguage(language).speechLocale;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

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
