"use client";

import { BarChart3, Clock, LoaderCircle, Receipt, ScanText, Sparkles, Square, TrendingUp, Wallet } from "lucide-react";
import { useId, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar } from "@/components/feature/ActionBar";
import { Panel, SectionHeading } from "@/components/feature/Panel";
import { PromptField } from "@/components/feature/PromptField";
import { StatCard } from "@/components/feature/StatCard";
import { FEATURE_CONTAINER, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEarnings } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { useToday } from "@/hooks/useToday";
import { api } from "@/lib/api-client";
import { byPlatform, daysAgo, summarize, type ExtractedEarning } from "@/lib/features/earnings";
import { getLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DraftCard } from "./DraftCard";
import { EntryList } from "./EntryList";
import { PlatformTable } from "./PlatformTable";
import { dailyNet, rupee } from "./series";
import { WeekChart } from "./WeekChart";

export function EarningsView() {
  const { t, language } = useLanguage();
  const locale = getLanguage(language).speechLocale;
  const inputId = useId();
  const { entries, isLoading, add, remove } = useEarnings();
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<ExtractedEarning | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const insights = useStreamingText("/api/earnings/insights");
  const today = useToday();

  // Derived views of the log, recomputed only when the entries change.
  const stats = useMemo(() => {
    if (!today) return null;
    return {
      week: summarize(entries, daysAgo(6, new Date(`${today}T12:00:00`))),
      days: dailyNet(entries, today),
      platforms: byPlatform(entries),
      sorted: [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [entries, today]);

  async function onParse(e: FormEvent) {
    e.preventDefault();
    if (!note.trim() || !today || parsing) return;
    setParsing(true);
    setParseError(null);
    setDraft(null);
    try {
      const { entry } = await api.post<{ entry: ExtractedEarning }>("/api/earnings/parse", {
        text: note,
        today,
        language,
      });
      setDraft(entry);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : t("toast.error"));
    } finally {
      setParsing(false);
    }
  }

  async function saveDraft() {
    if (!draft || saving) return;
    setSaving(true);
    try {
      await add(draft);
      toast.success(t("toast.saved"));
      setDraft(null);
      setNote("");
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSaving(false);
    }
  }

  const loading = isLoading || !stats;

  return (
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onParse} className="flex flex-col gap-4">
          <PromptField
            id={inputId}
            label={t("earnings.inputLabel")}
            labelClassName="text-base"
            value={note}
            onValueChange={setNote}
            placeholder={t("earnings.placeholder")}
            maxLength={1000}
            required
          />
          {parseError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {parseError}
            </p>
          )}
          <ActionBar>
            <Button
              type="submit"
              disabled={!note.trim() || parsing || !today}
              className={cn(PRIMARY_BUTTON, "max-sm:flex-1")}
            >
              {parsing ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden /> : <ScanText aria-hidden />}
              {parsing ? t("earnings.reading") : t("earnings.read")}
            </Button>
          </ActionBar>
        </form>
      </Panel>

      {parsing && <DraftSkeleton />}
      {draft && (
        <DraftCard
          draft={draft}
          locale={locale}
          saving={saving}
          onSave={() => void saveDraft()}
          onDiscard={() => setDraft(null)}
        />
      )}

      <section aria-labelledby="week-title" aria-busy={loading} className="flex flex-col gap-4">
        <SectionHeading id="week-title" icon={TrendingUp}>
          {t("earnings.week")}
        </SectionHeading>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                featured
                icon={Wallet}
                label={t("earnings.net")}
                value={rupee(stats.week.net)}
                className="col-span-2 lg:col-span-1"
              />
              <StatCard icon={TrendingUp} label={t("earnings.gross")} value={rupee(stats.week.gross)} />
              <StatCard icon={Receipt} label={t("earnings.expenses")} value={rupee(stats.week.expenses)} />
              <StatCard
                icon={Clock}
                label={t("earnings.perHour")}
                value={stats.week.avgNetPerHour === null ? "–" : rupee(stats.week.avgNetPerHour)}
                className="col-span-2 lg:col-span-1"
              />
            </dl>

            <Panel>
              <Tabs defaultValue="week" className="gap-5">
                {stats.platforms.length > 1 && (
                  <TabsList className="h-12 w-full rounded-full p-1 sm:w-fit">
                    <TabsTrigger value="week" className="h-10 rounded-full px-4 text-sm">
                      <BarChart3 aria-hidden />
                      {t("earnings.week")}
                    </TabsTrigger>
                    <TabsTrigger value="platform" className="h-10 rounded-full px-4 text-sm">
                      <Wallet aria-hidden />
                      {t("earnings.byPlatform")}
                    </TabsTrigger>
                  </TabsList>
                )}
                <TabsContent value="week">
                  {today && <WeekChart days={stats.days} today={today} locale={locale} />}
                </TabsContent>
                {stats.platforms.length > 1 && (
                  <TabsContent value="platform">
                    <PlatformTable platforms={stats.platforms} />
                  </TabsContent>
                )}
              </Tabs>
            </Panel>
          </>
        )}

        <div className="flex flex-col gap-4">
          <div>
            {insights.isStreaming ? (
              <Button type="button" variant="outline" onClick={insights.stop} className={SECONDARY_BUTTON}>
                <Square className="size-4 fill-current" aria-hidden />
                {t("common.stop")}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={entries.length === 0 || !today}
                onClick={() => today && void insights.run({ today, language })}
                className={PRIMARY_BUTTON}
              >
                <Sparkles aria-hidden />
                {t("earnings.insights")}
              </Button>
            )}
          </div>
          {insights.status !== "idle" && (
            <AnswerPanel text={insights.text} status={insights.status} error={insights.error} />
          )}
        </div>
      </section>

      <section aria-labelledby="log-title" aria-busy={loading} className="flex flex-col gap-4">
        <SectionHeading id="log-title" icon={Receipt}>
          {t("earnings.log")}
        </SectionHeading>
        <Panel>
          {loading ? (
            <ListSkeleton />
          ) : stats.sorted.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">{t("earnings.empty")}</p>
          ) : (
            <EntryList entries={stats.sorted} locale={locale} onRemove={remove} />
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="col-span-2 h-24 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="col-span-2 h-24 rounded-2xl lg:col-span-1" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-full" />
            <Skeleton className="h-3 w-1/4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function DraftSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
      <Skeleton className="h-6 w-40 rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
