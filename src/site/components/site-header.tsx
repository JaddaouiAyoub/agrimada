"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_PAGES, type Locale } from "@/site/config";
import { WhatsAppIcon } from "@/site/components/icons";
import { Logo } from "@/site/components/logo";

type NavItem = { href: string; label: string };

type Labels = {
  menu: string;
  close: string;
  switchLanguage: string;
  switchLanguageLabel: string;
  writeUs: string;
};

/** Même page dans l'autre langue : /fr/produits ↔ /ar/produits. */
function switchLocalePath(pathname: string, from: Locale, to: Locale): string {
  if (pathname === `/${from}`) return `/${to}`;
  if (pathname.startsWith(`/${from}/`)) return `/${to}${pathname.slice(from.length + 1)}`;
  return `/${to}`;
}

export function SiteHeader({
  locale,
  nav,
  labels,
  whatsappHref,
}: {
  locale: Locale;
  nav: NavItem[];
  labels: Labels;
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const otherLocale: Locale = locale === "fr" ? "ar" : "fr";
  // Pages ouvertes par une grande photo : l'en-tête est transparent au-dessus d'elle
  // tant qu'on n'a pas défilé (pas sur les crédits ni sur la page introuvable).
  const hasHero = SITE_PAGES.some((page) => pathname === `/${locale}${page}`);
  const overlay = hasHero && !scrolled && !open;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Menu mobile : fermeture par Échap ou au clic sur un lien ; défilement bloqué pendant l'ouverture.

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) => (href === `/${locale}` ? pathname === href : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,color] duration-500",
        overlay ? "bg-transparent text-ivory" : "bg-ivory/92 text-ink shadow-[0_1px_0_rgba(38,61,43,0.08)] backdrop-blur-md",
      )}
    >
      <div className="container-site flex h-18 items-center justify-between gap-6 lg:h-22">
        <Link href={`/${locale}`} className="shrink-0" aria-label="Agrimada">
          <Logo tone={overlay ? "light" : "dark"} />
        </Link>

        <nav aria-label={labels.menu} className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.92rem] font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-saffron after:transition-transform after:duration-300 rtl:after:origin-right",
                    "hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
                    overlay ? "text-ivory/90 hover:text-ivory" : "text-ink/80 hover:text-forest",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={switchLocalePath(pathname, locale, otherLocale)}
            hrefLang={otherLocale}
            lang={otherLocale}
            aria-label={labels.switchLanguageLabel}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              otherLocale === "ar" ? "font-[family-name:var(--font-naskh)]" : "",
              overlay ? "border-ivory/40 hover:bg-ivory/10" : "border-forest/20 hover:bg-forest/5",
            )}
          >
            {labels.switchLanguage}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-saffron px-4.5 py-2 text-sm font-semibold text-forest-deep transition-colors hover:bg-[#d8ab49] sm:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            {labels.writeUs}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? labels.close : labels.menu}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
              overlay ? "hover:bg-ivory/10" : "hover:bg-forest/5",
            )}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile plein écran */}
      <div
        id="site-mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-18 bottom-0 overflow-y-auto bg-forest text-ivory lg:hidden"
      >
        <nav aria-label={labels.menu} className="container-site flex min-h-full flex-col py-10">
          <ul className="flex flex-col gap-1">
            {nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-ivory/10 py-4 font-display text-3xl aria-[current=page]:text-saffron"
                >
                  <span className="font-sans text-xs text-ivory/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-saffron px-6 py-4 font-semibold text-forest-deep"
          >
            <WhatsAppIcon className="size-5" />
            {labels.writeUs}
          </a>
        </nav>
      </div>
    </header>
  );
}
