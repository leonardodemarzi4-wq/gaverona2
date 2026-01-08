
import React, { useState, useEffect } from 'react';
import { AuthUser, NavigationTab, UserRole, WarehouseName } from './types';
import Navigation from './components/Navigation';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import ReorderManagement from './components/ReorderManagement';
import StockMovement from './components/StockMovement';
import Warehouses from './components/Warehouses';
import Profile from './components/Profile';
import { mockApi, supabase, isConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await mockApi.getProfile(session.user.id);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (profile?.role as UserRole) || 'viewer'
          });
        }
      }
      setLoading(false);
    };

    initAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await mockApi.getProfile(session.user.id);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (profile?.role as UserRole) || 'viewer'
          });
        } else {
          setCurrentUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleDemoLogin = async (email: string) => {
    const role: UserRole = email.includes('admin') ? 'admin' : 'operator';
    setCurrentUser({
      id: 'demo-user',
      email: email,
      role: role
    });
  };

  const handleLogout = async () => {
    if (isConfigured) await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium tracking-tight tracking-widest uppercase text-[10px] font-black">Magazzino GA VR</p>
      </div>
    </div>
  );

  if (!currentUser) {
    return <Auth onLoginSuccess={handleDemoLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigateToOrdini={() => setActiveTab('ordini')} />;
      case 'inventario': return <InventoryTable currentUser={currentUser} />;
      case 'movimenti': return <StockMovement currentUser={currentUser} />;
      case 'ordini': return <ReorderManagement currentUser={currentUser} />;
      case 'magazzini': return <Warehouses currentUser={currentUser} />;
      case 'profilo': return <Profile currentUser={currentUser} onLogout={handleLogout} />;
      default: return <Dashboard onNavigateToOrdini={() => setActiveTab('ordini')} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col h-full md:ml-64 relative overflow-hidden">
        <header className="shrink-0 h-16 px-4 md:px-8 flex justify-between items-center bg-white border-b border-slate-200 z-40">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-100">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Magazzino GA</h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">
                   {currentUser.role[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{currentUser.email.split('@')[0]}</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>

        <nav className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {[
            { id: 'dashboard', label: 'Dash', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'inventario', label: 'Stock', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01' },
            { id: 'movimenti', label: 'Scanner', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h2m14 0h2M4 6h18M4 18h2m1.01-6H10m8 0V7m0 1v3m-10 1h.01M4 10V6M4 6h.01M20 6h.01' },
            { id: 'magazzini', label: 'Magazzini', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { id: 'ordini', label: 'Ordini', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as NavigationTab)} className={`flex flex-col items-center gap-1 p-2 min-w-[50px] rounded-xl transition-all ${activeTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
               <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;
