"use client";

import { ArrowRight, Camera, FileText, PenLine, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { ActionBar, SubmitOrStop } from "@/components/feature/ActionBar";
import { Panel } from "@/components/feature/Panel";
import { FEATURE_CONTAINER, INPUT, PRIMARY_BUTTON } from "@/components/feature/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentHandoff } from "@/hooks/useHandoff";
import { useStreamingText } from "@/hooks/useStreamingText";
import { DOCUMENT_MEDIA_TYPES, MAX_DOCUMENT_BYTES } from "@/lib/features/requests";
import { cn } from "@/lib/utils";
import { compressImage } from "./compressImage";

type MediaType = (typeof DOCUMENT_MEDIA_TYPES)[number];

function isAllowedType(type: string): type is MediaType {
  return (DOCUMENT_MEDIA_TYPES as readonly string[]).includes(type);
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function DocumentsView() {
  const { t, language } = useLanguage();
  const ids = { file: useId(), question: useId(), hint: useId() };
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/document");
  const [, setHandoff] = useDocumentHandoff();

  // Release the preview blob when it is replaced or the page unmounts.
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  function clearFile() {
    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFileError(null);
    setFile(null);
    setPreviewUrl(null);
    if (!selected) return;
    if (!isAllowedType(selected.type)) return setFileError(t("documents.badType"));
    setPreparing(true);
    // Images are shrunk on-device before upload; PDFs are sent as-is.
    const prepared = await compressImage(selected);
    setPreparing(false);
    if (prepared.size > MAX_DOCUMENT_BYTES) return setFileError(t("documents.tooBig"));
    setFile(prepared);
    if (prepared.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(prepared));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || isStreaming || !isAllowedType(file.type)) return;
    const data = await readAsBase64(file);
    void run({ mediaType: file.type, data, question: question || undefined, language });
  }

  return (
    <div className={FEATURE_CONTAINER}>
      <Panel>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {/* The whole drop area is the label, so tapping anywhere opens the camera / file picker. */}
            <label
              htmlFor={ids.file}
              className={cn(
                "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-input bg-surface-muted px-4 py-6 text-center transition-colors hover:border-foreground dark:bg-surface-strong",
                "has-[:focus-visible]:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                fileError && "border-danger",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm"
              >
                <Camera className="size-6" />
              </span>
              <span className="font-semibold">{t("documents.file")}</span>
              <span className="text-xs text-muted-foreground">{t("documents.formats")}</span>
              <input
                ref={inputRef}
                id={ids.file}
                type="file"
                accept={DOCUMENT_MEDIA_TYPES.join(",")}
                capture="environment"
                onChange={(e) => void onFileChange(e)}
                aria-describedby={fileError ? ids.hint : undefined}
                aria-invalid={fileError ? true : undefined}
                className="sr-only"
              />
            </label>
            {fileError && (
              <p id={ids.hint} role="alert" className="text-sm font-medium text-danger">
                {fileError}
              </p>
            )}
          </div>

          {preparing && <Skeleton className="h-48 rounded-2xl" />}
          {file && (
            <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={previewUrl} alt="" className="size-20 shrink-0 rounded-xl bg-surface-muted object-cover" />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary-pale text-primary"
                >
                  <FileText className="size-8" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{file.name}</p>
                <p className="text-sm text-muted-foreground tabular-nums">{formatSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearFile}
                aria-label={`${t("grievance.removeDoc")} ${file.name}`}
                className="size-11 rounded-full"
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.question} className="text-sm font-semibold">
              {t("documents.question")}
            </Label>
            <Input
              id={ids.question}
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              className={INPUT}
            />
          </div>
          <ActionBar>
            <SubmitOrStop streaming={isStreaming} onStop={stop} disabled={!file || preparing} icon={Sparkles}>
              {t("documents.explain")}
            </SubmitOrStop>
          </ActionBar>
        </form>
      </Panel>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
      {status === "done" && text && (
        <Link
          href="/grievance"
          onClick={() => setHandoff(text.slice(0, 4000))}
          className={cn(
            PRIMARY_BUTTON,
            "inline-flex items-center justify-center self-start bg-primary text-primary-foreground transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring max-sm:w-full",
          )}
        >
          <PenLine className="size-5" aria-hidden />
          {t("documents.toComplaint")}
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
