import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Scale, AlertOctagon, CheckCircle2, ArrowUpRight, TrendingUp, Download, Phone } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ onNavigateToTimbang, onNavigateToAnak, onViewKms }) {
  const [stats, setStats] = useState({
    total_anak: 0,
    total_timbang_bulan_ini: 0,
    statusCounts: [],
    stuntingList: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil statistik dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    alert('📊 Fitur Unduh Rekap Laporan Excel/PDF siap diekspor ke Dinas Kesehatan / Puskesmas!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Dashboard Puskesmas & Kader</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            Monitoring Gizi & Deteksi Stunting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau pertumbuhan balita secara digital, cepat, dan terintegrasi notifikasi WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNavigateToTimbang}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2"
          >
            <Scale className="w-4 h-4" /> Input Timbang
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            title="Unduh Laporan Rekap"
          >
            <Download className="w-4 h-4" /> Unduh Rekap
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Balita */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Balita</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{loading ? '...' : stats.total_anak}</div>
          <span className="text-[11px] text-slate-400">Terdaftar di Posyandu</span>
        </div>

        {/* Card 2: Ditimbang Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Timbang Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{loading ? '...' : stats.total_timbang_bulan_ini}</div>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Rekap Bulan Berjalan
          </span>
        </div>

        {/* Card 3: Berisiko Stunting */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase">Perlu Perhatian</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{loading ? '...' : stats.stuntingList.length}</div>
          <span className="text-[11px] text-rose-600 font-medium">Deteksi Berisiko Stunting</span>
        </div>

        {/* Card 4: Gizi Baik */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase">Gizi Baik</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">
            {loading ? '...' : stats.total_anak > 0 ? `${stats.total_anak - stats.stuntingList.length}` : '0'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Tumbuh Kembang Normal</span>
        </div>
      </div>

      {/* Grid 2 Kolom: Daftar Stunting & Aktivitas Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 Kolom): Perlu Perhatian / Berisiko Stunting */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <h2 className="text-base font-bold text-slate-800">Daftar Balita Perlu Intervensi / Stunting</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{stats.stuntingList.length} Balita</span>
          </div>

          {stats.stuntingList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Semua Balita Terpantau Gizi Baik!</p>
              <p className="text-xs text-slate-400">Tidak ada kasus stunting terdeteksi saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Nama Balita</th>
                    <th className="pb-3">Usia / TB</th>
                    <th className="pb-3">Status Gizi</th>
                    <th className="pb-3">Kontak Ortu</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stats.stuntingList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{item.nama}</div>
                        <span className="text-[11px] text-slate-400">Ortu: {item.nama_ortu}</span>
                      </td>
                      <td className="py-3">
                        <div>{item.usia_bulan} Bulan</div>
                        <span className="text-[11px] text-rose-600 font-bold">{item.tinggi_badan} cm</span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={item.status_gizi} size="sm" />
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://wa.me/${item.no_wa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {item.no_wa}
                        </a>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewKms(item.anak_id)}
                          className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-lg hover:bg-sky-100"
                        >
                          Grafik
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aktivitas Penimbangan Terkini */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Aktivitas Terkini</h2>
          
          {stats.recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Belum ada aktivitas timbang baru.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{act.nama_anak}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.tgl_timbang).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>⚖️ {act.berat_badan} kg • 📏 {act.tinggi_badan} cm</span>
                    <StatusBadge status={act.status_gizi} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onNavigateToAnak}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            Lihat Semua Balita <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
