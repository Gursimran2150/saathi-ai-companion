"use client";

import { useId } from "react";
import { WORK_TYPES, workTypeSchema, type WorkType } from "@/lib/profile";
import { useLanguage } from "./LanguageProvider";

export function WorkTypeSelect({ value, onChange }: { value: WorkType; onChange: (w: WorkType) => void }) {
  const id = useId();
  const { t } = useLanguage();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {t("common.workType")}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          const parsed = workTypeSchema.safeParse(e.target.value);
          if (parsed.success) onChange(parsed.data);
        }}
        className="input"
      >
        {WORK_TYPES.map((w) => (
          <option key={w} value={w}>
            {t(`work.${w}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
