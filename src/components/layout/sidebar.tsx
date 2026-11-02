import Link from "next/link";
import { Sprout } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";
import type { RoleValue } from "@/lib/constants";

export function Brand({ farmName }: { farmName: string }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-3 outline-none">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#6b8f71] text-white">
        <Sprout className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-semibold text-white">FarmShare</span>
        <span className="block truncate text-xs text-sidebar-muted">{farmName}</span>
      </span>
    </Link>
  );
}

export function Sidebar({ role, farmName }: { role: RoleValue; farmName: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
      <Brand farmName={farmName} />
      <div className="flex-1 overflow-y-auto">
        <NavLinks role={role} />
      </div>
      <p className="px-3 text-[11px] text-sidebar-muted">Montants en MAD</p>
    </aside>
  );
}
