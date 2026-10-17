"use client";

import { hardNavigate } from "@/lib/navigation";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useAppData";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { LanguageSelect } from "./LanguageSelect";
import { useLanguage } from "./LanguageProvider";
import { LargeTextToggle } from "./LargeTextToggle";
import { isActive, NAV_ITEMS } from "./nav";
import { SosButton } from "./SosButton";
import { ThemeToggle } from "./ThemeToggle";

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
    >
      S
    </span>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring",
                  active && "bg-sidebar-accent font-semibold",
                )}
              >
                <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserCard() {
  const { t } = useLanguage();
  const { user, isLoading } = useSession();

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      hardNavigate("/login");
    } catch {
      toast.error(t("toast.error"));
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl p-2">
      <Avatar className="size-10">
        <AvatarFallback className="bg-primary-pale font-semibold text-primary">
          {user.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold">
          <span className="truncate">{user.name}</span>
          {user.isDemo && (
            <Badge variant="secondary" className="shrink-0">
              {t("menu.demoBadge")}
            </Badge>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-11 rounded-full"
        onClick={logout}
        aria-label={t("menu.logout")}
      >
        <LogOut className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex items-center justify-between gap-2 px-2 pt-2">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <BrandMark />
          {t("app.name")}
        </Link>
        {!onNavigate && <SosButton />}
      </div>
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("menu.tools")}</p>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border pt-3">
        <div className="flex flex-wrap items-center gap-2 px-1">
          <LanguageSelect />
          <LargeTextToggle />
          <ThemeToggle />
        </div>
        <UserCard />
      </div>
    </div>
  );
}

/** Assistant-style layout: persistent sidebar on desktop, top bar + drawer on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => isActive(item.href, pathname));

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="skip-link">
        {t("common.skip")}
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-2 backdrop-blur pt-[env(safe-area-inset-top)] lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 rounded-full" aria-label={t("menu.open")}>
                <Menu className="size-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-80 bg-sidebar p-0">
              <SheetTitle className="sr-only">{t("app.name")}</SheetTitle>
              <SheetDescription className="sr-only">{t("menu.tools")}</SheetDescription>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="flex-1 truncate font-semibold">{current ? t(current.key) : t("app.name")}</p>
          <SosButton />
        </header>

        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
