"use client";

import { useSpeechInput } from "@/hooks/useSpeechInput";
import { getLanguage } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

interface MicButtonProps {
  onTranscript: (text: string) => void;
}

/** Voice input for a text field. Renders nothing where the browser lacks speech support. */
export function MicButton({ onTranscript }: MicButtonProps) {
  const { language } = useLanguage();
  const { supported, listening, error, start, stop } = useSpeechInput(getLanguage(language).speechLocale, onTranscript);

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:border-danger aria-pressed:text-danger"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
        </svg>
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </>
  );
}
