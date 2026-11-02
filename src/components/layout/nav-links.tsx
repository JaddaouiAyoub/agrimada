"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  List,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { RoleValue } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Finances",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/expenses", label: "Dépenses", icon: ArrowDownRight },
      { href: "/revenues", label: "Revenus", icon: ArrowUpRight },
      { href: "/transactions", label: "Opérations", icon: List },
      { href: "/reports", label: "Rapports et exports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/members", label: "Membres", icon: Users, adminOnly: true },
      { href: "/categories", label: "Catégories", icon: Tags, adminOnly: true },
      { href: "/settings", label: "Paramètres", icon: Settings, adminOnly: true },
      { href: "/audit", label: "Journal d'activité", icon: History, adminOnly: true },
    ],
  },
];

/** Navigation filtrée par rôle (confort d'affichage ; les droits sont vérifiés côté serveur). */
export function NavLinks({ role, onNavigate }: { role: RoleValue; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6" aria-label="Navigation principale">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((i) => !i.adminOnly || role === "ADMIN");
        if (items.length === 0) return null;
        return (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
              {section.title}
            </p>
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-muted",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-white",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
