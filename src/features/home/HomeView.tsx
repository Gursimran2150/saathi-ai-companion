"use client";

import Link from "next/link";
import { AssistantPanel } from "@/components/AssistantPanel";
import { Helplines } from "@/components/Helplines";
import { useLanguage } from "@/components/LanguageProvider";
import { useEarningsLog } from "@/hooks/useAppData";
import { useToday } from "@/hooks/useToday";
import { daysAgo, summarize } from "@/lib/features/earnings";
import type { StringKey } from "@/lib/strings";

const TOOLS: { href: string; title: StringKey; desc: StringKey; icon: string; tone: string }[] = [
  { href: "/earnings", title: "earnings.title", desc: "earnings.desc", icon: "₹", tone: "bg-primary-pale" },
  { href: "/rights", title: "rights.title", desc: "rights.desc", icon: "⚖️", tone: "bg-surface-muted" },
  { href: "/schemes", title: "schemes.title", desc: "schemes.desc", icon: "📜", tone: "bg-surface-muted" },
  { href: "/safety", title: "safety.title", desc: "safety.desc", icon: "🛡️", tone: "bg-primary-pale" },
  { href: "/documents", title: "documents.title", desc: "documents.desc", icon: "📄", tone: "bg-primary-pale" },
  { href: "/grievance", title: "grievance.title", desc: "grievance.desc", icon: "✍️", tone: "bg-surface-muted" },
];

const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function HomeView() {
  const { t } = useLanguage();
  const [log] = useEarningsLog();
  const today = useToday();
  const week = today ? summarize(log, daysAgo(6, new Date(`${today}T12:00:00`))) : null;

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-[2rem] bg-foreground px-6 py-10 text-background sm:px-10">
        <h1 className="display text-5xl text-primary sm:text-6xl">{t("app.name")}</h1>
        <p className="mt-3 max-w-2xl text-lg opacity-90">{t("app.tagline")}</p>
        <div className="mt-8 rounded-3xl bg-background/10 p-5">
          <p className="text-sm opacity-80">{t("home.weekTakeHome")}</p>
          {week && week.days > 0 ? (
            <p className="display mt-1 text-4xl tabular-nums text-primary">{rupee(week.net)}</p>
          ) : (
            <p className="mt-1 text-lg">{t("home.noEntries")}</p>
          )}
          <Link href="/earnings" className="btn-primary mt-4">
            🎙️ {t("home.addEntry")}
          </Link>
        </div>
      </section>

      <section aria-labelledby="ask-title" className="card">
        <h2 id="ask-title" className="display mb-4 text-2xl">
          {t("home.askTitle")}
        </h2>
        <AssistantPanel />
      </section>

      <section aria-labelledby="tools-title">
        <h2 id="tools-title" className="display mb-4 text-3xl">
          {t("home.toolsTitle")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className={`flex h-full flex-col gap-2 rounded-3xl p-6 transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${tool.tone}`}
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-background text-2xl"
                >
                  {tool.icon}
                </span>
                <span className="display text-xl">{t(tool.title)}</span>
                <span className="text-muted">{t(tool.desc)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Helplines />
    </div>
  );
}
