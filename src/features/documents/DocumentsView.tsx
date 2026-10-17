"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { AnswerPanel } from "@/components/AnswerPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { useDocumentHandoff } from "@/hooks/useHandoff";
import { useStreamingText } from "@/hooks/useStreamingText";
import { DOCUMENT_MEDIA_TYPES, MAX_DOCUMENT_BYTES } from "@/lib/features/requests";

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

export function DocumentsView() {
  const { t, language } = useLanguage();
  const ids = { file: useId(), question: useId(), hint: useId() };
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const { text, status, error, run, stop, isStreaming } = useStreamingText("/api/document");
  const [, setHandoff] = useDocumentHandoff();

  // Release the preview blob when it is replaced or the page unmounts.
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFileError(null);
    setFile(null);
    setPreviewUrl(null);
    if (!selected) return;
    if (!isAllowedType(selected.type)) return setFileError(t("documents.badType"));
    if (selected.size > MAX_DOCUMENT_BYTES) return setFileError(t("documents.tooBig"));
    setFile(selected);
    if (selected.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(selected));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || isStreaming || !isAllowedType(file.type)) return;
    const data = await readAsBase64(file);
    void run({ mediaType: file.type, data, question: question || undefined, language });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="card flex flex-col gap-4">
        <div>
          <label htmlFor={ids.file} className="field-label">
            {t("documents.file")}
          </label>
          <input
            id={ids.file}
            type="file"
            accept={DOCUMENT_MEDIA_TYPES.join(",")}
            capture="environment"
            onChange={onFileChange}
            aria-describedby={fileError ? ids.hint : undefined}
            className="input file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-background"
          />
          {fileError && (
            <p id={ids.hint} role="alert" className="mt-2 text-danger">
              {fileError}
            </p>
          )}
        </div>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={previewUrl} alt="Selected document preview" className="max-h-72 w-fit rounded-xl object-contain" />
        )}
        {file && !previewUrl && <p className="text-muted">📄 {file.name}</p>}
        <div>
          <label htmlFor={ids.question} className="field-label">
            {t("documents.question")}
          </label>
          <input
            id={ids.question}
            value={question}
            maxLength={500}
            onChange={(e) => setQuestion(e.target.value)}
            className="input"
          />
        </div>
        <div>
          {isStreaming ? (
            <button type="button" onClick={stop} className="btn-secondary">
              {t("common.stop")}
            </button>
          ) : (
            <button type="submit" disabled={!file} className="btn-primary">
              ✨ {t("documents.explain")}
            </button>
          )}
        </div>
      </form>
      {status !== "idle" && <AnswerPanel text={text} status={status} error={error} />}
      {status === "done" && text && (
        <Link href="/grievance" onClick={() => setHandoff(text.slice(0, 4000))} className="btn-primary self-start">
          ✍️ {t("documents.toComplaint")} →
        </Link>
      )}
    </div>
  );
}
