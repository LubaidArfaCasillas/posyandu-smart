import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Scale,
  TrendingUp,
  User,
  UserPlus,
  X,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  Baby,
} from 'lucide-react';
import api from '../api/client';

export default function DataAnak({ user, onSelectForTimbang, onViewKms }) {
  const [anakList, setAnakList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin_puskesmas';

  // Modal Tambah / Edit Balita
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editId, setEditId] = useState(null);
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
    setModalMode('add');
    setEditId(null);
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

  const handleOpenEdit = (anak) => {
    if (isAdmin) return;
    setModalMode('edit');
    setEditId(anak.id);
    setFormData({
      nik: anak.nik || '',
      nama: anak.nama || '',
      tgl_lahir: anak.tgl_lahir ? anak.tgl_lahir.split('T')[0] : '',
      jenis_kelamin: anak.jenis_kelamin || 'L',
      nama_ortu: anak.nama_ortu || '',
      no_wa: anak.no_wa || '',
      alamat: anak.alamat || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDeleteAnak = async (anak) => {
    if (isAdmin) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus balita "${anak.nama}"?\n\nPERINGATAN: Seluruh riwayat catatan KMS balita ini juga akan ikut terhapus secara permanen.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/anak/${anak.id}`);
      if (res.data.success) {
        fetchAnak();
      }
    } catch (err) {
      alert('Gagal menghapus data anak: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isAdmin) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (modalMode === 'edit' && editId) {
        await api.put(`/anak/${editId}`, formData);
      } else {
        await api.post('/anak', formData);
      }
      setModalOpen(false);
      fetchAnak();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data anak');
    } finally {
      setSubmitting(false);
    }
  };

  const [activeFilterTab, setActiveFilterTab] = useState('all');

  const filteredList = anakList.filter((anak) => {
    if (activeFilterTab === 'L') return anak.jenis_kelamin === 'L';
    if (activeFilterTab === 'P') return anak.jenis_kelamin === 'P';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Balita Terdaftar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data demografi anak, riwayat KMS, dan nomor WhatsApp orang tua.
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#00a86b] hover:bg-[#00925d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-soft-sm transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Balita</span>
          </button>
        )}
      </div>

      {/* Bar Pencarian & Filter Kategori */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Input Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama balita, NIK, atau nama orang tua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all shadow-soft-sm"
          />
        </div>

        {/* Filter Tab Gender */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-soft-sm shrink-0 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilterTab === 'all'
                ? 'bg-emerald-50 text-[#00a86b]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({anakList.length})
          </button>
          <button
            onClick={() => setActiveFilterTab('L')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilterTab === 'L'
                ? 'bg-sky-50 text-sky-800 border border-sky-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Laki-laki
          </button>
          <button
            onClick={() => setActiveFilterTab('P')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilterTab === 'P'
                ? 'bg-rose-50 text-rose-800 border border-rose-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Perempuan
          </button>
        </div>
      </div>

      {/* Grid Kartu Balita */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Memuat data balita...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a86b] flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Data Balita</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search ? 'Tidak ditemukan data yang sesuai dengan pencarian Anda.' : 'Belum ada data balita yang terdaftar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((anak) => {
            const isBoy = anak.jenis_kelamin === 'L';

            return (
              <div
                key={anak.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft-sm hover:border-emerald-200 hover:shadow-soft-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Header Card: Avatar, Nama, Age Badge & Edit/Delete Actions */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl p-0.5 bg-[#00a86b] shadow-soft-sm">
                          <div
                            className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                              isBoy ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <Baby className="w-5 h-5 stroke-[2.2]" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-[#00a86b] transition-colors">
                            {anak.nama}
                          </h2>
                          <span
                            className="w-4 h-4 rounded-full bg-[#00a86b] text-white flex items-center justify-center text-[9px] shrink-0"
                            title="Terverifikasi KMS"
                          >
                            ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Ortu: <span className="text-slate-700">{anak.nama_ortu || '-'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Age Badge & Actions (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#00a86b] border border-emerald-200/60 text-[11px] font-bold rounded-lg">
                        {anak.usia_sekarang_bulan} Bln
                      </span>
                      {!isAdmin && (
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(anak)}
                            className="p-1 text-slate-400 hover:text-[#00a86b] hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Data Balita"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnak(anak)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Data Balita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Info Kontak & Lahir */}
                  <div className="mt-3.5 py-2 px-3 bg-[#f0f7f4] rounded-xl space-y-1 text-xs text-slate-600 border border-emerald-100/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">NIK Balita:</span>
                      <span className="text-slate-800 font-mono font-semibold text-[11px]">
                        {anak.nik || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Jenis Kelamin:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          isBoy ? 'bg-sky-50 text-sky-800 border border-sky-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                        }`}
                      >
                        {isBoy ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">No. WhatsApp:</span>
                      <strong className="text-slate-800 font-semibold">{anak.no_wa || '-'}</strong>
                    </div>
                  </div>
                </div>

                {/* Divider Line & Action Buttons */}
                <div>
                  <hr className="my-3 border-slate-100" />

                  <div className="flex items-center gap-2">
                    {/* WhatsApp Button */}
                    <a
                      href={`https://wa.me/${anak.no_wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-2 border border-[#00a86b] hover:bg-emerald-50 text-[#00a86b] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Hubungi via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#00a86b]" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Tombol Timbang */}
                    {!isAdmin && (
                      <button
                        onClick={() => onSelectForTimbang(anak.id)}
                        className="flex-1 py-2 px-2 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-soft-sm"
                      >
                        <Scale className="w-3.5 h-3.5 text-white" />
                        <span>Timbang</span>
                      </button>
                    )}

                    {/* Grafik KMS */}
                    <button
                      onClick={() => onViewKms(anak.id)}
                      className={`${
                        isAdmin ? 'flex-1 py-2 px-2' : 'w-9 h-9'
                      } bg-[#00a86b] hover:bg-[#00925d] text-white rounded-xl flex items-center justify-center shadow-soft-sm transition-all shrink-0 gap-1.5 text-xs font-bold active:scale-95`}
                      title="Lihat Lembar KMS Digital"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      {isAdmin && <span>KMS</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tombol Bawah (+ Tambah Balita Baru) */}
      {!isAdmin && (
        <div className="pt-2">
          <button
            onClick={handleOpenAdd}
            className="w-full py-3 bg-white hover:bg-emerald-50 text-[#00a86b] font-extrabold text-xs sm:text-sm rounded-2xl border-2 border-[#00a86b] transition-all flex items-center justify-center gap-2 shadow-soft-sm active:scale-98"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Tambah Balita Baru</span>
          </button>
        </div>
      )}

      {/* Modal Tambah / Edit Balita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {modalMode === 'edit' ? 'Edit Data Balita' : 'Tambah Balita Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {modalMode === 'edit'
                    ? 'Perbarui data identitas balita'
                    : 'Daftarkan balita baru ke Posyandu'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  NIK Balita (16 Digit) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="35xxxxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Balita *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.tgl_lahir}
                    onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Siti Aminah"
                    value={formData.nama_ortu}
                    onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. WhatsApp Ortu *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.no_wa}
                    onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Rumah / RT RW</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Kenanga No. 12, RT 02/04"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#00a86b] hover:bg-[#00925d] text-white font-bold rounded-xl transition-all shadow-soft-sm disabled:opacity-50"
                >
                  {submitting
                    ? 'Menyimpan...'
                    : modalMode === 'edit'
                    ? 'Simpan Perubahan'
                    : 'Simpan Balita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
