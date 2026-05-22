const INVENTORY_STORAGE_KEY = 'alumnicafe_inventory';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'ml';
}

export type Inventory = InventoryItem[];

const DEFAULT_INVENTORY: Inventory = [
  { id: 'inv_1', name: 'Coffee Beans', quantity: 0, unit: 'g' },
  { id: 'inv_2', name: 'Milk', quantity: 0, unit: 'ml' }
];

export function getInventory(): Inventory {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return DEFAULT_INVENTORY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      // Migrate old format
      return [
        { id: 'inv_1', name: 'Coffee Beans', quantity: parsed.coffeeBeansGrams || 0, unit: 'g' },
        { id: 'inv_2', name: 'Milk', quantity: parsed.milkAmount || 0, unit: 'ml' }
      ];
    }
    return parsed as Inventory;
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
  stockName: string;
  addedQuantity: number;
  unit: string;
}

export function getInventoryLogs(): InventoryLog[] {
  try {
    const raw = localStorage.getItem(INVENTORY_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    
    // Attempt migration for old logs
    if (parsed.length > 0 && parsed[0].addedCoffeeGrams !== undefined) {
      let newLogs: InventoryLog[] = [];
      let newId = 1;
      parsed.forEach((old: any) => {
        if (old.addedCoffeeGrams > 0) {
          newLogs.push({
            id: newId++,
            date: old.date,
            time: old.time,
            stockName: 'Coffee Beans',
            addedQuantity: old.addedCoffeeGrams,
            unit: 'g'
          });
        }
        if (old.addedMilkAmount > 0) {
          newLogs.push({
            id: newId++,
            date: old.date,
            time: old.time,
            stockName: 'Milk',
            addedQuantity: old.addedMilkAmount,
            unit: 'ml'
          });
        }
      });
      return newLogs;
    }

    return parsed as InventoryLog[];
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
