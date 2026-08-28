import React from 'react';
import { LayoutGrid, PlusCircle, Users, History, TrendingUp } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'timbang', label: 'Input Timbang', icon: PlusCircle },
    { id: 'anak', label: 'Data Balita', icon: Users },
    { id: 'riwayat', label: 'Riwayat KMS', icon: History },
  ];

  return (
    <>
      {/* Top Header (Responsif: Desktop menampilkan navigasi pill di tengah, Mobile menampilkan logo & badge) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#0077b6]/10 flex items-center justify-center text-[#0077b6]">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0077b6]">
                PosyanduSmart
              </span>
            </div>
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

          {/* Badges Right */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
            <span className="hidden sm:inline-block px-3 py-1 bg-[#0077b6] text-white text-[11px] font-bold rounded-full shadow-xs">
              KMS Digital
            </span>
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
