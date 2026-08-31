import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Scale, TrendingUp, User, UserPlus, X, Phone, Calendar } from 'lucide-react';
import api from '../api/client';

export default function DataAnak({ user, onSelectForTimbang, onViewKms }) {
  const [anakList, setAnakList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin_puskesmas';

  // Modal Tambah Balita Baru
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    tgl_lahir: '',
    jenis_kelamin: 'L',
    nama_ortu: '',
    no_wa: '',
    alamat: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAnak();
  }, [search]);

  const fetchAnak = async () => {
    try {
      setLoading(true);
      const res = await api.get('/anak', { params: { search } });
      if (res.data.success) {
        setAnakList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal ambil anak:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (isAdmin) return;
    setFormData({
      nik: '',
      nama: '',
      tgl_lahir: '',
      jenis_kelamin: 'L',
      nama_ortu: '',
      no_wa: '',
      alamat: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isAdmin) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      await api.post('/anak', formData);
      setModalOpen(false);
      fetchAnak();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data anak');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Search Bar & Add Button (Add button khusus Kader) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama balita atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] shadow-xs"
          />
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-xl shadow-xs transition-all flex items-center gap-2 font-bold text-xs sm:text-sm active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Balita</span>
          </button>
        )}
      </div>

      {/* Grid Balita Cards (Responsif: 1 kolom di HP, 2 kolom di Tablet, 3 kolom di Desktop) */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Memuat data balita...</div>
      ) : anakList.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-xs text-slate-400 space-y-2">
          <User className="w-8 h-8 mx-auto text-slate-300" />
          <p>Belum ada data balita yang cocok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anakList.map((anak) => {
            const isBoy = anak.jenis_kelamin === 'L';

            return (
              <div
                key={anak.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between ${
                  isBoy ? 'border-l-4 border-l-[#0077b6]' : 'border-l-4 border-l-[#f43f5e]'
                }`}
              >
                <div>
                  {/* Header Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                          isBoy ? 'bg-[#e0f2fe] text-[#0077b6]' : 'bg-[#ffe4e6] text-[#f43f5e]'
                        }`}
                      >
                        {isBoy ? '👦' : '👧'}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">{anak.nama}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Anak {anak.nama_ortu?.startsWith('Bpk') || anak.nama_ortu?.startsWith('Ibu') ? anak.nama_ortu : `Bpk/Ibu ${anak.nama_ortu}`}
                        </p>
                      </div>
                    </div>

                    {/* Age Badge */}
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex-shrink-0">
                      {anak.usia_sekarang_bulan} Bln
                    </span>
                  </div>

                  {/* Detail Info Kontak */}
                  <div className="mt-3 py-2 px-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>WA: <strong>{anak.no_wa}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Lahir: {new Date(anak.tgl_lahir).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div>
                  <hr className="my-3.5 border-slate-100" />

                  {/* Action Buttons (Tombol Timbang disembunyikan untuk Admin) */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${anak.no_wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-2.5 border border-emerald-500 hover:bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Tombol Timbang khusus Kader */}
                    {!isAdmin && (
                      <button
                        onClick={() => onSelectForTimbang(anak.id)}
                        className="flex-1 py-2 px-2.5 border border-[#0077b6] hover:bg-sky-50 text-[#0077b6] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Timbang</span>
                      </button>
                    )}

                    {/* Grafik KMS */}
                    <button
                      onClick={() => onViewKms(anak.id)}
                      className={`${isAdmin ? 'flex-1 py-2 px-2.5' : 'w-9 h-8 sm:w-10 sm:h-9'} bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-xl flex items-center justify-center shadow-xs transition-colors shrink-0 gap-1.5 text-xs font-bold`}
                      title="Buku KMS Digital"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isAdmin && <span>KMS Balita</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Balita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Tambah Balita Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded-lg">{errorMsg}</div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Balita *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tgl Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.tgl_lahir}
                    onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0077b6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0077b6]"
                  >
                    <option value="L">Laki-laki (👦)</option>
                    <option value="P">Perempuan (👧)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Agus"
                  value={formData.nama_ortu}
                  onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={formData.no_wa}
                  onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#0077b6] text-white font-bold rounded-xl shadow-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Balita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
