import React from 'react';
import { LayoutGrid, PlusCircle, Users, History, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const isAdmin = user?.role === 'admin_puskesmas';

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'timbang', label: 'Input Timbang', icon: PlusCircle },
        { id: 'anak', label: 'Data Balita', icon: Users },
        { id: 'riwayat', label: 'Riwayat KMS', icon: History },
        { id: 'kader', label: 'Kelola Kader', icon: UserCheck },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'timbang', label: 'Input Timbang', icon: PlusCircle },
        { id: 'anak', label: 'Data Balita', icon: Users },
        { id: 'riwayat', label: 'Riwayat KMS', icon: History },
      ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-soft-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-1">
                <img
                  src="/posyandusmart.svg"
                  alt="PosyanduSmart Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none block">
                Posyandu<span className="text-emerald-600">Smart</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Digitalisasi KMS & Pantau Stunting
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-soft-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col text-right">
              {isAdmin ? (
                <>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Admin Puskesmas
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Pengawas Wilayah</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.nama_lengkap || 'Kader Posyandu'}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600">
                    {user?.nama_posyandu ? `Posyandu ${user.nama_posyandu}` : 'Kader Aktif'}
                  </span>
                </>
              )}
            </div>

            {/* Tombol Logout */}
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-95"
              title="Keluar / Logout Akun"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar (Khusus Layar HP - Ergonomis untuk Kader) */}
      <nav
        aria-label="Navigasi Bawah Kader"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-lg shadow-slate-900/5"
      >
        <div className={`max-w-md mx-auto grid ${navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-0.5`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'stroke-[2.4] scale-110 text-emerald-600' : 'stroke-[1.8]'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight leading-none ${
                    isActive ? 'font-bold text-emerald-800' : 'font-medium text-slate-600'
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
