
import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, WarehouseName } from '../types';
import { mockApi } from '../services/supabaseClient';

interface DashboardProps {
  onNavigateToOrdini: () => void;
}

const WAREHOUSES: WarehouseName[] = ['Principale', 'Nicola', 'Leonardo', 'Liborio', 'Marco', 'Mirko'];

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToOrdini }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShortageView, setShowShortageView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  // Barcode Scanning State
  const [isScanningSku, setIsScanningSku] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form State (Changed quantity and min_stock to strings for empty initial display)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    warehouse: 'Principale' as WarehouseName,
    quantity: '' as any,
    min_stock: '' as any
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await mockApi.getInventory();
    setItems(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    
    // Convert string inputs back to numbers
    const payload = {
      ...newProduct,
      quantity: parseInt(newProduct.quantity) || 0,
      min_stock: parseInt(newProduct.min_stock) || 0
    };

    await mockApi.createItem(payload);
    await fetchData();
    setCreateLoading(false);
    setIsCreateModalOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      warehouse: 'Principale',
      quantity: '',
      min_stock: ''
    });
  };

  // Barcode Scanner Logic
  const startSkuScanner = async () => {
    setIsScanningSku(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Impossibile accedere alla fotocamera");
      setIsScanningSku(false);
    }
  };

  const stopSkuScanner = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsScanningSku(false);
  };

  const captureBarcode = () => {
    // Simulazione di lettura barcode
    const mockBarcode = `BC-${Math.floor(Math.random() * 900000 + 100000)}`;
    setNewProduct({ ...newProduct, sku: mockBarcode });
    stopSkuScanner();
  };

  const lowStockItems = items.filter(i => i.quantity < (i.min_stock || 15));
  const totalProducts = items.length;
  const shortageCount = lowStockItems.length;

  if (loading && items.length === 0) return (
    <div className="h-full flex items-center justify-center p-10 animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">
      Sincronizzazione Globale...
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-200px)] pb-20">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 md:p-0 rounded-3xl md:bg-transparent">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Panoramica Aziendale</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Analisi tempo reale magazzini</p>
          </div>
          <div className="flex gap-3">
            {showShortageView && (
              <button 
                onClick={() => setShowShortageView(false)}
                className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 uppercase"
              >
                ← Home
              </button>
            )}
          </div>
        </div>

        {!showShortageView ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xl mb-3 shadow-lg shadow-blue-100">📦</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Totale SKU</p>
                <p className="text-3xl font-black text-slate-900 leading-none mt-1">{totalProducts}</p>
              </div>

              <button 
                onClick={() => setShowShortageView(true)}
                className={`p-6 rounded-[32px] border transition-all text-left shadow-sm ${shortageCount > 0 ? 'bg-orange-500 border-orange-400' : 'bg-white border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-2xl ${shortageCount > 0 ? 'bg-white text-orange-600' : 'bg-slate-100'} flex items-center justify-center text-xl mb-3`}>⚠️</div>
                <p className={`text-[9px] font-black uppercase tracking-widest ${shortageCount > 0 ? 'text-orange-100' : 'text-slate-400'}`}>Sotto Scorta</p>
                <p className={`text-3xl font-black leading-none mt-1 ${shortageCount > 0 ? 'text-white' : 'text-slate-900'}`}>{shortageCount}</p>
              </button>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-h-[200px]">
              <h3 className="text-[10px] font-black mb-4 text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                Ultimi Movimenti Aziendali
              </h3>
              <div className="space-y-2">
                {totalProducts === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest">Inventario Vuoto</p>
                  </div>
                ) : (
                  items.slice(0, 3).map((item, i) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} rounded-xl flex items-center justify-center`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={i % 2 === 0 ? "M12 4v16m8-8H4" : "M20 12H4"} /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[140px]">{item.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Log {item.warehouse}</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-black ${i % 2 === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {i % 2 === 0 ? '+' : ''}{item.quantity} pz
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-orange-200 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 duration-300">
            <div className="px-6 py-5 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-orange-900 text-sm uppercase tracking-wider">Focus Esaurimento</h3>
                <p className="text-[10px] text-orange-600 font-bold uppercase mt-0.5">Riordino prioritario</p>
              </div>
              {shortageCount > 0 && (
                <button 
                  onClick={onNavigateToOrdini}
                  className="text-[9px] font-black bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-100 uppercase"
                >
                  Nuovo Ordine
                </button>
              )}
            </div>
            
            <div className="divide-y divide-slate-100">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Settore: {item.warehouse}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-red-600 leading-none">{item.quantity} pz</div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Soglia: {item.min_stock || 15}</p>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="p-10 text-center">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Tutto in regola</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pulsante Flottante (+) - Unico in basso a destra */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-40">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-4 border-white"
          title="Nuovo Prodotto"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Nuovo Prodotto
          </span>
        </button>
      </div>

      {/* Modale Creazione Prodotto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <form 
            onSubmit={handleCreateProduct}
            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="bg-blue-600 p-8 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white uppercase text-lg tracking-widest leading-none">Crea Prodotto</h3>
                <p className="text-[9px] text-blue-100 font-black uppercase tracking-widest mt-2">Censimento SKU</p>
              </div>
              <button 
                type="button" 
                onClick={() => { stopSkuScanner(); setIsCreateModalOpen(false); }} 
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Articolo</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-300"
                  placeholder="es. Prodotto Alfa"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SKU Univoco</label>
                    <button 
                        type="button" 
                        onClick={isScanningSku ? stopSkuScanner : startSkuScanner}
                        className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${isScanningSku ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {isScanningSku ? 'Annulla' : 'Barcode Foto'}
                    </button>
                </div>

                {isScanningSku ? (
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-3">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3/4 h-1/2 border-2 border-white/40 rounded-xl relative">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 shadow-[0_0_15px_blue] animate-pulse"></div>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={captureBarcode}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-xl"
                        >
                            Rileva
                        </button>
                    </div>
                ) : (
                    <input 
                      required
                      type="text" 
                      value={newProduct.sku} 
                      onChange={e => setNewProduct({...newProduct, sku: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-mono text-xs font-black outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="SKU-XXX o barcode"
                    />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Magazzino</label>
                  <select 
                    value={newProduct.warehouse}
                    onChange={e => setNewProduct({...newProduct, warehouse: e.target.value as WarehouseName})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                  >
                    {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giacenza</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.quantity} 
                    onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Minimo</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.min_stock} 
                    onChange={e => setNewProduct({...newProduct, min_stock: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
              <button 
                type="submit" 
                disabled={createLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {createLoading ? 'Salvataggio...' : 'Crea Prodotto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
