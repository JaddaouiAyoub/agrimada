import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { CONTACT, whatsappLink, type Locale } from "@/site/config";
import { WhatsAppIcon } from "@/site/components/icons";
import { KasbahDivider } from "@/site/components/kasbah-divider";
import { Logo } from "@/site/components/logo";
import type { Dictionary } from "@/site/i18n";

export function SiteFooter({
  locale,
  dict,
  nav,
}: {
  locale: Locale;
  dict: Dictionary;
  nav: { href: string; label: string }[];
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-forest-deep text-ivory/80">
      <KasbahDivider id="footer" className="absolute inset-x-0 -top-3.5 text-forest-deep" />
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr] md:py-20">
        <div className="max-w-sm space-y-5">
          <Logo tone="light" />
          <p className="text-[0.95rem] leading-relaxed text-ivory/65">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.navTitle}>
          <p className="eyebrow mb-5 text-saffron">{dict.footer.navTitle}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem] md:grid-cols-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ivory">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5 text-saffron">{dict.footer.contactTitle}</p>
          <ul className="space-y-4 text-[0.95rem]">
            <li>
              <a
                href={whatsappLink(dict.common.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 transition-colors hover:text-ivory"
              >
                <WhatsAppIcon className="size-4.5 shrink-0 text-saffron" />
                <span>
                  {dict.common.whatsapp} · <span dir="ltr">{CONTACT.phoneDisplay}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={CONTACT.phoneHref} className="inline-flex items-center gap-3 transition-colors hover:text-ivory">
                <Phone className="size-4.5 shrink-0 text-saffron" aria-hidden />
                <span dir="ltr">{CONTACT.phoneDisplay}</span>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4.5 shrink-0 text-saffron" aria-hidden />
              <span>{CONTACT.address[locale]}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col gap-3 py-6 text-[0.82rem] text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Agrimada. {dict.footer.rights}
          </p>
          <div className="flex gap-6">
            <Link href={`/${locale}/credits`} className="transition-colors hover:text-ivory">
              {dict.footer.credits}
            </Link>
            <Link href="/login" className="transition-colors hover:text-ivory">
              {dict.footer.members}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
