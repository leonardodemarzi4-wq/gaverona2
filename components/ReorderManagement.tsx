
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuthUser, WarehouseName, PurchaseOrder } from '../types';
import { mockApi } from '../services/supabaseClient';

interface ReorderManagementProps {
  currentUser: AuthUser;
}

interface ReorderItem extends Partial<InventoryItem> {
  id: string;
  name: string;
  reorderQty: number;
  warehouse: WarehouseName;
}

const ReorderManagement: React.FC<ReorderManagementProps> = ({ currentUser }) => {
  const [activeView, setActiveView] = useState<'request' | 'history'>('request');
  const [reorderList, setReorderList] = useState<ReorderItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setOrderSent(false);
    setIsReviewing(false);
    
    // Fetch Inventory for reorders
    const { data: invData } = await mockApi.getInventory();
    if (invData) {
      const lowStock = invData
        .filter(i => i.quantity < (i.min_stock || 15))
        .map(i => ({ ...i, reorderQty: Math.max(1, (i.min_stock || 15) - i.quantity) }));
      setReorderList(lowStock as ReorderItem[]);
    }

    // Fetch History
    const { data: historyData } = await mockApi.getPurchaseOrders();
    if (historyData) {
      setPurchaseHistory(historyData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = (items: ReorderItem[]) => {
    const header = "Prodotto;SKU;Magazzino;Quantita\n";
    const rows = items.map(item => `${item.name};${item.sku};${item.warehouse};${item.reorderQty}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ordine_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmOrder = async () => {
    setOrderSent(true);
    
    // 1. Generate CSV
    downloadCSV(reorderList);

    // 2. Save to history (mock)
    const newOrder: PurchaseOrder = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      items_count: reorderList.length,
      created_at: new Date().toISOString(),
      status: 'sent',
      items: reorderList.map(i => ({ name: i.name, sku: i.sku || '', qty: i.reorderQty, warehouse: i.warehouse }))
    };
    
    await mockApi.savePurchaseOrder(newOrder);

    // 3. Cleanup
    setTimeout(() => {
        setOrderSent(false);
        setReorderList([]);
        setIsReviewing(false);
        setActiveView('history');
        fetchData(); // Refresh history
    }, 2000);
  };

  const updateReorderQty = (id: string, delta: number) => {
    setReorderList(prev => prev.map(item => 
      item.id === id 
        ? { ...item, reorderQty: Math.max(1, item.reorderQty + delta) }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setReorderList(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return (
    <div className="p-10 text-center animate-pulse text-[10px] font-black text-slate-300 uppercase tracking-widest">
      Sincronizzazione Ordini...
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* View Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit self-center md:self-start">
        <button 
          onClick={() => { setActiveView('request'); setIsReviewing(false); }}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'request' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
        >
          Nuovo Ordine
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
        >
          Storico Inviati
        </button>
      </div>

      {activeView === 'request' ? (
        <>
          <div className="shrink-0 px-1 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fabbisogno Stock</h2>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Prodotti sotto scorta minima</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
            {isReviewing ? (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anteprima Documento CSV</p>
                  <button onClick={() => setIsReviewing(false)} className="text-[10px] font-black text-blue-600">Modifica</button>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Prodotto</th>
                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Magazzino</th>
                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Quantità</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reorderList.map(item => (
                        <tr key={item.id}>
                          <td className="px-8 py-4">
                            <p className="text-xs font-black text-slate-900 uppercase">{item.name}</p>
                            <p className="text-[8px] font-mono text-slate-400 font-bold uppercase">SKU: {item.sku}</p>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-md">{item.warehouse}</span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className="text-sm font-black text-blue-600">{item.reorderQty} pz</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs font-black text-slate-400 uppercase">{reorderList.length} Voci in ordine</p>
                  <button 
                    onClick={handleConfirmOrder}
                    disabled={orderSent}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
                  >
                    {orderSent ? 'INVIO E DOWNLOAD...' : 'CONFERMA ED ESPORTA EXCEL'}
                  </button>
                </div>
              </div>
            ) : reorderList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/5">✓</div>
                <div>
                  <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Stock Ottimizzato</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tight">Nessun prodotto sotto scorta rilevato.</p>
                </div>
                <button onClick={fetchData} className="text-[9px] font-black text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full uppercase tracking-widest">Aggiorna Analisi</button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {reorderList.map(item => (
                  <div key={item.id} className="p-6 bg-white hover:bg-slate-50 transition-colors flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-4">
                        <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Attuali in {item.warehouse}: {item.quantity}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-all p-1">✕</button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button onClick={() => updateReorderQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl font-black">-</button>
                        <div className="w-12 text-center"><p className="font-black text-slate-900">{item.reorderQty}</p></div>
                        <button onClick={() => updateReorderQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl font-black">+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ordina</p>
                        <p className="text-lg font-black text-blue-600 leading-none">{item.reorderQty} <span className="text-[10px]">pz</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isReviewing && reorderList.length > 0 && (
            <button 
              onClick={() => setIsReviewing(true)}
              className="shrink-0 w-full bg-blue-600 text-white font-black py-5 rounded-[28px] shadow-xl shadow-blue-100 active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3"
            >
              Genera Ordine Fornitore
            </button>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 animate-in fade-in duration-300">
          <div className="px-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Storico Ordini Inviati</h2>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Vedi tutti gli ordini generati dal sistema</p>
          </div>

          <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden overflow-y-auto">
            {purchaseHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nessun ordine nello storico</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {purchaseHistory.map(order => (
                        <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{order.id}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                    {new Date(order.created_at).toLocaleDateString()} • {order.items_count} Articoli
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded-full uppercase">Inviato CSV</span>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReorderManagement;
