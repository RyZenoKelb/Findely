import type {
  TransactionType,
  WalletBalance,
  WalletTransaction,
} from "./wallet";
import { CREDIT_COSTS, CREDIT_PACKS } from "./wallet";
import { cryptoRandomId } from "./utils";

const STORAGE_KEY_BALANCE = "findely:wallet:balance";
const STORAGE_KEY_TRANSACTIONS = "findely:wallet:transactions";

const DEFAULT_BALANCE: WalletBalance = {
  credits: 50,
  updatedAt: new Date().toISOString(),
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded
  }
}

export function getBalance(): WalletBalance {
  return readJSON(STORAGE_KEY_BALANCE, DEFAULT_BALANCE);
}

export function getTransactions(): WalletTransaction[] {
  return readJSON<WalletTransaction[]>(STORAGE_KEY_TRANSACTIONS, []);
}

export function hasEnoughCredits(action: keyof typeof CREDIT_COSTS): boolean {
  const balance = getBalance();
  return balance.credits >= CREDIT_COSTS[action];
}

export function deductCredits(
  type: TransactionType,
  description: string,
  amount?: number
): { success: boolean; remaining: number } {
  const cost = amount ?? CREDIT_COSTS[type as keyof typeof CREDIT_COSTS] ?? 0;
  const balance = getBalance();

  if (balance.credits < cost) {
    return { success: false, remaining: balance.credits };
  }

  const newBalance: WalletBalance = {
    credits: balance.credits - cost,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEY_BALANCE, newBalance);

  const tx: WalletTransaction = {
    id: cryptoRandomId("tx"),
    type,
    amount: -cost,
    description,
    createdAt: new Date().toISOString(),
  };
  const transactions = getTransactions();
  transactions.unshift(tx);
  writeJSON(STORAGE_KEY_TRANSACTIONS, transactions.slice(0, 200));

  return { success: true, remaining: newBalance.credits };
}

export function addCredits(
  amount: number,
  type: TransactionType = "purchase",
  description = "Credit purchase"
): WalletBalance {
  const balance = getBalance();
  const newBalance: WalletBalance = {
    credits: balance.credits + amount,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEY_BALANCE, newBalance);

  const tx: WalletTransaction = {
    id: cryptoRandomId("tx"),
    type,
    amount: +amount,
    description,
    createdAt: new Date().toISOString(),
  };
  const transactions = getTransactions();
  transactions.unshift(tx);
  writeJSON(STORAGE_KEY_TRANSACTIONS, transactions.slice(0, 200));

  return newBalance;
}

/**
 * Stub: simulates a Stripe checkout completion.
 * In production, replace with a webhook handler after Stripe payment confirmation.
 */
export function simulatePurchase(packId: string): {
  success: boolean;
  balance: WalletBalance;
} {
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return { success: false, balance: getBalance() };

  const balance = addCredits(
    pack.credits,
    "purchase",
    `Purchased ${pack.name} pack (${pack.credits} credits)`
  );
  return { success: true, balance };
}
