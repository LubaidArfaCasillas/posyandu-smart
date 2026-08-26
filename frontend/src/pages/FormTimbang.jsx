import React, { useState, useEffect } from 'react';
import { Scale, Send, CheckCircle2, AlertTriangle, Sparkles, UserPlus, Phone, Baby, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function FormTimbang({ onNavigateToAnak, onSaved }) {
  const [anakList, setAnakList] = useState([]);
  const [selectedAnakId, setSelectedAnakId] = useState('');
  const [selectedAnak, setSelectedAnak] = useState(null);

  const [tglTimbang, setTglTimbang] = useState(new Date().toISOString().slice(0, 10));
  const [beratBadan, setBeratBadan] = useState('');
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [lingkarKepala, setLingkarKepala] = useState('');
  const [catatan, setCatatan] = useState('');
  const [sendWA, setSendWA] = useState(true);

  const [previewGizi, setPreviewGizi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch daftar anak
  useEffect(() => {
    fetchAnakList();
  }, []);

  const fetchAnakList = async () => {
    try {
      const res = await api.get('/anak');
      if (res.data.success) {
        setAnakList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar anak:', err);
    }
  };

  // Pilih anak
  const handleSelectAnak = (e) => {
    const id = e.target.value;
    setSelectedAnakId(id);
    const found = anakList.find((a) => a.id.toString() === id);
    setSelectedAnak(found || null);
    setPreviewGizi(null);
  };

  // Preview hitung WHO realtime saat berat & tinggi diisi
  useEffect(() => {
    if (selectedAnak && beratBadan && tinggiBadan) {
      const bb = parseFloat(beratBadan);
      const tb = parseFloat(tinggiBadan);
      if (bb > 0 && tb > 0) {
        calcPreview(selectedAnak.jenis_kelamin, selectedAnak.tgl_lahir, bb, tb);
      }
    } else {
      setPreviewGizi(null);
    }
  }, [selectedAnak, beratBadan, tinggiBadan, tglTimbang]);

  const calcPreview = async (jenisKelamin, tglLahir, bb, tb) => {
    try {
      const res = await api.post('/penimbangan/preview', {
        jenis_kelamin: jenisKelamin,
        tgl_lahir: tglLahir,
        tgl_timbang: tglTimbang,
        berat_badan: bb,
        tinggi_badan: tb,
      });
      if (res.data.success) {
        setPreviewGizi(res.data.data);
      }
    } catch (err) {
      console.error('Gagal hitung preview:', err);
    }
  };

  // Submit Penimbangan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedAnakId) {
      setErrorMsg('Silakan pilih balita yang akan ditimbang');
      return;
    }
    if (!beratBadan || !tinggiBadan) {
      setErrorMsg('Berat badan dan tinggi badan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/penimbangan', {
        anak_id: selectedAnakId,
        tgl_timbang: tglTimbang,
        berat_badan: parseFloat(beratBadan),
        tinggi_badan: parseFloat(tinggiBadan),
        lingkar_kepala: lingkarKepala ? parseFloat(lingkarKepala) : null,
        catatan: catatan,
        send_wa: sendWA,
      });

      if (res.data.success) {
        // Efek Konfeti untuk apresiasi kader
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setSuccessModal({
          nama: selectedAnak.nama,
          noWA: selectedAnak.no_wa,
          statusGizi: res.data.data.hasil_gizi.status_gizi,
          isStunting: res.data.data.hasil_gizi.is_stunting,
          saran: res.data.data.hasil_gizi.saran,
          waSuccess: res.data.data.wa_result?.success,
          waMode: res.data.data.wa_result?.mode,
        });

        // Reset form
        setBeratBadan('');
        setTinggiBadan('');
        setLingkarKepala('');
        setCatatan('');
        setPreviewGizi(null);
        if (onSaved) onSaved();
      }
    } catch (err) {
      console.error('Gagal simpan:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data penimbangan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Form */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5" /> Form Kader Posyandu
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Input Hasil Penimbangan</h1>
          <p className="mt-2 text-sky-100 text-sm sm:text-base leading-relaxed">
            Catat hasil ukur balita. Sistem akan otomatis menghitung status gizi standar WHO dan mengirimkan WhatsApp ke orang tua.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none">
          <Scale className="w-64 h-64 text-white" />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Input Data */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          {/* Pilih Balita */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Baby className="w-4 h-4 text-sky-600" /> Pilih Balita <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={onNavigateToAnak}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Balita Baru
              </button>
            </div>
            <select
              value={selectedAnakId}
              onChange={handleSelectAnak}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              required
            >
              <option value="">-- Pilih Balita dari Daftar --</option>
              {anakList.map((anak) => (
                <option key={anak.id} value={anak.id}>
                  {anak.nama} ({anak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}) - Ortu: {anak.nama_ortu}
                </option>
              ))}
            </select>
          </div>

          {/* Info Singkat Balita Terpilih */}
          {selectedAnak && (
            <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Tanggal Lahir:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedAnak.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Usia Taksiran:</span>
                <span className="font-semibold text-sky-700">{selectedAnak.usia_sekarang_bulan} Bulan</span>
              </div>
              <div>
                <span className="text-slate-500 block">WhatsApp Ortu:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" /> {selectedAnak.no_wa}
                </span>
              </div>
            </div>
          )}

          {/* Tanggal Timbang */}
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Tanggal Penimbangan</label>
            <input
              type="date"
              value={tglTimbang}
              onChange={(e) => setTglTimbang(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white"
              required
            />
          </div>

          {/* Tombol Besar Input Ukuran (Ramah HP Kader) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Berat Badan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider mb-1">
                Berat Badan (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 8.5"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  className="w-full text-2xl font-black px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sky-700 focus:ring-2 focus:ring-sky-500 pr-12"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-sm font-bold text-slate-400">kg</span>
              </div>
            </div>

            {/* Tinggi Badan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider mb-1">
                Tinggi / Panjang (cm) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 72.0"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  className="w-full text-2xl font-black px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-emerald-700 focus:ring-2 focus:ring-emerald-500 pr-12"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-sm font-bold text-slate-400">cm</span>
              </div>
            </div>
          </div>

          {/* Lingkar Kepala (Opsional) */}
          <div>
            <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider mb-1">
              Lingkar Kepala (cm) <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Contoh: 43.5"
              value={lingkarKepala}
              onChange={(e) => setLingkarKepala(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Catatan Kader */}
          <div>
            <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider mb-1">
              Catatan / Pesan untuk Orang Tua
            </label>
            <textarea
              rows="2"
              placeholder="Contoh: Anak aktif, teruskan ASI dan beri selingan biskuit/telur..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Opsi Kirim WhatsApp */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <input
              type="checkbox"
              id="sendWA"
              checked={sendWA}
              onChange={(e) => setSendWA(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="sendWA" className="text-xs sm:text-sm font-medium text-emerald-900 cursor-pointer">
              📲 <strong>Kirim Notifikasi WhatsApp Otomatis</strong> ke Orang Tua setelah tombol Simpan ditekan
            </label>
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Menghitung & Menyimpan...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Simpan & Proses Notifikasi
              </>
            )}
          </button>
        </div>

        {/* Kolom Kanan: Live WHO Analysis Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-base mb-4 border-b pb-3">
              <Calculator className="w-5 h-5" />
              <span>Analisis Status Gizi WHO</span>
            </div>

            {previewGizi ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Kesimpulan Status</span>
                  <div className="mt-1">
                    <StatusBadge status={previewGizi.status_gizi} size="lg" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tinggi menurut Umur (TB/U):</span>
                    <span className="font-bold text-slate-800">{previewGizi.status_tb_u}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Berat menurut Umur (BB/U):</span>
                    <span className="font-bold text-slate-800">{previewGizi.status_bb_u}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Status Wasting (BB/TB):</span>
                    <span className="font-bold text-slate-800">{previewGizi.status_bb_tb}</span>
                  </div>
                </div>

                {/* Card Saran Edukasi */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  previewGizi.is_stunting 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <strong className="block mb-1">
                    {previewGizi.is_stunting ? '⚠️ Peringatan Stunting:' : '💡 Rekomendasi:'}
                  </strong>
                  {previewGizi.saran}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">
                  Pilih balita dan masukkan angka berat & tinggi badan untuk melihat kalkulasi otomatis status WHO di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Modal Sukses */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Penimbangan Tersimpan!</h3>
              <p className="text-sm text-slate-600">Data balita <strong>{successModal.nama}</strong> berhasil dicatat.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Gizi:</span>
                <StatusBadge status={successModal.statusGizi} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Notifikasi WA:</span>
                <span className="font-semibold text-emerald-700">
                  {successModal.waMode === 'simulation' ? '✅ Terkirim (Mode Dev Simulasi)' : '✅ Terkirim ke ' + successModal.noWA}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Input Balita Lainnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
