"use client";

import { Mic, Square } from "lucide-react";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { getLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

interface MicButtonProps {
  onTranscript: (text: string) => void;
}

/** Voice input for a text field. Renders nothing where the browser lacks speech support. */
export function MicButton({ onTranscript }: MicButtonProps) {
  const { language, t } = useLanguage();
  const { supported, listening, error, start, stop } = useSpeechInput(getLanguage(language).speechLocale, onTranscript);

  if (!supported) return null;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? t("voice.stop") : t("voice.start")}
        className={cn(
          "relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground",
        )}
      >
        {listening && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping motion-reduce:hidden"
          />
        )}
        {listening ? (
          <Square className="relative size-4 fill-current" aria-hidden="true" />
        ) : (
          <Mic className="relative size-5" aria-hidden="true" />
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 bottom-full z-10 mb-2 w-max max-w-60 rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-background shadow-lg"
        >
          {error}
        </p>
      )}
    </span>
  );
}
