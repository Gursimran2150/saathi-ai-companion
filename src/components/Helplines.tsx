"use client";

import { Phone, Siren } from "lucide-react";
import { HELPLINES } from "@/data/helplines";
import { useLanguage } from "./LanguageProvider";

export function Helplines() {
  const { t } = useLanguage();
  return (
    <section
      aria-labelledby="helplines-title"
      className="rounded-3xl border border-border bg-card p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:p-6 dark:shadow-none"
    >
      <h2 id="helplines-title" className="flex items-center gap-3 text-xl font-bold tracking-tight">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger"
        >
          <Siren className="size-5" />
        </span>
        {t("safety.helplines")}
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {HELPLINES.map((h) => (
          <li key={h.number}>
            <a
              href={`tel:${h.number}`}
              className="group flex min-h-14 items-center gap-3 rounded-2xl bg-surface-muted px-4 py-2.5 transition-colors hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-surface-strong dark:hover:bg-surface-pressed"
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
              >
                <Phone className="size-4" />
              </span>
              <span className="min-w-14 text-lg font-bold tabular-nums">{h.number}</span>
              <span className="text-sm leading-snug text-muted-foreground">{h.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
