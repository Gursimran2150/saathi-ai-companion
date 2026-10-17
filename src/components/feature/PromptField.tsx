"use client";

import type { ComponentProps } from "react";
import { MicButton } from "@/components/MicButton";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PromptFieldProps extends Omit<ComponentProps<"textarea">, "id" | "value" | "onChange" | "maxLength"> {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  maxLength: number;
  labelClassName?: string;
}

/** Chat-style composer: auto-growing textarea with voice input and a character counter. */
export function PromptField({
  id,
  label,
  value,
  onValueChange,
  maxLength,
  labelClassName,
  className,
  ...props
}: PromptFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={cn("text-sm font-semibold", labelClassName)}>
        {label}
      </Label>
      <div className="relative rounded-3xl border border-input bg-background transition-shadow focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "block max-h-72 min-h-32 w-full resize-none rounded-3xl bg-transparent px-4 pt-3.5 pb-14 text-base leading-relaxed outline-none [field-sizing:content] placeholder:text-muted-foreground",
            className,
          )}
          {...props}
        />
        <div className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2">
          <span aria-hidden="true" className="text-xs tabular-nums text-muted-foreground">
            {value.length}/{maxLength}
          </span>
          <MicButton onTranscript={(s) => onValueChange((value ? `${value} ${s}` : s).slice(0, maxLength))} />
        </div>
      </div>
    </div>
  );
}
