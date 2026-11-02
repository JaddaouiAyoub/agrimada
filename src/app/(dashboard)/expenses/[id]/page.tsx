import type { Metadata } from "next";
import { OperationDetailPage } from "@/components/operations/operation-pages";

export const metadata: Metadata = { title: "Dépenses — détail" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OperationDetailPage type="EXPENSE" operationId={id} />;
}
