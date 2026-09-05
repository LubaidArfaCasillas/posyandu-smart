import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Scale, Ruler, Calendar, Check, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <label htmlFor="select-balita" className="text-xs font-semibold text-slate-700 sm:pl-1">
          Pilih Balita:
        </label>
        <select
          id="select-balita"
          value={selectedAnakId}
          onChange={(e) => setSelectedAnakId(e.target.value)}
          className="flex-1 sm:max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600"
        >
          {anakList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({a.usia_sekarang_bulan} Bln) — {a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-xs text-slate-400 space-y-2 border border-slate-200">
          <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Memuat Lembar KMS...</p>
        </div>
      ) : !anakDetail ? (
        <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
          Pilih balita untuk melihat riwayat KMS.
        </div>
      ) : (
        <>
          {/* Card Profil Balita */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Monogram Inisial Avatar */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {anakDetail.nama}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isBoy
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isBoy ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                  <span>Usia: <strong className="text-slate-700 font-semibold">{anakDetail.usia_sekarang_bulan} Bulan</strong></span>
                  <span>•</span>
                  <span>Lahir: <span className="text-slate-700">{new Date(anakDetail.tgl_lahir).toLocaleDateString('id-ID')}</span></span>
                  <span>•</span>
                  <span>Orang Tua: <strong className="text-slate-700 font-semibold">{anakDetail.nama_ortu}</strong></span>
                  {anakDetail.no_wa && (
                    <>
                      <span>•</span>
                      <span>WA: <span className="text-slate-700">{anakDetail.no_wa}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
              {!isAdmin && onNavigateToTimbang && (
                <button
                  type="button"
                  onClick={() => onNavigateToTimbang(anakDetail.id)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Timbang Baru</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResendWA}
                disabled={resending}
                className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>{resending ? 'Mengirim...' : 'Kirim Laporan WA'}</span>
              </button>
            </div>
          </div>

          {/* Kurva Pertumbuhan KMS Digital */}
          <KmsChart anak={anakDetail} riwayat={anakDetail.riwayat || []} />

          {/* Grid Riwayat Bulanan & Ringkasan Antropometri */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri (7 Kolom): Riwayat Bulanan */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                  Catatan Pengukuran ({anakDetail.riwayat?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">Urut dari terbaru</span>
              </div>

              {!anakDetail.riwayat || anakDetail.riwayat.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-xs text-slate-400">
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
                          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200/70 rounded-lg flex flex-col items-center justify-center text-slate-700 shrink-0">
                              <span className="text-[9px] text-slate-500 font-medium uppercase leading-none">Bln</span>
                              <span className="text-sm font-bold leading-tight">{rec.usia_bulan}</span>
                            </div>

                            <div>
                              <div className="flex items-center gap-3 text-xs">
                                <span>BB: <strong className="text-slate-800">{rec.berat_badan} kg</strong></span>
                                <span>TB: <strong className="text-slate-800">{rec.tinggi_badan} cm</strong></span>
                                <span className="text-slate-400 text-[11px]">
                                  {new Date(rec.tgl_timbang).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Status: <span className="font-medium text-slate-700">{rec.status_gizi || 'Gizi Baik'}</span>
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 text-[11px] font-medium rounded border shrink-0 ${
                              isStunting
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Status Pengukuran Terakhir
                  </h4>
                  {latestRecord && (
                    <span className="text-[11px] text-slate-500">
                      {new Date(latestRecord.tgl_timbang).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>

                {latestRecord ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Berat Badan</span>
                          <Scale className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="text-base font-bold text-slate-900 mt-1">
                          {latestRecord.berat_badan} <span className="text-xs font-normal text-slate-500">kg</span>
                        </div>
                        {deltaBB !== null && (
                          <div className={`text-[10px] font-medium mt-0.5 flex items-center gap-0.5 ${
                            deltaBB > 0 ? 'text-emerald-600' : deltaBB < 0 ? 'text-rose-600' : 'text-slate-500'
                          }`}>
                            {deltaBB > 0 ? `+${deltaBB} kg dari bln lalu` : deltaBB < 0 ? `${deltaBB} kg dari bln lalu` : 'Tetap (0 kg)'}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Tinggi Badan</span>
                          <Ruler className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="text-base font-bold text-slate-900 mt-1">
                          {latestRecord.tinggi_badan} <span className="text-xs font-normal text-slate-500">cm</span>
                        </div>
                        {deltaTB !== null && (
                          <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                            {deltaTB > 0 ? `+${deltaTB} cm dari bln lalu` : 'Tetap'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Klasifikasi Gizi (BB/U):</span>
                        <span className="font-semibold text-slate-800">{latestRecord.status_gizi || 'Gizi Baik'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Klasifikasi Stunting (TB/U):</span>
                        <span className="font-semibold text-slate-800">{latestRecord.status_tb_u || 'Normal'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2">Belum ada data pengukuran.</p>
                )}
              </div>

              {/* Card Kaidah Pertumbuhan KMS */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Kaidah Pertumbuhan KMS (Kemenkes)
                </h4>
                <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 shrink-0">N (Naik):</span>
                    <span>Berat badan bertambah mengikuti garis kurva pertumbuhan atau naik ke pita warna di atasnya.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-600 shrink-0">T (Tidak Naik):</span>
                    <span>Berat badan mendatar, menurun, atau kenaikannya kurang dari batas kenaikan minimal (KBM).</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    Bila berat badan anak berstatus <strong>T selama 2 bulan berturut-turut (2T)</strong>, kader wajib merujuk balita ke Puskesmas.
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
