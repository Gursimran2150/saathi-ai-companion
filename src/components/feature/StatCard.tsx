import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  featured?: boolean;
  className?: string;
}

/** One term/description pair styled as a tile. Render inside a <dl>. */
export function StatCard({ label, value, icon: Icon, featured, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border p-4",
        featured ? "border-transparent bg-primary-pale" : "border-border bg-card",
        className,
      )}
    >
      <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className={cn("size-4", featured && "text-primary")} aria-hidden />}
        {label}
      </dt>
      <dd className={cn("font-bold tracking-tight tabular-nums", featured ? "text-3xl" : "text-xl")}>{value}</dd>
    </div>
  );
}
