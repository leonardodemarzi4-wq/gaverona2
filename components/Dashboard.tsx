
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { mockApi } from '../services/supabaseClient';

interface DashboardProps {
  onNavigateToOrdini: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToOrdini }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShortageView, setShowShortageView] = useState(false);

  useEffect(() => {
    mockApi.getInventory().then(res => {
      setItems(res.data || []);
      setLoading(false);
    });
  }, []);

  const lowStockItems = items.filter(i => i.quantity < (i.min_stock || 15));
  const totalProducts = items.length;
  const shortageCount = lowStockItems.length;

  if (loading) return (
    <div className="h-full flex items-center justify-center p-10 animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">
      Sincronizzazione Globale...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Panoramica Aziendale</h2>
        {showShortageView && (
          <button 
            onClick={() => setShowShortageView(false)}
            className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 uppercase"
          >
            ← Indietro
          </button>
        )}
      </div>

      {!showShortageView ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xl mb-3 shadow-lg shadow-blue-100">📦</div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Totale SKU</p>
              <p className="text-3xl font-black text-slate-900 leading-none mt-1">{totalProducts}</p>
            </div>

            <button 
              onClick={() => setShowShortageView(true)}
              className={`p-5 rounded-3xl border transition-all text-left shadow-sm ${shortageCount > 0 ? 'bg-orange-500 border-orange-400' : 'bg-white border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-2xl ${shortageCount > 0 ? 'bg-white text-orange-600' : 'bg-slate-100'} flex items-center justify-center text-xl mb-3`}>⚠️</div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${shortageCount > 0 ? 'text-orange-100' : 'text-slate-400'}`}>Sotto Scorta Totale</p>
              <p className={`text-3xl font-black leading-none mt-1 ${shortageCount > 0 ? 'text-white' : 'text-slate-900'}`}>{shortageCount}</p>
            </button>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black mb-4 text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
              Ultimi Movimenti Aziendali
            </h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} rounded-xl flex items-center justify-center`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={i % 2 === 0 ? "M12 4v16m8-8H4" : "M20 12H4"} /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[140px]">Movimento #{200+i}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Magazzino {['Nicola', 'Marco', 'Mirko'][i%3]}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black ${i % 2 === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {i % 2 === 0 ? '+' : '-'}{i*2+1} pz
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-orange-200 shadow-sm overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-2 duration-300">
          <div className="px-6 py-5 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
            <div>
              <h3 className="font-black text-orange-900 text-sm uppercase tracking-wider">Esaurimento Globale</h3>
              <p className="text-[10px] text-orange-600 font-bold uppercase mt-0.5">Tutti i magazzini aggregati</p>
            </div>
            {shortageCount > 0 && (
              <button 
                onClick={onNavigateToOrdini}
                className="text-[9px] font-black bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-100 uppercase"
              >
                Crea Ordine
              </button>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 overflow-y-auto">
            {lowStockItems.map((item) => (
              <div key={item.id} className="p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Magazzino: {item.warehouse}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-red-600 leading-none">{item.quantity} pz</div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Min: {item.min_stock || 15}</p>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Nessun prodotto sotto scorta</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
