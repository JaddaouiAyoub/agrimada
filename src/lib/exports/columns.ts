import "server-only";
import {
  FUNDS_SOURCE_LABELS,
  OPERATION_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { dbDateToIso } from "@/lib/dates";
import type { ExportRow } from "@/server/queries/operations";

export type CellValue = { kind: "text"; value: string } | { kind: "amount"; value: string } | { kind: "date"; value: string };

export type ExportColumn = { header: string; width: number; get: (row: ExportRow) => CellValue };

const text = (value: string | null | undefined): CellValue => ({ kind: "text", value: value ?? "" });

export const OPERATION_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Date", width: 12, get: (r) => ({ kind: "date", value: dbDateToIso(r.date) }) },
  { header: "Type", width: 10, get: (r) => text(OPERATION_TYPE_LABELS[r.type]) },
  { header: "Titre", width: 32, get: (r) => text(r.title) },
  { header: "Description", width: 40, get: (r) => text(r.description) },
  { header: "Catégorie", width: 28, get: (r) => text(r.category.name) },
  { header: "Montant", width: 14, get: (r) => ({ kind: "amount", value: r.amount.toFixed(2) }) },
  { header: "Devise", width: 8, get: (r) => text(r.currency) },
  { header: "Membre concerné", width: 22, get: (r) => text(r.member.name) },
  { header: "Origine des fonds", width: 36, get: (r) => text(FUNDS_SOURCE_LABELS[r.type][r.fundsSource]) },
  { header: "Créateur", width: 22, get: (r) => text(r.createdBy.name) },
  { header: "Fournisseur / client", width: 26, get: (r) => text(r.counterparty) },
  {
    header: "Mode de paiement",
    width: 18,
    get: (r) => text(r.paymentMethod ? PAYMENT_METHOD_LABELS[r.paymentMethod] : ""),
  },
  { header: "Référence", width: 18, get: (r) => text(r.reference) },
];
