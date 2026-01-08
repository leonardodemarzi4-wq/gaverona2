
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuthUser, WarehouseName } from '../types';
import { mockApi } from '../services/supabaseClient';
import AIInsights from './AIInsights';

interface InventoryTableProps {
  warehouse?: WarehouseName;
  currentUser: AuthUser;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ warehouse, currentUser }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteItem = async () => {
    if (!editingItem || !canEdit) return;
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente "${editingItem.name}"?`)) return;

    setDeleteLoading(true);
    const { error } = await mockApi.deleteItem(editingItem.id);
    
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== editingItem.id));
      setEditingItem(null);
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse uppercase font-black text-slate-300">Caricamento Stock {warehouse || 'Globale'}...</div>;

  return (
    <div className="space-y-4">
      <AIInsights items={items} />

      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Magazzino {warehouse || 'Globale'}</h2>
        <button onClick={fetchData} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">AGGIORNA</button>
      </div>

      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nessun prodotto trovato</p>
          </div>
        ) : (
          items.map((item) => {
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
                    {warehouse === undefined && <p className="text-[8px] font-black text-blue-600 uppercase mt-1">Mag: {item.warehouse}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                     <div className={`text-lg font-black leading-none ${isLow ? 'text-orange-600' : 'text-slate-700'}`}>
                      {item.quantity} <span className="text-[10px] text-slate-400 font-medium">pz</span>
                     </div>
                     <p className="text-[9px] text-slate-400 mt-0.5">Scorta min: {item.min_stock || 0}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleUpdateItem}
            className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Dettaglio SKU</h3>
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

            <div className="p-6 bg-slate-50 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={updateLoading || deleteLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {updateLoading ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)}
                  className="bg-white border border-slate-200 py-3 rounded-2xl font-bold text-slate-500 text-xs uppercase"
                >
                  Indietro
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteItem}
                  disabled={deleteLoading || updateLoading}
                  className="bg-red-50 text-red-600 border border-red-100 py-3 rounded-2xl font-black text-xs uppercase disabled:opacity-50"
                >
                  {deleteLoading ? 'Eliminazione...' : 'Elimina SKU'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
