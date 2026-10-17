"use client";

import { Loader2, MapPin, Phone, Siren } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HELPLINES } from "@/data/helplines";
import { useLanguage } from "./LanguageProvider";

type LocationState = "idle" | "loading" | "error";

/** Emergency help: one tap to 112, verified helplines, and sharing the current location. */
export function SosButton({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const [location, setLocation] = useState<LocationState>("idle");

  function shareLocation() {
    if (!navigator.geolocation) return setLocation("error");
    setLocation("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const url = `https://maps.google.com/?q=${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;
        const text = `${t("sos.shareText")} ${url}`;
        setLocation("idle");
        if (navigator.share) await navigator.share({ title: "SOS", text }).catch(() => undefined);
        else window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
      },
      () => setLocation("error"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <Dialog onOpenChange={() => setLocation("idle")}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-[#c13515] px-4 text-sm font-bold text-white shadow-sm hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
        >
          <Siren className="size-4" aria-hidden="true" />
          {t("sos.label")}
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogTitle className="text-2xl">{t("sos.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("safety.helplines")}</DialogDescription>
        <div className="flex flex-col gap-3">
          <a
            href="tel:112"
            className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#c13515] text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Phone className="size-5" aria-hidden="true" /> {t("sos.call")}
          </a>
          <Button
            variant="outline"
            onClick={shareLocation}
            disabled={location === "loading"}
            className="h-12 rounded-full text-base"
          >
            {location === "loading" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <MapPin className="size-5" aria-hidden="true" />
            )}
            {location === "loading" ? t("sos.sharing") : t("sos.share")}
          </Button>
          {location === "error" && (
            <p role="alert" className="text-danger">
              {t("sos.locError")}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-2">
            {HELPLINES.filter((h) => h.number !== "112").map((h) => (
              <li key={h.number}>
                <a
                  href={`tel:${h.number}`}
                  className="flex h-full flex-col rounded-2xl bg-surface-muted px-3 py-2 hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="text-lg font-bold tabular-nums">{h.number}</span>
                  <span className="text-xs text-muted-foreground">{h.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
