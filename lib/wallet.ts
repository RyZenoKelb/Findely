export interface WalletBalance {
  credits: number;
  updatedAt: string;
}

export type TransactionType =
  | "search"
  | "export"
  | "enrichment"
  | "purchase"
  | "bonus"
  | "refund";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  meta?: Record<string, string>;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter_100",
    name: "Starter",
    credits: 100,
    price: 9,
    currency: "EUR",
  },
  {
    id: "growth_500",
    name: "Growth",
    credits: 500,
    price: 29,
    currency: "EUR",
    popular: true,
  },
  {
    id: "pro_2000",
    name: "Pro",
    credits: 2000,
    price: 79,
    currency: "EUR",
  },
  {
    id: "agency_10000",
    name: "Agency",
    credits: 10000,
    price: 299,
    currency: "EUR",
  },
];

export const CREDIT_COSTS = {
  search: 1,
  leadFound: 0,
  export: 2,
  enrichment: 5,
} as const;

export const TRANSACTION_LABELS: Record<TransactionType, { en: string; fr: string }> = {
  search: { en: "Search", fr: "Recherche" },
  export: { en: "Export", fr: "Export" },
  enrichment: { en: "Enrichment", fr: "Enrichissement" },
  purchase: { en: "Purchase", fr: "Achat" },
  bonus: { en: "Bonus", fr: "Bonus" },
  refund: { en: "Refund", fr: "Remboursement" },
};
