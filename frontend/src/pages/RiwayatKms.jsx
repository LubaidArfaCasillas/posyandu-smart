import React, { useState, useEffect } from 'react';
import { Trophy, Check, Utensils, Syringe, GraduationCap, MessageSquare, SlidersHorizontal, User, Scale, Plus } from 'lucide-react';
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
        alert(`✅ Laporan WhatsApp berhasil dikirim ke ${anakDetail.no_wa}!`);
      }
    } catch (err) {
      alert('Gagal mengirim WhatsApp: ' + (err.response?.data?.message || err.message));
    } finally {
      setResending(false);
    }
  };

  const isBoy = anakDetail?.jenis_kelamin === 'L';
  const isAdmin = user?.role === 'admin_puskesmas';

  return (
    <div className="space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Selector Dropdown Balita */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 pl-2">
          <span className="w-2 h-2 rounded-full bg-[#0077b6]"></span>
          <span className="text-xs sm:text-sm font-bold text-slate-700">Pilih Balita:</span>
        </div>
        <select
          value={selectedAnakId}
          onChange={(e) => setSelectedAnakId(e.target.value)}
          className="flex-1 sm:max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
        >
          {anakList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({a.usia_sekarang_bulan} Bln) - {a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#0077b6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Memuat Lembar KMS Digital...</p>
        </div>
      ) : !anakDetail ? (
        <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400">
          Pilih balita untuk melihat riwayat KMS.
        </div>
      ) : (
        <>
          {/* Card Profil Header Balita */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Photo Avatar */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xs overflow-hidden flex-shrink-0 ${
                  isBoy ? 'bg-[#e0f2fe] text-[#0077b6]' : 'bg-[#ffe4e6] text-[#f43f5e]'
                }`}
              >
                {isBoy ? '👦' : '👧'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {anakDetail.nama}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold ${
                      isBoy ? 'bg-[#e0f2fe] text-[#0077b6]' : 'bg-[#ffe4e6] text-[#f43f5e]'
                    }`}
                  >
                    {isBoy ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Usia: <strong>{anakDetail.usia_sekarang_bulan} Bulan</strong> • Lahir:{' '}
                  {new Date(anakDetail.tgl_lahir).toLocaleDateString('id-ID')} • Ortu:{' '}
                  <strong>{anakDetail.nama_ortu}</strong>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">
                    Posyandu: {anakDetail.nama_posyandu || 'Posyandu Melati 01'}
                  </span>
                  <span className="text-slate-400 text-[11px]">No. WA: {anakDetail.no_wa}</span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
              {!isAdmin && onNavigateToTimbang && (
                <button
                  type="button"
                  onClick={() => onNavigateToTimbang(anakDetail.id)}
                  className="px-4 py-2.5 bg-[#0077b6] hover:bg-[#023e8a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Timbang Baru</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResendWA}
                disabled={resending}
                className="px-4 py-2.5 rounded-xl border border-emerald-500 hover:bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{resending ? 'Mengirim...' : 'Kirim WA'}</span>
              </button>
            </div>
          </div>

          {/* 🌟 Komponen Kurva Pertumbuhan KMS Digital */}
          <KmsChart anak={anakDetail} riwayat={anakDetail.riwayat || []} />

          {/* Grid Riwayat Bulanan & Milestone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri (7 Kolom): Riwayat Bulanan */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Catatan Pengukuran Bulanan ({anakDetail.riwayat?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">Urut dari terbaru</span>
              </div>

              {!anakDetail.riwayat || anakDetail.riwayat.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-xs text-slate-400">
                  Belum ada riwayat pengukuran bulanan untuk balita ini.
                </div>
              ) : (
                <div className="space-y-3">
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
                          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Month Box */}
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-800 flex-shrink-0">
                              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">
                                Bln
                              </span>
                              <span className="text-base font-black leading-tight">
                                {rec.usia_bulan}
                              </span>
                            </div>

                            {/* Measurement Data */}
                            <div>
                              <div className="flex items-center gap-4 text-xs sm:text-sm">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">BB (kg)</span>
                                  <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                                    {rec.berat_badan}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block">TB (cm)</span>
                                  <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                                    {rec.tinggi_badan}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Tanggal</span>
                                  <span className="font-medium text-slate-600 text-xs">
                                    {new Date(rec.tgl_timbang).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isStunting ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                ></span>
                                <span>{rec.status_gizi || 'Gizi Baik (Normal)'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Tag */}
                          <span
                            className={`px-2.5 py-1 text-[10px] sm:text-xs font-extrabold rounded-lg uppercase flex-shrink-0 ${
                              isStunting
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
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

            {/* Kolom Kanan (5 Kolom): Milestone Perkembangan */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <Trophy className="w-4 h-4 text-[#0077b6]" />
                  <span>Milestone Tumbuh Kembang</span>
                </div>

                {/* Stepper Timeline */}
                <div className="relative pt-2 pb-1">
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                    <div className="bg-[#0077b6] h-full w-2/3"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 mt-1.5">Lahir</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 mt-1.5">MPASI</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                        <Syringe className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-[#0077b6] mt-1.5 leading-tight">
                        Imunisasi
                        <br />
                        Lengkap
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-1.5">PAUD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Edukasi Gizi Ringkas */}
              <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-3xl p-5 border border-sky-100 shadow-2xs space-y-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  💡 Tips Pemantauan KMS
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Penimbangan balita wajib dilakukan setiap bulan di Posyandu minimal sampai anak
                  berusia 5 tahun (60 bulan). Catat jika balita mengalami sakit atau tidak nafsu makan
                  yang mempengaruhi kenaikan kurva.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
