"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { buildQuery, cn } from "@/lib/utils";

export type FilterField =
  | { kind: "search"; name: string; label: string; placeholder?: string; className?: string }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      allLabel?: string;
      className?: string;
    }
  | { kind: "date"; name: string; label: string; className?: string }
  | { kind: "amount"; name: string; label: string; placeholder?: string; className?: string };

type UrlFiltersProps = {
  basePath: string;
  fields: FilterField[];
  /** Valeurs courantes lues côté serveur dans l'URL. */
  values: Record<string, string | undefined>;
  /** Paramètres conservés mais non modifiables ici (tri, taille de page…). */
  preserved?: Record<string, string | undefined>;
};

/**
 * Barre de filtres synchronisée avec l'URL. Toute modification réinitialise la
 * pagination (le paramètre « page » est retiré).
 */
export function UrlFilters(props: UrlFiltersProps) {
  // Remonte le composant quand un filtre de sélection change dans l'URL (bouton retour…)
  // pour resynchroniser les champs. Les champs saisis au clavier sont exclus de la clé
  // afin de ne pas perdre le focus pendant la frappe.
  const key = JSON.stringify(
    props.fields.filter((f) => f.kind === "select" || f.kind === "date").map((f) => props.values[f.name] ?? ""),
  );
  return <UrlFiltersInner key={key} {...props} />;
}

function UrlFiltersInner({ basePath, fields, values, preserved = {} }: UrlFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [draft, setDraft] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, values[f.name] ?? ""])),
  );
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (debounce.current) clearTimeout(debounce.current);
  }, []);

  const navigate = (next: Record<string, string>) => {
    startTransition(() => {
      router.push(`${basePath}${buildQuery({ ...preserved, ...next, page: undefined })}`, { scroll: false });
    });
  };

  const update = (name: string, value: string, delay = 0) => {
    const next = { ...draft, [name]: value };
    setDraft(next);
    if (debounce.current) clearTimeout(debounce.current);
    if (delay > 0) debounce.current = setTimeout(() => navigate(next), delay);
    else navigate(next);
  };

  const hasActive = fields.some((f) => (values[f.name] ?? "") !== "");

  return (
    <div className="flex flex-wrap items-end gap-3" role="search">
      {fields.map((field) => {
        const id = `filter-${field.name}`;
        const value = draft[field.name] ?? "";
        return (
          <div key={field.name} className={cn("grid min-w-36 flex-1 gap-1 sm:flex-none", field.className)}>
            <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
              {field.label}
            </label>
            {field.kind === "search" && (
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={id}
                  type="search"
                  className="pl-8"
                  placeholder={field.placeholder ?? "Rechercher…"}
                  value={value}
                  maxLength={100}
                  onChange={(e) => update(field.name, e.target.value, 400)}
                />
              </div>
            )}
            {field.kind === "select" && (
              <NativeSelect id={id} value={value} onChange={(e) => update(field.name, e.target.value)}>
                <option value="">{field.allLabel ?? "Tous"}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
            )}
            {field.kind === "date" && (
              <Input id={id} type="date" value={value} onChange={(e) => update(field.name, e.target.value)} />
            )}
            {field.kind === "amount" && (
              <Input
                id={id}
                inputMode="decimal"
                placeholder={field.placeholder ?? "0,00"}
                value={value}
                onChange={(e) => update(field.name, e.target.value, 600)}
              />
            )}
          </div>
        );
      })}
      <div className="flex h-9 items-center gap-2">
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(Object.fromEntries(fields.map((f) => [f.name, ""])))}
          >
            <X /> Réinitialiser
          </Button>
        )}
        {pending && <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Chargement" />}
      </div>
    </div>
  );
}
