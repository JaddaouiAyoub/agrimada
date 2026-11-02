import { z } from "zod";
import { emailSchema, newPasswordSchema, personNameSchema } from "@/lib/validations/common";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis").max(128),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const setPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: newPasswordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel").max(128),
    newPassword: newPasswordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Le nouveau mot de passe doit être différent de l'actuel",
    path: ["newPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  name: personNameSchema,
});
export type ProfileValues = z.infer<typeof profileSchema>;
