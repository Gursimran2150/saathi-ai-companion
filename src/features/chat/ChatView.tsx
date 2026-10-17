"use client";

import { ArrowUp, HandCoins, Landmark, Scale, Sparkles, Square, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { MicButton } from "@/components/MicButton";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshEarnings, useSession } from "@/hooks/useAppData";
import { useStreamingText } from "@/hooks/useStreamingText";
import { useToday } from "@/hooks/useToday";
import { api, fetcher } from "@/lib/api-client";
import type { StringKey } from "@/lib/strings";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation/schemas";
import { MessageActions } from "./MessageActions";

interface Message {
  id: number | string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS: { key: StringKey; icon: typeof Wallet }[] = [
  { key: "chat.suggest.log", icon: HandCoins },
  { key: "chat.suggest.week", icon: Wallet },
  { key: "chat.suggest.schemes", icon: Landmark },
  { key: "chat.suggest.rights", icon: Scale },
];

function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white"
    >
      <Sparkles className="size-4" />
    </span>
  );
}

function ThinkingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col gap-2 pt-1" role="status" aria-label={label}>
      <Skeleton className="h-3.5 w-11/12" />
      <Skeleton className="h-3.5 w-9/12" />
      <Skeleton className="h-3.5 w-6/12" />
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="ml-auto h-11 w-2/3 rounded-3xl" />
      <div className="flex gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-10/12" />
          <Skeleton className="h-3.5 w-7/12" />
        </div>
      </div>
      <Skeleton className="ml-auto h-11 w-1/2 rounded-3xl" />
    </div>
  );
}

/** The home screen: a multi-turn assistant whose tools can save earnings and look up schemes and rights. */
export function ChatView() {
  const { t, language } = useLanguage();
  const inputId = useId();
  const today = useToday();
  const { user } = useSession();
  const refreshEarnings = useRefreshEarnings();
  const { data, isLoading, mutate } = useSWR<{ messages: Message[] }>("/api/chat/history", fetcher);
  const stream = useStreamingText("/api/chat");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = data?.messages ?? [];
  const busy = stream.isStreaming;
  const firstName = user?.name.split(" ")[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, stream.text, pending]);

  // Grow the composer with its content, up to a limit.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [draft]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy || !today) return;
      setDraft("");
      setPending(message);
      const reply = await stream.run({ message, language, today });
      setPending(null);
      if (reply) {
        await mutate(
          (cur) => ({
            messages: [
              ...(cur?.messages ?? []),
              { id: `u-${Date.now()}`, role: "user", content: message },
              { id: `a-${Date.now()}`, role: "assistant", content: reply },
            ],
          }),
          { revalidate: false },
        );
        void refreshEarnings(); // the assistant may have logged earnings via a tool
        stream.reset();
      }
    },
    [busy, today, stream, language, mutate, refreshEarnings],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  }

  async function clearChat() {
    try {
      await mutate(
        api.delete("/api/chat/history").then(() => ({ messages: [] })),
        { revalidate: false },
      );
      toast.success(t("chat.cleared"));
    } catch {
      toast.error(t("toast.error"));
    }
  }

  const appendTranscript = useCallback((s: string) => setDraft((d) => (d ? `${d} ${s}` : s)), []);
  const empty = !isLoading && messages.length === 0 && !pending;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <h1 className="sr-only">{t("app.name")}</h1>

      <div className="flex-1 py-6">
        {isLoading ? (
          <HistorySkeleton />
        ) : empty ? (
          <section aria-labelledby="greeting" className="flex flex-col items-center gap-8 pt-6 text-center sm:pt-16">
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"
            >
              <Sparkles className="size-8" />
            </span>
            <div>
              <h2 id="greeting" className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("chat.greeting")}
                {firstName ? `, ${firstName}` : ""}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">{t("chat.subtitle")}</p>
            </div>
            <ul className="grid w-full gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map(({ key, icon: Icon }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => void send(t(key))}
                    disabled={!today}
                    className="flex h-full w-full cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:border-foreground hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-[0.95rem] font-medium">{t(key)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div role="log" aria-label="Conversation" aria-live="polite" className="flex flex-col gap-6">
            {messages.length > 0 && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearChat} className="rounded-full text-muted-foreground">
                  <Trash2 className="size-4" aria-hidden="true" /> {t("chat.clear")}
                </Button>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.content} />
              ) : (
                <div key={m.id} className="flex gap-3">
                  <AssistantAvatar />
                  <div className="min-w-0 flex-1">
                    <SimpleMarkdown text={m.content} />
                    <MessageActions text={m.content} />
                  </div>
                </div>
              ),
            )}
            {pending && <UserBubble text={pending} />}
            {(pending || stream.status === "error") && (
              <div className="flex gap-3">
                <AssistantAvatar />
                {stream.status === "error" ? (
                  <p role="alert" className="flex-1 rounded-2xl bg-primary-pale p-3 text-danger">
                    {stream.error}
                  </p>
                ) : stream.text ? (
                  <div className="min-w-0 flex-1" aria-busy="true">
                    <SimpleMarkdown text={stream.text} />
                  </div>
                ) : (
                  <ThinkingSkeleton label={t("chat.thinking")} />
                )}
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 bg-gradient-to-t from-background from-70% to-transparent pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
      >
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-border bg-card p-2 shadow-[0_6px_24px_rgba(0,0,0,0.08)] focus-within:border-foreground">
          <label htmlFor={inputId} className="sr-only">
            {t("home.askLabel")}
          </label>
          <textarea
            id={inputId}
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("chat.placeholder")}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
            className="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground"
          />
          <MicButton onTranscript={appendTranscript} />
          {busy ? (
            <Button
              type="button"
              size="icon"
              onClick={stream.stop}
              className="size-11 rounded-full"
              aria-label={t("common.stop")}
            >
              <Square className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!draft.trim() || !today}
              className="size-11 rounded-full"
              aria-label={t("chat.send")}
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t("common.aiNote")}</p>
      </form>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-surface-strong px-4 py-2.5">{text}</p>
    </div>
  );
}
