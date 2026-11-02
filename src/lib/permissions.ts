// Matrice des permissions — fonctions pures, appelées côté serveur avant chaque lecture
// ou écriture sensible. L'interface s'en sert aussi pour masquer les actions, mais
// ce masquage n'est jamais une protection.
import type { RoleValue } from "@/lib/constants";

export type Actor = { id: string; role: RoleValue };

export function isAdmin(actor: Actor): boolean {
  return actor.role === "ADMIN";
}

/** Membres, catégories, paramètres, journal d'audit. */
export function canAdministrate(actor: Actor): boolean {
  return isAdmin(actor);
}

/** Q6 : tous les membres actifs voient toutes les opérations de la ferme. */
export function canReadOperations(_actor: Actor): boolean {
  return true;
}

/** Q4 : un membre ne saisit que ses propres opérations ; l'admin peut choisir le membre. */
export function canChooseOperationMember(actor: Actor): boolean {
  return isAdmin(actor);
}

/** Un membre modifie/supprime les opérations qu'il a créées ; l'admin, toutes. */
export function canEditOperation(actor: Actor, operation: { createdById: string }): boolean {
  return isAdmin(actor) || operation.createdById === actor.id;
}

/** Les exports suivent les droits de lecture. */
export function canExport(actor: Actor): boolean {
  return canReadOperations(actor);
}
