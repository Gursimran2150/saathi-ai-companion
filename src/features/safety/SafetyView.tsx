"use client";

import { CarFront, CloudRain, KeyRound, MoonStar, ShieldAlert, ShieldCheck, Sun, type LucideIcon } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar, SubmitOrStop } from "@/components/feature/ActionBar";
import { ChoiceChip } from "@/components/feature/ChoiceChip";
import { Panel } from "@/components/feature/Panel";
import { PromptField } from "@/components/feature/PromptField";
import { SaveStatus } from "@/components/feature/SaveStatus";
import { FEATURE_CONTAINER } from "@/components/feature/styles";
import { Helplines } from "@/components/Helplines";
import { useLanguage } from "@/components/LanguageProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkTypeSelect } from "@/components/WorkTypeSelect";
import { useStreamingText } from "@/hooks/useStreamingText";
import type { StringKey } from "@/lib/strings";
import { useProfileEditor } from "../shared/useProfileEditor";

const QUICK_SITUATIONS: readonly { key: StringKey; icon: LucideIcon }[] = [
  { key: "safety.q.night", icon: MoonStar },
  { key: "safety.q.rain", icon: CloudRain },
  { key: "safety.q.heat", icon: Sun },
  { key: "safety.q.abuse", icon: ShieldAlert },
  { key: "safety.q.accident", icon: CarFront },
  { key: "safety.q.otp", icon: KeyRound },
];

export function SafetyView() {
  const { t, language } = useLanguage();
  const situationId = useId();
  const { profile, isLoading, update, saveState } = useProfileEditor();
  const [situation, setSituation] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/safety");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!situation.trim() || isStreaming) return;
    void run({ workType: profile.workType, situation, language });
  }

  return (
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="flex flex-col gap-2" aria-hidden="true">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ) : (
              <WorkTypeSelect value={profile.workType} onChange={(workType) => update({ workType })} />
            )}
            <SaveStatus state={saveState} />
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-semibold">{t("safety.quick")}</legend>
            <div className="flex flex-wrap gap-2">
              {QUICK_SITUATIONS.map(({ key, icon }) => (
                <ChoiceChip key={key} icon={icon} pressed={situation === t(key)} onClick={() => setSituation(t(key))}>
                  {t(key)}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>
          <PromptField
            id={situationId}
            label={t("safety.situation")}
            value={situation}
            onValueChange={setSituation}
            placeholder={t("safety.placeholder")}
            maxLength={1000}
            required
          />
          <ActionBar>
            <SubmitOrStop streaming={isStreaming} onStop={stop} disabled={!situation.trim()} icon={ShieldCheck}>
              {t("safety.get")}
            </SubmitOrStop>
          </ActionBar>
        </form>
      </Panel>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
      <Helplines />
    </div>
  );
}
