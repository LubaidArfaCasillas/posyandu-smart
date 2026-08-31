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
      {/* 4 Metric Cards Grid (Responsif: 2 kolom di HP, 4 kolom di Tablet/Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        {/* 1. Total Balita */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-32 sm:h-36">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            <Users className="w-4 h-4 text-slate-400" />
            <span>TOTAL BALITA</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#0077b6]">
            {loading ? '...' : totalBalita}
          </div>
          <span className="text-[11px] text-slate-400">Terdaftar di Posyandu</span>
        </div>

        {/* 2. Telah Diukur */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-32 sm:h-36">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            <Ruler className="w-4 h-4 text-slate-400" />
            <span>TELAH DIUKUR</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#0077b6]">
            {loading ? '...' : `${persentaseUkur}`}<span className="text-xl font-bold ml-1 text-slate-600">%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0077b6] h-full rounded-full transition-all duration-500"
              style={{ width: `${persentaseUkur}%` }}
            ></div>
          </div>
        </div>

        {/* 3. Risiko Stunting */}
        <div className="bg-[#fee2e2]/60 rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-sm flex flex-col justify-between h-32 sm:h-36">
          <div className="flex items-center gap-1.5 text-[#991b1b] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
            <span>RISIKO STUNTING</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#b91c1c]">
            {loading ? '...' : totalStunting}
          </div>
          <span className="text-[11px] text-[#991b1b] font-medium">Perlu Intervensi Gizi</span>
        </div>

        {/* 4. Normal */}
        <div className="bg-[#dcfce7]/70 rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-sm flex flex-col justify-between h-32 sm:h-36">
          <div className="flex items-center gap-1.5 text-[#166534] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            <span>NORMAL</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#15803d]">
            {loading ? '...' : totalNormal}
          </div>
          <span className="text-[11px] text-[#166534] font-medium">Tumbuh Kembang Baik</span>
        </div>
      </div>

      {/* Grid 2 Bagian (Responsif: Bertumpuk di HP, Berdampingan di Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Kolom Kiri (3 Kolom): Butuh Intervensi */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Butuh Intervensi</h2>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
              {stats.stuntingList.length} Balita
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {stats.stuntingList && stats.stuntingList.length > 0 ? (
              stats.stuntingList.map((item, idx) => {
                const isSevere = item.status_tb_u?.includes('Sangat') || item.status_gizi?.includes('Stunting');
                const initial = item.nama?.charAt(0).toUpperCase() || 'A';

                return (
                  <div
                    key={idx}
                    onClick={() => onViewKms(item.anak_id)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${
                          isSevere ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#fef3c7] text-[#d97706]'
                        }`}
                      >
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{item.nama}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.usia_bulan} Bulan • Ortu: {item.nama_ortu}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white ${
                          isSevere ? 'bg-[#b91c1c]' : 'bg-[#eab308]'
                        }`}
                      >
                        {item.status_gizi || 'Stunting'}
                      </span>
                      <p
                        className={`text-xs font-bold mt-1 ${
                          isSevere ? 'text-[#b91c1c]' : 'text-[#d97706]'
                        }`}
                      >
                        TB: {item.tinggi_badan} cm
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
              className="p-3 bg-slate-50/70 text-center text-xs font-bold text-[#0077b6] hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Lihat Semua Balita &raquo;
            </div>
          </div>
        </div>

        {/* Kolom Kanan (2 Kolom): Log Pemeriksaan Terbaru */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Log Pemeriksaan Terbaru</h2>
            <button
              onClick={onNavigateToAnak}
              className="text-xs font-bold text-[#0077b6] uppercase tracking-wider hover:underline"
            >
              LIHAT SEMUA
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((act, idx) => {
                const isStunting = act.status_gizi?.includes('Stunting') || act.status_tb_u?.includes('Pendek');

                return (
                  <div
                    key={act.id || idx}
                    onClick={() => onViewKms(act.anak_id)}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                        <Scale className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{act.nama_anak}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          BB: {act.berat_badan} kg | TB: {act.tinggi_badan} cm
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isStunting ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-[#dcfce7] text-[#15803d]'
                      }`}
                    >
                      {isStunting ? <ArrowDown className="w-4 h-4 stroke-[2.5]" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-xs text-slate-400">
                Belum ada log pemeriksaan terbaru.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
