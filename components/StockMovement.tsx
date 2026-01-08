
import React, { useState, useRef, useEffect } from 'react';
import { InventoryItem, AuthUser, WarehouseName } from '../types';
import { mockApi } from '../services/supabaseClient';

interface StockMovementProps {
  currentUser: AuthUser;
}

const WAREHOUSES: WarehouseName[] = ['Principale', 'Nicola', 'Leonardo', 'Liborio', 'Marco', 'Mirko'];

const StockMovement: React.FC<StockMovementProps> = ({ currentUser }) => {
  const [sku, setSku] = useState('');
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [targetWarehouse, setTargetWarehouse] = useState<WarehouseName>('Principale');
  const [qty, setQty] = useState(1);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'operator';

  const startScanner = async () => {
    setScanning(true);
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus({ type: 'error', text: 'ACCESSO CAMERA NEGATO' });
      setScanning(false);
    }
  };

  const stopScanner = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setScanning(false);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;
    setLoading(true);
    const { data } = await mockApi.getInventory();
    const found = data?.find(i => i.sku.toLowerCase() === sku.toLowerCase());
    if (found) {
      setItem(found);
      setTargetWarehouse(found.warehouse);
      setQty(1);
      stopScanner();
    } else {
      setStatus({ type: 'error', text: 'SKU NON TROVATO' });
    }
    setLoading(false);
  };

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  useEffect(() => {
    let timeout: any;
    if (scanning && !item) {
      timeout = setTimeout(async () => {
        const { data } = await mockApi.getInventory();
        if (data && data.length > 0) {
          const randomItem = data[Math.floor(Math.random() * data.length)];
          setSku(randomItem.sku);
          setItem(randomItem);
          setTargetWarehouse(randomItem.warehouse);
          setQty(1);
          stopScanner();
        }
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [scanning, item]);

  const handleMovement = async (type: 'carico' | 'scarico') => {
    if (!item || !canEdit) return;
    setLoading(true);
    const delta = type === 'carico' ? qty : -qty;
    const newQty = Math.max(0, item.quantity + delta);
    const { error } = await mockApi.updateQuantity(item.id, newQty);
    if (!error) {
      setStatus({ type: 'success', text: `OK: ${type.toUpperCase()} IN ${targetWarehouse.toUpperCase()}` });
      setTimeout(() => {
        setStatus(null);
        setItem(null);
        setSku('');
        startScanner();
      }, 1500);
    } else {
      setStatus({ type: 'error', text: 'ERRORE SISTEMA' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-full space-y-6">
      <div className="shrink-0 flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Movimento Stock</h2>
        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${canEdit ? 'bg-blue-600 text-white shadow-sm' : 'bg-red-500 text-white'}`}>
           {canEdit ? 'Operativo' : 'Lettura'}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white p-6 rounded-[40px] border border-slate-200 shadow-xl flex flex-col space-y-4">
        
        {/* Manual Search Input (Always Visible) */}
        <form onSubmit={handleManualSearch} className="relative">
          <input 
            type="text" 
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Cerca SKU a mano..."
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-3xl text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>

        {scanning && !item ? (
          <div className="flex-1 relative rounded-[32px] overflow-hidden bg-black shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-44 border-2 border-white/30 rounded-[32px] relative overflow-hidden">
                <div className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2.5s_infinite]"></div>
              </div>
            </div>
            <div className="absolute top-4 left-0 right-0 text-center">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full">Scansione in corso</span>
            </div>
          </div>
        ) : item ? (
          <div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-center shadow-inner">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Dettaglio Rilevato</p>
                <h3 className="text-lg font-black text-slate-900 uppercase leading-tight mb-1">{item.name}</h3>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">SKU: {item.sku}</p>
             </div>

             <div className="flex-1 flex flex-col space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Magazzino Destinazione</label>
                  <div className="grid grid-cols-3 gap-2">
                    {WAREHOUSES.map(w => (
                      <button 
                        key={w}
                        onClick={() => setTargetWarehouse(w)}
                        className={`py-3 rounded-2xl text-[9px] font-black uppercase transition-all border ${targetWarehouse === w ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Variazione Quantità</p>
                   <div className="flex items-center gap-8">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm text-2xl font-black text-slate-400 active:scale-90">-</button>
                      <span className="text-5xl font-black text-slate-900">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm text-2xl font-black text-slate-400 active:scale-90">+</button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button 
                    disabled={loading || !canEdit}
                    onClick={() => handleMovement('scarico')}
                    className="h-20 bg-slate-900 text-white rounded-[28px] shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-20"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Scarica</span>
                  </button>
                  <button 
                    disabled={loading || !canEdit}
                    onClick={() => handleMovement('carico')}
                    className="h-20 bg-blue-600 text-white rounded-[28px] shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-20"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Carica</span>
                  </button>
                </div>
                <button onClick={() => { setItem(null); startScanner(); }} className="text-[9px] font-black text-slate-400 uppercase tracking-widest underline decoration-2 underline-offset-4 text-center pb-2">Ricomincia Scansione</button>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h2m14 0h2M4 6h18M4 18h2m1.01-6H10m8 0V7m0 1v3m-10 1h.01M4 10V6M4 6h.01M20 6h.01" /></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usa lo scanner o scrivi lo SKU sopra</p>
          </div>
        )}
      </div>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">{status.text}</p>
        </div>
      )}

      <style>{`@keyframes scan { 0%, 100% { top: 10%; } 50% { top: 90%; } }`}</style>
    </div>
  );
};

export default StockMovement;
