import {
  PAYMENT_METHOD_LABELS,
  ROLE_LABELS,
  type PaymentMethodValue,
  type RoleValue,
} from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const ACTION_LABELS: Record<string, string> = {
  "operation.create": "Opération créée",
  "operation.update": "Opération modifiée",
  "operation.delete": "Opération supprimée",
  "user.create": "Membre créé",
  "user.update": "Membre modifié",
  "user.enable": "Compte réactivé",
  "user.disable": "Compte désactivé",
  "user.delete": "Compte supprimé",
  "user.activate": "Compte activé",
  "user.invitation_link": "Lien d'activation généré",
  "user.reset_link": "Lien de réinitialisation généré",
  "user.password_reset": "Mot de passe réinitialisé",
  "user.password_change": "Mot de passe modifié",
  "user.profile_update": "Profil modifié",
  "category.create": "Catégorie créée",
  "category.update": "Catégorie modifiée",
  "category.enable": "Catégorie activée",
  "category.disable": "Catégorie désactivée",
  "category.reorder": "Catégories réordonnées",
  "category.delete": "Catégorie supprimée",
  "settings.update": "Paramètres modifiés",
  "export.download": "Export téléchargé",
  "admin.bootstrap": "Administrateur initial créé",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Titre",
  amount: "Montant",
  date: "Date",
  categoryId: "Catégorie",
  memberId: "Membre",
  fundsSource: "Origine des fonds",
  paymentMethod: "Mode de paiement",
  counterparty: "Fournisseur / client",
  reference: "Référence",
  description: "Description",
  name: "Nom",
  email: "Email",
  role: "Rôle",
  color: "Couleur",
  icon: "Icône",
  farmName: "Nom de la ferme",
  timezone: "Fuseau horaire",
  dateFormat: "Format des dates",
  lockedUntil: "Clôture jusqu'au",
};

export function describeAuditAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatValue(field: string, value: unknown, names: Record<string, string>): string {
  if (value === null || value === undefined || value === "") return "—";
  const v = String(value);
  if (field === "amount") return formatMoney(v);
  if (field === "categoryId" || field === "memberId") return names[v] ?? "(élément supprimé)";
  if (field === "fundsSource") return v === "MEMBER" ? "Argent du membre" : "Fonds de la ferme";
  if (field === "paymentMethod") return PAYMENT_METHOD_LABELS[v as PaymentMethodValue] ?? v;
  if (field === "role") return ROLE_LABELS[v as RoleValue] ?? v;
  return v.length > 80 ? `${v.slice(0, 80)}…` : v;
}

/** Extrait les changements { champ: [avant, après] } d'une métadonnée d'audit. */
export function describeChanges(
  metadata: unknown,
  names: Record<string, string>,
): { field: string; before: string; after: string }[] {
  if (!metadata || typeof metadata !== "object" || !("changes" in metadata)) return [];
  const changes = (metadata as { changes: unknown }).changes;
  if (!changes || typeof changes !== "object") return [];
  return Object.entries(changes as Record<string, unknown>)
    .filter((entry): entry is [string, [unknown, unknown]] => Array.isArray(entry[1]) && entry[1].length === 2)
    .map(([field, [before, after]]) => ({
      field: FIELD_LABELS[field] ?? field,
      before: formatValue(field, before, names),
      after: formatValue(field, after, names),
    }));
}
