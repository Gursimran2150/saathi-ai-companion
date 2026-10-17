"use client";

import type { StringKey } from "@/lib/strings";
import { useLanguage } from "./LanguageProvider";
import { NAV_ITEMS } from "./nav";

/** Page title block; reuses the navigation icon for the feature (e.g. "earnings.title" → nav.earnings). */
export function PageIntro({ title, desc }: { title: StringKey; desc: StringKey }) {
  const { t } = useLanguage();
  const section = title.split(".")[0];
  const Icon = NAV_ITEMS.find((item) => item.key === `nav.${section}`)?.icon;
  return (
    <div className="mx-auto flex w-full max-w-4xl items-start gap-4 px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-8">
      {Icon && (
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-pale text-primary sm:size-14"
        >
          <Icon className="size-6 sm:size-7" />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight sm:text-4xl">{t(title)}</h1>
        <p className="mt-1.5 max-w-2xl text-base text-muted-foreground sm:text-lg">{t(desc)}</p>
      </div>
    </div>
  );
}
