import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ChoiceChipProps extends Omit<ComponentProps<"button">, "type"> {
  pressed: boolean;
  icon?: LucideIcon;
}

/** Pill toggle (aria-pressed). Selected state inverts to ink so it reads in both themes without relying on colour. */
export function ChoiceChip({ pressed, icon: Icon, className, children, ...props }: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-left text-sm font-medium transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:active:scale-[0.98] aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      {children}
    </button>
  );
}
