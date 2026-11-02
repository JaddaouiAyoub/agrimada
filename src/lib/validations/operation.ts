import { z } from "zod";
import { FUNDS_SOURCES, PAYMENT_METHODS } from "@/lib/constants";
import { isValidIsoDate } from "@/lib/dates";
import { AMOUNT_REGEX, normalizeAmount } from "@/lib/money";
import { ID_REGEX } from "@/lib/validations/common";

// Schéma sans transformation : identique pour le formulaire (client) et l'action (serveur).
// La conversion en Decimal / Date est faite par le service serveur.
export const operationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(160, "160 caractères maximum"),
  description: z.string().trim().max(2000, "2000 caractères maximum"),
  amount: z
    .string()
    .trim()
    .regex(AMOUNT_REGEX, "Montant invalide (ex. 1250,50 — 2 décimales maximum)")
    .refine((v) => Number(normalizeAmount(v)) > 0, "Le montant doit être supérieur à 0"),
  date: z
    .string()
    .refine(isValidIsoDate, "Date invalide")
    .refine((v) => v >= "2000-01-01" && v <= "2100-12-31", "Date hors limites"),
  categoryId: z.string().regex(ID_REGEX, "Choisissez une catégorie"),
  memberId: z.string().regex(ID_REGEX, "Choisissez un membre"),
  fundsSource: z.enum(FUNDS_SOURCES),
  paymentMethod: z.union([z.literal(""), z.enum(PAYMENT_METHODS)]),
  counterparty: z.string().trim().max(160, "160 caractères maximum"),
  reference: z.string().trim().max(100, "100 caractères maximum"),
});

export type OperationFormValues = z.infer<typeof operationFormSchema>;
