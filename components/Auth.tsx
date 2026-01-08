
import React, { useState } from 'react';
import { supabase, isConfigured } from '../services/supabaseClient';

interface AuthProps {
  onLoginSuccess: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isConfigured) {
      // Logica Demo con persistenza manuale
      setTimeout(() => {
        const demoEmail = email || 'admin@magazzinoga.it';
        // Salviamo nel localStorage per far sì che non venga richiesto al refresh
        localStorage.setItem('ga_demo_session', JSON.stringify({
          email: demoEmail,
          role: demoEmail.includes('admin') ? 'admin' : 'operator'
        }));
        onLoginSuccess(demoEmail);
        setLoading(false);
      }, 1200);
      return;
    }

    // Login reale con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email,
      password 
    });

    if (error) {
      setMessage({ type: 'error', text: 'Credenziali non valide o errore di sistema' });
    } else if (data.user) {
      onLoginSuccess(data.user.email || email);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10 text-center bg-blue-600 relative overflow-hidden">
          {/* Decorazione di sfondo */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg relative z-10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">MAGAZZINO GA VR</h1>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80 relative z-10">Accesso Sistema Gestionale</p>
        </div>
        
        <form onSubmit={handleAuth} className="p-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Aziendale</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@azienda.it"
                className="w-full bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-slate-500"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 bottom-4 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 px-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'ACCEDI ORA'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="text-center pt-4 border-t border-slate-800">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Sistema di autenticazione crittografato.<br/>
              Le credenziali sono gestite tramite Supabase.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
