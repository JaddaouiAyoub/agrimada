import "server-only";
import { db } from "@/lib/db";
import { BusinessError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/auth/session";
import { dbDateToIso, isoToDbDate } from "@/lib/dates";
import { emptyToNull } from "@/lib/validations/common";
import type { SettingsValues } from "@/lib/validations/settings";
import { diffFields, writeAudit } from "@/server/audit";

export async function updateSettings(actor: CurrentUser, input: SettingsValues): Promise<void> {
  await db.$transaction(async (tx) => {
    const existing = await tx.farmSettings.findUnique({ where: { id: 1 } });
    const defaultContributionCategoryId = input.defaultContributionCategoryId || null;
    if (defaultContributionCategoryId && defaultContributionCategoryId !== existing?.defaultContributionCategoryId) {
      const category = await tx.category.findUnique({
        where: { id: defaultContributionCategoryId },
        select: { type: true, isActive: true },
      });
      if (!category || category.type !== "REVENUE" || !category.isActive) {
        throw new BusinessError("La catégorie par défaut des cotisations doit être une catégorie de revenu active.");
      }
    }
    const next = {
      farmName: input.farmName,
      description: emptyToNull(input.description),
      timezone: input.timezone,
      dateFormat: input.dateFormat,
      lockedUntil: input.lockedUntil ? isoToDbDate(input.lockedUntil) : null,
      defaultContributionCategoryId,
    };
    await tx.farmSettings.upsert({ where: { id: 1 }, create: { id: 1, ...next }, update: next });

    const changes = diffFields(
      {
        farmName: existing?.farmName ?? null,
        description: existing?.description ?? null,
        timezone: existing?.timezone ?? null,
        dateFormat: existing?.dateFormat ?? null,
        lockedUntil: existing?.lockedUntil ? dbDateToIso(existing.lockedUntil) : null,
        defaultContributionCategoryId: existing?.defaultContributionCategoryId ?? null,
      },
      { ...next, lockedUntil: input.lockedUntil || null },
    );
    if (Object.keys(changes).length > 0) {
      await writeAudit(tx, {
        actorId: actor.id,
        action: "settings.update",
        entityType: "FarmSettings",
        entityId: "1",
        metadata: { changes },
      });
    }
  });
}
