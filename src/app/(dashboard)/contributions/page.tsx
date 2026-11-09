import type { Metadata } from "next";
import { OperationListPage } from "@/components/operations/operation-pages";
import type { SearchParams } from "@/lib/validations/filters";

export const metadata: Metadata = { title: "Cotisations" };

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <OperationListPage type="REVENUE" contribution basePath="/contributions" searchParams={await searchParams} />;
}
