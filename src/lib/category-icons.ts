// Liste blanche d'icônes Lucide proposées pour les catégories.
// Seuls ces noms sont acceptés côté serveur.
import {
  Banknote,
  Beef,
  Briefcase,
  Carrot,
  Droplets,
  Fuel,
  HandCoins,
  Leaf,
  Milk,
  Package,
  Sprout,
  Tag,
  Tractor,
  Truck,
  Users,
  Wheat,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS = {
  wheat: Wheat,
  sprout: Sprout,
  leaf: Leaf,
  carrot: Carrot,
  beef: Beef,
  milk: Milk,
  tractor: Tractor,
  wrench: Wrench,
  droplets: Droplets,
  fuel: Fuel,
  zap: Zap,
  truck: Truck,
  users: Users,
  briefcase: Briefcase,
  package: Package,
  banknote: Banknote,
  "hand-coins": HandCoins,
  tag: Tag,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS) as CategoryIconName[];

export function isCategoryIconName(value: string): value is CategoryIconName {
  return Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, value);
}

export function getCategoryIcon(name: string | null | undefined): LucideIcon {
  return name && isCategoryIconName(name) ? CATEGORY_ICONS[name] : Tag;
}

export const CATEGORY_COLORS = [
  "#2f6b4f",
  "#6b8f71",
  "#1baf7a",
  "#2a78d6",
  "#eb6834",
  "#eda100",
  "#e87ba4",
  "#6250d6",
  "#e34948",
  "#8a7a5c",
] as const;
