import React from 'react';
import { LayoutGrid, PlusCircle, Users, History, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const isAdmin = user?.role === 'admin_puskesmas';

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'kader', label: 'Kelola Kader', icon: UserCheck },
        { id: 'anak', label: 'Data Balita', icon: Users },
        { id: 'riwayat', label: 'Riwayat KMS', icon: History },
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
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <img
              src="/posyandusmart.svg"
              alt="PosyanduSmart Logo"
              className="h-9 sm:h-10 w-auto object-contain shrink-0"
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Posyandu<span className="text-sky-600">Smart</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col text-right">
              {isAdmin ? (
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  Admin Puskesmas
                </span>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.nama_lengkap || 'Pengguna'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {user?.nama_posyandu || 'Kader Posyandu'}
                  </span>
                </>
              )}
            </div>

            {/* Tombol Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-xs"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-sky-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold text-sky-600' : 'font-medium text-slate-600'}`}>
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
