import type { Metadata } from "next";
import { OperationFormPage } from "@/components/operations/operation-pages";

export const metadata: Metadata = { title: "Dépenses — saisie" };

export default function Page() {
  return <OperationFormPage type="EXPENSE" />;
}
