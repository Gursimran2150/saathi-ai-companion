import { CircleAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleMarkdown } from "./SimpleMarkdown";
import { Skeleton } from "./ui/skeleton";

interface AiResponseProps {
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error: string | null;
  emptyHint?: string;
  label?: string;
  /** Screen-reader text while waiting for the first token. */
  thinkingLabel?: string;
}

const THINKING_LINES = ["w-11/12", "w-full", "w-4/5", "w-3/5"];

/** Shows streamed AI output with thinking, error and empty states, announced to screen readers. */
export function AiResponse({
  text,
  status,
  error,
  emptyHint = "Your answer will appear here.",
  label = "AI response",
  thinkingLabel = "Thinking…",
}: AiResponseProps) {
  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-3xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger"
      >
        <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>{error}</p>
      </div>
    );
  }

  const streaming = status === "streaming";

  return (
    <section
      aria-live="polite"
      aria-busy={streaming}
      aria-label={label}
      className="flex min-h-28 gap-3 rounded-3xl border border-border bg-card p-4 shadow-[0_6px_20px_rgba(0,0,0,0.05)] sm:gap-4 sm:p-5 dark:shadow-none"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-pale text-primary",
          streaming && "motion-safe:animate-pulse",
        )}
      >
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        {text ? (
          <SimpleMarkdown text={text} />
        ) : streaming ? (
          <div className="flex flex-col gap-3 pt-1" data-testid="ai-thinking">
            <span className="sr-only">{thinkingLabel}</span>
            {THINKING_LINES.map((w) => (
              <Skeleton key={w} className={cn("h-3.5 rounded-full", w)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{emptyHint}</p>
        )}
      </div>
    </section>
  );
}
