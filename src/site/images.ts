// Bibliothèque d'images du site. Les imports statiques donnent à next/image les
// dimensions et un aperçu flou ; un produit référence une image par sa clé.
import type { StaticImageData } from "next/image";
import amandesDecortiquees from "./images/amandes-decortiquees.jpg";
import amandierAzilal from "./images/amandier-azilal.jpg";
import amandiersFleurisKasbah from "./images/amandiers-fleuris-kasbah.jpg";
import huileOliveBouteille from "./images/huile-olive-bouteille.jpg";
import olivesBranche from "./images/olives-branche.jpg";
import olivesCueillette from "./images/olives-cueillette.jpg";
import oliviersMenara from "./images/oliviers-menara.jpg";
import paysageValleeOasisAtlas from "./images/paysage-vallee-oasis-atlas.jpg";
import roseDamascenaGrosPlan from "./images/rose-damascena-gros-plan.jpg";
import rosesChampKasbah from "./images/roses-champ-kasbah.jpg";
import rosesPanierKasbah from "./images/roses-panier-kasbah.jpg";
import rosesPetalesRecolteSac from "./images/roses-petales-recolte-sac.jpg";
import rosesPetalesTapis from "./images/roses-petales-tapis.jpg";
import safranCueillettePaniers from "./images/safran-cueillette-paniers.jpg";
import safranEmondageMains from "./images/safran-emondage-mains.jpg";
import safranEmondageTable from "./images/safran-emondage-table.jpg";
import safranPistilsPlateau from "./images/safran-pistils-plateau.jpg";
import roseDamascenaKelaa from "./images/rose-damascena-kelaa.jpg";
import rosesChampsKelaa from "./images/roses-champs-kelaa.jpg";
import rosesSechees from "./images/roses-sechees.jpg";
import safranBocal from "./images/safran-bocal.jpg";
import valleeDadesRiviere from "./images/vallee-dades-riviere.jpg";

export type GalleryCategory = "ferme" | "roses" | "safran" | "oliviers" | "amandiers" | "recoltes";

export type Credit = { author: string; license: string; source: string };

export type SiteImage = {
  src: StaticImageData;
  alt: { fr: string; ar: string };
  categories: GalleryCategory[];
  /** Photo tierce sous licence libre : crédit obligatoire. */
  credit?: Credit;
};

export const IMAGES = {
  "roses-champ-kasbah": {
    src: rosesChampKasbah,
    alt: { fr: "Rosiers de Damas en fleurs devant une kasbah", ar: "شجيرات الورد العطري المزهرة أمام قصبة" },
    categories: ["ferme", "roses"],
  },
  "paysage-vallee-oasis-atlas": {
    src: paysageValleeOasisAtlas,
    alt: { fr: "Vallée verdoyante entre les montagnes rouges de l'Atlas", ar: "واد أخضر بين جبال الأطلس الحمراء" },
    categories: ["ferme"],
  },
  "amandiers-fleuris-kasbah": {
    src: amandiersFleurisKasbah,
    alt: { fr: "Amandiers en fleurs autour d'une kasbah", ar: "أشجار اللوز المزهرة حول قصبة" },
    categories: ["ferme", "amandiers"],
  },
  "rose-damascena-gros-plan": {
    src: roseDamascenaGrosPlan,
    alt: { fr: "Rose de Damas en gros plan", ar: "وردة عطرية عن قرب" },
    categories: ["roses"],
  },
  "roses-panier-kasbah": {
    src: rosesPanierKasbah,
    alt: { fr: "Cueillette des roses dans un panier tressé, près d'une séguia", ar: "قطف الورد في سلة منسوجة قرب ساقية" },
    categories: ["roses", "recoltes"],
  },
  "roses-petales-recolte-sac": {
    src: rosesPetalesRecolteSac,
    alt: { fr: "Récolte de pétales de roses dans un sac en toile", ar: "جمع بتلات الورد في كيس من الخيش" },
    categories: ["roses", "recoltes"],
  },
  "roses-petales-tapis": {
    src: rosesPetalesTapis,
    alt: { fr: "Tapis de pétales de roses fraîchement cueillies", ar: "بساط من بتلات الورد المقطوفة حديثًا" },
    categories: ["roses", "recoltes"],
  },
  "safran-cueillette-paniers": {
    src: safranCueillettePaniers,
    alt: { fr: "Cueillette des fleurs de safran au lever du jour", ar: "قطف أزهار الزعفران عند الفجر" },
    categories: ["safran", "recoltes"],
  },
  "safran-pistils-plateau": {
    src: safranPistilsPlateau,
    alt: { fr: "Pistils de safran au centre des fleurs émondées", ar: "خيوط الزعفران وسط الأزهار المنقّاة" },
    categories: ["safran"],
  },
  "safran-emondage-table": {
    src: safranEmondageTable,
    alt: { fr: "Émondage du safran en famille", ar: "تنقية الزعفران في جو عائلي" },
    categories: ["safran", "recoltes"],
  },
  "safran-emondage-mains": {
    src: safranEmondageMains,
    alt: { fr: "Mains séparant les pistils de safran", ar: "أيادٍ تفصل خيوط الزعفران" },
    categories: ["safran"],
  },
  "oliviers-menara": {
    src: oliviersMenara,
    alt: { fr: "Rangées d'oliviers sur une terre rouge", ar: "صفوف أشجار الزيتون على تربة حمراء" },
    categories: ["oliviers"],
    credit: {
      author: "Elgaard",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:MarrakechOliveTreesMenaraGarden.jpg",
    },
  },
  "olives-branche": {
    src: olivesBranche,
    alt: { fr: "Olives mûres sur la branche", ar: "حبات زيتون ناضجة على الغصن" },
    categories: ["oliviers"],
    credit: {
      author: "Monaam Ben Fredj",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Olives_branch.jpg",
    },
  },
  "olives-cueillette": {
    src: olivesCueillette,
    alt: { fr: "Gaulage des olives sous un olivier", ar: "جني الزيتون تحت شجرة زيتون" },
    categories: ["oliviers", "recoltes"],
    credit: {
      author: "ECH-CHAFI ALI",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Olive_picking-morocco-tawnat-azour.jpg",
    },
  },
  "huile-olive-bouteille": {
    src: huileOliveBouteille,
    alt: { fr: "Bouteille d'huile d'olive", ar: "قنينة زيت الزيتون" },
    categories: ["oliviers"],
    credit: {
      author: "margenauer (Pixabay)",
      license: "CC0",
      source: "https://commons.wikimedia.org/wiki/File:Bottle_of_olive_oil.jpg",
    },
  },
  "amandier-azilal": {
    src: amandierAzilal,
    alt: { fr: "Fleurs d'amandier au printemps", ar: "أزهار اللوز في الربيع" },
    categories: ["amandiers"],
    credit: {
      author: "Brahim ELHASNAOUY",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Almond_tree_Azilal_Morocco.jpg",
    },
  },
  "amandes-decortiquees": {
    src: amandesDecortiquees,
    alt: { fr: "Amandes décortiquées", ar: "لوز مقشّر" },
    categories: ["amandiers"],
    credit: {
      author: "Luigi Chiesa",
      license: "CC BY-SA 3.0",
      source: "https://commons.wikimedia.org/wiki/File:Mandorle_sgusciate.jpg",
    },
  },
  "roses-champs-kelaa": {
    src: rosesChampsKelaa,
    alt: { fr: "Champ de roses en fleurs à Kalaat M'Gouna", ar: "حقل ورد مزهر بقلعة مكونة" },
    categories: ["ferme", "roses"],
    credit: {
      author: "مصطفى ملو (Moustafa Mellou)",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Rose_fields_in_Kelaa_Mgouna.jpg",
    },
  },
  "rose-damascena-kelaa": {
    src: roseDamascenaKelaa,
    alt: { fr: "Roses parfumées et boutons sur un rosier de Kalaat M'Gouna", ar: "ورود عطرية وبراعم على شجيرة بقلعة مكونة" },
    categories: ["roses"],
    credit: {
      author: "Nabil Talibi",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Rosa_damascena_kelaa_mgouna_%D9%82%D9%84%D8%B9%D8%A9_%D9%85%D9%83%D9%88%D9%86%D8%A9.jpg",
    },
  },
  "roses-sechees": {
    src: rosesSechees,
    alt: { fr: "Boutons et pétales de roses séchés dans un plateau tressé", ar: "براعم وبتلات ورد مجففة في طبق منسوج" },
    categories: ["roses", "recoltes"],
    credit: {
      author: "مصطفى ملو (Moustafa Mellou)",
      license: "CC BY-SA 4.0",
      source: "https://commons.wikimedia.org/wiki/File:Dried_Moroccan_rose.jpg",
    },
  },
  "vallee-dades-riviere": {
    src: valleeDadesRiviere,
    alt: { fr: "La vallée et sa rivière bordée de cultures, entre villages de terre", ar: "الوادي ونهره المحاط بالحقول بين قرى طينية" },
    categories: ["ferme"],
    credit: {
      author: "Youssefkhar",
      license: "CC0",
      source: "https://commons.wikimedia.org/wiki/File:Dades_River_valley.jpg",
    },
  },
  "safran-bocal": {
    src: safranBocal,
    alt: { fr: "Pistils de safran séchés dans un bocal en verre", ar: "خيوط زعفران مجففة في برطمان زجاجي" },
    categories: ["safran"],
    credit: {
      author: "ulleo (Pixabay)",
      license: "CC0",
      source: "https://commons.wikimedia.org/wiki/File:Saffron_threads_in_a_glass_jar_(_Viora_Saffron_packaging).jpg",
    },
  },
} satisfies Record<string, SiteImage>;

/** Ordre d'affichage de la galerie. */
export const GALLERY_ORDER: ImageKey[] = [
  "roses-champ-kasbah",
  "roses-petales-tapis",
  "safran-cueillette-paniers",
  "amandiers-fleuris-kasbah",
  "roses-champs-kelaa",
  "safran-emondage-table",
  "oliviers-menara",
  "rose-damascena-gros-plan",
  "paysage-vallee-oasis-atlas",
  "safran-pistils-plateau",
  "olives-cueillette",
  "roses-panier-kasbah",
  "amandier-azilal",
  "safran-emondage-mains",
  "roses-petales-recolte-sac",
  "olives-branche",
  "vallee-dades-riviere",
  "roses-sechees",
  "safran-bocal",
  "rose-damascena-kelaa",
  "huile-olive-bouteille",
  "amandes-decortiquees",
];

export type ImageKey = keyof typeof IMAGES;

export function getImage(key: ImageKey): SiteImage {
  return IMAGES[key];
}
