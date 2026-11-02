import "server-only";
import { unstable_rethrow } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { BusinessError, type ActionResult } from "@/lib/action-result";

/**
 * Enveloppe commune des Server Actions : convertit les erreurs connues en messages
 * utilisateur et masque les erreurs internes (journalisées côté serveur uniquement).
 */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    unstable_rethrow(error); // redirect(), notFound()…
    if (error instanceof BusinessError) return { ok: false, error: error.message };
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: "Certaines informations sont invalides.",
        fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { ok: false, error: "Cette valeur existe déjà." };
      if (error.code === "P2003") return { ok: false, error: "Cet élément est lié à des données existantes." };
      if (error.code === "P2034") return { ok: false, error: "Conflit de modification, veuillez réessayer." };
    }
    console.error("[action] erreur inattendue", error);
    return { ok: false, error: "Une erreur inattendue est survenue. Veuillez réessayer." };
  }
}

/** Valide une entrée d'action ; lève une ZodError convertie par runAction. */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  return schema.parse(input);
}
