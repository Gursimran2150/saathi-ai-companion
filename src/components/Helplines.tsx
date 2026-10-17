"use client";

import { HELPLINES } from "@/data/helplines";
import { useLanguage } from "./LanguageProvider";

export function Helplines() {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="helplines-title" className="rounded-3xl bg-ink-deep p-6 text-white">
      <h2 id="helplines-title" className="text-xl font-bold">
        {t("safety.helplines")}
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {HELPLINES.map((h) => (
          <li key={h.number}>
            <a
              href={`tel:${h.number}`}
              className="flex min-h-12 items-center gap-3 rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="text-xl font-bold tabular-nums">{h.number}</span>
              <span className="text-sm">{h.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
