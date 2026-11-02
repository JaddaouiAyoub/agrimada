"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks } from "@/components/layout/nav-links";
import type { RoleValue } from "@/lib/constants";

export function MobileNav({ role, farmName }: { role: RoleValue; farmName: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-8 bg-sidebar px-3 py-5 text-sidebar-foreground">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#6b8f71] text-white">
            <Sprout className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-semibold text-white">FarmShare</span>
            <span className="block truncate text-xs text-sidebar-muted">{farmName}</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
