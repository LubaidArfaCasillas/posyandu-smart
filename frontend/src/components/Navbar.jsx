import React from 'react';
import { LayoutGrid, PlusCircle, Users, History, TrendingUp, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'timbang', label: 'Input Timbang', icon: PlusCircle },
    { id: 'anak', label: 'Data Balita', icon: Users },
    { id: 'riwayat', label: 'Riwayat KMS', icon: History },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <img
              src="/posyandusmart.svg"
              alt="PosyanduSmart Logo"
              className="h-9 sm:h-10 w-auto object-contain transition-transform hover:scale-105"
            />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0077b6]">
              PosyanduSmart
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#48cae4] text-slate-900 shadow-xs scale-102'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900 stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.nama_lengkap || 'Kader Posyandu'}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {user?.role === 'admin_puskesmas' ? 'Admin Puskesmas' : user?.nama_posyandu || 'Kader'}
              </span>
            </div>

            {/* Tombol Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar (Khusus Layar Mobile) */}
      <nav
        aria-label="Navigasi Bawah"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] py-2 px-4"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
                  isActive
                    ? 'px-4 sm:px-5 py-1.5 rounded-full bg-[#48cae4] text-slate-900 font-bold shadow-xs'
                    : 'px-2.5 sm:px-3 text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className={`text-[10px] sm:text-[11px] mt-0.5 ${isActive ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
