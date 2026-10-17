"use client";

import { useEffect, useState } from "react";
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

/** AI answer with Listen (text-to-speech), Copy and optional Download actions. */
export function AnswerPanel({ text, status, error, downloadName }: AnswerPanelProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const ready = status === "done" && text.length > 0;
  const plain = text.replaceAll("**", "");

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

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
      setTimeout(() => setCopied(false), 2000);
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
    <div className="flex flex-col gap-3">
      <AiResponse text={text} status={status} error={error} emptyHint={t("common.answerHint")} />
      {ready && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={toggleSpeak} aria-pressed={speaking} className="btn-subtle">
            {speaking ? t("common.stopListening") : `🔊 ${t("common.listen")}`}
          </button>
          <button type="button" onClick={copy} className="btn-subtle">
            {copied ? `✓ ${t("common.copied")}` : t("common.copy")}
          </button>
          {downloadName && (
            <button type="button" onClick={download} className="btn-subtle">
              {t("common.download")}
            </button>
          )}
          <span role="status" className="sr-only">
            {copied ? t("common.copied") : ""}
          </span>
        </div>
      )}
      {ready && <p className="text-xs text-muted">{t("common.aiNote")}</p>}
    </div>
  );
}
