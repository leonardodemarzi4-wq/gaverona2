
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { getInventoryInsights } from '../services/geminiService';

interface AIInsightsProps {
  items: InventoryItem[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ items }) => {
  const [insights, setInsights] = useState<{ title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      const fetchInsights = async () => {
        setLoading(true);
        const data = await getInventoryInsights(items);
        setInsights(data);
        setLoading(false);
      };
      fetchInsights();
    }
  }, [items]);

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm animate-pulse space-y-3">
        <div className="h-4 w-32 bg-blue-50 rounded"></div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-50 rounded-xl"></div>
          <div className="h-10 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
        Suggerimenti AI
      </h3>
      <div className="grid gap-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-black text-blue-900 leading-tight">{insight.title}</h4>
            <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
