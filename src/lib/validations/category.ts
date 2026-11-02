import { z } from "zod";
import { OPERATION_TYPES } from "@/lib/constants";
import { isCategoryIconName } from "@/lib/category-icons";

export const categorySchema = z.object({
  type: z.enum(OPERATION_TYPES),
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Le nom ne doit pas dépasser 80 caractères"),
  description: z.string().trim().max(500, "500 caractères maximum"),
  color: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide")]),
  icon: z.string().refine((v) => v === "" || isCategoryIconName(v), "Icône invalide"),
});
export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryValues = z.output<typeof categorySchema>;

/** Nom normalisé pour l'unicité insensible à la casse. */
export function normalizeCategoryName(name: string): string {
  return cleanCategoryName(name).toLocaleLowerCase("fr-FR");
}

export function cleanCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
