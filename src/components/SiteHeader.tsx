"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StringKey } from "@/lib/strings";
import { LanguageSelect } from "./LanguageSelect";
import { LargeTextToggle } from "./LargeTextToggle";
import { useLanguage } from "./LanguageProvider";

export const NAV_ITEMS: { href: string; key: StringKey; icon: string }[] = [
  { href: "/", key: "nav.home", icon: "🏠" },
  { href: "/earnings", key: "nav.earnings", icon: "₹" },
  { href: "/rights", key: "nav.rights", icon: "⚖️" },
  { href: "/schemes", key: "nav.schemes", icon: "📜" },
  { href: "/safety", key: "nav.safety", icon: "🛡️" },
  { href: "/documents", key: "nav.documents", icon: "📄" },
  { href: "/grievance", key: "nav.grievance", icon: "✍️" },
];

export function SiteHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="display flex items-center gap-2 text-2xl">
          <span aria-hidden="true" className="inline-block size-7 rounded-full bg-primary" />
          {t("app.name")}
        </Link>
        <div className="flex items-center gap-2">
          <LargeTextToggle />
          <LanguageSelect />
        </div>
      </div>
      <nav aria-label="Main" className="mx-auto max-w-5xl overflow-x-auto px-4 pb-3">
        <ul className="flex gap-2">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-3xl px-4 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
