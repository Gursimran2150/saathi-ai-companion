"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./LanguageProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 5000, keepPreviousData: true }}>
        <LanguageProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </LanguageProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
