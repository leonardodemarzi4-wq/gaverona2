
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { mockApi } from '../services/supabaseClient';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getOrders().then(res => {
      setOrders(res.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestione Ordini</h2>
          <p className="text-slate-500">Traccia le spedizioni e gli ordini in attesa</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all">Nuovo Ordine</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID Ordine</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Stato</th>
              <th className="px-6 py-4 text-right">Totale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{order.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{order.customer}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-700">€{order.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
