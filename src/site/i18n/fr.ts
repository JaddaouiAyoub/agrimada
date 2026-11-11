// Textes du site — français (langue principale). Les textes marqués PROVISOIRE
// sont à relire et compléter par la ferme.

export const fr = {
  meta: {
    title: "Agrimada — Ferme du terroir à Kalaat M'Gouna",
    description:
      "Agrimada, ferme familiale de 7 hectares à Kalaat M'Gouna (Drâa-Tafilalet, Maroc) : rose de Damas, safran, olives, huile d'olive et amandes du terroir.",
  },
  nav: {
    home: "Accueil",
    farm: "Notre ferme",
    products: "Nos produits",
    activities: "Nos activités",
    gallery: "Galerie",
    contact: "Contact",
    menu: "Menu",
    close: "Fermer",
    skip: "Aller au contenu",
    switchLanguage: "العربية",
    switchLanguageLabel: "Lire le site en arabe",
  },
  common: {
    whatsapp: "WhatsApp",
    writeUs: "Écrivez-nous",
    orderWhatsapp: "Commander via WhatsApp",
    askInfo: "Demander des informations",
    discover: "Découvrir",
    call: "Appeler",
    season: "Saison",
    origin: "Origine",
    availability: {
      available: "Disponible",
      on_order: "Sur commande",
      seasonal: "De saison",
      sold_out: "Épuisé",
    },
    whatsappMessage: "Bonjour Agrimada, je souhaite des informations",
    whatsappProductMessage: (product: string) => `Bonjour Agrimada, je souhaite des informations sur : ${product}.`,
  },
  home: {
    hero: {
      eyebrow: "Kalaat M'Gouna · Vallée des Roses",
      title: "L'authenticité du terroir marocain, cultivée avec passion",
      subtitle:
        "Au pied du Haut Atlas, Agrimada cultive depuis 2020 la rose de Damas, le safran, l'olivier et l'amandier, avec le savoir-faire des familles de la vallée du M'Goun.",
      primary: "Découvrir notre ferme",
      secondary: "Nos produits",
      scroll: "Faire défiler",
    },
    facts: [
      { value: "2020", label: "Création de la ferme" },
      { value: "7 ha", label: "De terres cultivées" },
      { value: "4", label: "Cultures du terroir" },
      { value: "M'Goun", label: "Une vallée, un savoir-faire" },
    ],
    story: {
      eyebrow: "Notre ferme",
      title: "Une terre, une vallée, une transmission",
      // PROVISOIRE
      paragraphs: [
        "Entre les montagnes rouges du Haut Atlas et les oasis de la vallée du Dadès, Kalaat M'Gouna est connue dans tout le Maroc pour ses roses. C'est ici qu'Agrimada a pris racine en 2020, sur 7 hectares.",
        "Nous y cultivons ce que cette terre donne de meilleur : la rose de Damas au printemps, le safran à l'automne, les olives et les amandes au fil des saisons. Avec des gestes simples, transmis de génération en génération.",
      ],
      cta: "Notre histoire",
      badge: "Depuis 2020",
    },
    values: {
      eyebrow: "Nos valeurs",
      title: "Ce qui nous guide",
      // PROVISOIRE
      items: [
        {
          title: "Authenticité",
          text: "Des variétés locales et des méthodes de culture héritées de la vallée, sans artifice.",
        },
        {
          title: "Respect de la terre",
          text: "Une gestion économe de l'eau et des sols, pour une terre qui reste féconde pour les générations à venir.",
        },
        {
          title: "Savoir-faire local",
          text: "Cueillette et émondage à la main, avec les familles de Kalaat M'Gouna qui connaissent chaque geste.",
        },
        {
          title: "Qualité & confiance",
          text: "Chaque récolte est suivie de la parcelle jusqu'à vous, en toute transparence.",
        },
      ],
    },
    products: {
      eyebrow: "Nos produits",
      title: "Les trésors de la vallée",
      subtitle: "Des produits du terroir cultivés, récoltés et préparés à Kalaat M'Gouna, disponibles selon les saisons.",
      all: "Voir tous les produits",
    },
    seasons: {
      eyebrow: "Nos activités",
      title: "Au rythme des saisons",
      subtitle: "Chaque culture a son temps. Voici le calendrier de la ferme, de la floraison à la récolte.",
      flowering: "Floraison",
      harvest: "Récolte",
      cta: "Découvrir nos activités",
      rows: {
        rose: "Rose de Damas",
        saffron: "Safran",
        olive: "Olivier",
        almond: "Amandier",
      },
    },
    gallery: {
      eyebrow: "Galerie",
      title: "La ferme en images",
      cta: "Voir la galerie",
    },
    contact: {
      eyebrow: "Contact",
      title: "Une question, une commande ?",
      text: "Écrivez-nous directement sur WhatsApp : nous vous répondons personnellement, pour les particuliers comme pour les professionnels.",
      whatsapp: "Discuter sur WhatsApp",
      callLabel: "Ou appelez-nous",
    },
  },
  months: {
    short: ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
    tiny: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  },
  footer: {
    tagline: "Rose, safran, olives et amandes du terroir de Kalaat M'Gouna.",
    navTitle: "Le site",
    contactTitle: "Contact",
    members: "Espace membres",
    credits: "Crédits photos",
    rights: "Tous droits réservés.",
  },
  credits: {
    title: "Crédits photos",
    intro:
      "Certaines photographies du site proviennent de Wikimedia Commons et sont utilisées selon leur licence libre. Merci à leurs auteurs.",
    author: "Auteur",
    license: "Licence",
    source: "Source",
  },
  // Pages intérieures. Textes PROVISOIRES à relire par la ferme.
  pages: {
    farm: {
      metaTitle: "Notre ferme",
      metaDescription:
        "L'histoire d'Agrimada, ferme de 7 hectares créée en 2020 à Kalaat M'Gouna : notre vallée, notre vision et nos engagements pour une agriculture de qualité.",
      eyebrow: "Notre ferme",
      title: "Une ferme enracinée dans la Vallée des Roses",
      subtitle: "Depuis 2020, 7 hectares cultivés avec patience, entre les montagnes du Haut Atlas et les oasis du Dadès.",
      story: {
        eyebrow: "Notre histoire",
        title: "De la terre de nos familles à vos tables",
        paragraphs: [
          "Agrimada est née en 2020 d'une conviction partagée par ses associés : la vallée de Kalaat M'Gouna produit des trésors qui méritent d'être cultivés avec exigence et partagés au-delà de la région.",
          "Sur nos 7 hectares, nous avons réuni les cultures qui font l'identité de la vallée : les haies de rosiers parfumés qui bordent les parcelles, le safran planté à l'automne, les oliviers et les amandiers qui rythment l'année.",
          "Chaque saison mobilise les familles du voisinage, gardiennes d'un savoir-faire précieux : cueillir la rose à l'aube, émonder le safran fleur par fleur, gauler les olives au bon moment.",
        ],
        quote: "Cultiver ce que la vallée donne de meilleur, et le faire connaître avec fierté.",
      },
      location: {
        eyebrow: "Localisation",
        title: "Kalaat M'Gouna, au cœur du Sud marocain",
        text: "Au confluent des oueds M'Goun et Dadès, Kalaat M'Gouna est célèbre pour ses roses et son festival annuel. Ses étés chauds, ses hivers froids et l'eau des montagnes donnent aux cultures un caractère unique.",
        facts: [
          { label: "Région", value: "Drâa-Tafilalet" },
          { label: "Province", value: "Tinghir" },
          { label: "Altitude", value: "≈ 1 450 m" },
          { label: "Ouarzazate", value: "≈ 90 km" },
        ],
        mapTitle: "Carte de Kalaat M'Gouna",
        openMap: "Ouvrir dans Google Maps",
      },
      vision: {
        eyebrow: "Vision & mission",
        title: "Ce que nous construisons",
        items: [
          {
            title: "Notre vision",
            text: "Faire d'Agrimada une référence des produits du terroir de Kalaat M'Gouna, reconnue pour son authenticité et la qualité constante de ses récoltes.",
          },
          {
            title: "Notre mission",
            text: "Cultiver, récolter et préparer avec soin la rose, le safran, l'olive et l'amande, en valorisant le travail des familles de la vallée et en préservant la terre qui nous nourrit.",
          },
        ],
      },
      commitments: {
        eyebrow: "Nos engagements",
        title: "Une agriculture de qualité",
        items: [
          { title: "L'eau, ressource précieuse", text: "Une irrigation raisonnée, adaptée à chaque culture et aux saisons." },
          { title: "Des gestes à la main", text: "Cueillette, émondage et tri réalisés à la main, au bon moment." },
          { title: "Des récoltes suivies", text: "Chaque lot est suivi de la parcelle jusqu'à la livraison." },
          { title: "Le travail local", text: "Des emplois saisonniers pour les familles de la vallée." },
        ],
      },
      photosTitle: "La ferme au fil des saisons",
    },
    products: {
      metaTitle: "Nos produits",
      metaDescription:
        "Rose parfumée, safran, olives, huile d'olive et amandes de Kalaat M'Gouna : découvrez les produits Agrimada et commandez directement sur WhatsApp.",
      eyebrow: "Nos produits",
      title: "Le meilleur de la vallée, récolté à la main",
      subtitle:
        "Des produits du terroir de Kalaat M'Gouna, disponibles selon les saisons. Une question, une commande : écrivez-nous sur WhatsApp.",
      featuresTitle: "Caractéristiques",
      availabilityTitle: "Disponibilité",
      orderMessage: "Bonjour Agrimada, je souhaite commander : {product}.",
      pro: {
        eyebrow: "Professionnels",
        title: "Revendeurs, restaurants, distributeurs",
        text: "Vous souhaitez proposer nos produits ou les utiliser en cuisine ? Parlons volumes, conditionnements et calendrier de livraison.",
        cta: "Discuter d'un partenariat",
        message: "Bonjour Agrimada, je suis un professionnel et je souhaite discuter d'un partenariat.",
      },
    },
    activities: {
      metaTitle: "Nos activités",
      metaDescription:
        "Culture des roses, production du safran, oliviers, amandiers, récolte, transformation et commercialisation : découvrez le travail de la ferme Agrimada.",
      eyebrow: "Nos activités",
      title: "Du champ à la récolte, chaque geste compte",
      subtitle: "Quatre cultures, un même soin. Voici comment nous travaillons, saison après saison.",
      stepsLabel: "Les étapes",
      items: [
        {
          key: "roses",
          title: "Culture des roses",
          season: "Récolte : avril – mai",
          text: "Plantés en haies le long des parcelles, nos rosiers parfumés fleurissent quelques semaines par an. La floraison est courte : tout se joue en quelques jours.",
          steps: ["Taille et entretien des haies en hiver", "Cueillette à la main dès l'aube", "Livraison ou séchage le jour même"],
        },
        {
          key: "saffron",
          title: "Production du safran",
          season: "Récolte : octobre – novembre",
          text: "Les bulbes de crocus, plantés en été, fleurissent à l'automne. Chaque matin de floraison, les fleurs sont cueillies avant que le soleil ne les ouvre.",
          steps: ["Plantation des bulbes en été", "Cueillette quotidienne des fleurs", "Émondage et séchage des pistils"],
        },
        {
          key: "olives",
          title: "Culture des oliviers",
          season: "Récolte : novembre – janvier",
          text: "Nos oliviers demandent patience et régularité : taille, irrigation raisonnée et surveillance jusqu'à la maturité des fruits.",
          steps: ["Taille et entretien des arbres", "Récolte par gaulage sur filets", "Préparation des olives ou pressage"],
        },
        {
          key: "almonds",
          title: "Culture des amandiers",
          season: "Floraison : février – mars · Récolte : août – septembre",
          text: "Premiers arbres à fleurir dans la vallée, les amandiers annoncent le printemps. Leurs fruits mûrissent tout l'été.",
          steps: ["Floraison et pollinisation", "Récolte à maturité", "Séchage et décorticage"],
        },
        {
          key: "harvest",
          title: "Récolte & transformation",
          season: "Selon les cultures",
          text: "Une récolte réussie se prolonge par une préparation soignée : séchage des roses, émondage du safran, tri des amandes et des olives.",
          steps: ["Tri soigneux de chaque récolte", "Séchage à l'abri de la lumière", "Conditionnement en petites quantités"],
        },
        {
          key: "sales",
          title: "Commercialisation",
          season: "Toute l'année",
          text: "Nous proposons nos produits aux particuliers comme aux professionnels, directement, pour garantir leur fraîcheur et leur traçabilité.",
          steps: ["Commande par WhatsApp", "Préparation de la commande", "Remise en main propre ou expédition"],
        },
      ],
      calendarTitle: "Le calendrier de la ferme",
      calendarSubtitle: "Floraisons et récoltes, mois par mois.",
    },
    gallery: {
      metaTitle: "Galerie",
      metaDescription:
        "Les photos de la ferme Agrimada et de la vallée de Kalaat M'Gouna : roses, safran, oliviers, amandiers et récoltes.",
      eyebrow: "Galerie",
      title: "La vallée en images",
      subtitle: "Roses, safran, oliviers, amandiers : l'année de la ferme, saison après saison.",
      filterLabel: "Filtrer les photos",
      all: "Tout",
      categories: {
        ferme: "La ferme",
        roses: "Les roses",
        safran: "Le safran",
        oliviers: "Les oliviers",
        amandiers: "Les amandiers",
        recoltes: "Les récoltes",
      },
      open: "Agrandir la photo",
      close: "Fermer",
      prev: "Photo précédente",
      next: "Photo suivante",
      counter: "{current} sur {total}",
    },
    contact: {
      metaTitle: "Contact",
      metaDescription:
        "Contactez Agrimada à Kalaat M'Gouna par WhatsApp ou par téléphone au 07 00 54 71 63 : informations, commandes et partenariats.",
      eyebrow: "Contact",
      title: "Parlons de vos envies de terroir",
      subtitle: "Une question sur un produit, une commande, un partenariat : nous vous répondons directement sur WhatsApp.",
      whatsappTitle: "WhatsApp",
      whatsappText: "Le moyen le plus rapide pour nous joindre.",
      phoneTitle: "Téléphone",
      addressTitle: "Adresse",
      form: {
        title: "Préparez votre message",
        text: "Remplissez ces quelques champs : votre message s'ouvrira dans WhatsApp, prêt à être envoyé.",
        name: "Votre nom",
        subject: "Sujet",
        general: "Question générale",
        pro: "Partenariat professionnel",
        message: "Votre message",
        messagePlaceholder: "Quantité souhaitée, ville de livraison, question…",
        submit: "Envoyer sur WhatsApp",
        errorName: "Indiquez votre nom.",
        errorMessage: "Écrivez votre message.",
        greeting: "Bonjour Agrimada,",
        subjectLabel: "Sujet",
        nameLabel: "Nom",
      },
      mapTitle: "Nous trouver",
      openMap: "Ouvrir dans Google Maps",
    },
  },
  notFound: {
    title: "Page introuvable",
    text: "Cette page n'existe pas ou a été déplacée.",
    back: "Retour à l'accueil",
  },
};

export type Dictionary = typeof fr;
