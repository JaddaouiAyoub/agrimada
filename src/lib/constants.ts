// Constantes partagées client/serveur. Ne jamais importer @prisma/client ici :
// ce fichier est aussi utilisé dans les composants client.

export const APP_NAME = "FarmShare";
export const DEFAULT_CURRENCY = "MAD";
export const DEFAULT_TIMEZONE = "Africa/Casablanca";

export const ROLES = ["ADMIN", "MEMBER"] as const;
export type RoleValue = (typeof ROLES)[number];

export const USER_STATUSES = ["PENDING", "ACTIVE", "DISABLED"] as const;
export type UserStatusValue = (typeof USER_STATUSES)[number];

export const OPERATION_TYPES = ["EXPENSE", "REVENUE"] as const;
export type OperationTypeValue = (typeof OPERATION_TYPES)[number];

export const FUNDS_SOURCES = ["FARM", "MEMBER"] as const;
export type FundsSourceValue = (typeof FUNDS_SOURCES)[number];

export const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "CARD",
  "MOBILE_PAYMENT",
  "OTHER",
] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export const ROLE_LABELS: Record<RoleValue, string> = {
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};

export const USER_STATUS_LABELS: Record<UserStatusValue, string> = {
  PENDING: "En attente d'activation",
  ACTIVE: "Actif",
  DISABLED: "Désactivé",
};

export const OPERATION_TYPE_LABELS: Record<OperationTypeValue, string> = {
  EXPENSE: "Dépense",
  REVENUE: "Revenu",
};

export const OPERATION_TYPE_PLURAL: Record<OperationTypeValue, string> = {
  EXPENSE: "Dépenses",
  REVENUE: "Revenus",
};

export const OPERATION_TYPE_PATHS: Record<OperationTypeValue, string> = {
  EXPENSE: "/expenses",
  REVENUE: "/revenues",
};

export const FUNDS_SOURCE_LABELS: Record<OperationTypeValue, Record<FundsSourceValue, string>> = {
  EXPENSE: {
    FARM: "Payée avec les fonds de la ferme",
    MEMBER: "Avancée par le membre (argent personnel)",
  },
  REVENUE: {
    FARM: "Versé dans les fonds de la ferme",
    MEMBER: "Conservé par le membre",
  },
};

export const MEMBER_ROLE_LABELS: Record<OperationTypeValue, string> = {
  EXPENSE: "Payé par",
  REVENUE: "Encaissé par",
};

export const COUNTERPARTY_LABELS: Record<OperationTypeValue, string> = {
  EXPENSE: "Fournisseur",
  REVENUE: "Client / acheteur",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  CASH: "Espèces",
  BANK_TRANSFER: "Virement bancaire",
  CHEQUE: "Chèque",
  CARD: "Carte bancaire",
  MOBILE_PAYMENT: "Paiement mobile",
  OTHER: "Autre",
};

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export const DATE_FORMATS = ["dd/MM/yyyy", "d MMM yyyy", "yyyy-MM-dd"] as const;
export type DateFormatValue = (typeof DATE_FORMATS)[number];
export const DATE_FORMAT_LABELS: Record<DateFormatValue, string> = {
  "dd/MM/yyyy": "24/10/2026",
  "d MMM yyyy": "24 oct. 2026",
  "yyyy-MM-dd": "2026-10-24",
};

export const PERIOD_PRESETS = ["today", "week", "month", "quarter", "year", "all", "custom"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
  all: "Toute la période",
  custom: "Période personnalisée",
};

export const TIMEZONES = [
  "Africa/Casablanca",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
] as const;

export const PASSWORD_MIN_LENGTH = 12;
export const INVITATION_TTL_HOURS = 72;
export const RESET_TTL_HOURS = 24;
