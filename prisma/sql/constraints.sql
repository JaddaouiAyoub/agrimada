-- FarmShare — contraintes CHECK non exprimables dans schema.prisma.
-- Prisma Migrate ignore les contraintes CHECK : elles ne seront ni signalées comme dérive, ni supprimées.
-- À AJOUTER À LA FIN du fichier migration.sql généré par :
--   npx prisma migrate dev --create-only --name init
-- puis appliquer avec : npx prisma migrate dev

ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_amount_positive" CHECK ("amount" > 0);

ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_currency_upper" CHECK ("currency" = upper("currency"));

ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_deleted_consistency" CHECK (("deletedAt" IS NULL) = ("deletedById" IS NULL));

ALTER TABLE "User"
  ADD CONSTRAINT "User_email_lowercase" CHECK ("email" = lower("email"));

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_normalized_lowercase" CHECK ("normalizedName" = lower("normalizedName"));

ALTER TABLE "FarmSettings"
  ADD CONSTRAINT "FarmSettings_singleton" CHECK ("id" = 1);

-- Ajoutée par la migration 20261109120000_add_contributions :
ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_contribution_is_revenue" CHECK (NOT "isContribution" OR "type" = 'REVENUE');

-- Ajoutée par la migration 20261110120000_expense_contributions :
ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_source_expense_on_contribution" CHECK ("sourceExpenseId" IS NULL OR "isContribution");
