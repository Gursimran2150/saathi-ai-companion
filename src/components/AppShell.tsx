"use client";

import type { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import { SiteHeader } from "./SiteHeader";
import { SosButton } from "./SosButton";

/** Translated page chrome: skip link, header, footer and the SOS button. */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <>
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 pb-28 text-center text-sm text-muted sm:pb-6">
        {t("app.name")} · {t("footer.privacy")} · 112
      </footer>
      <SosButton />
    </>
  );
}
