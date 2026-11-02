// Protection contre l'injection de formules (CSV / Excel) :
// une cellule texte commençant par = + - @ tabulation ou retour chariot est
// préfixée d'une apostrophe pour être interprétée comme du texte.
const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;

export function sanitizeCell(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const v = String(value);
  return DANGEROUS_PREFIX.test(v) ? `'${v}` : v;
}
