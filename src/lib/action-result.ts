export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

/** Erreur métier dont le message peut être montré tel quel à l'utilisateur. */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export class ForbiddenError extends BusinessError {
  constructor(message = "Vous n'avez pas les droits nécessaires pour cette action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
