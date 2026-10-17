import { SimpleMarkdown } from "./SimpleMarkdown";

interface AiResponseProps {
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error: string | null;
  emptyHint?: string;
  label?: string;
}

/** Shows streamed AI output with loading, error and empty states, announced to screen readers. */
export function AiResponse({
  text,
  status,
  error,
  emptyHint = "Your answer will appear here.",
  label = "AI response",
}: AiResponseProps) {
  if (status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <section
      aria-live="polite"
      aria-busy={status === "streaming"}
      aria-label={label}
      className="min-h-32 rounded-3xl bg-surface-muted p-5"
    >
      {text ? (
        <SimpleMarkdown text={text} />
      ) : status === "streaming" ? (
        <p className="animate-pulse text-muted">…</p>
      ) : (
        <p className="text-muted">{emptyHint}</p>
      )}
    </section>
  );
}
