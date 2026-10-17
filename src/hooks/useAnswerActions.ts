"use client";

import { useCallback, useEffect, useState } from "react";
import { getLanguage, type LanguageCode } from "@/lib/i18n";

/** Strips markdown emphasis so copied and spoken text reads naturally. */
export function toPlainText(markdown: string): string {
  return markdown.replaceAll("**", "");
}

/** Read-aloud toggle using the browser's speech synthesis, in the user's language. */
export function useSpeak(text: string, language: LanguageCode) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const toggle = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(toPlainText(text));
    utterance.lang = getLanguage(language).speechLocale;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  }, [speaking, text, language]);

  return { speaking, toggle };
}

/** Copy-to-clipboard with a short-lived "copied" flag for feedback. */
export function useCopy(text: string, resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetMs);
    return () => clearTimeout(timer);
  }, [copied, resetMs]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(text));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return { copied, copy };
}
