"use client";

import { useId } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";
import { compactRupee, formatDate, rupee, type DayTotal } from "./series";

interface WeekChartProps {
  days: DayTotal[];
  today: string;
  locale: string;
}

/**
 * Single-series bar chart of daily take-home. The bars are decorative (aria-hidden);
 * screen readers get the same numbers from the visually hidden table.
 */
export function WeekChart({ days, today, locale }: WeekChartProps) {
  const { t } = useLanguage();
  const captionId = useId();
  const max = Math.max(1, ...days.map((d) => d.net));
  const best = days.reduce((a, b) => (b.net > a.net ? b : a), days[0]);

  return (
    <figure aria-labelledby={captionId} className="flex flex-col gap-3">
      <figcaption id={captionId} className="sr-only">
        {t("earnings.week")}: {t("earnings.net")}
      </figcaption>
      <div aria-hidden="true" className="flex h-48 items-end gap-2 sm:gap-4">
        {days.map((d) => {
          const isToday = d.date === today;
          const labelled = d.net > 0 && (isToday || d === best);
          return (
            <div key={d.date} className="group flex h-full flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  "h-4 text-[0.7rem] font-semibold whitespace-nowrap text-foreground tabular-nums transition-opacity",
                  labelled || d.net === 0 ? "" : "opacity-0 group-hover:opacity-100",
                  d.net === 0 && "invisible",
                )}
              >
                {compactRupee(d.net)}
              </span>
              <div className="flex w-full max-w-11 flex-1 items-end rounded-[4px] bg-surface-muted dark:bg-surface-strong">
                <div
                  className={cn(
                    "w-full rounded-t-[4px] transition-[height] duration-500 motion-reduce:transition-none",
                    isToday ? "bg-primary" : "bg-brand/80 group-hover:bg-brand",
                  )}
                  style={{ height: `${(Math.max(0, d.net) / max) * 100}%` }}
                />
              </div>
              <span
                className={cn("text-xs", isToday ? "font-bold text-foreground" : "font-medium text-muted-foreground")}
              >
                {formatDate(d.date, locale, { weekday: "short" })}
              </span>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">{t("earnings.date")}</th>
            <th scope="col">{t("earnings.net")}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row">{formatDate(d.date, locale, { weekday: "long", day: "numeric", month: "long" })}</th>
              <td>{rupee(d.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
