// --- Menu Storage (localStorage-based) ---

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  image?: string; // base64 data URL for uploaded PNG
}

const MENU_STORAGE_KEY = 'alumnicafe_menu';

// Default products - used when no custom menu exists in localStorage
const DEFAULT_PRODUCTS: MenuItem[] = [
  { id: 1, name: 'Brewed Coffee', price: 55, category: 'Coffee', icon: '☕' },
  { id: 2, name: 'Americano', price: 75, category: 'Coffee', icon: '☕' },
  { id: 3, name: 'Café Latte', price: 95, category: 'Coffee', icon: '🥛' },
  { id: 4, name: 'Cappuccino', price: 95, category: 'Coffee', icon: '☕' },
  { id: 5, name: 'Mocha Frappe', price: 120, category: 'Coffee', icon: '❄️' },
  { id: 6, name: 'Caramel Macchiato', price: 125, category: 'Coffee', icon: '🍮' },
  { id: 7, name: 'Spanish Latte', price: 115, category: 'Coffee', icon: '☕' },
  { id: 8, name: 'Iced Coffee', price: 85, category: 'Coffee', icon: '🧊' },
  { id: 9, name: 'Hot Choco', price: 80, category: 'Non-Coffee', icon: '🍫' },
  { id: 10, name: 'Matcha Latte', price: 115, category: 'Non-Coffee', icon: '🍵' },
  { id: 11, name: 'Iced Tea', price: 65, category: 'Non-Coffee', icon: '🍹' },
  { id: 12, name: 'Lemonade', price: 70, category: 'Non-Coffee', icon: '🍋' },
  { id: 13, name: 'Fruit Shake', price: 90, category: 'Non-Coffee', icon: '🍓' },
  { id: 14, name: 'Taro Milk Tea', price: 110, category: 'Non-Coffee', icon: '🧋' },
  { id: 15, name: 'Cheese Pandesal', price: 45, category: 'Food', icon: '🍞' },
  { id: 16, name: 'Club Sandwich', price: 120, category: 'Food', icon: '🥪' },
  { id: 17, name: 'Pasta Carbonara', price: 145, category: 'Food', icon: '🍝' },
  { id: 18, name: 'Pancake Set', price: 110, category: 'Food', icon: '🥞' },
  { id: 19, name: 'Fries', price: 75, category: 'Food', icon: '🍟' },
  { id: 20, name: 'Fried Rice', price: 85, category: 'Food', icon: '🍚' },
  { id: 21, name: 'Hotdog Sandwich', price: 95, category: 'Food', icon: '🌭' },
  { id: 22, name: 'Ensaymada', price: 55, category: 'Pastry & Snacks', icon: '🥨' },
  { id: 23, name: 'Cinnamon Roll', price: 75, category: 'Pastry & Snacks', icon: '🌀' },
  { id: 24, name: 'Choco Muffin', price: 65, category: 'Pastry & Snacks', icon: '🧁' },
  { id: 25, name: 'Banana Bread', price: 70, category: 'Pastry & Snacks', icon: '🍞' },
  { id: 26, name: 'Croissant', price: 80, category: 'Pastry & Snacks', icon: '🥐' },
  { id: 27, name: 'Blueberry Cheesecake', price: 130, category: 'Desserts', icon: '🍰' },
  { id: 28, name: 'Leche Flan', price: 95, category: 'Desserts', icon: '🍮' },
  { id: 29, name: 'Halo-Halo', price: 120, category: 'Desserts', icon: '🍨' },
  { id: 30, name: 'Buko Pandan', price: 85, category: 'Desserts', icon: '🍧' },
];

export const MENU_CATEGORIES = [
  'Coffee', 'Non-Coffee', 'Food', 'Pastry & Snacks', 'Desserts'
];

export function getMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return [...DEFAULT_PRODUCTS];
    return JSON.parse(raw) as MenuItem[];
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
