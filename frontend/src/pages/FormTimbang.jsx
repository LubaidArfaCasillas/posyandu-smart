import React, { useState, useEffect } from 'react';
import { Search, Minus, Plus, MessageSquare, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/client';

export default function FormTimbang({ user, onNavigateToAnak, onSaved }) {
  const isAdmin = user?.role === 'admin_puskesmas';
  const [anakList, setAnakList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnak, setSelectedAnak] = useState(null);

  const [beratBadan, setBeratBadan] = useState(0.0);
  const [tinggiBadan, setTinggiBadan] = useState(0.0);
  const [sendWA, setSendWA] = useState(true);

  const [previewGizi, setPreviewGizi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-lg mx-auto my-8 space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: Input Timbang</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Admin Puskesmas berfokus pada pemantauan & manajemen wilayah. Fitur entri penimbangan balita khusus dilaksanakan oleh Kader Posyandu.
          </p>
        </div>
        <button
          onClick={onNavigateToAnak}
          className="px-5 py-2.5 bg-[#0077b6] hover:bg-[#023e8a] text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
        >
          Lihat Data Balita &raquo;
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchAnakList();
  }, []);

  const fetchAnakList = async () => {
    try {
      const res = await api.get('/anak');
      if (res.data.success && res.data.data.length > 0) {
        setAnakList(res.data.data);
        setSelectedAnak(res.data.data[0]);
        setSearchTerm(res.data.data[0].nama);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar anak:', err);
    }
  };

  const filteredAnak = anakList.filter(
    (a) =>
      a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.nik && a.nik.includes(searchTerm))
  );

  useEffect(() => {
    if (selectedAnak && beratBadan > 0 && tinggiBadan > 0) {
      calcPreview(selectedAnak.jenis_kelamin, selectedAnak.tgl_lahir, beratBadan, tinggiBadan);
    } else {
      setPreviewGizi(null);
    }
  }, [selectedAnak, beratBadan, tinggiBadan]);

  const calcPreview = async (jk, tglLahir, bb, tb) => {
    try {
      const res = await api.post('/penimbangan/preview', {
        jenis_kelamin: jk,
        tgl_lahir: tglLahir,
        berat_badan: bb,
        tinggi_badan: tb,
      });
      if (res.data.success) {
        setPreviewGizi(res.data.data);
      }
    } catch (err) {
      console.error('Gagal preview:', err);
    }
  };

  const handleSelectAnak = (anak) => {
    setSelectedAnak(anak);
    setSearchTerm(anak.nama);
  };

  const handleStepBB = (delta) => {
    setBeratBadan((prev) => Math.max(0, parseFloat((prev + delta).toFixed(1))));
  };

  const handleStepTB = (delta) => {
    setTinggiBadan((prev) => Math.max(0, parseFloat((prev + delta).toFixed(1))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedAnak) {
      setErrorMsg('Silakan pilih balita');
      return;
    }
    if (beratBadan <= 0 || tinggiBadan <= 0) {
      setErrorMsg('Berat badan dan tinggi badan harus di atas 0');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/penimbangan', {
        anak_id: selectedAnak.id,
        tgl_timbang: new Date().toISOString().slice(0, 10),
        berat_badan: beratBadan,
        tinggi_badan: tinggiBadan,
        send_wa: sendWA,
      });

      if (res.data.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        setSuccessModal({
          nama: selectedAnak.nama,
          statusGizi: res.data.data.hasil_gizi.status_gizi,
          noWA: selectedAnak.no_wa,
        });
        if (onSaved) onSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Grid Responsif (Mobile: 1 kolom, Desktop: 2 kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kolom Kiri (7 Kolom): Input Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Pilih Balita */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-2.5">
            <label className="text-sm font-bold text-slate-900 block">Pilih Balita</label>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari nama balita atau NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white transition-all"
              />
            </div>

            {/* Suggestion Dropdown */}
            {searchTerm && filteredAnak.length > 0 && searchTerm !== selectedAnak?.nama && (
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                {filteredAnak.map((anak) => (
                  <div
                    key={anak.id}
                    onClick={() => handleSelectAnak(anak)}
                    className="p-2.5 text-xs hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-800">{anak.nama}</span>
                    <span className="text-slate-400">{anak.usia_sekarang_bulan} Bln • Ortu: {anak.nama_ortu}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedAnak && (
              <div className="text-xs text-slate-500 flex flex-wrap justify-between items-center pt-1 gap-1">
                <span>Balita: <strong className="text-slate-800">{selectedAnak.nama}</strong> ({selectedAnak.usia_sekarang_bulan} Bln)</span>
                <span className="text-emerald-600 font-medium">WA: {selectedAnak.no_wa}</span>
              </div>
            )}
          </div>

          {/* Card 2 & 3: Berat Badan & Tinggi Badan (Grid 2 kolom di tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Berat Badan (kg) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center space-y-3">
              <label className="text-sm font-bold text-slate-800 block">Berat Badan (kg)</label>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStepBB(-0.1)}
                  className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-xl transition-all"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <div className="w-28 sm:w-32 py-2 border-2 border-slate-200 rounded-xl bg-white">
                  <input
                    type="number"
                    step="0.1"
                    value={beratBadan === 0 ? '' : beratBadan}
                    placeholder="0.0"
                    onChange={(e) => setBeratBadan(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-slate-900 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStepBB(0.1)}
                  className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-xl transition-all"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Tinggi Badan (cm) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center space-y-3">
              <label className="text-sm font-bold text-slate-800 block">Tinggi Badan (cm)</label>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStepTB(-0.5)}
                  className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-xl transition-all"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <div className="w-28 sm:w-32 py-2 border-2 border-slate-200 rounded-xl bg-white">
                  <input
                    type="number"
                    step="0.5"
                    value={tinggiBadan === 0 ? '' : tinggiBadan}
                    placeholder="0.0"
                    onChange={(e) => setTinggiBadan(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-slate-900 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStepTB(0.5)}
                  className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-xl transition-all"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Kirim Laporan WA Otomatis */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Kirim Laporan WA Otomatis</h4>
                <p className="text-[11px] text-slate-500">Kirim hasil KMS langsung ke nomor WhatsApp orang tua</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sendWA}
                onChange={(e) => setSendWA(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077b6]"></div>
            </label>
          </div>

          {/* Action Button: Simpan & Kirim */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-[#0077b6] hover:bg-[#023e8a] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Menyimpan & Menghitung...' : 'Simpan & Kirim Laporan'}</span>
          </button>
        </div>

        {/* Kolom Kanan (5 Kolom): Live WHO Status & Analysis (Sticky di Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Status Gizi WHO</h3>
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold text-white ${
                  previewGizi?.is_stunting ? 'bg-[#b91c1c]' : 'bg-[#10b981]'
                }`}
              >
                {previewGizi ? previewGizi.status_gizi : 'Normal'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {previewGizi ? Math.abs(previewGizi.zScore?.tb_u || 0.45) : '0.45'}
              </span>
              <span className="text-sm font-bold text-slate-500">Z-Score</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tinggi menurut Usia (TB/U):</span>
                <span className="font-bold text-slate-800">{previewGizi?.status_tb_u || 'Normal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Berat menurut Usia (BB/U):</span>
                <span className="font-bold text-slate-800">{previewGizi?.status_bb_u || 'Normal'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {previewGizi
                ? previewGizi.saran
                : 'Pertumbuhan balita sesuai grafik standar WHO. Lanjutkan pemberian nutrisi seimbang dan pemantauan berkala.'}
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Berhasil Disimpan!</h3>
              <p className="text-xs text-slate-500 mt-1">Data timbang <strong>{successModal.nama}</strong> berhasil disimpan & notifikasi dikirim ke {successModal.noWA}.</p>
            </div>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-2.5 bg-[#0077b6] text-white font-bold rounded-xl text-xs"
            >
              OK, Lanjut Input
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
