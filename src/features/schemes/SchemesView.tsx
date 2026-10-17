"use client";

import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar, SubmitOrStop } from "@/components/feature/ActionBar";
import { ChoiceChip } from "@/components/feature/ChoiceChip";
import { Panel, SectionHeading } from "@/components/feature/Panel";
import { SaveStatus } from "@/components/feature/SaveStatus";
import { FEATURE_CONTAINER, INPUT } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkTypeSelect } from "@/components/WorkTypeSelect";
import { useStreamingText } from "@/hooks/useStreamingText";
import { matchSchemes } from "@/lib/features/schemes";
import type { StringKey } from "@/lib/strings";
import { useProfileEditor } from "../shared/useProfileEditor";

function toNumber(value: string): number | undefined {
  const n = Number(value);
  return value.trim() === "" || Number.isNaN(n) ? undefined : n;
}

export function SchemesView() {
  const { t, language } = useLanguage();
  const ids = { age: useId(), income: useId(), state: useId(), question: useId() };
  const { profile, isLoading, update, isInvalid, saveState } = useProfileEditor();
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/schemes");
  const matched = useMemo(() => matchSchemes(profile), [profile]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isStreaming) return;
    void run({ profile, question: question || undefined, language });
  }

  return (
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <WorkTypeSelect value={profile.workType} onChange={(workType) => update({ workType })} />
              <Field id={ids.age} label={t("schemes.age")}>
                <Input
                  id={ids.age}
                  type="number"
                  inputMode="numeric"
                  min={14}
                  max={100}
                  value={profile.age ?? ""}
                  aria-invalid={isInvalid("age") || undefined}
                  onChange={(e) => update({ age: toNumber(e.target.value) }, { debounce: true })}
                  className={INPUT}
                />
              </Field>
              <Field id={ids.income} label={t("schemes.income")}>
                <Input
                  id={ids.income}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={profile.monthlyIncome ?? ""}
                  aria-invalid={isInvalid("monthlyIncome") || undefined}
                  onChange={(e) => update({ monthlyIncome: toNumber(e.target.value) }, { debounce: true })}
                  className={INPUT}
                />
              </Field>
              <Field id={ids.state} label={t("schemes.state")}>
                <Input
                  id={ids.state}
                  value={profile.state ?? ""}
                  maxLength={60}
                  autoComplete="address-level1"
                  onChange={(e) => update({ state: e.target.value || undefined }, { debounce: true })}
                  className={INPUT}
                />
              </Field>
              <YesNo
                label="schemes.taxpayer"
                value={profile.isTaxpayer}
                onChange={(isTaxpayer) => update({ isTaxpayer })}
              />
              <YesNo
                label="schemes.epfo"
                value={profile.hasEpfoEsic}
                onChange={(hasEpfoEsic) => update({ hasEpfoEsic })}
              />
            </div>
          )}
          <SaveStatus state={saveState} />
          <Field id={ids.question} label={t("schemes.question")}>
            <Input
              id={ids.question}
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              className={INPUT}
            />
          </Field>
          <ActionBar>
            <SubmitOrStop streaming={isStreaming} onStop={stop} disabled={isLoading} icon={Sparkles}>
              {t("schemes.find")}
            </SubmitOrStop>
          </ActionBar>
        </form>
      </Panel>

      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}

      <section aria-labelledby="matched-title" className="flex flex-col gap-4">
        <SectionHeading
          id="matched-title"
          icon={Landmark}
          trailing={
            <Badge variant="secondary" className="h-7 rounded-full px-3 text-sm tabular-nums" aria-hidden="true">
              {matched.length}
            </Badge>
          }
        >
          {t("schemes.matched")}
          <span className="sr-only"> ({matched.length})</span>
        </SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2">
          {matched.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(0,0,0,0.1)] dark:shadow-none"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-pale text-primary"
                >
                  <Landmark className="size-5" />
                </span>
                <h3 className="pt-1.5 text-lg leading-snug font-semibold">{s.name}</h3>
              </div>
              <p className="text-muted-foreground">{s.benefits}</p>
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("schemes.apply")}
                <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only"> {t("common.newTab")}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: StringKey;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  const { t } = useLanguage();
  const options: { v: boolean | undefined; key: StringKey }[] = [
    { v: false, key: "common.no" },
    { v: true, key: "common.yes" },
    { v: undefined, key: "common.unknown" },
  ];
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{t(label)}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <ChoiceChip key={o.key} pressed={value === o.v} onClick={() => onChange(o.v)} className="px-5">
            {t(o.key)}
          </ChoiceChip>
        ))}
      </div>
    </fieldset>
  );
}
