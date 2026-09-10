import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Scale, Ruler, Calendar, Check, AlertCircle, TrendingUp, TrendingDown, Minus, Baby } from 'lucide-react';
import api from '../api/client';
import KmsChart from '../components/KmsChart';

export default function RiwayatKms({ initialAnakId, onNavigateToTimbang, user }) {
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(initialAnakId || '');
  const [anakDetail, setAnakDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetchAnakList();
  }, []);

  useEffect(() => {
    if (selectedAnakId) {
      fetchDetailAnak(selectedAnakId);
    }
  }, [selectedAnakId]);

  const fetchAnakList = async () => {
    try {
      const res = await api.get('/anak');
      if (res.data.success && res.data.data.length > 0) {
        setAnakList(res.data.data);
        if (!selectedAnakId) {
          setSelectedAnakId(res.data.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Gagal ambil daftar anak:', err);
    }
  };

  const fetchDetailAnak = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/anak/${id}`);
      if (res.data.success) {
        setAnakDetail(res.data.data);
      }
    } catch (err) {
      console.error('Gagal ambil detail anak:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendWA = async () => {
    if (!anakDetail?.riwayat || anakDetail.riwayat.length === 0) {
      alert('Belum ada riwayat timbang untuk dikirim.');
      return;
    }

    const lastRecord = anakDetail.riwayat[anakDetail.riwayat.length - 1];
    setResending(true);
    try {
      const res = await api.post(`/penimbangan/${lastRecord.id}/resend-wa`);
      if (res.data.success) {
        alert(`Laporan WhatsApp berhasil dikirim ke ${anakDetail.no_wa}`);
      }
    } catch (err) {
      alert('Gagal mengirim WhatsApp: ' + (err.response?.data?.message || err.message));
    } finally {
      setResending(false);
    }
  };

  const isBoy = anakDetail?.jenis_kelamin === 'L';
  const isAdmin = user?.role === 'admin_puskesmas';

  // Inisial Nama Monogram
  const initials = anakDetail?.nama
    ? anakDetail.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'B';

  // Data Pengukuran Terakhir & Selisih (Delta)
  const sortedRiwayat = anakDetail?.riwayat
    ? [...anakDetail.riwayat].sort((a, b) => a.usia_bulan - b.usia_bulan)
    : [];
  const latestRecord = sortedRiwayat.length > 0 ? sortedRiwayat[sortedRiwayat.length - 1] : null;
  const prevRecord = sortedRiwayat.length > 1 ? sortedRiwayat[sortedRiwayat.length - 2] : null;

  const deltaBB =
    latestRecord && prevRecord
      ? parseFloat((latestRecord.berat_badan - prevRecord.berat_badan).toFixed(1))
      : null;
  const deltaTB =
    latestRecord && prevRecord
      ? parseFloat((latestRecord.tinggi_badan - prevRecord.tinggi_badan).toFixed(1))
      : null;

  return (
    <div className="space-y-5">
      {/* Selector Dropdown Balita */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <label htmlFor="select-balita" className="text-xs sm:text-sm font-bold text-slate-800 sm:pl-1 flex items-center gap-2">
          <span>Pilih Balita:</span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            {anakList.length} Balita
          </span>
        </label>
        <select
          id="select-balita"
          value={selectedAnakId}
          onChange={(e) => setSelectedAnakId(e.target.value)}
          className="flex-1 sm:max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
        >
          {anakList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({a.usia_sekarang_bulan} Bln) — {a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 space-y-2 border border-slate-200/80 shadow-soft-sm">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-semibold text-slate-600">Memuat Lembar KMS Balita...</p>
        </div>
      ) : !anakDetail ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200/80 shadow-soft-sm">
          Pilih balita untuk melihat riwayat pertumbuhan KMS.
        </div>
      ) : (
        <>
          {/* Card Profil Balita (Identik dengan Layar Tengah Gambar 2: Profil dengan Circular Avatar, Cincin Hijau & 3 Kotak Metrik) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100/80 shadow-soft-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Circular Avatar dengan Cincin Hijau & Verified Badge (Identik dengan Referensi Image 2) */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full p-1 bg-[#00a86b] shadow-soft-sm">
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center border-2 border-white ${
                        isBoy
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <Baby className="w-8 h-8 stroke-[2.2]" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00a86b] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs">
                    ✓
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      {anakDetail.nama}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isBoy
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isBoy ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Orang Tua: <span className="font-bold text-slate-800">{anakDetail.nama_ortu}</span> • WA: <span className="font-semibold text-slate-800">{anakDetail.no_wa || '-'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleResendWA}
                  disabled={resending}
                  className="px-4 py-2.5 rounded-xl border border-[#00a86b] hover:bg-emerald-50 text-[#00a86b] text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-[#00a86b]" />
                  <span>{resending ? 'Mengirim...' : 'Kirim Laporan WA'}</span>
                </button>

                {!isAdmin && onNavigateToTimbang && (
                  <button
                    type="button"
                    onClick={() => onNavigateToTimbang(anakDetail.id)}
                    className="px-5 py-2.5 bg-[#00a86b] hover:bg-[#00925d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft-sm transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Timbang Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Kotak Metrik Profil */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#f0f7f4] rounded-2xl border border-emerald-100/70 text-center">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase">Usia Balita</span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
                  {anakDetail.usia_sekarang_bulan} <span className="text-xs font-semibold text-slate-500">Bulan</span>
                </span>
              </div>
              <div className="border-x border-emerald-200/60">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase">BB Terakhir</span>
                <span className="text-sm sm:text-lg font-extrabold text-[#00a86b] mt-0.5 block">
                  {latestRecord ? `${latestRecord.berat_badan} kg` : '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase">TB Terakhir</span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
                  {latestRecord ? `${latestRecord.tinggi_badan} cm` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Kurva Pertumbuhan KMS Digital */}
          <KmsChart anak={anakDetail} riwayat={anakDetail.riwayat || []} />

          {/* Grid Riwayat Bulanan & Ringkasan Antropometri */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri (7 Kolom): Riwayat Bulanan */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Catatan Pengukuran Bulanan ({anakDetail.riwayat?.length || 0})
                </h3>
                <span className="text-xs text-slate-400 font-medium">Urut dari terbaru</span>
              </div>

              {!anakDetail.riwayat || anakDetail.riwayat.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-soft-sm text-xs text-slate-400">
                  Belum ada riwayat pengukuran bulanan untuk balita ini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {anakDetail.riwayat
                    .slice()
                    .reverse()
                    .map((rec) => {
                      const isStunting =
                        rec.status_tb_u?.includes('Pendek') ||
                        rec.status_gizi?.includes('Stunting');

                      return (
                        <div
                          key={rec.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft-sm flex items-center justify-between hover:border-emerald-200 transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-emerald-50 border border-emerald-200/80 rounded-xl flex flex-col items-center justify-center text-[#00a86b] shrink-0">
                              <span className="text-[9px] font-bold uppercase leading-none">Bln</span>
                              <span className="text-base font-extrabold leading-tight">{rec.usia_bulan}</span>
                            </div>

                            <div>
                              <div className="flex items-center gap-3 text-xs sm:text-sm">
                                <span>
                                  BB: <strong className="text-slate-900 font-bold">{rec.berat_badan} kg</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  TB: <strong className="text-slate-900 font-bold">{rec.tinggi_badan} cm</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400 text-[11px]">
                                  {new Date(rec.tgl_timbang).toLocaleDateString('id-ID')}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] font-semibold text-slate-600">
                                  {rec.status_gizi || 'Gizi Baik'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 ${
                              isStunting
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-[#00a86b] border-emerald-200'
                            }`}
                          >
                            {rec.status_tb_u || 'Normal'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Kolom Kanan (5 Kolom): Ringkasan Antropometri Terkini */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card Status Terakhir */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Status Pengukuran Terakhir
                  </h4>
                  {latestRecord && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                      {new Date(latestRecord.tgl_timbang).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>

                {latestRecord ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold uppercase">Berat Badan</span>
                          <Scale className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                          {latestRecord.berat_badan} <span className="text-xs font-normal text-slate-500">kg</span>
                        </div>
                        {deltaBB !== null && (
                          <div
                            className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                              deltaBB > 0
                                ? 'text-emerald-600'
                                : deltaBB < 0
                                ? 'text-rose-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {deltaBB > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : deltaBB < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            <span>{deltaBB > 0 ? `+${deltaBB} kg` : `${deltaBB} kg`} bln lalu</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold uppercase">Tinggi Badan</span>
                          <Ruler className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                          {latestRecord.tinggi_badan} <span className="text-xs font-normal text-slate-500">cm</span>
                        </div>
                        {deltaTB !== null && (
                          <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{deltaTB > 0 ? `+${deltaTB} cm` : 'Tetap'} bln lalu</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 text-xs sm:text-sm">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Klasifikasi Gizi (BB/U):</span>
                        <span className="font-bold text-slate-800">{latestRecord.status_gizi || 'Gizi Baik'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Klasifikasi Stunting (TB/U):</span>
                        <span className="font-bold text-slate-800">{latestRecord.status_tb_u || 'Normal'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">Belum ada data pengukuran.</p>
                )}
              </div>

              {/* Card Kaidah Pertumbuhan KMS */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  Kaidah Pertumbuhan KMS (Kemenkes RI)
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5 p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      N
                    </span>
                    <div>
                      <strong className="text-emerald-900 block">Naik (N)</strong>
                      <span>Berat badan bertambah mengikuti arah garis kurva standar pertumbuhan KMS.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 bg-rose-50/60 rounded-xl border border-rose-100">
                    <span className="w-5 h-5 rounded-md bg-rose-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      T
                    </span>
                    <div>
                      <strong className="text-rose-900 block">Tidak Naik (T)</strong>
                      <span>Berat badan mendatar, menurun, atau kenaikannya di bawah Kenaikan Berat Minimal (KBM).</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 leading-normal">
                    ⚠️ Bila berat badan anak berstatus <strong>T selama 2 bulan berturut-turut (2T)</strong>, kader wajib segera merujuk balita ke Puskesmas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
