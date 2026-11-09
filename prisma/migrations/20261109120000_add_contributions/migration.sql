-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "isContribution" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FarmSettings" ADD COLUMN     "defaultContributionCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "Operation_type_isContribution_date_idx" ON "Operation"("type", "isContribution", "date" DESC);

-- AddForeignKey
ALTER TABLE "FarmSettings" ADD CONSTRAINT "FarmSettings_defaultContributionCategoryId_fkey" FOREIGN KEY ("defaultContributionCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FarmShare — contrainte CHECK (non exprimable dans schema.prisma) :
-- une cotisation est toujours un revenu.
ALTER TABLE "Operation"
  ADD CONSTRAINT "Operation_contribution_is_revenue" CHECK (NOT "isContribution" OR "type" = 'REVENUE');
