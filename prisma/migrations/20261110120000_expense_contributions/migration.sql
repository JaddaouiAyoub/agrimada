-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "sourceExpenseId" TEXT;

-- AlterTable
ALTER TABLE "FarmSettings" ADD COLUMN     "advanceContributionCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "Operation_sourceExpenseId_idx" ON "Operation"("sourceExpenseId");

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_sourceExpenseId_fkey" FOREIGN KEY ("sourceExpenseId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmSettings" ADD CONSTRAINT "FarmSettings_advanceContributionCategoryId_fkey" FOREIGN KEY ("advanceContributionCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FarmShare — contrainte CHECK (non exprimable dans schema.prisma) :
-- seule une cotisation peut être rattachée à une dépense d'origine.
ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_source_expense_on_contribution" CHECK ("sourceExpenseId" IS NULL OR "isContribution");
