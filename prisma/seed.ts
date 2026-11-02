// Initialisation idempotente : crée les paramètres de la ferme et les catégories par défaut
// UNIQUEMENT si elles n'existent pas. Ne crée aucun utilisateur (voir scripts/create-admin.ts).
// Lancement : npm run db:seed
import { PrismaClient, type OperationType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = { name: string; icon: string; color: string };

const EXPENSE_CATEGORIES: SeedCategory[] = [
  { name: "Alimentation du bétail", icon: "wheat", color: "#8a7a5c" },
  { name: "Semences", icon: "sprout", color: "#6b8f71" },
  { name: "Engrais et produits agricoles", icon: "leaf", color: "#2f6b4f" },
  { name: "Matériel agricole", icon: "tractor", color: "#2a78d6" },
  { name: "Main-d'œuvre", icon: "users", color: "#6250d6" },
  { name: "Irrigation et eau", icon: "droplets", color: "#1baf7a" },
  { name: "Électricité et carburant", icon: "fuel", color: "#eda100" },
  { name: "Entretien et réparations", icon: "wrench", color: "#eb6834" },
  { name: "Transport", icon: "truck", color: "#e87ba4" },
  { name: "Location de matériel", icon: "package", color: "#2f6b4f" },
  { name: "Frais administratifs", icon: "briefcase", color: "#8a7a5c" },
  { name: "Autres dépenses", icon: "tag", color: "#e34948" },
];

const REVENUE_CATEGORIES: SeedCategory[] = [
  { name: "Vente de récoltes", icon: "wheat", color: "#2f6b4f" },
  { name: "Vente de fruits et légumes", icon: "carrot", color: "#eb6834" },
  { name: "Vente d'animaux", icon: "beef", color: "#8a7a5c" },
  { name: "Vente de lait et de produits agricoles", icon: "milk", color: "#2a78d6" },
  { name: "Location de terrain ou de matériel", icon: "hand-coins", color: "#1baf7a" },
  { name: "Autres revenus", icon: "banknote", color: "#6250d6" },
];

function normalize(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

async function seedCategories(type: OperationType, categories: SeedCategory[]): Promise<number> {
  const existing = await prisma.category.count({ where: { type } });
  if (existing > 0) {
    console.log(`  • Catégories ${type} : ${existing} déjà présentes — rien à faire.`);
    return 0;
  }
  const result = await prisma.category.createMany({
    data: categories.map((c, index) => ({
      type,
      name: c.name,
      normalizedName: normalize(c.name),
      icon: c.icon,
      color: c.color,
      sortOrder: index + 1,
    })),
    skipDuplicates: true,
  });
  console.log(`  • Catégories ${type} : ${result.count} créées.`);
  return result.count;
}

async function main() {
  console.log("Initialisation FarmShare…");

  const settings = await prisma.farmSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.farmSettings.create({ data: { id: 1, farmName: "Notre ferme" } });
    console.log("  • Paramètres de la ferme créés (nom modifiable dans Paramètres).");
  } else {
    console.log("  • Paramètres de la ferme déjà présents — rien à faire.");
  }

  const created = (await seedCategories("EXPENSE", EXPENSE_CATEGORIES)) + (await seedCategories("REVENUE", REVENUE_CATEGORIES));
  if (created > 0) {
    await prisma.auditLog.create({
      data: { actorId: null, action: "category.create", entityType: "Category", metadata: { seed: true, count: created } },
    });
  }
  console.log("Terminé.");
}

main()
  .catch((error) => {
    console.error("Échec de l'initialisation :", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
