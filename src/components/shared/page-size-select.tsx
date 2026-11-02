"use client";

import { useRouter } from "next/navigation";
import { NativeSelect } from "@/components/ui/input";
import { PAGE_SIZES } from "@/lib/constants";
import { buildQuery } from "@/lib/utils";

export function PageSizeSelect({
  basePath,
  params,
  value,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  value: number;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-muted-foreground">
      <span className="hidden sm:inline">Lignes</span>
      <NativeSelect
        wrapperClassName="w-20"
        aria-label="Nombre de lignes par page"
        value={value}
        onChange={(e) =>
          // Changer la taille de page ramène à la première page.
          router.push(`${basePath}${buildQuery({ ...params, page: undefined, pageSize: e.target.value })}`, {
            scroll: false,
          })
        }
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
