
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WarehouseName, PurchaseOrder, Order } from '../types';

const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const isConfigured = !supabaseUrl.includes('your-project-url');

const WAREHOUSES: WarehouseName[] = ['Principale', 'Nicola', 'Leonardo', 'Liborio', 'Marco', 'Mirko'];

// Extended Mock Data for Demo
const MOCK_INVENTORY: any[] = WAREHOUSES.flatMap((w, idx) => [
  { id: `w${idx}-1`, name: 'Trapano Industriale X200', sku: 'DRL-001', quantity: 45, category: 'Attrezzatura', warehouse: w, updated_at: new Date().toISOString(), min_stock: 10 },
  { id: `w${idx}-2`, name: 'Casco di Sicurezza L-Class', sku: 'SAF-012', quantity: 12, category: 'Sicurezza', warehouse: w, updated_at: new Date().toISOString(), min_stock: 15 },
  { id: `w${idx}-3`, name: 'Cavo Rame 50m', sku: 'CAB-993', quantity: 120, category: 'Elettrico', warehouse: w, updated_at: new Date().toISOString(), min_stock: 50 },
  { id: `w${idx}-4`, name: 'Liquido Idraulico 5L', sku: 'OIL-442', quantity: 8, category: 'Manutenzione', warehouse: w, updated_at: new Date().toISOString(), min_stock: 10 },
]);

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  { 
    id: 'PO-2024-001', 
    items_count: 2, 
    created_at: new Date(Date.now() - 86400000).toISOString(), 
    status: 'sent',
    items: [
      { name: 'Cavo Rame 50m', sku: 'CAB-993', qty: 10, warehouse: 'Principale' },
      { name: 'Liquido Idraulico 5L', sku: 'OIL-442', qty: 5, warehouse: 'Nicola' }
    ]
  }
];

// Added mock data for customer orders to resolve the error in components/Orders.tsx
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
  // Added getOrders method to resolve the error in components/Orders.tsx
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
