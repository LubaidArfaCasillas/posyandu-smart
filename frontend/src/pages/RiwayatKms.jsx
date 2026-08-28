import React, { useState, useEffect } from 'react';
import { Trophy, Check, Utensils, Syringe, GraduationCap, MessageSquare, SlidersHorizontal, User } from 'lucide-react';
import api from '../api/client';

export default function RiwayatKms({ initialAnakId, onNavigateToTimbang }) {
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

  return (
    <div className="space-y-5">
      {/* Selector Dropdown Balita */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-bold text-slate-700 pl-2">Pilih Balita:</span>
        <select
          value={selectedAnakId}
          onChange={(e) => setSelectedAnakId(e.target.value)}
          className="flex-1 max-w-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
        >
          {anakList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({a.usia_sekarang_bulan} Bln)
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Memuat Buku KMS...</div>
      ) : !anakDetail ? (
        <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400">
          Pilih balita untuk melihat riwayat KMS.
        </div>
      ) : (
        /* Grid Responsif (Mobile: 1 kolom, Desktop: 2 kolom) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Kolom Kiri (5 Kolom di Desktop): Profile & Milestone */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card Profil Balita */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {/* Photo Avatar */}
                <div className="w-14 h-14 rounded-full bg-[#e0f2fe] text-[#0077b6] flex items-center justify-center font-bold text-2xl shadow-xs overflow-hidden flex-shrink-0">
                  {anakDetail.jenis_kelamin === 'L' ? '👦' : '👧'}
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {anakDetail.nama}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {anakDetail.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {anakDetail.usia_sekarang_bulan} Bulan
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#0077b6] text-white text-[10px] font-bold rounded-md">
                      Gizi Baik
                    </span>
                    <span className="text-xs text-slate-400">Ortu: {anakDetail.nama_ortu}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 text-slate-300">
                <User className="w-6 h-6" />
              </div>
            </div>

            {/* Card Milestone Penting */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <Trophy className="w-4 h-4 text-[#0077b6]" />
                <span>Milestone Penting</span>
              </div>

              {/* Stepper Timeline */}
              <div className="relative pt-2 pb-1">
                {/* Line Connector */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                  <div className="bg-[#0077b6] h-full w-2/3"></div>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center relative z-10">
                  {/* 1. Lahir */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 mt-1.5">Lahir</span>
                  </div>

                  {/* 2. MPASI */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 mt-1.5">MPASI</span>
                  </div>

                  {/* 3. Imunisasi */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#0077b6] text-white flex items-center justify-center text-xs shadow-xs">
                      <Syringe className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#0077b6] mt-1.5 leading-tight">
                      Imunisasi<br />Lengkap
                    </span>
                  </div>

                  {/* 4. PAUD */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 mt-1.5">PAUD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action: Kirim Ulang Laporan WhatsApp */}
            <button
              type="button"
              onClick={handleResendWA}
              disabled={resending}
              className="w-full py-3.5 px-4 rounded-full border-2 border-slate-200 hover:border-emerald-500 bg-white text-slate-700 hover:text-emerald-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{resending ? 'Mengirim WhatsApp...' : 'Kirim Ulang Laporan WhatsApp'}</span>
            </button>
          </div>

          {/* Kolom Kanan (7 Kolom di Desktop): Riwayat Bulanan */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Riwayat Bulanan</h3>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            {(!anakDetail.riwayat || anakDetail.riwayat.length === 0) ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-xs text-slate-400">
                Belum ada riwayat pengukuran bulanan untuk balita ini.
              </div>
            ) : (
              <div className="space-y-3">
                {anakDetail.riwayat.slice().reverse().map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Month Box */}
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-800 flex-shrink-0">
                        <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Bln</span>
                        <span className="text-base font-black leading-tight">{rec.usia_bulan}</span>
                      </div>

                      {/* Measurement Data */}
                      <div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-[10px] text-slate-400 block">BB (kg)</span>
                            <span className="font-extrabold text-slate-800 text-sm sm:text-base">{rec.berat_badan}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">TB (cm)</span>
                            <span className="font-extrabold text-slate-800 text-sm sm:text-base">{rec.tinggi_badan}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{rec.status_gizi || 'Normal'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Tag */}
                    <span className="px-2.5 py-1 bg-[#e0f2fe] text-[#0077b6] text-[10px] sm:text-xs font-extrabold rounded-md uppercase flex-shrink-0">
                      WHO P50
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
