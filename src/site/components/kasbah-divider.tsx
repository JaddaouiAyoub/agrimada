import { cn } from "@/lib/utils";

/**
 * Frise de créneaux inspirée des remparts des kasbahs du Sud.
 * Placée en haut d'une section, elle prend la couleur de cette section (currentColor).
 */
export function KasbahDivider({ id, className }: { id: string; className?: string }) {
  const patternId = `kasbah-${id}`;
  return (
    <svg className={cn("block h-3.5 w-full", className)} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={patternId} width="32" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14V7h5V2h7v5h8V2h7v5h5v7Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#${patternId})`} />
    </svg>
  );
}
