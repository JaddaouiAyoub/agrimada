import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/server/settings";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);

  return (
    <div className="flex min-h-dvh">
      <Sidebar role={user.role} farmName={settings.farmName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <MobileNav role={user.role} farmName={settings.farmName} />
          <p className="truncate text-sm font-medium text-muted-foreground lg:hidden">{settings.farmName}</p>
          <div className="ml-auto">
            <UserMenu name={user.name} email={user.email} role={user.role} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
