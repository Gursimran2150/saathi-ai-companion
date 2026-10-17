"use client";

import { ChevronDown, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLanguage, isLanguageCode, LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

/** Language picker: native script names, with the English name as a hint for helpers and evaluators. */
export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  const current = getLanguage(language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-full px-4 text-sm font-medium"
          aria-label={`Language: ${current.label}`}
        >
          <Languages className="size-4 text-muted-foreground" aria-hidden="true" />
          {current.nativeLabel}
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-56 rounded-2xl p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
      >
        {/* Kept in English on purpose: someone stuck in an unfamiliar language can still find this control. */}
        <DropdownMenuLabel className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={language} onValueChange={(v) => isLanguageCode(v) && setLanguage(v)}>
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem
              key={l.code}
              value={l.code}
              lang={l.code}
              className="min-h-11 cursor-pointer rounded-xl py-2 pl-3 pr-9"
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="text-[0.95rem] font-medium">{l.nativeLabel}</span>
                {l.code !== "en" && <span className="text-xs text-muted-foreground">{l.label}</span>}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
