import React, { useState } from 'react';
import {
  Home,
  Smile,
  Scale,
  TrendingUp,
  UserCheck,
  Bell,
  LogOut,
  Plus,
  ChevronRight,
  X,
  User,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const isAdmin = user?.role === 'admin_puskesmas';
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 5 Nav items strictly uniform
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'anak', label: 'Data Balita', icon: Smile },
    { id: 'timbang', label: 'Timbang', icon: Scale },
    { id: 'riwayat', label: 'KMS Digital', icon: TrendingUp },
    { id: 'kader', label: 'Akun Kader', icon: UserCheck },
  ];

  const getSubTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Beranda';
      case 'anak':
        return 'Data Balita';
      case 'timbang':
        return 'Pemeriksaan Timbang';
      case 'riwayat':
        return 'KMS Digital';
      case 'kader':
        return 'Kelola Kader & Posyandu';
      default:
        return 'Beranda';
    }
  };

  const handleTabClick = (itemId) => {
    if (itemId === 'kader' && !isAdmin) {
      setShowProfileModal(true);
    } else {
      setActiveTab(itemId);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100/70 sticky top-0 z-40 shadow-soft-2xs">
        <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Brand & Subtitle (Left) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Medical Green Cross Icon */}
            <div className="w-9 h-9 rounded-xl bg-[#00a86b] text-white flex items-center justify-center shadow-soft-sm shrink-0">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>

            {/* Title & Pill Badge */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 tracking-tight leading-tight">
                  Posyandu<span className="text-[#00a86b]">Smart</span>
                </span>
                <span className="bg-[#d2f1e2] text-[#008753] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200/60 leading-none">
                  PWA Kader
                </span>
              </div>
              <span className="text-xs text-slate-500 font-semibold leading-tight mt-0.5">
                {getSubTitle()}
              </span>
            </div>
          </div>

          {/* Actions (Right): Bell with Red Dot & Account/Guest Icon */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationModal(!showNotificationModal)}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#00a86b] flex items-center justify-center transition-colors relative"
                title="Pemberitahuan Posyandu"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
                {/* Red Indicator Dot */}
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {/* Notification Popup Dropdown */}
              {showNotificationModal && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-lg border border-slate-200/80 p-3.5 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                    <span className="text-xs font-black text-slate-900">Notifikasi Posyandu</span>
                    <span className="text-[10px] bg-emerald-50 text-[#00a86b] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div
                      onClick={() => {
                        setActiveTab('dashboard');
                        setShowNotificationModal(false);
                      }}
                      className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 cursor-pointer hover:bg-emerald-100/60 transition-colors"
                    >
                      <p className="font-bold text-[#00a86b]">Jadwal Penimbangan Aktif</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sesi penimbangan balita dibuka hari ini.
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('anak');
                        setShowNotificationModal(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <p className="font-bold text-amber-700">Pantau Tumbuh Kembang</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        3 balita membutuhkan pantauan nutrisi lanjutan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Circular Account / Guest Logo (No Photo) */}
            <div
              onClick={() => setShowProfileModal(true)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#00a86b] border border-slate-200 flex items-center justify-center cursor-pointer shadow-2xs transition-all active:scale-95 shrink-0"
              title="Akun Pengguna"
            >
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </header>

      {/* Akun & Profil Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-soft-lg border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">Profil Akun</span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#ebf7f0] border border-emerald-200/60">
              <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 text-[#00a86b] flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {user?.nama_lengkap || 'Kader Posyandu'}
                </h4>
                <p className="text-xs text-[#008753] font-bold">
                  {isAdmin ? 'Admin Puskesmas' : 'Kader Posyandu Aktif'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {user?.nama_posyandu || 'Posyandu Melati RW 04'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setActiveTab('kader');
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 font-bold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00a86b]" />
                    <span>Kelola Akun Kader & Posyandu</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onLogout();
                }}
                className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar: All 5 Items Uniform with Green Hover */}
      <nav
        aria-label="Navigasi Bawah Kader"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-emerald-100/70 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-2 flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'text-[#00a86b] font-black'
                    : 'text-slate-400 hover:text-[#00a86b] font-semibold'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-150 ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 tracking-tight leading-none transition-colors duration-150 ${
                    isActive ? 'font-black' : 'font-semibold'
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


