"use client";

import { hardNavigate } from "@/lib/navigation";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api, ApiError } from "@/lib/api-client";

type Mode = "login" | "signup";
type Busy = null | "form" | "demo";

export function LoginView() {
  const { t } = useLanguage();
  const ids = { name: useId(), email: useId(), password: useId(), error: useId() };
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function enter(action: () => Promise<unknown>, kind: Exclude<Busy, null>) {
    setBusy(kind);
    setError(null);
    try {
      await action();
      // Full navigation so every cache starts fresh for this user.
      hardNavigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("toast.error"));
      setBusy(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = mode === "login" ? { email: form.email, password: form.password } : form;
    void enter(() => api.post(`/api/auth/${mode}`, body), "form");
  }

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <main className="flex min-h-dvh flex-col bg-surface-muted">
      <div className="flex justify-end gap-2 p-3">
        <LanguageSelect />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-[0_8px_28px_rgba(0,0,0,0.08)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"
            >
              <Sparkles className="size-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("login.title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("login.subtitle")}</p>
          </div>

          <Button
            type="button"
            onClick={() => void enter(() => api.post("/api/auth/demo"), "demo")}
            disabled={busy !== null}
            className="mt-6 h-12 w-full rounded-full text-base font-semibold"
          >
            {busy === "demo" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Zap className="size-5" aria-hidden="true" />
            )}
            {t("login.demo")}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">{t("login.demoNote")}</p>

          <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Separator className="flex-1" />
            {t("login.or")}
            <Separator className="flex-1" />
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
            aria-describedby={error ? ids.error : undefined}
            noValidate
          >
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={ids.name}>{t("login.name")}</Label>
                <Input
                  id={ids.name}
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="name"
                  required
                  maxLength={80}
                  className="h-12 rounded-xl"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.email}>{t("login.email")}</Label>
              <Input
                id={ids.email}
                type="email"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                required
                inputMode="email"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.password}>{t("login.password")}</Label>
              <Input
                id={ids.password}
                type="password"
                value={form.password}
                onChange={update("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={mode === "signup" ? 8 : undefined}
                className="h-12 rounded-xl"
              />
            </div>
            {error && (
              <p id={ids.error} role="alert" className="rounded-xl bg-primary-pale px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="outline"
              disabled={busy !== null}
              className="h-12 rounded-full border-foreground text-base font-semibold"
            >
              {busy === "form" && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
              {mode === "login" ? t("login.submit") : t("login.signup")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="mx-auto mt-4 block min-h-11 cursor-pointer text-sm font-semibold underline underline-offset-4"
          >
            {mode === "login" ? t("login.switchToSignup") : t("login.switchToLogin")}
          </button>
        </div>
      </div>
    </main>
  );
}
