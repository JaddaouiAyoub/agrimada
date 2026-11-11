import { NextResponse, type NextRequest } from "next/server";

// Contrôle grossier : redirige vers /login en l'absence de cookie de session.
// Ce n'est PAS une barrière de sécurité : chaque page, action et route vérifie
// la session et les droits côté serveur (requireUser / requireAdminPage).
const PUBLIC_PATHS = ["/login", "/activate", "/forgot-password"];

// Site vitrine (/fr, /ar et leurs pages) et fichiers SEO : accessibles sans compte.
const SITE_PATHS = ["/fr", "/ar"];
const SITE_FILES = ["/", "/sitemap.xml", "/robots.txt"];

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith("authjs.session-token") || c.name.startsWith("__Secure-authjs.session-token"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    SITE_FILES.includes(pathname) ||
    [...PUBLIC_PATHS, ...SITE_PATHS].some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isPublic && !hasSessionCookie(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|jpeg|webp)$).*)"],
};
