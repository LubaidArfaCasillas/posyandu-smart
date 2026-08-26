import React, { useState, useEffect } from 'react';
import { Activity, Baby, Calendar, Scale, Send, CheckCircle2, Phone, Sparkles, Printer } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function RiwayatKms({ initialAnakId, onNavigateToTimbang }) {
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState(initialAnakId || '');
  const [anakDetail, setAnakDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState(null);

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
      if (res.data.success) {
        setAnakList(res.data.data);
        if (!selectedAnakId && res.data.data.length > 0) {
          setSelectedAnakId(res.data.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Gagal mengambil daftar anak:', err);
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
      console.error('Gagal mengambil detail anak:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendWA = async (penimbanganId) => {
    try {
      setResendingId(penimbanganId);
      const res = await api.post(`/penimbangan/${penimbanganId}/resend-wa`);
      if (res.data.success) {
        alert('✅ Pesan WhatsApp berhasil dikirim ulang ke orang tua!');
        fetchDetailAnak(selectedAnakId);
      }
    } catch (err) {
      alert('Gagal mengirim ulang WhatsApp: ' + (err.response?.data?.message || err.message));
    } finally {
      setResendingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header & Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" /> Buku KMS & Riwayat Pertumbuhan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak kenaikan berat dan tinggi badan balita setiap bulan.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAnakId}
            onChange={(e) => setSelectedAnakId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
          >
            {anakList.map((anak) => (
              <option key={anak.id} value={anak.id}>
                {anak.nama} ({anak.jenis_kelamin === 'L' ? 'L' : 'P'})
              </option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="Cetak Laporan KMS"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Memuat riwayat KMS balita...</p>
        </div>
      ) : !anakDetail ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
          Pilih balita untuk melihat riwayat KMS.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Biodata Balita */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-sky-200">
                {anakDetail.jenis_kelamin === 'L' ? '👦' : '👧'}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">{anakDetail.nama}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600 font-medium">
                  <span>NIK: {anakDetail.nik || '-'}</span>
                  <span>•</span>
                  <span>Ortu: {anakDetail.nama_ortu}</span>
                  <span>•</span>
                  <span>Usia: {anakDetail.usia_sekarang_bulan} Bulan</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTimbang(anakDetail.id)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" /> + Timbang Bulan Ini
              </button>
            </div>
          </div>

          {/* Tabel Riwayat Penimbangan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Catatan Pengukuran Bulanan</h3>

            {(!anakDetail.riwayat || anakDetail.riwayat.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 space-y-2">
                <Scale className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Balita ini belum memiliki riwayat penimbangan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Tanggal Timbang</th>
                      <th className="pb-3">Usia</th>
                      <th className="pb-3">Berat (kg)</th>
                      <th className="pb-3">Tinggi (cm)</th>
                      <th className="pb-3">Status Gizi</th>
                      <th className="pb-3">Status WA</th>
                      <th className="pb-3">Catatan / Saran</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {anakDetail.riwayat.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-3 font-semibold text-slate-800">
                          {new Date(row.tgl_timbang).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3">{row.usia_bulan} bln</td>
                        <td className="py-3 font-bold text-sky-700">{row.berat_badan} kg</td>
                        <td className="py-3 font-bold text-emerald-700">{row.tinggi_badan} cm</td>
                        <td className="py-3">
                          <StatusBadge status={row.status_gizi} size="sm" />
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status_wa === 'sent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.status_wa === 'sent' ? '✓ Terkirim' : 'Simulasi/Pending'}
                          </span>
                        </td>
                        <td className="py-3 max-w-xs truncate text-slate-500" title={row.catatan}>
                          {row.catatan || '-'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleResendWA(row.id)}
                            disabled={resendingId === row.id}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Kirim Ulang Notifikasi WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
