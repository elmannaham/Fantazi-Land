import type { ProfileCategory } from "./types";

export const CATEGORIES: ProfileCategory[] = [
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
];

export const CURRENCIES = [
  { value: "EUR", label: "EUR", symbol: "\u20ac" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "GBP", label: "GBP", symbol: "\u00a3" },
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  disputed: "Litige",
};

export const ITEMS_PER_PAGE = 12;
