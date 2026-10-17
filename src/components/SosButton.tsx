"use client";

import { useEffect, useRef, useState } from "react";
import { HELPLINES } from "@/data/helplines";
import { useLanguage } from "./LanguageProvider";

type LocationState = { kind: "idle" } | { kind: "loading" } | { kind: "error" };

/** Floating emergency button: one tap to 112, helplines, and sharing the current location. */
export function SosButton() {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState<LocationState>({ kind: "idle" });

  useEffect(() => {
    const dialog = dialogRef.current;
    const reset = () => setLocation({ kind: "idle" });
    dialog?.addEventListener("close", reset);
    return () => dialog?.removeEventListener("close", reset);
  }, []);

  function shareLocation() {
    if (!navigator.geolocation) return setLocation({ kind: "error" });
    setLocation({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const url = `https://maps.google.com/?q=${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;
        const text = `I need help. My location: ${url}`;
        setLocation({ kind: "idle" });
        if (navigator.share) {
          await navigator.share({ title: "SOS", text }).catch(() => undefined);
        } else {
          window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
        }
      },
      () => setLocation({ kind: "error" }),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-40 flex size-16 items-center justify-center rounded-full bg-danger text-lg font-black text-white shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-danger"
      >
        {t("sos.label")}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="sos-title"
        className="m-auto w-[min(92vw,28rem)] rounded-3xl bg-background p-6 text-foreground backdrop:bg-black/60"
      >
        <h2 id="sos-title" className="display text-2xl">
          {t("sos.title")}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <a
            href="tel:112"
            className="flex min-h-14 items-center justify-center rounded-3xl bg-danger text-xl font-black text-white"
          >
            📞 {t("sos.call")}
          </a>
          <button type="button" onClick={shareLocation} disabled={location.kind === "loading"} className="btn-primary">
            📍 {location.kind === "loading" ? t("sos.sharing") : t("sos.share")}
          </button>
          {location.kind === "error" && (
            <p role="alert" className="text-danger">
              {t("sos.locError")}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-2">
            {HELPLINES.filter((h) => h.number !== "112").map((h) => (
              <li key={h.number}>
                <a href={`tel:${h.number}`} className="flex flex-col rounded-2xl bg-surface-muted px-3 py-2">
                  <span className="text-lg font-black tabular-nums">{h.number}</span>
                  <span className="text-xs text-muted">{h.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <form method="dialog">
            <button className="btn-secondary w-full">{t("sos.close")}</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
