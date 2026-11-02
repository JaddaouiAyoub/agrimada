import { Sprout } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#6b8f71] text-white">
            <Sprout className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold text-white">FarmShare</span>
        </div>
        <div className="max-w-md space-y-4">
          <p className="text-3xl leading-tight font-semibold text-white">
            Les comptes de la ferme, clairs et partagés entre associés.
          </p>
          <p className="text-sm text-sidebar-muted">
            Dépenses, revenus, avances de chacun et bilans exportables — au même endroit.
          </p>
        </div>
        <p className="text-xs text-sidebar-muted">Accès réservé aux membres de la ferme.</p>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-[#6b8f71]/15 blur-2xl"
        />
      </aside>
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
