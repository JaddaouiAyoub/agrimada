import { cn } from "@/lib/utils";
import { SEASONS } from "@/site/content/seasons";
import type { Dictionary } from "@/site/i18n";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Calendrier floraison / récolte, lisible au lecteur d'écran (vrai tableau). */
export function SeasonCalendar({ dict, className }: { dict: Dictionary; className?: string }) {
  const t = dict.home.seasons;
  return (
    <table className={cn("w-full table-fixed border-collapse text-center", className)}>
      <caption className="sr-only">{t.title}</caption>
      <thead>
        <tr>
          <th scope="col" className="w-[30%] sm:w-[24%]">
            <span className="sr-only">{t.eyebrow}</span>
          </th>
          {MONTHS.map((m) => (
            <th key={m} scope="col" className="pb-4 text-[0.7rem] font-semibold text-stone">
              <abbr title={dict.months.short[m - 1]} className="no-underline sm:hidden">
                {dict.months.tiny[m - 1]}
              </abbr>
              <span className="hidden sm:inline">{dict.months.short[m - 1]}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SEASONS.map((row) => (
          <tr key={row.key} className="border-t border-forest/10">
            <th scope="row" className="display py-5 pe-3 text-start text-[1.15rem] font-medium text-forest sm:text-[1.4rem]">
              {t.rows[row.key]}
            </th>
            {MONTHS.map((m) => {
              const harvest = row.harvest.includes(m);
              const flowering = row.flowering.includes(m);
              const label = [flowering && t.flowering, harvest && t.harvest].filter(Boolean).join(" · ");
              return (
                <td key={m} className="px-[1px] py-5 sm:px-0.5">
                  <span
                    className={cn(
                      "relative block h-7 overflow-hidden rounded-full bg-sand",
                      harvest && "bg-saffron",
                      flowering && !harvest && "bg-blush",
                    )}
                    title={label || undefined}
                  >
                    {flowering && harvest && <span className="absolute inset-y-0 start-0 w-1/2 bg-blush" aria-hidden />}
                    {label && <span className="sr-only">{label}</span>}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SeasonLegend({ dict }: { dict: Dictionary }) {
  const t = dict.home.seasons;
  return (
    <div className="flex flex-wrap gap-5 text-sm text-stone">
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full bg-blush" aria-hidden /> {t.flowering}
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full bg-saffron" aria-hidden /> {t.harvest}
      </span>
    </div>
  );
}
