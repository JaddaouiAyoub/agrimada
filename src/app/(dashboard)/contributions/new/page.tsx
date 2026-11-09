import type { Metadata } from "next";
import { OperationFormPage } from "@/components/operations/operation-pages";

export const metadata: Metadata = { title: "Cotisations — saisie" };

export default function Page() {
  return <OperationFormPage type="REVENUE" contribution />;
}
