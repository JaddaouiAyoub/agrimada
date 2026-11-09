import { z } from "zod";
import { FUNDS_SOURCES, PAYMENT_METHODS } from "@/lib/constants";
import { isValidIsoDate } from "@/lib/dates";
import { AMOUNT_REGEX, normalizeAmount } from "@/lib/money";
import { ID_REGEX } from "@/lib/validations/common";

// Schéma sans transformation : identique pour le formulaire (client) et l'action (serveur).
// La conversion en Decimal / Date est faite par le service serveur.
export const operationFormSchema = z
  .object({
    // Facultatif pour une cotisation (généré automatiquement si vide), sinon 2 caractères minimum.
    title: z.string().trim().max(160, "160 caractères maximum"),
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
    // Uniquement pour les revenus ; ignoré (forcé à false) pour une dépense par le service.
    isContribution: z.boolean(),
    paymentMethod: z.union([z.literal(""), z.enum(PAYMENT_METHODS)]),
    // Ignorés (enregistrés vides) pour une cotisation.
    counterparty: z.string().trim().max(160, "160 caractères maximum"),
    reference: z.string().trim().max(100, "100 caractères maximum"),
  })
  .superRefine((v, ctx) => {
    const title = v.title.trim();
    if (v.isContribution ? title.length === 1 : title.length < 2) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "Le titre doit contenir au moins 2 caractères" });
    }
  });

export type OperationFormValues = z.infer<typeof operationFormSchema>;
