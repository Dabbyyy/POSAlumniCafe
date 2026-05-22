// --- Menu Storage (localStorage-based) ---

export interface MenuItemIngredient {
  inventoryId: string;
  quantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  image?: string; // base64 data URL for uploaded PNG
  coffeeGrams?: number; // Deprecated
  milkAmount?: number; // Deprecated
  ingredients?: MenuItemIngredient[];
}

const MENU_STORAGE_KEY = 'alumnicafe_menu';

// Default products - used when no custom menu exists in localStorage
const DEFAULT_PRODUCTS: MenuItem[] = [
  { id: 1, name: 'Americano', price: 75, category: 'Coffee', icon: '☕', ingredients: [{ inventoryId: 'inv_1', quantity: 18 }] },
  { id: 2, name: 'Café Latte', price: 95, category: 'Coffee', icon: '🥛', ingredients: [{ inventoryId: 'inv_1', quantity: 18 }, { inventoryId: 'inv_2', quantity: 150 }] },
  { id: 3, name: 'Spanish Latte', price: 115, category: 'Coffee', icon: '☕', ingredients: [{ inventoryId: 'inv_1', quantity: 18 }, { inventoryId: 'inv_2', quantity: 180 }] },
  { id: 4, name: 'Caramel Macchiato', price: 125, category: 'Coffee', icon: '🍮', ingredients: [{ inventoryId: 'inv_1', quantity: 18 }, { inventoryId: 'inv_2', quantity: 160 }] },
];

const CATEGORY_STORAGE_KEY = 'alumnicafe_categories';

const DEFAULT_CATEGORIES = [
  'Coffee'
];

export function getMenuCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return [...DEFAULT_CATEGORIES];
    return JSON.parse(raw) as string[];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveMenuCategories(cats: string[]): void {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cats));
}

export function addMenuCategory(cat: string): string[] {
  const cats = getMenuCategories();
  if (!cats.includes(cat)) {
    cats.push(cat);
    saveMenuCategories(cats);
  }
  return cats;
}

export function deleteMenuCategory(cat: string): string[] {
  const cats = getMenuCategories().filter(c => c !== cat);
  saveMenuCategories(cats);
  
  // Also clean up items in that category? 
  // For now let's just delete the category name from the list.
  return cats;
}

export function getMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return [...DEFAULT_PRODUCTS];
    let parsed = JSON.parse(raw) as MenuItem[];
    
    // Migration for old format
    parsed = parsed.map(item => {
      if (item.ingredients === undefined) {
        const ingredients: MenuItemIngredient[] = [];
        if (item.coffeeGrams && item.coffeeGrams > 0) {
          ingredients.push({ inventoryId: 'inv_1', quantity: item.coffeeGrams });
        }
        if (item.milkAmount && item.milkAmount > 0) {
          ingredients.push({ inventoryId: 'inv_2', quantity: item.milkAmount });
        }
        return { ...item, ingredients };
      }
      return item;
    });
    return parsed;
  } catch {
    return [...DEFAULT_PRODUCTS];
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
}

export function addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem[] {
  const items = getMenuItems();
  const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const newItem = { ...item, id: newId };
  items.push(newItem);
  saveMenuItems(items);
  return items;
}

export function updateMenuItem(id: number, updates: Partial<MenuItem>): MenuItem[] {
  const items = getMenuItems().map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveMenuItems(items);
  return items;
}

export function deleteMenuItem(id: number): MenuItem[] {
  const items = getMenuItems().filter(item => item.id !== id);
  saveMenuItems(items);
  return items;
}
