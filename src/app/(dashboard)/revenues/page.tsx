import type { Metadata } from "next";
import { OperationListPage } from "@/components/operations/operation-pages";
import type { SearchParams } from "@/lib/validations/filters";

export const metadata: Metadata = { title: "Revenus" };

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <OperationListPage type="REVENUE" basePath="/revenues" searchParams={await searchParams} />;
}
