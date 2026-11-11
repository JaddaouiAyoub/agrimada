// Calendrier cultural de la ferme (mois 1 à 12). PROVISOIRE : à ajuster selon les années.
export type SeasonRow = {
  key: "rose" | "saffron" | "olive" | "almond";
  flowering: number[];
  harvest: number[];
};

export const SEASONS: SeasonRow[] = [
  { key: "rose", flowering: [4], harvest: [4, 5] },
  { key: "saffron", flowering: [10], harvest: [10, 11] },
  { key: "olive", flowering: [4, 5], harvest: [11, 12, 1] },
  { key: "almond", flowering: [2, 3], harvest: [8, 9] },
];
