# FarmShare

Application web de gestion financière d'**une seule ferme** partagée entre associés : dépenses, revenus, qui a payé ou encaissé quoi, avec quel argent, tableau de bord, historique et exports CSV / Excel.

> Statut : **V1 — code écrit, non encore exécuté ni testé.** Voir « Premier lancement » ci-dessous.

---

## Stack

| Rôle | Technologie |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| UI | Tailwind CSS v4, composants de style shadcn/ui (Radix UI), Lucide, Sonner |
| Données | PostgreSQL, Prisma 6 (montants en `Decimal(14,2)`) |
| Authentification | Auth.js v5 (Credentials + JWT), mots de passe Argon2id |
| Formulaires / validation | React Hook Form + Zod 4 (mêmes schémas côté client et serveur) |
| Graphiques | Recharts 3 |
| Exports | ExcelJS (écriture en flux), CSV maison |

## Architecture

```
src/
  app/
    (auth)/            login, activate/[token], forgot-password
    (dashboard)/       dashboard, expenses, revenues, transactions, members,
                       categories, reports, settings, profile, audit
    api/auth/          Auth.js
    api/exports/       export CSV / XLSX (flux)
  components/
    ui/                primitives (button, dialog, table…)
    layout/ shared/ operations/ dashboard/ members/ categories/ reports/ settings/ profile/
  lib/
    auth/              config Auth.js, session (requireUser…), hachage, jetons, limitation
    validations/       schémas Zod + lecture des paramètres d'URL
    exports/           CSV, XLSX, protection contre l'injection de formules
    permissions.ts     matrice des droits
    constants.ts dates.ts money.ts
  server/
    actions/           Server Actions : session → Zod → droits → service
    services/          logique métier, transactions, audit, calculs financiers (finance.ts)
    queries/           lectures paginées et agrégations SQL
  proxy.ts             redirection grossière vers /login (pas une barrière de sécurité)
prisma/
  schema.prisma  seed.ts  sql/constraints.sql
scripts/
  create-admin.ts
```

Règle : **toute** page, action et route vérifie la session côté serveur (`requireUser` / `requireAdminPage` / `assertAdmin`). La session est relue en base à chaque requête : un compte désactivé, ou dont le rôle / l'email / le mot de passe change, perd immédiatement l'accès (`sessionVersion`).

## Règles métier retenues (V1)

- **Une table `Operation`** (type `EXPENSE` / `REVENUE`) et **une table `Category`** typée. Une clé étrangère composite `(categoryId, type)` garantit en base qu'une dépense n'utilise qu'une catégorie de dépense.
- **Origine des fonds** (`fundsSource`) :
  - dépense `FARM` = payée avec l'argent de la ferme ; `MEMBER` = **avance personnelle** du membre ;
  - revenu `FARM` = versé à la ferme ; `MEMBER` = **conservé par le membre**.
- **Résultat de la période = revenus − dépenses.** Ce n'est **pas** un solde de trésorerie (aucun solde d'ouverture suivi en V1).
- Le résumé par membre affiche des **montants bruts** (payé, avancé, encaissé, conservé). **Aucune dette entre associés n'est calculée** : parts, remboursements et régularisation relèvent de l'étape 10, à valider.
- Un **membre** ne saisit que ses propres opérations ; l'**administrateur** peut saisir pour n'importe quel membre actif. Un membre modifie / supprime les opérations qu'il a créées ; l'admin, toutes.
- Tous les membres voient toutes les opérations de la ferme.
- **Suppression logique** des opérations (`deletedAt`), tracée dans le journal.
- **Clôture** : l'admin peut verrouiller les comptes jusqu'à une date (Paramètres) ; aucune opération à cette date ou avant ne peut alors être créée, modifiée ou supprimée.
- Devise unique : **MAD**. Pas de justificatifs (non demandés). Pas de service d'email : les liens d'activation / réinitialisation sont générés par l'admin et transmis manuellement.
- Le dernier administrateur actif ne peut être ni désactivé ni rétrogradé ; un admin ne peut pas modifier son propre rôle ni se désactiver.
- Catégories : nom unique par type sans distinction de casse ; type non modifiable ; désactivation préférée à la suppression (suppression possible uniquement si jamais utilisée).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL utilisée par l'application |
| `DIRECT_URL` | Connexion directe utilisée par Prisma Migrate (identique en local) |
| `AUTH_SECRET` | Secret de signature des sessions — **à générer** (`npx auth secret`) |
| `AUTH_TRUST_HOST` | `true` hors Vercel (derrière un proxy de confiance) |
| `APP_URL` | URL publique, utilisée pour construire les liens d'activation |

Le fichier `.env` (non versionné) contient déjà vos URLs locales (`localhost:5435/fermedb`). Il reste à renseigner `AUTH_SECRET`.

## Premier lancement

Prérequis : Node.js ≥ 20.9, PostgreSQL accessible sur `localhost:5435`.

```bash
# 1. Dépendances (génère aussi le client Prisma via postinstall)
npm install

# 2. Secret d'authentification : copier la valeur affichée dans AUTH_SECRET du fichier .env
npx auth secret

# 3. Créer la migration initiale SANS l'appliquer
npx prisma migrate dev --create-only --name init
#    → ouvrir prisma/migrations/<horodatage>_init/migration.sql
#    → coller à la fin le contenu de prisma/sql/constraints.sql (contraintes CHECK)

# 4. Appliquer la migration
npx prisma migrate dev

# 5. Initialiser les paramètres et les catégories par défaut (idempotent)
npm run db:seed

# 6. Créer le premier administrateur (saisie interactive, mot de passe masqué)
npm run admin:create

# 7. Vérifications puis lancement
npm run typecheck
npm run lint
npm run dev
```

Puis ouvrir http://localhost:3000 et se connecter avec le compte administrateur. Ajouter ensuite les trois autres associés depuis **Membres → Ajouter un membre** : un lien d'activation à usage unique (72 h) s'affiche une seule fois, à leur transmettre.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` (crée / applique les migrations en dev) |
| `npm run db:migrate:create` | Crée une migration sans l'appliquer (pour relecture) |
| `npm run db:deploy` | `prisma migrate deploy` (production) |
| `npm run db:seed` | Paramètres + catégories par défaut, uniquement si absents (utilise les variables d'environnement Railway ou `.env` en local) |
| `npm run db:studio` | Prisma Studio |
| `npm run admin:create` | Premier administrateur (refuse s'il en existe déjà un actif) |

## Procédure de migration

1. Modifier `prisma/schema.prisma`.
2. `npm run db:migrate:create -- --name <nom>` puis **relire** le SQL généré (aucune migration destructrice sans validation).
3. `npm run db:migrate` en développement, `npm run db:deploy` en production.

Les contraintes `CHECK` de `prisma/sql/constraints.sql` ne sont pas gérées par Prisma : elles ne sont ni supprimées ni signalées comme dérive.

## Mot de passe oublié / réinitialisation

Sans service d'email : l'administrateur ouvre **Membres → ⋯ → Lien de réinitialisation**. Le lien (24 h, usage unique) est affiché une seule fois. L'utilisation d'un lien révoque toutes les sessions du compte.

## Exports

- Page **Rapports et exports**, ou boutons Excel / CSV des listes (les filtres actifs sont repris).
- Données : toutes les opérations, dépenses, revenus, ou **bilan financier** (totaux, par catégorie, par membre).
- L'export porte sur **tous** les résultats filtrés (pas seulement la page affichée). Les opérations sont lues par lots de 1 000 (pagination par curseur) et écrites **en flux** : la mémoire reste stable même pour de gros volumes.
- CSV : séparateur `;`, décimales avec virgule, UTF-8 avec BOM (ouverture directe dans Excel en français).
- Injection de formules : toute cellule texte commençant par `= + - @` (ou tabulation / retour chariot) est préfixée d'une apostrophe.
- Noms de fichiers : `farmshare-<donnees>-<periode>.<ext>` (ex. `farmshare-depenses-2026-10.xlsx`).
- Chaque export est inscrit au journal d'activité.
- Limite connue : en cas d'erreur base de données en cours d'export, le fichier téléchargé est tronqué (l'erreur est journalisée côté serveur).

## Sécurité — résumé

- Mots de passe : Argon2id (19 Mio, 2 itérations) ; jamais stockés en clair, jamais journalisés ni renvoyés.
- Jetons d'activation / réinitialisation : 256 bits aléatoires, seul le hash SHA-256 est stocké, usage unique, expiration.
- Connexion : message d'erreur unique, temps de réponse égalisé, limitation (5 échecs / 15 min par email, 20 par IP).
- Pas d'inscription publique ; premier admin uniquement par script local.
- Validation Zod côté serveur sur toutes les entrées ; identité, rôle et créateur toujours déterminés par la session.
- Journal d'audit des actions sensibles (opérations, membres, catégories, paramètres, activations, mots de passe, exports).
- En-têtes de sécurité HTTP (`X-Frame-Options`, `nosniff`, `Referrer-Policy`…).

## Hors périmètre V1 / prochaines étapes

- **Étape 10** (après validation) : parts des associés, remboursements, contributions au capital, calcul des écarts.
- Trésorerie réelle (soldes d'ouverture, comptes caisse / banque).
- Justificatifs (non retenus pour l'instant).
- Envoi d'emails (invitations, réinitialisation).
- Tests automatisés (à préparer : services `finance`, `operations`, `members`, et parcours de connexion).
