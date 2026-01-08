
import React from 'react';
import { AuthUser } from '../types';

interface ProfileProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8 -mt-12 text-center">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center p-1 border-4 border-white overflow-hidden mb-4">
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl">
              👤
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{currentUser.email.split('@')[0]}</h2>
          <p className="text-slate-500">{currentUser.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
            {currentUser.role}
          </div>
        </div>

        <div className="border-t border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">ID Utente</p>
              <p className="text-sm font-mono text-slate-700 truncate">{currentUser.id}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Ultimo Accesso</p>
              <p className="text-sm text-slate-700">Oggi, {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Impostazioni Account</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors flex justify-between items-center group">
                <span className="text-sm font-medium text-slate-600">Cambia Password</span>
                <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors flex justify-between items-center group text-red-600">
                <span className="text-sm font-medium">Notifiche di Sistema</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-2xl font-bold transition-all mt-8"
          >
            Disconnetti Sessione
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
