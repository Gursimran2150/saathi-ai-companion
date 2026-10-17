"use client";

import { Ban, Gavel, HandCoins, HeartPulse, Scale, ShieldAlert, Smartphone, type LucideIcon } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar, SubmitOrStop } from "@/components/feature/ActionBar";
import { ChoiceChip } from "@/components/feature/ChoiceChip";
import { Panel } from "@/components/feature/Panel";
import { PromptField } from "@/components/feature/PromptField";
import { FEATURE_CONTAINER } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { RIGHTS_TOPICS } from "@/lib/features/requests";

type Topic = (typeof RIGHTS_TOPICS)[number];

const TOPIC_ICONS: Record<Topic, LucideIcon> = {
  deactivation: Ban,
  wages: HandCoins,
  accident: HeartPulse,
  harassment: ShieldAlert,
  fraud: Smartphone,
  legalAid: Gavel,
};

export function RightsView() {
  const { t, language } = useLanguage();
  const questionId = useId();
  const { profile } = useProfile();
  const [topic, setTopic] = useState<Topic | undefined>();
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/rights");

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
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">{t("rights.topics")}</legend>
            <div className="flex flex-wrap gap-2">
              {RIGHTS_TOPICS.map((id) => (
                <ChoiceChip key={id} icon={TOPIC_ICONS[id]} pressed={topic === id} onClick={() => pickTopic(id)}>
                  {t(`rights.topic.${id}`)}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>
          <PromptField
            id={questionId}
            label={t("rights.question")}
            value={question}
            onValueChange={setQuestion}
            placeholder={t("rights.placeholder")}
            maxLength={1000}
            required
          />
          <ActionBar>
            <SubmitOrStop streaming={isStreaming} onStop={stop} disabled={!question.trim()} icon={Scale}>
              {t("rights.ask")}
            </SubmitOrStop>
          </ActionBar>
        </form>
      </Panel>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
    </div>
  );
}
