import { cn } from "@/lib/utils";

/**
 * Emblème Agrimada : un arc de kasbah qui abrite une fleur — à la fois la rose
 * de Damas et la fleur de safran — posée sur la ligne d'horizon de la vallée.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* Arc de porte de kasbah */}
      <path
        d="M11 43V21.5C11 13.5 16.8 7 24 7s13 6.5 13 14.5V43"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Créneaux */}
      <path d="M19.5 4.2h2.2V6M26.3 4.2h2.2V6" fill="none" stroke="var(--color-saffron)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Pétales */}
      <path d="M24 35c-6.4-2.4-8.3-8.6-5.6-14 1.9 3.6 3.9 7.4 5.6 14Z" fill="var(--color-blush)" />
      <path d="M24 35c6.4-2.4 8.3-8.6 5.6-14-1.9 3.6-3.9 7.4-5.6 14Z" fill="var(--color-blush)" />
      <path d="M24 34c-3.7-4.5-3.8-11.4 0-17 3.8 5.6 3.7 12.5 0 17Z" fill="var(--color-saffron)" />
      {/* Tige, feuille et horizon */}
      <path d="M24 35v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 39.5c2.4-2.2 5-2.6 7.2-1.6-2 2.2-4.6 2.7-7.2 1.6Z" fill="var(--color-olive)" />
      <path d="M6 43h36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Logo complet. Le nom de marque reste toujours en français, y compris sur le site arabe. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span
      lang="fr"
      dir="ltr"
      className={cn("inline-flex items-center gap-2.5", tone === "light" ? "text-ivory" : "text-forest", className)}
    >
      <LogoMark className="size-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-cormorant)] text-[1.6rem] font-semibold tracking-[0.02em]">
          Agrimada
        </span>
        <span
          className={cn(
            "mt-1 font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold tracking-[0.28em] uppercase",
            tone === "light" ? "text-ivory/70" : "text-olive",
          )}
        >
          Kalaat M&apos;Gouna
        </span>
      </span>
    </span>
  );
}
