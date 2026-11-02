// Formatage des montants. Les montants circulent en chaînes décimales (ex. "1250.50") :
// la conversion en number n'est utilisée que pour l'affichage, jamais pour un calcul qui fait foi.

export const AMOUNT_REGEX = /^\d{1,12}([.,]\d{1,2})?$/;

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "MAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: string | number | null | undefined): string {
  return moneyFormatter.format(toNumber(value));
}

export function formatCompact(value: string | number): string {
  return compactFormatter.format(toNumber(value));
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

/** "1 250,5" → "1250.5" ; à appeler après validation par AMOUNT_REGEX. */
export function normalizeAmount(input: string): string {
  return input.trim().replace(/\s/g, "").replace(",", ".");
}

/** Montant décimal → valeur saisissable dans un champ texte ("1250.50" → "1250,50"). */
export function amountToInput(value: string): string {
  return value.replace(".", ",");
}
