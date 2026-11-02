"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Ellipsis, LoaderCircle, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_ICON_NAMES } from "@/lib/category-icons";
import { OPERATION_TYPES, OPERATION_TYPE_LABELS } from "@/lib/constants";
import { categorySchema, type CategoryInput, type CategoryValues } from "@/lib/validations/category";
import { cn } from "@/lib/utils";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  setCategoryActiveAction,
  updateCategoryAction,
} from "@/server/actions/categories";

function CategoryFormDialog({
  open,
  onOpenChange,
  categoryId,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
  defaultValues: CategoryInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const form = useForm<CategoryInput, unknown, CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues });
  const { errors } = form.formState;
  const color = useWatch({ control: form.control, name: "color" });
  const icon = useWatch({ control: form.control, name: "icon" });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = categoryId ? await updateCategoryAction(categoryId, values) : await createCategoryAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Enregistré.");
      onOpenChange(false);
      if (!categoryId) form.reset(defaultValues);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryId ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          <DialogDescription>
            Le nom doit être unique pour un même type (sans distinction de majuscules).
            {categoryId && " Le type d'une catégorie existante ne peut pas être modifié."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <FormField id="c-type" label="Type" required>
              <NativeSelect id="c-type" disabled={Boolean(categoryId)} {...form.register("type")}>
                {OPERATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {OPERATION_TYPE_LABELS[t]}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="c-name" label="Nom" required error={errors.name?.message}>
              <Input {...fieldAria("c-name", errors.name?.message)} {...form.register("name")} />
            </FormField>
          </div>
          <FormField id="c-description" label="Description" error={errors.description?.message}>
            <Textarea {...fieldAria("c-description", errors.description?.message)} rows={2} {...form.register("description")} />
          </FormField>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Couleur</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => form.setValue("color", "", { shouldDirty: true })}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-[10px] text-muted-foreground",
                  color === "" && "ring-2 ring-ring ring-offset-2",
                )}
                aria-label="Aucune couleur"
                aria-pressed={color === ""}
              >
                —
              </button>
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => form.setValue("color", c, { shouldDirty: true })}
                  className={cn("size-8 rounded-full border", color === c && "ring-2 ring-ring ring-offset-2")}
                  style={{ backgroundColor: c }}
                  aria-label={`Couleur ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Icône</legend>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ICON_NAMES.map((name) => {
                const Icon = CATEGORY_ICONS[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => form.setValue("icon", icon === name ? "" : name, { shouldDirty: true })}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border bg-card hover:bg-accent",
                      icon === name && "border-primary bg-secondary text-primary",
                    )}
                    aria-label={`Icône ${name}`}
                    aria-pressed={icon === name}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <LoaderCircle className="animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCategoryButton({ defaultType }: { defaultType: "EXPENSE" | "REVENUE" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Nouvelle catégorie
      </Button>
      {open && (
        <CategoryFormDialog
          open
          onOpenChange={setOpen}
          defaultValues={{ type: defaultType, name: "", description: "", color: "", icon: "" }}
        />
      )}
    </>
  );
}

export function CategoryActions({
  category,
  isFirst,
  isLast,
}: {
  category: {
    id: string;
    type: "EXPENSE" | "REVENUE";
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    isActive: boolean;
    totalOperationsCount: number;
  };
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<"edit" | "toggle" | "delete" | null>(null);
  const [, startTransition] = React.useTransition();

  const move = (direction: "up" | "down") =>
    startTransition(async () => {
      const result = await moveCategoryAction(category.id, direction);
      if (!result.ok) toast.error(result.error);
      router.refresh();
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${category.name}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("edit")}>
            <Pencil /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isFirst} onSelect={() => move("up")}>
            <ArrowUp /> Monter
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLast} onSelect={() => move("down")}>
            <ArrowDown /> Descendre
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialog("toggle")}>
            {category.isActive ? <PowerOff /> : <Power />}
            {category.isActive ? "Désactiver" : "Activer"}
          </DropdownMenuItem>
          {category.totalOperationsCount === 0 && (
            <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
              <Trash2 /> Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "edit" && (
        <CategoryFormDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          categoryId={category.id}
          defaultValues={{
            type: category.type,
            name: category.name,
            description: category.description ?? "",
            color: category.color ?? "",
            icon: category.icon ?? "",
          }}
        />
      )}
      <ConfirmAction
        open={dialog === "toggle"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={category.isActive ? `Désactiver « ${category.name} » ?` : `Activer « ${category.name} » ?`}
        description={
          category.isActive
            ? "La catégorie ne sera plus proposée pour les nouvelles opérations. Les opérations existantes la conservent."
            : "La catégorie sera de nouveau proposée lors de la saisie."
        }
        confirmLabel={category.isActive ? "Désactiver" : "Activer"}
        action={() => setCategoryActiveAction(category.id, !category.isActive)}
      />
      <ConfirmAction
        open={dialog === "delete"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Supprimer « ${category.name} » ?`}
        description="Cette catégorie n'a jamais été utilisée : elle sera supprimée définitivement."
        confirmLabel="Supprimer"
        destructive
        action={() => deleteCategoryAction(category.id)}
      />
    </>
  );
}
