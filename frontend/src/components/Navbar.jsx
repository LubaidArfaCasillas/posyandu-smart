import React from 'react';
import { Activity, Baby, Scale, LayoutDashboard, HeartPulse } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timbang', label: 'Input Timbang', icon: Scale },
    { id: 'anak', label: 'Data Balita', icon: Baby },
    { id: 'riwayat', label: 'Riwayat KMS', icon: Activity },
  ];

  return (
    <>
      {/* Top Header (Logo & Info Status) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-200">
                <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
                    PosyanduSmart
                  </span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    KMS Digital
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Platform Digitalisasi KMS & Deteksi Stunting
                </p>
              </div>
            </div>

            {/* Status Server & Kader */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-700">Kader Posyandu</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Server Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar (Rapi, Sejajar & Hover Responsif) */}
      <nav
        aria-label="Navigasi Bawah"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-1.5 px-3 sm:px-6"
      >
        <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-4 gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 sm:px-3 rounded-xl transition-all duration-200 group active:scale-95 ${
                  isActive
                    ? 'text-sky-700 font-bold'
                    : 'text-slate-500 hover:text-sky-600 hover:bg-slate-50/90 font-medium'
                }`}
              >
                {/* Indikator Garis Atas Aktif */}
                {isActive && (
                  <span className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full shadow-sm shadow-sky-300 animate-fadeIn"></span>
                )}

                {/* Ikon dengan efek Hover & Active Pill */}
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-100 text-sky-600 shadow-xs scale-105'
                      : 'text-slate-500 group-hover:text-sky-600 group-hover:scale-110 group-hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-200" />
                </div>

                {/* Label Menu */}
                <span
                  className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                    isActive ? 'text-sky-700 font-bold' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
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
