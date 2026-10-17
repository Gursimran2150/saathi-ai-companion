"use client";

import { Trophy } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { PlatformStats } from "@/lib/features/earnings";
import { rupee } from "./series";

/** Compares apps by take-home; rows arrive sorted best net-per-hour first. */
export function PlatformTable({ platforms }: { platforms: PlatformStats[] }) {
  const { t } = useLanguage();
  const dash = (n: number | null) => (n === null ? "–" : rupee(n));
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm sm:text-base">
        <thead>
          <tr className="border-b border-border text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="px-3 py-3">
              {t("earnings.platform")}
            </th>
            <th scope="col" className="px-3 py-3 text-right">
              {t("earnings.net")}
            </th>
            <th scope="col" className="px-3 py-3 text-right">
              {t("earnings.perTrip")}
            </th>
            <th scope="col" className="px-3 py-3 text-right">
              {t("earnings.perHour")}
            </th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p, i) => {
            const top = i === 0 && p.netPerHour !== null;
            return (
              <tr key={p.platform} className="border-b border-border last:border-0">
                <th scope="row" className="px-3 py-3.5 font-semibold">
                  <span className="flex items-center gap-2">
                    {top ? (
                      <Trophy className="size-4 text-primary" aria-hidden />
                    ) : (
                      <span className="size-4" aria-hidden />
                    )}
                    {p.platform}
                  </span>
                </th>
                <td className="px-3 py-3.5 text-right font-semibold tabular-nums">{rupee(p.net)}</td>
                <td className="px-3 py-3.5 text-right tabular-nums">{dash(p.netPerTrip)}</td>
                <td className="px-3 py-3.5 text-right tabular-nums">{dash(p.netPerHour)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
