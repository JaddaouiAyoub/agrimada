import { cn } from "@/lib/utils";
import { CONTACT } from "@/site/config";

/** Lien vers la position de la ferme dans Google Maps. */
export function googleMapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${CONTACT.geo.lat},${CONTACT.geo.lng}`;
}

/**
 * Carte OpenStreetMap (sans clé ni cookie publicitaire), chargée seulement à l'approche
 * de l'écran pour ne pas ralentir la page.
 */
export function MapEmbed({ title, className }: { title: string; className?: string }) {
  const { lat, lng } = CONTACT.geo;
  const d = 0.03;
  const bbox = [lng - d, lat - d / 1.6, lng + d, lat + d / 1.6].map((n) => n.toFixed(4)).join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className={cn("relative overflow-hidden rounded-[2px] border border-forest/10 bg-sand-deep", className)}>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0 grayscale-[35%] sepia-[15%]"
      />
    </div>
  );
}
