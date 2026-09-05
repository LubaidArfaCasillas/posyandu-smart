import React, { useState, useEffect } from 'react';
import { Users, Ruler, AlertTriangle, CheckCircle2, Check, ArrowDown, Scale } from 'lucide-react';
import api from '../api/client';

export default function Dashboard({ user, onNavigateToTimbang, onNavigateToAnak, onViewKms }) {
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

  const totalBalita = stats.total_anak || 0;
  const totalStunting = stats.stuntingList?.length || 0;
  const totalNormal = Math.max(0, totalBalita - totalStunting);
  const persentaseUkur = totalBalita > 0 ? Math.min(100, Math.round(((stats.total_timbang_bulan_ini || totalBalita) / totalBalita) * 100)) : 85;

  const isAdmin = user?.role === 'admin_puskesmas';

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards Grid (Minimalist, Clean White Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Balita */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-32 sm:h-34">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
            <span>Total Balita</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : totalBalita}
          </div>
          <span className="text-[11px] text-slate-400">Terdaftar di Posyandu</span>
        </div>

        {/* 2. Telah Diukur */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-32 sm:h-34">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
            <span>Telah Diukur</span>
            <Ruler className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {loading ? '...' : `${persentaseUkur}`}<span className="text-base font-normal text-slate-400 ml-0.5">%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${persentaseUkur}%` }}
            ></div>
          </div>
        </div>

        {/* 3. Risiko Stunting */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-32 sm:h-34">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
            <span>Risiko Stunting</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
            {loading ? '...' : totalStunting}
          </div>
          <span className="text-[11px] text-rose-600/90 font-medium">Perlu intervensi gizi</span>
        </div>

        {/* 4. Normal */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-32 sm:h-34">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium uppercase tracking-wider">
            <span>Gizi Baik / Normal</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums">
            {loading ? '...' : totalNormal}
          </div>
          <span className="text-[11px] text-emerald-600/90 font-medium">Tumbuh kembang baik</span>
        </div>
      </div>

      {/* Grid 2 Bagian */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Kolom Kiri (3 Kolom): Butuh Intervensi */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Perlu Pantauan Khusus</h2>
            <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              {stats.stuntingList.length} Balita
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {stats.stuntingList && stats.stuntingList.length > 0 ? (
              stats.stuntingList.map((item, idx) => {
                const initial = item.nama
                  ? item.nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'A';

                return (
                  <div
                    key={idx}
                    onClick={() => onViewKms(item.anak_id)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight">{item.nama}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.usia_bulan} Bulan • Ortu: {item.nama_ortu}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        {item.status_gizi || 'Stunting'}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        TB: <span className="font-medium text-slate-800">{item.tinggi_badan} cm</span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada balita yang memerlukan intervensi saat ini.
              </div>
            )}

            <div
              onClick={onNavigateToAnak}
              className="p-3 bg-slate-50/70 text-center text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Lihat Semua Balita &rarr;
            </div>
          </div>
        </div>

        {/* Kolom Kanan (2 Kolom): Log Pemeriksaan Terbaru */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pemeriksaan Terbaru</h2>
            <button
              onClick={onNavigateToAnak}
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Lihat semua
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((act, idx) => {
                const isStunting = act.status_gizi?.includes('Stunting') || act.status_tb_u?.includes('Pendek');

                return (
                  <div
                    key={act.id || idx}
                    onClick={() => onViewKms(act.anak_id)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 text-xs sm:text-sm">{act.nama_anak}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          BB: {act.berat_badan} kg • TB: {act.tinggi_badan} cm
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded border shrink-0 ${
                        isStunting
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isStunting ? 'Perlu Pantauan' : 'Normal'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada log pemeriksaan terbaru.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
