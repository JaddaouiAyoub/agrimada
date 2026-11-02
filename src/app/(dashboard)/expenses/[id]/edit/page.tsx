import type { Metadata } from "next";
import { OperationFormPage } from "@/components/operations/operation-pages";

export const metadata: Metadata = { title: "Dépenses — modification" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OperationFormPage type="EXPENSE" operationId={id} />;
}
