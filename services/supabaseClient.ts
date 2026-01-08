
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WarehouseName, PurchaseOrder, Order, InventoryItem } from '../types';

const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const isConfigured = !supabaseUrl.includes('your-project-url');

const WAREHOUSES: WarehouseName[] = ['Principale', 'Nicola', 'Leonardo', 'Liborio', 'Marco', 'Mirko'];

// Inventario inizialmente vuoto come richiesto
let MOCK_INVENTORY: InventoryItem[] = [];

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', customer: 'Impianti Nord srl', status: 'shipped', total: 1250.50, created_at: new Date().toISOString() },
  { id: 'ORD-002', customer: 'Edilizia Moderna', status: 'pending', total: 450.00, created_at: new Date().toISOString() },
];

export const mockApi = {
  getInventory: async (warehouse?: WarehouseName) => {
    await new Promise(r => setTimeout(r, 400));
    const data = warehouse 
      ? MOCK_INVENTORY.filter(i => i.warehouse === warehouse)
      : [...MOCK_INVENTORY];
    return { data, error: null };
  },
  getOrders: async () => {
    await new Promise(r => setTimeout(r, 400));
    return { data: [...MOCK_ORDERS], error: null };
  },
  getPurchaseOrders: async () => {
    await new Promise(r => setTimeout(r, 400));
    return { data: [...MOCK_PURCHASE_ORDERS], error: null };
  },
  savePurchaseOrder: async (order: PurchaseOrder) => {
    await new Promise(r => setTimeout(r, 500));
    MOCK_PURCHASE_ORDERS.unshift(order);
    return { data: order, error: null };
  },
  createItem: async (item: Partial<InventoryItem>) => {
    await new Promise(r => setTimeout(r, 500));
    const newItem: InventoryItem = {
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || 'Nuovo Prodotto',
      sku: item.sku || 'SKU-TEMP',
      quantity: item.quantity || 0,
      category: item.category || 'Generale',
      warehouse: item.warehouse || 'Principale',
      updated_at: new Date().toISOString(),
      min_stock: item.min_stock || 10
    };
    MOCK_INVENTORY.push(newItem);
    return { data: newItem, error: null };
  },
  updateQuantity: async (itemId: string, newQuantity: number) => {
    await new Promise(r => setTimeout(r, 300));
    const item = MOCK_INVENTORY.find(i => i.id === itemId);
    if (item) item.quantity = newQuantity;
    return { data: item, error: null };
  },
  updateItem: async (itemId: string, updates: any) => {
    await new Promise(r => setTimeout(r, 300));
    const index = MOCK_INVENTORY.findIndex(i => i.id === itemId);
    if (index !== -1) {
      MOCK_INVENTORY[index] = { ...MOCK_INVENTORY[index], ...updates };
    }
    return { data: MOCK_INVENTORY[index], error: null };
  },
  getProfile: async (id: string) => {
    return { data: { id, role: 'admin', full_name: 'Admin Magazzino' }, error: null };
  }
};
