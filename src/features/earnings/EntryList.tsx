"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { netEarning, totalExpenses, type EarningEntry } from "@/lib/features/earnings";
import { formatDate, rupee } from "./series";

interface EntryListProps {
  entries: EarningEntry[];
  locale: string;
  onRemove: (id: string) => Promise<void>;
}

export function EntryList({ entries, locale, onRemove }: EntryListProps) {
  const { t } = useLanguage();
  const [removing, setRemoving] = useState<string | null>(null);

  async function remove(id: string) {
    setRemoving(id);
    try {
      await onRemove(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {entries.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-pale text-base font-bold text-foreground"
          >
            {(e.platform ?? "–").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {e.platform ?? "–"}
              <span className="font-normal text-muted-foreground">
                {" · "}
                {formatDate(e.date, locale, { weekday: "short", day: "numeric", month: "short" })}
                {e.trips !== null && ` · ${e.trips} ${t("earnings.trips").toLowerCase()}`}
              </span>
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {rupee(e.gross)} − {rupee(totalExpenses(e))}
            </p>
          </div>
          <p className="text-right text-lg font-bold tabular-nums">{rupee(netEarning(e))}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void remove(e.id)}
            disabled={removing === e.id}
            aria-label={`${t("earnings.delete")} ${e.date}`}
            className="size-11 rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-5" aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
