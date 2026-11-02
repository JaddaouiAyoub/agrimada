import { z } from "zod";
import { ROLES } from "@/lib/constants";
import { emailSchema, idSchema, personNameSchema } from "@/lib/validations/common";

export const memberCreateSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  role: z.enum(ROLES),
  // Seule méthode d'activation disponible sans service email : lien à usage unique.
  initialStatus: z.enum(["PENDING", "DISABLED"]),
});
export type MemberCreateValues = z.infer<typeof memberCreateSchema>;

export const memberUpdateSchema = z.object({
  id: idSchema,
  name: personNameSchema,
  email: emailSchema,
  role: z.enum(ROLES),
});
export type MemberUpdateValues = z.infer<typeof memberUpdateSchema>;
