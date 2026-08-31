import React from 'react';
import {
  LayoutGrid,
  PlusCircle,
  Users,
  History,
  LogOut,
  HeartHandshake,
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function KaderLayout({ activeTab, setActiveTab, user, onLogout, children }) {
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutGrid },
    { id: 'timbang', label: '+ Timbang', icon: PlusCircle, highlight: true },
    { id: 'anak', label: 'Data Balita', icon: Users },
    { id: 'riwayat', label: 'KMS Balita', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] pb-20 md:pb-10">
      {/* Mobile Header Bar */}
      <header className="bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#03045e] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Posyandu & Kader Greeting */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src="/posyandusmart.svg"
                alt="PosyanduSmart Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white">
                  PosyanduSmart <span className="text-[#48cae4] text-xs font-semibold">Kader</span>
                </h1>
              </div>
              <p className="text-[11px] text-sky-100/90 font-medium truncate max-w-[200px] sm:max-w-none">
                {user?.nama_posyandu || 'Posyandu Melati 01'} • {user?.nama_lengkap || 'Kader'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-bold text-sky-100 border border-white/20">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
              <span>Aplikasi Kader</span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Action Ribbon Mobile */}
      <div className="bg-sky-50 border-b border-sky-200/60 px-4 py-2 text-xs font-medium text-sky-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Tampilan HP Kader: <strong>{user?.nama_posyandu || 'Posyandu Setempat'}</strong></span>
          </div>
          {activeTab !== 'timbang' && (
            <button
              onClick={() => setActiveTab('timbang')}
              className="bg-[#0077b6] hover:bg-[#023e8a] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            >
              <span>+ Input Cepat</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area Mobile-Optimized */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-6">
        {children}
      </main>

      {/* Bottom Navigation Bar (Khusus Aplikasi Mobile Kader) */}
      <nav
        aria-label="Navigasi Kader Posyandu"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-1.5 px-3"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-[#0077b6] text-white ring-4 ring-sky-200'
                      : 'bg-gradient-to-tr from-[#0077b6] to-[#48cae4] text-white shadow-sky-300'
                  }`}>
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0077b6] mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#0077b6] font-bold bg-sky-50'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0077b6] stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-[#0077b6]' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
