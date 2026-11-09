-- FarmShare — conversion des revenus de la catégorie « المساهمات الشهرية » en cotisations.
-- À exécuter UNE FOIS, APRÈS la migration 20261109120000_add_contributions,
-- sur chaque base concernée (locale : fermedb sur localhost:5435, puis production).
-- Le script est rejouable sans effet de bord (il ne touche que les lignes pas encore converties).

-- 1) Vérification préalable : la catégorie est-elle trouvée, et combien d'opérations ?
SELECT c.id, c.name, count(o.id) AS nb_operations, coalesce(sum(o.amount), 0) AS total
FROM "Category" c
LEFT JOIN "Operation" o ON o."categoryId" = c.id AND o."type" = 'REVENUE'
WHERE c."type" = 'REVENUE'
  AND btrim(c.name) = 'المساهمات الشهرية'
GROUP BY c.id, c.name;

-- 2) Conversion
BEGIN;

UPDATE "Operation" o
SET "isContribution" = true,
    "updatedAt"      = now()
FROM "Category" c
WHERE o."categoryId" = c.id
  AND o."type" = 'REVENUE'
  AND c."type" = 'REVENUE'
  AND btrim(c.name) = 'المساهمات الشهرية'
  AND o."isContribution" = false;
-- Le nombre de lignes mises à jour doit correspondre à « nb_operations » de l'étape 1
-- (moins celles déjà converties si le script est rejoué).

-- 3) Facultatif : définir cette catégorie comme catégorie par défaut des cotisations
--    (sinon, la choisir dans Paramètres > Cotisations).
UPDATE "FarmSettings" s
SET "defaultContributionCategoryId" = c.id,
    "updatedAt"                     = now()
FROM "Category" c
WHERE s.id = 1
  AND c."type" = 'REVENUE'
  AND btrim(c.name) = 'المساهمات الشهرية'
  AND s."defaultContributionCategoryId" IS NULL;

COMMIT;   -- ou ROLLBACK; si les nombres ne correspondent pas
