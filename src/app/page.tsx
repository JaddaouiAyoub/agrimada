import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/site/config";

// L'adresse racine ouvre le site vitrine ; l'application reste accessible via /login et /dashboard.
export default function Home() {
  redirect(`/${DEFAULT_LOCALE}`);
}
