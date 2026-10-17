"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { MicButton } from "@/components/MicButton";
import { useProfile } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { RIGHTS_TOPICS } from "@/lib/features/requests";

type Topic = (typeof RIGHTS_TOPICS)[number];

export function RightsView() {
  const { t, language } = useLanguage();
  const questionId = useId();
  const [profile] = useProfile();
  const [topic, setTopic] = useState<Topic | undefined>();
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/rights");

  const appendTranscript = useCallback((s: string) => setQuestion((v) => (v ? `${v} ${s}` : s)), []);

  function pickTopic(id: Topic) {
    setTopic(id);
    setQuestion(t(`rights.topic.${id}`));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || isStreaming) return;
    void run({ topic, question, state: profile.state, language });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="card flex flex-col gap-4">
        <fieldset>
          <legend className="field-label">{t("rights.topics")}</legend>
          <div className="flex flex-wrap gap-2">
            {RIGHTS_TOPICS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={topic === id}
                onClick={() => pickTopic(id)}
                className="btn-subtle aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary"
              >
                {t(`rights.topic.${id}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor={questionId} className="field-label">
            {t("rights.question")}
          </label>
          <div className="flex gap-2">
            <textarea
              id={questionId}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("rights.placeholder")}
              maxLength={1000}
              rows={3}
              required
              className="input"
            />
            <MicButton onTranscript={appendTranscript} />
          </div>
        </div>
        <div>
          {isStreaming ? (
            <button type="button" onClick={stop} className="btn-secondary">
              {t("common.stop")}
            </button>
          ) : (
            <button type="submit" disabled={!question.trim()} className="btn-primary">
              ⚖️ {t("rights.ask")}
            </button>
          )}
        </div>
      </form>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
    </div>
  );
}
