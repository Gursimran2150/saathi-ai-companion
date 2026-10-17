import {
  FileText,
  HandCoins,
  Landmark,
  MessageCircle,
  PenLine,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { StringKey } from "@/lib/strings";

interface NavItem {
  href: string;
  key: StringKey;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", key: "nav.home", icon: MessageCircle },
  { href: "/earnings", key: "nav.earnings", icon: HandCoins },
  { href: "/rights", key: "nav.rights", icon: Scale },
  { href: "/schemes", key: "nav.schemes", icon: Landmark },
  { href: "/safety", key: "nav.safety", icon: ShieldCheck },
  { href: "/documents", key: "nav.documents", icon: FileText },
  { href: "/grievance", key: "nav.grievance", icon: PenLine },
];

export function isActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
