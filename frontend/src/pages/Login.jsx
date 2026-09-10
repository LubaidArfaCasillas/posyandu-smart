import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Silakan masukkan username dan password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const user = res.data.data.user;
        localStorage.setItem('posyandu_user', JSON.stringify(user));
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Username atau password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState('kader');

  const roles = [
    {
      id: 'kader',
      title: 'Kader Posyandu',
      desc: 'Penimbangan & pencatatan KMS balita',
      icon: User,
      color: 'bg-emerald-50 text-[#00a86b] border-emerald-200',
      defaultUser: 'kader',
    },
    {
      id: 'admin',
      title: 'Admin Puskesmas',
      desc: 'Supervisi posyandu & data wilayah',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      defaultUser: 'admin',
    },
    {
      id: 'bidan',
      title: 'Bidan / Petugas',
      desc: 'Pemeriksaan klinis & rujukan gizi',
      icon: User,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      defaultUser: 'bidan',
    },
    {
      id: 'ortu',
      title: 'Orang Tua Balita',
      desc: 'Akses hasil KMS via WhatsApp',
      icon: User,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      defaultUser: 'ortu',
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    if (role.id === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role.id === 'kader') {
      setUsername('kader');
      setPassword('kader123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f4] flex flex-col justify-center items-center px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Soft Ambient Background Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#00a86b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-5 relative z-10">
        {/* Header & Logo */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-[#00a86b] p-0.5 shadow-soft-sm mx-auto mb-2">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-2">
              <img
                src="/posyandusmart.svg"
                alt="PosyanduSmart Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Posyandu<span className="text-[#00a86b]">Smart</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Platform Digitalisasi KMS & Pemantauan Stunting
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-slate-800">
              Pilih peran Anda untuk masuk
            </h2>
            <p className="text-[11px] text-slate-400">Klik peran untuk memilih akun demo atau ketik akun Anda</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleSelect(r)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
                    isSelected
                      ? 'border-2 border-[#00a86b] shadow-soft-sm bg-emerald-50/20'
                      : 'border-slate-200/80 hover:border-emerald-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${r.color} mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                    {r.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Form Login */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100/80 shadow-soft-md space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">Masuk ke Akun</h2>
              <p className="text-[11px] text-slate-400">Masukkan username & password</p>
            </div>
            <span className="text-[10px] font-extrabold text-[#00a86b] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              {selectedRole === 'admin' ? 'Admin' : 'Kader'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Input Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00a86b] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00a86b] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00a86b] hover:bg-[#00925d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-soft-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Masuk ke PosyanduSmart</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center text-[11px] text-slate-400 space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-slate-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00a86b]" />
            <span>Sistem Informasi Terpadu Posyandu & Puskesmas</span>
          </div>
          <p>Terhubung langsung dengan data balita wilayah</p>
        </div>
      </div>
    </div>
  );
}
