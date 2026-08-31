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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <img
            src="/posyandusmart.svg"
            alt="PosyanduSmart Logo"
            className="h-28 sm:h-32 w-auto mx-auto object-contain mb-3 drop-shadow-md hover:scale-105 transition-transform"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0077b6] tracking-tight">
            PosyanduSmart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Platform Digitalisasi KMS & Deteksi Dini Stunting
          </p>
        </div>

        {/* Card Form Login */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-400 mt-0.5">Khusus untuk Kader Posyandu & Petugas Puskesmas</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0077b6] hover:bg-[#023e8a] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Memverifikasi...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-sky-900">
            <span className="flex items-center gap-1.5">🔑 Demo Login Credentials</span>
            <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded-full">Klik untuk Cepat Masuk</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setUsername('kader1');
                setPassword('123456');
              }}
              className="p-2 bg-white rounded-xl border border-sky-100 text-left hover:border-sky-300 transition-all shadow-xs group"
            >
              <div className="font-bold text-slate-800 group-hover:text-[#0077b6]">📱 Kader 1 (Mobile UI)</div>
              <div className="text-[10px] text-slate-500 font-mono">kader1 / 123456</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('kader2');
                setPassword('123456');
              }}
              className="p-2 bg-white rounded-xl border border-sky-100 text-left hover:border-sky-300 transition-all shadow-xs group"
            >
              <div className="font-bold text-slate-800 group-hover:text-[#0077b6]">📱 Kader 2 (Mobile UI)</div>
              <div className="text-[10px] text-slate-500 font-mono">kader2 / 123456</div>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername('admin');
              setPassword('admin123');
            }}
            className="w-full p-2 bg-white rounded-xl border border-sky-100 text-left hover:border-sky-300 transition-all shadow-xs group flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-800 group-hover:text-[#0077b6]">💻 Admin Puskesmas (Desktop UI)</div>
              <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded-md">Isi Form &raquo;</span>
          </button>
        </div>

        {/* Footer Info Resmi */}
        <div className="text-center space-y-1 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem Terdaftar Resmi Puskesmas</span>
          </div>
          <p className="text-[11px]">Akun kader diterbitkan dan dikelola langsung oleh Puskesmas setempat.</p>
        </div>
      </div>
    </div>
  );
}
