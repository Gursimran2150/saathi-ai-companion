"use client";

import {
  Ban,
  CircleHelp,
  FileText,
  HandCoins,
  HeartPulse,
  PenLine,
  ShieldAlert,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useId, useMemo, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar, SubmitOrStop } from "@/components/feature/ActionBar";
import { ChoiceChip } from "@/components/feature/ChoiceChip";
import { Panel } from "@/components/feature/Panel";
import { PromptField } from "@/components/feature/PromptField";
import { FEATURE_CONTAINER, INPUT } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEarnings } from "@/hooks/useAppData";
import { useDocumentHandoff } from "@/hooks/useHandoff";
import { useStreamingText } from "@/hooks/useStreamingText";
import { useToday } from "@/hooks/useToday";
import { daysAgo } from "@/lib/features/earnings";
import { GRIEVANCE_TYPES } from "@/lib/features/requests";

type IssueType = (typeof GRIEVANCE_TYPES)[number];

const ISSUE_ICONS: Record<IssueType, LucideIcon> = {
  unpaid_payout: WalletCards,
  account_deactivation: Ban,
  accident_or_injury: HeartPulse,
  wage_theft: HandCoins,
  harassment: ShieldAlert,
  other: CircleHelp,
};

export function GrievanceView() {
  const { t, language } = useLanguage();
  const ids = { against: useId(), details: useId(), name: useId(), attach: useId() };
  const { entries } = useEarnings();
  const [documentEvidence, setDocumentEvidence] = useDocumentHandoff();
  const [issueType, setIssueType] = useState<IssueType>("unpaid_payout");
  const [against, setAgainst] = useState("");
  const [details, setDetails] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [attach, setAttach] = useState(true);
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/grievance");

  // Only the count is needed here: the server loads the last 30 days itself when attachEarnings is true.
  const today = useToday();
  const recentCount = useMemo(() => {
    if (!today) return 0;
    const since = daysAgo(29, new Date(`${today}T12:00:00`));
    return entries.filter((e) => e.date >= since).length;
  }, [entries, today]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!against.trim() || !details.trim() || isStreaming) return;
    void run({
      issueType,
      against,
      details,
      workerName: workerName || undefined,
      attachEarnings: attach && recentCount > 0,
      documentEvidence: documentEvidence || undefined,
      language,
    });
  }

  return (
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">{t("grievance.type")}</legend>
            <div className="flex flex-wrap gap-2">
              {GRIEVANCE_TYPES.map((g) => (
                <ChoiceChip key={g} icon={ISSUE_ICONS[g]} pressed={issueType === g} onClick={() => setIssueType(g)}>
                  {t(`issue.${g}`)}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.against} className="text-sm font-semibold">
                {t("grievance.against")}
              </Label>
              <Input
                id={ids.against}
                value={against}
                maxLength={100}
                required
                onChange={(e) => setAgainst(e.target.value)}
                placeholder={t("grievance.againstPlaceholder")}
                className={INPUT}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.name} className="text-sm font-semibold">
                {t("grievance.name")}
              </Label>
              <Input
                id={ids.name}
                value={workerName}
                maxLength={80}
                autoComplete="name"
                onChange={(e) => setWorkerName(e.target.value)}
                className={INPUT}
              />
            </div>
          </div>

          <PromptField
            id={ids.details}
            label={t("grievance.details")}
            value={details}
            onValueChange={setDetails}
            placeholder={t("grievance.detailsPlaceholder")}
            maxLength={2000}
            rows={4}
            required
          />

          {recentCount > 0 && (
            <label
              htmlFor={ids.attach}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 transition-colors hover:border-foreground has-[:checked]:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <input
                id={ids.attach}
                type="checkbox"
                checked={attach}
                onChange={(e) => setAttach(e.target.checked)}
                className="size-5 shrink-0 cursor-pointer accent-primary"
              />
              <span className="flex-1 text-sm font-medium">
                {t("grievance.attach")} ({recentCount})
              </span>
            </label>
          )}

          {documentEvidence && (
            <div className="flex items-start gap-3 rounded-2xl bg-primary-pale p-4">
              <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{t("grievance.docAttached")}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {documentEvidence.replaceAll("*", "")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDocumentEvidence("")}
                className="h-11 shrink-0 gap-1.5 rounded-full px-3"
              >
                <X className="size-4" aria-hidden />
                {t("grievance.removeDoc")}
              </Button>
            </div>
          )}

          <ActionBar>
            <SubmitOrStop
              streaming={isStreaming}
              onStop={stop}
              disabled={!against.trim() || !details.trim()}
              icon={PenLine}
            >
              {t("grievance.draft")}
            </SubmitOrStop>
          </ActionBar>
        </form>
      </Panel>
      {status !== "idle" && (
        <AnswerPanel text={text} status={status} error={error} downloadName="complaint-letter.txt" />
      )}
    </div>
  );
}
