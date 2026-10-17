"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { netEarning, totalExpenses, type ExtractedEarning } from "@/lib/features/earnings";
import { cn } from "@/lib/utils";
import { formatDate, rupee } from "./series";

interface DraftCardProps {
  draft: ExtractedEarning;
  locale: string;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

/** "Is this correct?" card for what the AI read from the worker's note, before anything is saved. */
export function DraftCard({ draft, locale, saving, onSave, onDiscard }: DraftCardProps) {
  const { t } = useLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus here so keyboard and screen-reader users land on the confirmation.
  useEffect(() => headingRef.current?.focus(), [draft]);

  const rows: [string, string][] = [
    [t("earnings.date"), formatDate(draft.date, locale, { weekday: "short", day: "numeric", month: "short" })],
    [t("earnings.platform"), draft.platform ?? "–"],
    [t("earnings.trips"), draft.trips?.toString() ?? "–"],
    [t("earnings.hours"), draft.hours?.toString() ?? "–"],
  ];

  return (
    <section
      aria-labelledby="draft-title"
      className="flex flex-col gap-5 rounded-3xl border-2 border-primary/70 bg-card p-5 shadow-[0_10px_30px_rgba(224,11,65,0.12)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 sm:p-6 dark:shadow-none"
    >
      <h2
        id="draft-title"
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold tracking-tight outline-none focus-visible:underline"
      >
        {t("earnings.confirm")}
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <Separator />
      <dl className="grid grid-cols-3 gap-3">
        <Money label={t("earnings.gross")} value={rupee(draft.gross)} />
        <Money label={t("earnings.expenses")} value={rupee(totalExpenses(draft))} />
        <Money label={t("earnings.net")} value={rupee(netEarning(draft))} strong />
      </dl>
      {draft.expenses.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {draft.expenses.map((x, i) => (
            <li key={`${x.label}-${i}`}>
              <Badge variant="secondary" className="h-8 rounded-full px-3 text-sm font-medium">
                {x.label}: {rupee(x.amount)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {draft.note && <p className="rounded-2xl bg-surface-muted p-3 text-sm dark:bg-surface-strong">{draft.note}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onSave} disabled={saving} className={cn(PRIMARY_BUTTON, "max-sm:flex-1")}>
          <Check aria-hidden />
          {t("earnings.save")}
        </Button>
        <Button type="button" variant="outline" onClick={onDiscard} className={cn(SECONDARY_BUTTON, "max-sm:flex-1")}>
          <X aria-hidden />
          {t("earnings.discard")}
        </Button>
      </div>
    </section>
  );
}

function Money({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-3", strong ? "bg-primary-pale" : "bg-surface-muted dark:bg-surface-strong")}>
      <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</dt>
      <dd className={cn("font-bold tabular-nums", strong ? "text-xl sm:text-2xl" : "text-lg")}>{value}</dd>
    </div>
  );
}
