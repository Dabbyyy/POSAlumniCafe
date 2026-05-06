// --- Cashier Storage (localStorage-based) ---

export interface CashierAccount {
  id: number;
  name: string;
  username: string;
  role: string;
  status: string;
  lastLogin: string;
  password?: string;
}

const CASHIER_STORAGE_KEY = 'alumnicafe_cashiers';

const DEFAULT_CASHIERS: CashierAccount[] = [
  { id: 1, name: 'Juan Dela Cruz', username: 'juan@alumnicafe', role: 'Senior Cashier', status: 'Active', lastLogin: 'Today, 08:00 AM', password: '12345' },
  { id: 2, name: 'Maria Santos', username: 'maria@alumnicafe', role: 'Cashier', status: 'Active', lastLogin: 'Today, 09:00 AM', password: '12345' },
  { id: 3, name: 'Pedro Reyes', username: 'pedro@alumnicafe', role: 'Cashier', status: 'Inactive', lastLogin: 'Yesterday, 05:00 PM', password: '12345' },
];

export function getCashiers(): CashierAccount[] {
  try {
    const raw = localStorage.getItem(CASHIER_STORAGE_KEY);
    if (!raw) return [...DEFAULT_CASHIERS];
    return JSON.parse(raw) as CashierAccount[];
  } catch {
    return [...DEFAULT_CASHIERS];
  }
}

export function saveCashiers(items: CashierAccount[]): void {
  localStorage.setItem(CASHIER_STORAGE_KEY, JSON.stringify(items));
}

export function addCashier(item: Omit<CashierAccount, 'id' | 'lastLogin'>): CashierAccount[] {
  const items = getCashiers();
  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const newItem = { ...item, id: newId, lastLogin: 'Never', password: item.password ?? '12345' };
  items.push(newItem);
  saveCashiers(items);
  return items;
}

export function updateCashier(id: number, updates: Partial<CashierAccount>): CashierAccount[] {
  const items = getCashiers().map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveCashiers(items);
  return items;
}

export function deleteCashier(id: number): CashierAccount[] {
  const items = getCashiers().filter(item => item.id !== id);
  saveCashiers(items);
  return items;
}
