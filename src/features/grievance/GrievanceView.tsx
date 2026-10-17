"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { MicButton } from "@/components/MicButton";
import { useEarningsLog } from "@/hooks/useAppData";
import { useDocumentHandoff } from "@/hooks/useHandoff";
import { useStreamingText } from "@/hooks/useStreamingText";
import { useToday } from "@/hooks/useToday";
import { daysAgo, formatLogForPrompt } from "@/lib/features/earnings";
import { GRIEVANCE_TYPES } from "@/lib/features/requests";

type IssueType = (typeof GRIEVANCE_TYPES)[number];

export function GrievanceView() {
  const { t, language } = useLanguage();
  const ids = { type: useId(), against: useId(), details: useId(), name: useId(), attach: useId() };
  const [log] = useEarningsLog();
  const [documentEvidence, setDocumentEvidence] = useDocumentHandoff();
  const [issueType, setIssueType] = useState<IssueType>("unpaid_payout");
  const [against, setAgainst] = useState("");
  const [details, setDetails] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [attach, setAttach] = useState(true);
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/grievance");

  const today = useToday();
  const since = today ? daysAgo(29, new Date(`${today}T12:00:00`)) : null;
  const recent = since ? log.filter((e) => e.date >= since) : [];
  const appendTranscript = useCallback((s: string) => setDetails((v) => (v ? `${v} ${s}` : s)), []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!against.trim() || !details.trim() || isStreaming) return;
    void run({
      issueType,
      against,
      details,
      workerName: workerName || undefined,
      earningsEvidence: attach && recent.length ? formatLogForPrompt(recent, 30).slice(0, 4000) : undefined,
      documentEvidence: documentEvidence || undefined,
      language,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="card grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.type} className="field-label">
            {t("grievance.type")}
          </label>
          <select
            id={ids.type}
            value={issueType}
            onChange={(e) => {
              const v = GRIEVANCE_TYPES.find((g) => g === e.target.value);
              if (v) setIssueType(v);
            }}
            className="input"
          >
            {GRIEVANCE_TYPES.map((g) => (
              <option key={g} value={g}>
                {t(`issue.${g}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.against} className="field-label">
            {t("grievance.against")}
          </label>
          <input
            id={ids.against}
            value={against}
            maxLength={100}
            required
            onChange={(e) => setAgainst(e.target.value)}
            placeholder="Swiggy / Zomato / Uber / Contractor"
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={ids.details} className="field-label">
            {t("grievance.details")}
          </label>
          <div className="flex gap-2">
            <textarea
              id={ids.details}
              value={details}
              maxLength={2000}
              rows={4}
              required
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("grievance.detailsPlaceholder")}
              className="input"
            />
            <MicButton onTranscript={appendTranscript} />
          </div>
        </div>
        <div>
          <label htmlFor={ids.name} className="field-label">
            {t("grievance.name")}
          </label>
          <input
            id={ids.name}
            value={workerName}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setWorkerName(e.target.value)}
            className="input"
          />
        </div>
        {recent.length > 0 && (
          <div className="flex items-center gap-3 self-end">
            <input
              id={ids.attach}
              type="checkbox"
              checked={attach}
              onChange={(e) => setAttach(e.target.checked)}
              className="size-5 accent-foreground"
            />
            <label htmlFor={ids.attach}>
              {t("grievance.attach")} ({recent.length})
            </label>
          </div>
        )}
        {documentEvidence && (
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-primary-pale p-4 sm:col-span-2">
            <div>
              <p className="font-semibold">📄 {t("grievance.docAttached")}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{documentEvidence.replaceAll("*", "")}</p>
            </div>
            <button type="button" onClick={() => setDocumentEvidence("")} className="btn-subtle">
              {t("grievance.removeDoc")}
            </button>
          </div>
        )}
        <div className="sm:col-span-2">
          {isStreaming ? (
            <button type="button" onClick={stop} className="btn-secondary">
              {t("common.stop")}
            </button>
          ) : (
            <button type="submit" disabled={!against.trim() || !details.trim()} className="btn-primary">
              ✍️ {t("grievance.draft")}
            </button>
          )}
        </div>
      </form>
      {status !== "idle" && (
        <AnswerPanel text={text} status={status} error={error} downloadName="complaint-letter.txt" />
      )}
    </div>
  );
}
