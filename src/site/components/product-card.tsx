import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappLink, type Locale } from "@/site/config";
import type { Product } from "@/site/content/products";
import { WhatsAppIcon } from "@/site/components/icons";
import { getImage } from "@/site/images";
import type { Dictionary } from "@/site/i18n";

export function ProductCard({
  product,
  locale,
  dict,
  className,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  const image = getImage(product.image);
  const other: Locale = locale === "fr" ? "ar" : "fr";
  const name = product.name[locale];

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-sand-deep">
        <Image
          src={image.src}
          alt={image.alt[locale]}
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 80vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105"
        />
        <span className="absolute start-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-forest backdrop-blur">
          <CalendarDays className="size-3.5 text-saffron" aria-hidden />
          {product.season[locale]}
        </span>
      </div>

      <div className="flex flex-1 flex-col border-x border-b border-forest/10 bg-ivory p-6">
        <p lang={other} className={cn("text-saffron-deep", other === "ar" ? "font-[family-name:var(--font-naskh)] text-lg" : "eyebrow")}>
          {product.name[other]}
        </p>
        <h3 className="display mt-1.5 text-[1.9rem] text-forest">{name}</h3>
        <p className="mt-1 font-[family-name:var(--font-cormorant-italic)] text-[0.95rem] italic text-stone">{product.latin}</p>
        <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink/75">{product.short[locale]}</p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-forest/10 pt-5">
          <Link
            href={`/${locale}/produits#${product.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-olive"
          >
            {dict.common.discover}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </Link>
          <a
            href={whatsappLink(dict.common.whatsappProductMessage(name))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${dict.common.orderWhatsapp} — ${name}`}
            className="inline-flex size-10 items-center justify-center rounded-full bg-forest text-ivory transition-colors hover:bg-olive"
          >
            <WhatsAppIcon className="size-4.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
