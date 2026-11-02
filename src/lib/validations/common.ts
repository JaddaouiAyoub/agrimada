import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export const ID_REGEX = /^[a-z0-9]{20,40}$/i;

export const idSchema = z.string().regex(ID_REGEX, "Identifiant invalide");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "L'adresse email est requise")
  .max(254, "Adresse email trop longue")
  .pipe(z.email("Adresse email invalide"));

export const personNameSchema = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(120, "Le nom ne doit pas dépasser 120 caractères");

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`)
  .max(128, "Le mot de passe ne doit pas dépasser 128 caractères");

/** "" ou undefined → null, sinon la chaîne nettoyée. */
export function emptyToNull(value: string | undefined | null): string | null {
  const v = value?.trim();
  return v ? v : null;
}
