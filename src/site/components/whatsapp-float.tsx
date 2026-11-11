import { WhatsAppIcon } from "@/site/components/icons";

/** Bouton WhatsApp flottant, présent sur toutes les pages du site. */
export function WhatsAppFloat({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed end-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full bg-whatsapp p-3.5 text-white shadow-[0_10px_30px_-8px_rgba(18,90,50,0.55)] transition-transform duration-300 hover:-translate-y-0.5 sm:end-6 sm:bottom-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.6s] motion-reduce:hidden" />
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
