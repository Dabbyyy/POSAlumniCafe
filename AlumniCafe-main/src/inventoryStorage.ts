const INVENTORY_STORAGE_KEY = 'alumnicafe_inventory';

export interface Inventory {
  coffeeBeansGrams: number;
  milkAmount: number;
}

const DEFAULT_INVENTORY: Inventory = {
  coffeeBeansGrams: 0,
  milkAmount: 0,
};

export function getInventory(): Inventory {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return DEFAULT_INVENTORY;
    return JSON.parse(raw) as Inventory;
  } catch {
    return DEFAULT_INVENTORY;
  }
}

export function saveInventory(inv: Inventory): void {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inv));
}

const INVENTORY_LOG_KEY = 'alumnicafe_inventory_log';

export interface InventoryLog {
  id: number;
  date: string;
  time: string;
  addedCoffeeGrams: number;
  addedMilkAmount: number;
}

export function getInventoryLogs(): InventoryLog[] {
  try {
    const raw = localStorage.getItem(INVENTORY_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InventoryLog[];
  } catch {
    return [];
  }
}

export function addInventoryLog(log: Omit<InventoryLog, 'id'>): InventoryLog[] {
  const logs = getInventoryLogs();
  const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
  logs.push({ ...log, id: newId });
  localStorage.setItem(INVENTORY_LOG_KEY, JSON.stringify(logs));
  return logs;
}
