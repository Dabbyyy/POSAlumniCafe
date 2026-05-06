// --- Transaction Storage (localStorage-based) ---

export interface TransactionRecord {
  id: string;
  date: string;        // ISO date string
  time: string;        // formatted time
  cashier: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    category: string;
  }[];
  subtotal: number;
  discountType: string;
  discountRate: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  cashTendered: number;
  change: number;
}

const STORAGE_KEY = 'alumnicafe_transactions';

export function saveTransaction(txn: TransactionRecord): void {
  const existing = getTransactions();
  existing.push(txn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TransactionRecord[];
  } catch {
    return [];
  }
}

export function getTransactionsForDate(dateStr: string): TransactionRecord[] {
  return getTransactions().filter(t => t.date.startsWith(dateStr));
}

export function getTodayTransactions(): TransactionRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  return getTransactionsForDate(today);
}
