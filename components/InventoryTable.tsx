
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuthUser, WarehouseName } from '../types';
import { mockApi } from '../services/supabaseClient';
import AIInsights from './AIInsights';

interface InventoryTableProps {
  // Warehouse is now optional to allow "Stock Totale" (global view) as seen in App.tsx
  warehouse?: WarehouseName;
  currentUser: AuthUser;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ warehouse, currentUser }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'operator';

  const fetchData = async () => {
    setLoading(true);
    const { data } = await mockApi.getInventory(warehouse);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [warehouse]);

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !canEdit) return;
    setUpdateLoading(true);
    
    await mockApi.updateItem(editingItem.id, {
      name: editingItem.name,
      sku: editingItem.sku,
      min_stock: editingItem.min_stock
    });
    
    setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
    setEditingItem(null);
    setUpdateLoading(false);
  };

  // Adjusted loading text to handle undefined warehouse
  if (loading) return <div className="p-10 text-center animate-pulse uppercase font-black text-slate-300">Caricamento Stock {warehouse || 'Globale'}...</div>;

  return (
    <div className="space-y-4">
      {/* Integrated AIInsights to provide strategic tips for the current inventory view */}
      <AIInsights items={items} />

      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Magazzino {warehouse || 'Globale'}</h2>
        <button onClick={fetchData} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">AGGIORNA</button>
      </div>

      <div className="grid gap-3">
        {items.map((item) => {
          const isLow = item.quantity < (item.min_stock || 15);
          return (
            <div 
              key={item.id} 
              onClick={() => canEdit && setEditingItem(item)}
              className={`bg-white p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:shadow-md ${isLow ? 'border-orange-200' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-4">
                  <h4 className={`font-black text-sm truncate uppercase tracking-tight ${isLow ? 'text-orange-700' : 'text-slate-900'}`}>{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest">SKU: {item.sku}</p>
                </div>
                <div className="shrink-0 text-right">
                   <div className={`text-lg font-black leading-none ${isLow ? 'text-orange-600' : 'text-slate-700'}`}>
                    {item.quantity} <span className="text-[10px] text-slate-400 font-medium">pz</span>
                   </div>
                   <p className="text-[9px] text-slate-400 mt-0.5">Scorta min: {item.min_stock || 15}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleUpdateItem}
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Modifica Prodotto</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome Prodotto</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">SKU</label>
                  <input 
                    type="text" 
                    value={editingItem.sku} 
                    onChange={e => setEditingItem({...editingItem, sku: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Scorta Minima</label>
                  <input 
                    type="number" 
                    value={editingItem.min_stock} 
                    onChange={e => setEditingItem({...editingItem, min_stock: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                type="button" 
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-bold text-slate-500 text-xs uppercase"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                disabled={updateLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {updateLoading ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
