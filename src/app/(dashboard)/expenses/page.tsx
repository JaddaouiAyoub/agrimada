import type { Metadata } from "next";
import { OperationListPage } from "@/components/operations/operation-pages";
import type { SearchParams } from "@/lib/validations/filters";

export const metadata: Metadata = { title: "Dépenses" };

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <OperationListPage type="EXPENSE" basePath="/expenses" searchParams={await searchParams} />;
}
