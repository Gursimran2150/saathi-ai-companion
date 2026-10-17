"use client";

import { Check, Copy, Download, Info, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getLanguage } from "@/lib/i18n";
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
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const ready = status === "done" && text.length > 0;
  const plain = text.replaceAll("**", "");

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  function toggleSpeak() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = getLanguage(language).speechLocale;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([plain], { type: "text/plain;charset=utf-8" }));
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
