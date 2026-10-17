"use client";

import { Check, Copy, Download, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPlainText, useCopy, useSpeak } from "@/hooks/useAnswerActions";
import { AiResponse } from "./AiResponse";
import { useLanguage } from "./LanguageProvider";

interface AnswerPanelProps {
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error: string | null;
  /** When set, shows a Download button that saves the answer as this .txt file. */
  downloadName?: string;
}

const ACTION = "h-11 gap-2 rounded-full px-4 text-sm font-medium";

/** AI answer with Listen (text-to-speech), Copy and optional Download actions. */
export function AnswerPanel({ text, status, error, downloadName }: AnswerPanelProps) {
  const { t, language } = useLanguage();
  const { speaking, toggle: toggleSpeak } = useSpeak(text, language);
  const { copied, copy } = useCopy(text);
  const ready = status === "done" && text.length > 0;

  function download() {
    const url = URL.createObjectURL(new Blob([toPlainText(text)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName ?? "saathi.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
      <AiResponse
        text={text}
        status={status}
        error={error}
        emptyHint={t("common.answerHint")}
        thinkingLabel={t("chat.thinking")}
      />
      {ready && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={toggleSpeak} aria-pressed={speaking} className={ACTION}>
            {speaking ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
            {speaking ? t("common.stopListening") : t("common.listen")}
          </Button>
          <Button type="button" variant="outline" onClick={copy} className={ACTION}>
            {copied ? <Check className="text-success" aria-hidden /> : <Copy aria-hidden />}
            {copied ? t("common.copied") : t("common.copy")}
          </Button>
          {downloadName && (
            <Button type="button" variant="outline" onClick={download} className={ACTION}>
              <Download aria-hidden />
              {t("common.download")}
            </Button>
          )}
          <span role="status" className="sr-only">
            {copied ? t("common.copied") : ""}
          </span>
        </div>
      )}
      {ready && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          {t("common.aiNote")}
        </p>
      )}
    </div>
  );
}
