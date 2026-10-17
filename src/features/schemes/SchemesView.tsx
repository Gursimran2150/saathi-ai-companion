"use client";

import { useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { WorkTypeSelect } from "@/components/WorkTypeSelect";
import { useProfile } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { matchSchemes } from "@/lib/features/schemes";
import type { Profile } from "@/lib/profile";
import type { StringKey } from "@/lib/strings";

function toNumber(value: string): number | undefined {
  const n = Number(value);
  return value.trim() === "" || Number.isNaN(n) ? undefined : n;
}

export function SchemesView() {
  const { t, language } = useLanguage();
  const ids = { age: useId(), income: useId(), state: useId(), question: useId() };
  const [profile, setProfile] = useProfile();
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/schemes");
  const matched = matchSchemes(profile);

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isStreaming) return;
    void run({ profile, question: question || undefined, language });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="card grid gap-4 sm:grid-cols-2">
        <WorkTypeSelect value={profile.workType} onChange={(workType) => update({ workType })} />
        <div>
          <label htmlFor={ids.age} className="field-label">
            {t("schemes.age")}
          </label>
          <input
            id={ids.age}
            type="number"
            inputMode="numeric"
            min={14}
            max={100}
            value={profile.age ?? ""}
            onChange={(e) => update({ age: toNumber(e.target.value) })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor={ids.income} className="field-label">
            {t("schemes.income")}
          </label>
          <input
            id={ids.income}
            type="number"
            inputMode="numeric"
            min={0}
            value={profile.monthlyIncome ?? ""}
            onChange={(e) => update({ monthlyIncome: toNumber(e.target.value) })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor={ids.state} className="field-label">
            {t("schemes.state")}
          </label>
          <input
            id={ids.state}
            value={profile.state ?? ""}
            maxLength={60}
            onChange={(e) => update({ state: e.target.value || undefined })}
            className="input"
          />
        </div>
        <YesNo label="schemes.taxpayer" value={profile.isTaxpayer} onChange={(isTaxpayer) => update({ isTaxpayer })} />
        <YesNo label="schemes.epfo" value={profile.hasEpfoEsic} onChange={(hasEpfoEsic) => update({ hasEpfoEsic })} />
        <div className="sm:col-span-2">
          <label htmlFor={ids.question} className="field-label">
            {t("schemes.question")}
          </label>
          <input
            id={ids.question}
            value={question}
            maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          {isStreaming ? (
            <button type="button" onClick={stop} className="btn-secondary">
              {t("common.stop")}
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              ✨ {t("schemes.find")}
            </button>
          )}
        </div>
      </form>

      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}

      <section aria-labelledby="matched-title">
        <h2 id="matched-title" className="display mb-4 text-2xl">
          {t("schemes.matched")} ({matched.length})
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {matched.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-5">
              <h3 className="text-lg font-bold">{s.name}</h3>
              <p className="text-muted">{s.benefits}</p>
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto self-start font-medium underline underline-offset-4"
              >
                {t("schemes.apply")} ↗<span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
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
      <legend className="field-label">{t(label)}</legend>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            className="btn-subtle aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary"
          >
            {t(o.key)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
