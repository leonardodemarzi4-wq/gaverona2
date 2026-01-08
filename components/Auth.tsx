
import React, { useState } from 'react';
import { supabase, isConfigured } from '../services/supabaseClient';

interface AuthProps {
  onLoginSuccess: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isConfigured) {
      // Demo logic
      setTimeout(() => {
        onLoginSuccess(email || 'demo@magazzinoga.it');
        setLoading(false);
      }, 1000);
      return;
    }

    // Real Supabase Auth: Send OTP/Magic Link
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { emailRedirectTo: window.location.origin }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Controlla la tua email per il link di accesso!' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-10 text-center bg-blue-600">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">MAGAZZINO GA VR</h1>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Powered by Leonardo</p>
        </div>
        
        <form onSubmit={handleAuth} className="p-10 space-y-8">
          <div>
            <label className="block text-[11px] font-black text-white uppercase tracking-widest mb-3">Email Aziendale</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@azienda.it"
              className="w-full bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-slate-500"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 px-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'ACCESSO'}
          </button>

          {message && (
            <div className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
              Accesso riservato al personale autorizzato.<br/>Riceverai un link sicuro via email.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
