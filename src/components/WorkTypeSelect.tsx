"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { WORK_TYPES, workTypeSchema, type WorkType } from "@/lib/profile";
import { useLanguage } from "./LanguageProvider";

export function WorkTypeSelect({ value, onChange }: { value: WorkType; onChange: (w: WorkType) => void }) {
  const id = useId();
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {t("common.workType")}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => {
            const parsed = workTypeSchema.safeParse(e.target.value);
            if (parsed.success) onChange(parsed.data);
          }}
          className="input cursor-pointer appearance-none pr-11"
        >
          {WORK_TYPES.map((w) => (
            <option key={w} value={w}>
              {t(`work.${w}`)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
