"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noopSubscribe = () => () => {};

/** Browser speech-to-text (Web Speech API). `supported` is false where unavailable. */
export function useSpeechInput(locale: string, onTranscript: (text: string) => void) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(getRecognitionCtor()),
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);

  useEffect(() => {
    callbackRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = locale;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results, (r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) callbackRef.current(transcript);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed" ? "Microphone permission was denied." : "Could not hear you. Please try again.",
      );
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }, [locale]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { supported, listening, error, start, stop };
}
