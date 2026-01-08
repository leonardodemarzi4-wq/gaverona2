
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuthUser, WarehouseName } from '../types';
import { mockApi } from '../services/supabaseClient';

interface WarehousesProps {
  currentUser: AuthUser;
}

const WAREHOUSES: WarehouseName[] = ['Principale', 'Nicola', 'Leonardo', 'Liborio', 'Marco', 'Mirko'];

const Warehouses: React.FC<WarehousesProps> = ({ currentUser }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseName | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedWarehouse) {
      setLoading(true);
      mockApi.getInventory(selectedWarehouse).then(res => {
        setItems(res.data || []);
        setLoading(false);
      });
    }
  }, [selectedWarehouse]);

  if (selectedWarehouse) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Magazzino {selectedWarehouse}</h2>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Vista Dettaglio Posizione</p>
          </div>
          <button 
            onClick={() => setSelectedWarehouse(null)}
            className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl uppercase hover:bg-slate-50 transition-colors"
          >
            Chiudi
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center animate-pulse text-[10px] font-black text-slate-300 uppercase tracking-widest">Interrogazione Magazzino...</div>
        ) : (
          <div className="grid gap-3">
            {items.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight leading-tight">{item.name}</h4>
                  <p className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-600">{item.quantity} pz</div>
                  <div className={`text-[8px] font-black uppercase mt-1 ${item.quantity < (item.min_stock || 15) ? 'text-orange-500' : 'text-slate-400'}`}>
                    {item.quantity < (item.min_stock || 15) ? 'Sotto Scorta' : 'Disponibile'}
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center p-20 bg-slate-50 border border-slate-100 rounded-[32px]">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nessun prodotto assegnato a questa posizione</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Magazzini Aziendali</h2>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Seleziona una posizione per vedere lo stock</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {WAREHOUSES.map(w => (
          <button 
            key={w}
            onClick={() => setSelectedWarehouse(w)}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-center group flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
               📦
            </div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{w}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Vedi Stock →</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Warehouses;
