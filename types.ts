
export type UserRole = 'admin' | 'operator' | 'viewer';

export type WarehouseName = 'Principale' | 'Nicola' | 'Leonardo' | 'Liborio' | 'Marco' | 'Mirko';

export type NavigationTab = 'dashboard' | 'inventario' | 'movimenti' | 'ordini' | 'magazzini' | 'profilo';

export interface Profile {
  id: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  warehouse: WarehouseName;
  updated_at: string;
  min_stock?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Order {
  id: string;
  customer: string;
  status: 'pending' | 'shipped' | 'delivered';
  total: number;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  items_count: number;
  created_at: string;
  status: 'sent' | 'processing';
  items: { name: string; sku: string; qty: number; warehouse: string }[];
}
