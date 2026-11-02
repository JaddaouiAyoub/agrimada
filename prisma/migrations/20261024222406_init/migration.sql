-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('EXPENSE', 'REVENUE');

-- CreateEnum
CREATE TYPE "FundsSource" AS ENUM ('FARM', 'MEMBER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'MOBILE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('INVITATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "normalizedName" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7),
    "icon" VARCHAR(40),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(2000),
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'MAD',
    "date" DATE NOT NULL,
    "categoryId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "fundsSource" "FundsSource" NOT NULL DEFAULT 'FARM',
    "paymentMethod" "PaymentMethod",
    "counterparty" VARCHAR(160),
    "reference" VARCHAR(100),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "ip" VARCHAR(45),
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "farmName" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000),
    "currency" CHAR(3) NOT NULL DEFAULT 'MAD',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Africa/Casablanca',
    "dateFormat" VARCHAR(20) NOT NULL DEFAULT 'dd/MM/yyyy',
    "lockedUntil" DATE,
    "sharesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" VARCHAR(60) NOT NULL,
    "entityType" VARCHAR(40) NOT NULL,
    "entityId" VARCHAR(40),
    "metadata" JSONB,
    "ip" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_role_idx" ON "User"("status", "role");

-- CreateIndex
CREATE INDEX "Category_type_isActive_sortOrder_idx" ON "Category"("type", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_type_normalizedName_key" ON "Category"("type", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_type_key" ON "Category"("id", "type");

-- CreateIndex
CREATE INDEX "Operation_date_id_idx" ON "Operation"("date" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Operation_type_date_idx" ON "Operation"("type", "date" DESC);

-- CreateIndex
CREATE INDEX "Operation_memberId_date_idx" ON "Operation"("memberId", "date" DESC);

-- CreateIndex
CREATE INDEX "Operation_categoryId_date_idx" ON "Operation"("categoryId", "date" DESC);

-- CreateIndex
CREATE INDEX "Operation_amount_idx" ON "Operation"("amount");

-- CreateIndex
CREATE INDEX "Operation_createdById_idx" ON "Operation"("createdById");

-- CreateIndex
CREATE INDEX "Operation_createdAt_idx" ON "Operation"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");

-- CreateIndex
CREATE INDEX "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ip_createdAt_idx" ON "LoginAttempt"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_categoryId_type_fkey" FOREIGN KEY ("categoryId", "type") REFERENCES "Category"("id", "type") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
