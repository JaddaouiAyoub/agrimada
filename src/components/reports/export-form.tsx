"use client";

import * as React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERIOD_LABELS, PERIOD_PRESETS, type PeriodPreset } from "@/lib/constants";
import { buildQuery, cn } from "@/lib/utils";

type Option = { value: string; label: string };

const DATASETS = [
  { value: "operations", label: "Toutes les opérations", description: "Dépenses, revenus et cotisations dans un même fichier." },
  { value: "expenses", label: "Dépenses", description: "Uniquement les dépenses." },
  { value: "revenues", label: "Revenus", description: "Uniquement les revenus, hors cotisations." },
  { value: "contributions", label: "Cotisations", description: "Uniquement les cotisations des membres." },
  { value: "summary", label: "Bilan financier", description: "Totaux, ventilation par catégorie et par membre." },
] as const;

export function ExportForm({ members, categories }: { members: Option[]; categories: Option[] }) {
  const [dataset, setDataset] = React.useState<(typeof DATASETS)[number]["value"]>("operations");
  const [period, setPeriod] = React.useState<PeriodPreset>("month");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [member, setMember] = React.useState("");
  const [category, setCategory] = React.useState("");

  const href = (format: "csv" | "xlsx") =>
    `/api/exports${buildQuery({
      dataset,
      format,
      period,
      from: period === "custom" ? from : undefined,
      to: period === "custom" ? to : undefined,
      member,
      category,
    })}`;

  const invalidCustom = period === "custom" && Boolean(from && to && from > to);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvel export</CardTitle>
        <CardDescription>
          L&apos;export porte sur l&apos;ensemble des résultats correspondant aux critères (pas seulement une page).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium">Données</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DATASETS.map((d) => (
              <label
                key={d.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border bg-card p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  dataset === d.value && "border-primary bg-secondary",
                )}
              >
                <input
                  type="radio"
                  name="dataset"
                  value={d.value}
                  checked={dataset === d.value}
                  onChange={() => setDataset(d.value)}
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="block text-sm font-medium">{d.label}</span>
                  <span className="block text-xs text-muted-foreground">{d.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-1.5">
            <Label htmlFor="x-period">Période</Label>
            <NativeSelect id="x-period" value={period} onChange={(e) => setPeriod(e.target.value as PeriodPreset)}>
              {PERIOD_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {PERIOD_LABELS[p]}
                </option>
              ))}
            </NativeSelect>
          </div>
          {period === "custom" && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="x-from">Du</Label>
                <Input id="x-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="x-to">Au</Label>
                <Input
                  id="x-to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  aria-invalid={invalidCustom || undefined}
                />
              </div>
            </>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="x-member">Membre</Label>
            <NativeSelect id="x-member" value={member} onChange={(e) => setMember(e.target.value)}>
              <option value="">Tous les membres</option>
              {members.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="x-category">Catégorie</Label>
            <NativeSelect id="x-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        {invalidCustom && (
          <p role="alert" className="text-sm text-destructive">
            La date de début doit précéder la date de fin.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-2">
        <Button variant="outline" asChild aria-disabled={invalidCustom}>
          <a href={invalidCustom ? undefined : href("csv")} download>
            <FileText /> Télécharger en CSV
          </a>
        </Button>
        <Button asChild aria-disabled={invalidCustom}>
          <a href={invalidCustom ? undefined : href("xlsx")} download>
            <FileSpreadsheet /> Télécharger en Excel
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
