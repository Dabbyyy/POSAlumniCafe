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
