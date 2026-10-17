"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { MicButton } from "@/components/MicButton";
import { useEarningsLog } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { useToday } from "@/hooks/useToday";
import {
  byPlatform,
  daysAgo,
  netEarning,
  summarize,
  totalExpenses,
  type EarningEntry,
  type ExtractedEarning,
} from "@/lib/features/earnings";

const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function EarningsView() {
  const { t, language } = useLanguage();
  const inputId = useId();
  const [log, setLog] = useEarningsLog();
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<ExtractedEarning | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const insights = useStreamingText("/api/earnings/insights");

  const appendTranscript = useCallback((s: string) => setNote((n) => (n ? `${n} ${s}` : s)), []);
  const today = useToday();
  const ref = today ? new Date(`${today}T12:00:00`) : undefined;
  const week = summarize(today ? log : [], ref && daysAgo(6, ref));

  async function onParse(e: FormEvent) {
    e.preventDefault();
    if (!note.trim() || !today) return;
    setParsing(true);
    setParseError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/earnings/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note, today, language }),
      });
      const data = (await res.json()) as { entry?: ExtractedEarning; error?: string };
      if (!res.ok || !data.entry) throw new Error(data.error ?? "Could not read the note.");
      setDraft(data.entry);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Could not read the note.");
    } finally {
      setParsing(false);
    }
  }

  function saveDraft() {
    if (!draft) return;
    const entry: EarningEntry = { ...draft, id: crypto.randomUUID() };
    setLog([entry, ...log].slice(0, 500));
    setDraft(null);
    setNote("");
  }

  function remove(id: string) {
    setLog(log.filter((e) => e.id !== id));
  }

  const lastSeven = Array.from({ length: ref ? 7 : 0 }, (_, i) => {
    const date = daysAgo(6 - i, ref);
    const net = log.filter((e) => e.date === date).reduce((s, e) => s + netEarning(e), 0);
    return { date, net };
  });
  const platforms = byPlatform(log);
  const maxNet = Math.max(1, ...lastSeven.map((d) => d.net));

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onParse} className="card flex flex-col gap-3">
        <label htmlFor={inputId} className="field-label text-lg">
          {t("earnings.inputLabel")}
        </label>
        <div className="flex gap-2">
          <textarea
            id={inputId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("earnings.placeholder")}
            maxLength={1000}
            rows={3}
            required
            className="input"
          />
          <MicButton onTranscript={appendTranscript} />
        </div>
        <div>
          <button type="submit" disabled={!note.trim() || parsing} className="btn-primary">
            {parsing ? t("earnings.reading") : t("earnings.read")}
          </button>
        </div>
        {parseError && (
          <p role="alert" className="text-danger">
            {parseError}
          </p>
        )}
      </form>

      {draft && (
        <section aria-labelledby="draft-title" aria-live="polite" className="card border-foreground">
          <h2 id="draft-title" className="text-xl font-bold">
            {t("earnings.confirm")}
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Date" value={draft.date} />
            <Stat label="Platform" value={draft.platform ?? "-"} />
            <Stat label="Trips" value={draft.trips?.toString() ?? "-"} />
            <Stat label="Hours" value={draft.hours?.toString() ?? "-"} />
            <Stat label={t("earnings.gross")} value={rupee(draft.gross)} />
            <Stat label={t("earnings.expenses")} value={rupee(totalExpenses(draft))} />
            <Stat label={t("earnings.net")} value={rupee(netEarning(draft))} strong />
          </dl>
          {draft.expenses.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              {draft.expenses.map((x) => `${x.label}: ${rupee(x.amount)}`).join(" · ")}
            </p>
          )}
          {draft.note && <p className="mt-2 text-sm">{draft.note}</p>}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={saveDraft} className="btn-primary">
              {t("earnings.save")}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary">
              {t("earnings.discard")}
            </button>
          </div>
        </section>
      )}

      <section aria-labelledby="week-title">
        <h2 id="week-title" className="display mb-4 text-2xl">
          {t("earnings.week")}
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t("earnings.net")} value={rupee(week.net)} strong boxed />
          <Stat label={t("earnings.gross")} value={rupee(week.gross)} boxed />
          <Stat label={t("earnings.expenses")} value={rupee(week.expenses)} boxed />
          <Stat
            label={t("earnings.perHour")}
            value={week.avgNetPerHour === null ? "-" : rupee(week.avgNetPerHour)}
            boxed
          />
        </dl>
        <figure className="mt-4 rounded-2xl bg-surface-muted p-4">
          <figcaption className="sr-only">Take-home per day, last 7 days</figcaption>
          <div className="flex h-36 items-end gap-2" aria-hidden="true">
            {lastSeven.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums text-muted">{d.net ? rupee(d.net) : ""}</span>
                <div
                  className="w-full rounded-t-md bg-foreground"
                  style={{ height: `${Math.max(2, (Math.max(0, d.net) / maxNet) * 100)}px` }}
                />
                <span className="text-xs text-muted">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
          <table className="sr-only">
            <tbody>
              {lastSeven.map((d) => (
                <tr key={d.date}>
                  <th scope="row">{d.date}</th>
                  <td>{rupee(d.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <button
              type="button"
              disabled={log.length === 0 || !today || insights.isStreaming}
              onClick={() => today && void insights.run({ entries: log, today, language })}
              className="btn-primary"
            >
              ✨ {t("earnings.insights")}
            </button>
          </div>
          {insights.status !== "idle" && (
            <AnswerPanel text={insights.text} status={insights.status} error={insights.error} />
          )}
        </div>
      </section>

      {platforms.length > 1 && (
        <section aria-labelledby="platform-title">
          <h2 id="platform-title" className="display mb-4 text-2xl">
            {t("earnings.byPlatform")}
          </h2>
          <div className="overflow-x-auto rounded-3xl bg-surface-muted">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-sm text-muted">
                  <th scope="col" className="p-4">
                    {t("earnings.platform")}
                  </th>
                  <th scope="col" className="p-4">
                    {t("earnings.net")}
                  </th>
                  <th scope="col" className="p-4">
                    {t("earnings.perTrip")}
                  </th>
                  <th scope="col" className="p-4">
                    {t("earnings.perHour")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p, i) => (
                  <tr key={p.platform} className="border-b border-border last:border-0">
                    <th scope="row" className="p-4 font-semibold">
                      {i === 0 && p.netPerHour !== null ? "🏆 " : ""}
                      {p.platform}
                    </th>
                    <td className="p-4 tabular-nums">{rupee(p.net)}</td>
                    <td className="p-4 tabular-nums">{p.netPerTrip === null ? "-" : rupee(p.netPerTrip)}</td>
                    <td className="p-4 tabular-nums">{p.netPerHour === null ? "-" : rupee(p.netPerHour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section aria-labelledby="log-title">
        <h2 id="log-title" className="display mb-4 text-2xl">
          {t("earnings.log")}
        </h2>
        {log.length === 0 ? (
          <p className="text-muted">{t("earnings.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...log]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {e.date} · {e.platform ?? "-"}
                      {e.trips !== null && ` · ${e.trips} trips`}
                    </p>
                    <p className="text-sm text-muted">
                      {rupee(e.gross)} − {rupee(totalExpenses(e))} ={" "}
                      <strong className="text-foreground">{rupee(netEarning(e))}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    aria-label={`${t("earnings.delete")} ${e.date}`}
                    className="btn-subtle"
                  >
                    {t("earnings.delete")}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, strong, boxed }: { label: string; value: string; strong?: boolean; boxed?: boolean }) {
  return (
    <div className={boxed ? "rounded-2xl bg-surface-muted p-4" : undefined}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-2xl font-bold" : "text-lg font-medium"}`}>{value}</dd>
    </div>
  );
}
