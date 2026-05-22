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
  status?: 'Completed' | 'Voided';
}

const STORAGE_KEY = 'alumnicafe_transactions';

export function saveTransaction(txn: TransactionRecord): void {
  const existing = getTransactions();
  existing.push({ ...txn, status: txn.status || 'Completed' });
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

export function deleteTransaction(id: string): void {
  const existing = getTransactions();
  const filtered = existing.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateTransaction(id: string, updatedTxn: Partial<TransactionRecord>): void {
  const existing = getTransactions();
  const index = existing.findIndex(t => t.id === id);
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updatedTxn };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}

export function getTransactionsForDate(dateStr: string): TransactionRecord[] {
  return getTransactions().filter(t => t.date.startsWith(dateStr));
}

export function getTodayTransactions(): TransactionRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  return getTransactionsForDate(today);
}

export function updateCashierNames(oldName: string, newName: string): void {
  const txns = getTransactions();
  let changed = false;
  const updated = txns.map(t => {
    if (t.cashier === oldName) {
      changed = true;
      return { ...t, cashier: newName };
    }
    return t;
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}
