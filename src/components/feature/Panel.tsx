import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Soft, rounded surface (Airbnb card). `overflow-visible` lets a sticky ActionBar inside it stick to the viewport. */
export function Panel({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "gap-5 overflow-visible rounded-3xl border border-border p-5 text-base ring-0 shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:p-6 dark:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

/** Section heading with an optional icon and trailing slot (e.g. a status chip). */
export function SectionHeading({
  id,
  icon: Icon,
  children,
  trailing,
}: {
  id: string;
  icon?: LucideIcon;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
        {Icon && <Icon className="size-5 text-primary" aria-hidden />}
        {children}
      </h2>
      {trailing}
    </div>
  );
}
