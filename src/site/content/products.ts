// Produits présentés sur le site. Étape 5 : ces données passeront en base
// (gestion depuis l'espace administrateur) avec la même structure.
// Textes PROVISOIRES, à relire par la ferme.
import type { ImageKey } from "@/site/images";

export type Availability = "available" | "on_order" | "seasonal" | "sold_out";

type Localized = { fr: string; ar: string };

export type Product = {
  slug: string;
  name: Localized;
  latin: string;
  image: ImageKey;
  short: Localized;
  description: Localized;
  features: { fr: string[]; ar: string[] };
  origin: Localized;
  season: Localized;
  availability: Availability;
};

export const PRODUCTS: Product[] = [
  {
    slug: "rose-de-damas",
    name: { fr: "Rose de Damas", ar: "الورد العطري" },
    latin: "Rosa damascena",
    image: "rose-damascena-gros-plan",
    short: {
      fr: "La rose parfumée qui a fait la renommée de Kalaat M'Gouna, cueillie à l'aube.",
      ar: "الوردة العطرية التي صنعت شهرة قلعة مكونة، تُقطف عند الفجر.",
    },
    description: {
      fr: "Nos rosiers de Damas fleurissent quelques semaines par an, au printemps. Les fleurs sont cueillies à la main au lever du jour, lorsque leur parfum est le plus intense, puis proposées fraîches ou séchées.",
      ar: "تزهر شجيرات الورد العطري لدينا بضعة أسابيع في الربيع. تُقطف الأزهار يدويًا عند شروق الشمس، حين يكون عطرها في أوجه، ثم تُعرض طازجة أو مجففة.",
    },
    features: {
      fr: ["Cueillette manuelle à l'aube", "Fleurs fraîches ou séchées", "Variété traditionnelle de la vallée"],
      ar: ["قطف يدوي عند الفجر", "أزهار طازجة أو مجففة", "صنف تقليدي من الوادي"],
    },
    origin: { fr: "Kalaat M'Gouna, vallée du M'Goun", ar: "قلعة مكونة، وادي مكون" },
    season: { fr: "Avril – mai", ar: "أبريل – ماي" },
    availability: "seasonal",
  },
  {
    slug: "safran",
    name: { fr: "Safran", ar: "الزعفران" },
    latin: "Crocus sativus",
    image: "safran-pistils-plateau",
    short: {
      fr: "L'or rouge du Sud : des pistils émondés un à un, à la main.",
      ar: "الذهب الأحمر للجنوب: خيوط تُنقّى واحدة واحدة باليد.",
    },
    description: {
      fr: "Chaque automne, les fleurs de crocus sont cueillies avant que le soleil ne les ouvre. Les pistils sont ensuite séparés à la main puis séchés avec soin pour préserver leur couleur et leur arôme.",
      ar: "في كل خريف تُقطف أزهار الزعفران قبل أن تتفتح تحت الشمس، ثم تُفصل الخيوط يدويًا وتُجفف بعناية للحفاظ على لونها ونكهتها.",
    },
    features: {
      fr: ["Pistils entiers émondés à la main", "Séchage soigné", "Petites quantités, grande intensité"],
      ar: ["خيوط كاملة منقّاة باليد", "تجفيف بعناية", "كميات صغيرة ونكهة قوية"],
    },
    origin: { fr: "Kalaat M'Gouna, Drâa-Tafilalet", ar: "قلعة مكونة، درعة تافيلالت" },
    season: { fr: "Octobre – novembre", ar: "أكتوبر – نونبر" },
    availability: "on_order",
  },
  {
    slug: "olives-huile-olive",
    name: { fr: "Olives & huile d'olive", ar: "الزيتون وزيت الزيتون" },
    latin: "Olea europaea",
    image: "olives-branche",
    short: {
      fr: "Des olives de nos arbres et une huile au goût franc du terroir.",
      ar: "زيتون من أشجارنا وزيت بطعم الأرض الأصيل.",
    },
    description: {
      fr: "Nos oliviers sont récoltés en fin d'automne. Une partie des olives est préparée pour la table, l'autre est pressée pour donner une huile au caractère fruité, à consommer crue pour en apprécier toutes les nuances.",
      ar: "تُجنى أشجار الزيتون لدينا في أواخر الخريف. يُحضّر جزء من الزيتون للمائدة، ويُعصر الجزء الآخر للحصول على زيت بنكهة فاكهية، يُستحسن تناوله نيئًا.",
    },
    features: {
      fr: ["Olives de table", "Huile d'olive de la récolte de l'année", "Récolte de fin d'automne"],
      ar: ["زيتون المائدة", "زيت زيتون من محصول السنة", "جني في أواخر الخريف"],
    },
    origin: { fr: "Kalaat M'Gouna", ar: "قلعة مكونة" },
    season: { fr: "Novembre – janvier", ar: "نونبر – يناير" },
    availability: "on_order",
  },
  {
    slug: "amandes",
    name: { fr: "Amandes", ar: "اللوز" },
    latin: "Prunus dulcis",
    image: "amandes-decortiquees",
    short: {
      fr: "Des amandes de pays, au goût riche, récoltées à la fin de l'été.",
      ar: "لوز بلدي غني المذاق، يُجنى في نهاية الصيف.",
    },
    description: {
      fr: "Les amandiers annoncent le printemps dans la vallée par leur floraison blanche. Leurs fruits mûrissent tout l'été et sont récoltés, séchés et proposés en coque ou décortiqués.",
      ar: "تعلن أشجار اللوز عن قدوم الربيع في الوادي بأزهارها البيضاء. تنضج ثمارها طوال الصيف، ثم تُجنى وتُجفف وتُعرض بقشرتها أو مقشّرة.",
    },
    features: {
      fr: ["Amandes de pays", "En coque ou décortiquées", "Séchage naturel"],
      ar: ["لوز بلدي", "بقشرته أو مقشّر", "تجفيف طبيعي"],
    },
    origin: { fr: "Kalaat M'Gouna", ar: "قلعة مكونة" },
    season: { fr: "Août – septembre", ar: "غشت – شتنبر" },
    availability: "on_order",
  },
];
