import React, { useState, useEffect, useRef } from 'react';
import { Search, Minus, Plus, MessageSquare, Save, CheckCircle2, ShieldAlert, ChevronDown, Check, X, Calendar } from 'lucide-react';
import api from '../api/client';

export default function FormTimbang({ user, onNavigateToAnak, onSaved }) {
  const isAdmin = user?.role === 'admin_puskesmas';
  const [anakList, setAnakList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [tglTimbang, setTglTimbang] = useState(new Date().toISOString().split('T')[0]);
  const [beratBadan, setBeratBadan] = useState(0.0);
  const [tinggiBadan, setTinggiBadan] = useState(0.0);
  const [lingkarKepala, setLingkarKepala] = useState('');
  const [catatan, setCatatan] = useState('');
  const [sendWA, setSendWA] = useState(true);

  const [previewGizi, setPreviewGizi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [adminOverride, setAdminOverride] = useState(false);

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

  const calcPreview = async (jk, tglLahir, bb, tb, tglTimb) => {
    try {
      const res = await api.post('/penimbangan/preview', {
        jenis_kelamin: jk,
        tgl_lahir: tglLahir,
        tgl_timbang: tglTimb || tglTimbang,
        berat_badan: bb,
        tinggi_badan: tb,
      });
      if (res.data.success) {
        setPreviewGizi(res.data.data);
      }
    } catch (err) {
      console.error('Gagal kalkulasi preview:', err);
    }
  };

  useEffect(() => {
    fetchAnakList();
  }, []);

  // Click outside listener untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        if (selectedAnak) {
          setSearchTerm(selectedAnak.nama);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedAnak]);

  const filteredAnak = anakList.filter((a) => {
    const query = searchTerm.toLowerCase();
    return (
      a.nama.toLowerCase().includes(query) ||
      (a.nik && a.nik.includes(query)) ||
      (a.nama_ortu && a.nama_ortu.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (selectedAnak && beratBadan > 0 && tinggiBadan > 0) {
      calcPreview(selectedAnak.jenis_kelamin, selectedAnak.tgl_lahir, beratBadan, tinggiBadan, tglTimbang);
    } else {
      setPreviewGizi(null);
    }
  }, [selectedAnak, beratBadan, tinggiBadan, tglTimbang]);

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
    if (!selectedAnak) {
      setErrorMsg('Pilih balita terlebih dahulu!');
      return;
    }
    if (beratBadan <= 0 || tinggiBadan <= 0) {
      setErrorMsg('Berat badan dan tinggi badan harus lebih dari 0!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/penimbangan', {
        anak_id: selectedAnak.id,
        tgl_timbang: tglTimbang || new Date().toISOString().split('T')[0],
        berat_badan: beratBadan,
        tinggi_badan: tinggiBadan,
        lingkar_kepala: lingkarKepala ? parseFloat(lingkarKepala) : null,
        catatan: catatan ? catatan.trim() : null,
        petugas_id: user?.id || null,
        send_wa: sendWA,
      });

      if (res.data.success) {
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

  if (isAdmin && !adminOverride) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-soft-sm text-center max-w-lg mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-extrabold text-slate-900">Akses Terbatas: Input Timbang</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Admin Puskesmas berfokus pada pengawasan wilayah. Fitur entri penimbangan balita biasanya dilaksanakan oleh <strong>Kader Posyandu</strong>.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setAdminOverride(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-soft-sm transition-all active:scale-95"
          >
            Buka Form (Mode Petugas / Uji Coba)
          </button>
          <button
            onClick={onNavigateToAnak}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Lihat Data Balita &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-shake">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Responsif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kolom Kiri (7 Kolom): Input Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Pilih Balita (Bisa Dropdown & Bisa Search) */}
          <div
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm space-y-3 relative"
            ref={dropdownRef}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                1. Pilih Balita yang Ditimbang
              </label>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                {anakList.length} Balita Terdaftar
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Ketik nama atau NIK balita untuk mencari..."
                value={searchTerm}
                onFocus={() => setDropdownOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDropdownOpen(true);
                }}
                className="w-full pl-10 pr-16 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
              />

              {/* Action Buttons: Clear & Dropdown Toggle */}
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setDropdownOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                    title="Hapus ketikan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-transform"
                  title="Buka / Tutup Dropdown"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Menu List */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-soft-lg divide-y divide-slate-100">
                  {filteredAnak.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ditemukan balita dengan nama/NIK "{searchTerm}"
                    </div>
                  ) : (
                    filteredAnak.map((anak) => {
                      const isSelected = selectedAnak?.id === anak.id;
                      const isBoy = anak.jenis_kelamin === 'L';
                      return (
                        <div
                          key={anak.id}
                          onClick={() => {
                            handleSelectAnak(anak);
                            setDropdownOpen(false);
                          }}
                          className={`p-3 text-xs hover:bg-emerald-50/60 cursor-pointer flex justify-between items-center transition-colors ${
                            isSelected ? 'bg-emerald-50/90' : ''
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-sm ${
                                  isSelected ? 'text-emerald-800' : 'text-slate-900'
                                }`}
                              >
                                {anak.nama}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isBoy
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {isBoy ? 'Laki-laki' : 'Perempuan'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs">
                              Usia: <strong>{anak.usia_sekarang_bulan} Bln</strong> • Ortu:{' '}
                              {anak.nama_ortu}
                              {anak.nik ? ` • NIK: ${anak.nik}` : ''}
                            </p>
                          </div>

                          {isSelected && (
                            <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Info Balita Terpilih */}
            {selectedAnak && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-700">
                    Balita Aktif:{' '}
                    <strong className="text-slate-900 font-bold text-sm">
                      {selectedAnak.nama}
                    </strong>{' '}
                    ({selectedAnak.usia_sekarang_bulan} Bulan,{' '}
                    {selectedAnak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                  </span>
                </div>
                <span className="text-slate-600 text-xs">
                  WA Ortu:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {selectedAnak.no_wa || '-'}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Card: Tanggal Penimbangan */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <label htmlFor="tgl_timbang_input" className="text-xs sm:text-sm font-bold text-slate-800 block cursor-pointer">
                  2. Tanggal Penimbangan
                </label>
                <p className="text-[11px] text-slate-500">Sesuaikan jika mencatat hasil timbang hari sebelumnya</p>
              </div>
            </div>
            <input
              id="tgl_timbang_input"
              type="date"
              value={tglTimbang}
              onChange={(e) => setTglTimbang(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
            />
          </div>

          {/* Card 3 & 4: Stepper Berat Badan & Tinggi Badan (Dirancang Khusus Ramah Ibu Kader) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Berat Badan (kg) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft-sm text-center space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Berat Badan (kg)
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Step 0.1 kg
                </span>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleStepBB(-0.1)}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-extrabold text-xl transition-all shadow-2xs active:scale-90 touch-manipulation"
                  title="Kurang 0.1 kg"
                  aria-label="Kurang berat badan"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="w-28 sm:w-32 py-2 px-1 border-2 border-slate-200 rounded-2xl bg-slate-50/50 focus-within:bg-white focus-within:border-emerald-600 focus-within:shadow-card-glow transition-all">
                  <input
                    type="number"
                    step="0.1"
                    value={beratBadan === 0 ? '' : beratBadan}
                    placeholder="0.0"
                    onChange={(e) => setBeratBadan(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-slate-900 bg-transparent focus:outline-none tabular-nums"
                  />
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Kilogram
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepBB(0.1)}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-xl transition-all shadow-2xs active:scale-90 touch-manipulation"
                  title="Tambah 0.1 kg"
                  aria-label="Tambah berat badan"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Preset Tambahan Cepat */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[-0.5, +0.5, +1.0].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleStepBB(delta)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Tinggi Badan (cm) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft-sm text-center space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Tinggi Badan (cm)
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Step 0.5 cm
                </span>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleStepTB(-0.5)}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-extrabold text-xl transition-all shadow-2xs active:scale-90 touch-manipulation"
                  title="Kurang 0.5 cm"
                  aria-label="Kurang tinggi badan"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="w-28 sm:w-32 py-2 px-1 border-2 border-slate-200 rounded-2xl bg-slate-50/50 focus-within:bg-white focus-within:border-emerald-600 focus-within:shadow-card-glow transition-all">
                  <input
                    type="number"
                    step="0.5"
                    value={tinggiBadan === 0 ? '' : tinggiBadan}
                    placeholder="0.0"
                    onChange={(e) => setTinggiBadan(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold text-slate-900 bg-transparent focus:outline-none tabular-nums"
                  />
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Centimeter
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepTB(0.5)}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-xl transition-all shadow-2xs active:scale-90 touch-manipulation"
                  title="Tambah 0.5 cm"
                  aria-label="Tambah tinggi badan"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Preset Tambahan Cepat */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[-1.0, +1.0, +2.0].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleStepTB(delta)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pengukuran Tambahan & Catatan Kader (Opsional) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                5. Pengukuran Tambahan & Catatan
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Opsional
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Lingkar Kepala (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 45.0"
                  value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Catatan / Keluhan Balita
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Balita aktif, nafsu makan baik"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card: Kirim Notifikasi WhatsApp Otomatis */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  6. Kirim Notifikasi WhatsApp Otomatis
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Hasil catatan KMS dan saran gizi langsung masuk ke HP orang tua balita
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={sendWA}
                onChange={(e) => setSendWA(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner" />
            </label>
          </div>

          {/* Action Button: Simpan & Kirim */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-soft-sm transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>
              {loading ? 'Menyimpan & Menghitung Standar WHO...' : 'Simpan & Rekam Penimbangan Balita'}
            </span>
          </button>
        </div>

        {/* Kolom Kanan (5 Kolom): Live WHO Status & Analysis Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Analisis Standar WHO
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  previewGizi?.is_stunting
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {previewGizi ? previewGizi.status_gizi : 'Normal'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">Skor Z Pertumbuhan</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                  {previewGizi ? Math.abs(previewGizi.zScore?.tb_u || 0.45) : '0.45'}
                </span>
                <span className="text-xs font-semibold text-slate-500">Z-Score (TB/U)</span>
              </div>
            </div>

            {/* Antropometri Preview */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tinggi menurut Usia (TB/U):</span>
                <span className="font-bold text-slate-800">
                  {previewGizi?.status_tb_u || 'Normal'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Berat menurut Usia (BB/U):</span>
                <span className="font-bold text-slate-800">
                  {previewGizi?.status_bb_u || 'Normal'}
                </span>
              </div>
            </div>

            {/* Saran Gizi Standar */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100/90 text-xs text-slate-700 leading-relaxed space-y-1">
              <span className="font-bold text-emerald-900 block">Saran untuk Kader & Orang Tua:</span>
              <p>
                {previewGizi
                  ? previewGizi.saran
                  : 'Pertumbuhan balita sesuai grafik standar WHO. Lanjutkan pemberian nutrisi seimbang, ASI/MP-ASI, dan pemantauan berkala setiap bulan.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-soft-lg border border-slate-200 animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Data Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Data penimbangan <strong>{successModal.nama}</strong> telah tercatat ke buku KMS
                digital
                {sendWA && successModal.noWA ? (
                  <>
                    {' '}
                    dan laporan WhatsApp otomatis dikirim ke <strong>{successModal.noWA}</strong>
                  </>
                ) : (
                  '.'
                )}
              </p>
            </div>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all"
            >
              Selesai / Lanjut Timbang Balita Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
