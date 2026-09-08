import React, { useState, useEffect } from 'react';
import { Users, Ruler, AlertTriangle, CheckCircle2, Check, ArrowDown, Scale, Download, FileSpreadsheet } from 'lucide-react';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportLoading, setExportLoading] = useState(false);

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

  const handleExportLaporan = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/dashboard/export-laporan', {
        params: {
          bulan: selectedMonth,
          posyandu_id: user?.posyandu_id || undefined,
        },
      });

      if (!res.data.success || !res.data.data || res.data.data.length === 0) {
        alert(`Tidak ada data penimbangan balita pada periode ${selectedMonth}`);
        return;
      }

      const rows = res.data.data;
      const headers = [
        'No',
        'Tanggal Timbang',
        'Nama Posyandu',
        'NIK Balita',
        'Nama Balita',
        'Jenis Kelamin',
        'Tanggal Lahir',
        'Usia (Bulan)',
        'Nama Orang Tua',
        'No. WhatsApp',
        'Berat Badan (kg)',
        'Tinggi Badan (cm)',
        'Lingkar Kepala (cm)',
        'Status BB/U',
        'Status TB/U (Stunting)',
        'Status BB/TB',
        'Kesimpulan Status Gizi',
        'Catatan Kader',
        'Status WhatsApp',
        'Petugas Pemeriksa',
      ];

      const csvRows = [
        headers.join(','),
        ...rows.map((r, idx) => [
          idx + 1,
          `"${r.tgl_timbang}"`,
          `"${(r.nama_posyandu || '').replace(/"/g, '""')}"`,
          `'${r.nik}'`,
          `"${(r.nama_anak || '').replace(/"/g, '""')}"`,
          `"${r.jenis_kelamin}"`,
          `"${r.tgl_lahir}"`,
          r.usia_bulan,
          `"${(r.nama_ortu || '').replace(/"/g, '""')}"`,
          `'${r.no_wa}'`,
          r.berat_badan,
          r.tinggi_badan,
          `"${r.lingkar_kepala}"`,
          `"${(r.status_bb_u || '').replace(/"/g, '""')}"`,
          `"${(r.status_tb_u || '').replace(/"/g, '""')}"`,
          `"${(r.status_bb_tb || '').replace(/"/g, '""')}"`,
          `"${(r.status_gizi || '').replace(/"/g, '""')}"`,
          `"${(r.catatan || '').replace(/"/g, '""')}"`,
          `"${r.status_wa}"`,
          `"${(r.nama_petugas || '').replace(/"/g, '""')}"`,
        ].join(',')),
      ];

      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_PosyanduSmart_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal unduh laporan:', err);
      alert('Gagal mengunduh laporan: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  const totalBalita = stats.total_anak || 0;
  const totalStunting = stats.stuntingList?.length || 0;
  const totalNormal = Math.max(0, totalBalita - totalStunting);
  const persentaseUkur = totalBalita > 0 ? Math.min(100, Math.round(((stats.total_timbang_bulan_ini || totalBalita) / totalBalita) * 100)) : 85;

  const isAdmin = user?.role === 'admin_puskesmas';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card (Kartu Putih Bersih dengan Aksen Hijau Kesehatan) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-200/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 relative overflow-hidden">
        {/* Subtle decorative health glow accent */}
        <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-emerald-50/80 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-16 w-40 h-40 bg-teal-50/60 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-l-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200/70 shadow-2xs">
              <span>📅 {currentDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Halo, {user?.nama_lengkap || (isAdmin ? 'Admin Puskesmas' : 'Ibu Kader')}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAdmin
                ? 'Pantau statistik tumbuh kembang balita dan pencegahan stunting di seluruh Posyandu binaan.'
                : `Selamat bertugas di ${user?.nama_posyandu?.toLowerCase().startsWith('posyandu') ? user.nama_posyandu : `Posyandu ${user?.nama_posyandu || 'Melati'}`}. Mari pantau tumbuh kembang balita dengan mudah dan akurat.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Tombol Unduh Laporan Bulanan (Excel/CSV) di Banner */}
            <div className="flex items-center gap-1.5 bg-slate-50/90 border border-slate-200/90 p-1.5 rounded-2xl shadow-2xs">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                title="Pilih Bulan Rekap Laporan"
              />
              <button
                onClick={handleExportLaporan}
                disabled={exportLoading}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-soft-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title="Unduh Rekap Laporan Bulanan (Format Excel / CSV)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exportLoading ? 'Mengunduh...' : 'Unduh Laporan'}</span>
              </button>
            </div>

            {onNavigateToTimbang && (
              <button
                onClick={onNavigateToTimbang}
                className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-soft-sm transition-all duration-200 flex items-center justify-center gap-2.5 shrink-0 active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Scale className="w-4 h-4" />
                </div>
                <span>Mulai Input Penimbangan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid (Healthcare Modern Soft Elevated) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Balita */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Total Balita</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {loading ? '...' : totalBalita}
            </div>
            <span className="text-[11px] text-slate-400">Terdaftar di Posyandu</span>
          </div>
        </div>

        {/* 2. Telah Diukur */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Telah Diukur</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 space-y-1.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums flex items-baseline gap-1">
              <span>{loading ? '...' : persentaseUkur}</span>
              <span className="text-sm font-semibold text-slate-400">%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${persentaseUkur}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Risiko Stunting */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Perlu Pantauan</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums">
              {loading ? '...' : totalStunting}
            </div>
            <span className="text-[11px] font-semibold text-rose-700/80 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Risiko Stunting / Pendek
            </span>
          </div>
        </div>

        {/* 4. Normal */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <span>Gizi Normal</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {loading ? '...' : totalNormal}
            </div>
            <span className="text-[11px] font-semibold text-emerald-700/80 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Tumbuh Kembang Baik
            </span>
          </div>
        </div>
      </div>

      {/* Banner Khusus Fitur Rekap Laporan Bulanan Puskesmas (Excel / CSV) */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-soft-sm flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Rekap Laporan Bulanan Penimbangan (Excel / CSV)
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300/60">
                Resmi
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Unduh rekap bulanan lengkap (NIK, riwayat berat/tinggi, Z-Score WHO, status stunting, dan catatan kader) untuk arsip Posyandu dan pelaporan Puskesmas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-2xs"
            title="Pilih Bulan Rekap"
          />
          <button
            onClick={handleExportLaporan}
            disabled={exportLoading}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-soft-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exportLoading ? 'Sedang Mengekspor...' : 'Unduh File CSV / Excel'}</span>
          </button>
        </div>
      </div>

      {/* Grid 2 Bagian */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Kolom Kiri (3 Kolom): Butuh Intervensi */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Perlu Pantauan Khusus</h2>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                {stats.stuntingList.length} Balita
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden divide-y divide-slate-100">
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
            <h2 className="text-base font-bold text-slate-900">Pemeriksaan Terbaru</h2>
            <button
              onClick={onNavigateToAnak}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Lihat semua &rarr;
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm divide-y divide-slate-100 overflow-hidden">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((act, idx) => {
                const isStunting = act.status_gizi?.includes('Stunting') || act.status_tb_u?.includes('Pendek');

                return (
                  <div
                    key={act.id || idx}
                    onClick={() => onViewKms(act.anak_id)}
                    className="p-3.5 flex items-center justify-between hover:bg-emerald-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Scale className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{act.nama_anak}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          BB: <span className="font-semibold text-slate-700">{act.berat_badan} kg</span> • TB: <span className="font-semibold text-slate-700">{act.tinggi_badan} cm</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
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
