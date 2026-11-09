import type { Metadata } from "next";
import { OperationDetailPage } from "@/components/operations/operation-pages";

export const metadata: Metadata = { title: "Cotisations — détail" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OperationDetailPage type="REVENUE" contribution operationId={id} />;
}
