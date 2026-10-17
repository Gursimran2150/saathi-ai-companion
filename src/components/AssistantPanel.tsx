"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { useStreamingText } from "@/hooks/useStreamingText";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation/schemas";
import { AnswerPanel } from "./AnswerPanel";
import { useLanguage } from "./LanguageProvider";
import { MicButton } from "./MicButton";

export function AssistantPanel() {
  const inputId = useId();
  const { language, t } = useLanguage();
  const [message, setMessage] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/chat");

  const appendTranscript = useCallback((s: string) => setMessage((m) => (m ? `${m} ${s}` : s)), []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;
    void run({ message, language });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label htmlFor={inputId} className="field-label">
          {t("home.askLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            required
            className="input"
          />
          <MicButton onTranscript={appendTranscript} />
        </div>
        <div>
          {isStreaming ? (
            <button type="button" onClick={stop} className="btn-secondary">
              {t("common.stop")}
            </button>
          ) : (
            <button type="submit" disabled={!message.trim()} className="btn-primary">
              {t("home.askButton")}
            </button>
          )}
        </div>
      </form>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
    </div>
  );
}
