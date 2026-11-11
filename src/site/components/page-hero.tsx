import Image from "next/image";
import { StarMark } from "@/site/components/icons";
import type { SiteImage } from "@/site/images";
import type { Locale } from "@/site/config";

/** En-tête photographique des pages intérieures (plus court que celui de l'accueil). */
export function PageHero({
  locale,
  image,
  eyebrow,
  title,
  subtitle,
  position = "50% 50%",
}: {
  locale: Locale;
  image: SiteImage;
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Cadrage de la photo (object-position). */
  position?: string;
}) {
  return (
    <section className="relative isolate flex min-h-[62svh] items-end overflow-hidden bg-forest-deep pt-32 text-ivory sm:min-h-[68svh]">
      <Image
        src={image.src}
        alt={image.alt[locale]}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="hero-zoom -z-20 object-cover"
        style={{ objectPosition: position }}
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,44,31,0.6)_0%,rgba(27,44,31,0.15)_40%,rgba(27,44,31,0.85)_100%)]"
        aria-hidden
      />
      <div className="container-site pb-14 sm:pb-20">
        <p className="eyebrow inline-flex items-center gap-2.5 text-ivory/85">
          <StarMark className="size-3 text-saffron" />
          {eyebrow}
        </p>
        <h1 className="display mt-4 max-w-3xl text-[2.6rem] text-ivory sm:text-6xl lg:text-7xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ivory/80 sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
