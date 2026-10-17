"use client";

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "streaming" | "done" | "error";

/** POSTs JSON to a streaming text endpoint and exposes the text as it arrives. */
export function useStreamingText(endpoint: string) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (body: unknown) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setText("");
      setError(null);
      setStatus("streaming");

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Something went wrong. Please try again.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let received = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += decoder.decode(value, { stream: true });
          setText(received);
        }
        if (!received.trim()) throw new Error("The AI returned an empty answer. Please try again.");
        setStatus("done");
      } catch (err) {
        if (controller.signal.aborted) {
          setStatus("done");
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [endpoint],
  );

  return { text, status, error, run, stop, isStreaming: status === "streaming" };
}
