import React, { useState, useEffect } from 'react';
import { Baby, Search, Plus, Phone, Calendar, MapPin, Scale, Trash2, Edit3, UserCheck, X } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function DataAnak({ onSelectForTimbang, onViewKms }) {
  const [anakList, setAnakList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Tambah / Edit
  const [modalOpen, setModalOpen] = useState(false);
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
      console.error('Gagal ambil data anak:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
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
    setEditId(anak.id);
    setFormData({
      nik: anak.nik || '',
      nama: anak.nama,
      tgl_lahir: anak.tgl_lahir ? anak.tgl_lahir.slice(0, 10) : '',
      jenis_kelamin: anak.jenis_kelamin,
      nama_ortu: anak.nama_ortu,
      no_wa: anak.no_wa,
      alamat: anak.alamat || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (editId) {
        await api.put(`/anak/${editId}`, formData);
      } else {
        await api.post('/anak', formData);
      }
      setModalOpen(false);
      fetchAnak();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data balita "${nama}"? Semua riwayat timbangnya juga akan terhapus.`)) {
      try {
        await api.delete(`/anak/${id}`);
        fetchAnak();
      } catch (err) {
        alert('Gagal menghapus data anak');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="w-6 h-6 text-sky-600" /> Data Balita Posyandu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Daftar semua anak balita yang terdaftar di wilayah kerja posyandu.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Data Balita
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama balita, NIK, atau nama orang tua..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-sm text-sm focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Grid Card Balita */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Memuat data balita...</p>
        </div>
      ) : anakList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Baby className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Belum Ada Data Balita</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'Tidak ada balita yang cocok dengan kata kunci pencarian.' : 'Mulai dengan menambahkan data balita pertama Anda.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 px-4 py-2 bg-sky-50 text-sky-700 font-bold text-xs rounded-lg hover:bg-sky-100"
          >
            + Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {anakList.map((anak) => (
            <div
              key={anak.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
                        anak.jenis_kelamin === 'L'
                          ? 'bg-sky-100 text-sky-700 border border-sky-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {anak.jenis_kelamin === 'L' ? '👦' : '👧'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{anak.nama}</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {anak.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {anak.usia_sekarang_bulan} Bulan
                      </span>
                    </div>
                  </div>
                  {anak.status_terakhir && <StatusBadge status={anak.status_terakhir} size="sm" />}
                </div>

                {/* Info Detail */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ortu: <strong>{anak.nama_ortu}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WA: <strong>{anak.no_wa}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lahir: {new Date(anak.tgl_lahir).toLocaleDateString('id-ID')}</span>
                  </div>
                  {anak.alamat && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{anak.alamat}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectForTimbang(anak.id)}
                  className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" /> Timbang
                </button>
                <button
                  onClick={() => onViewKms(anak.id)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Grafik KMS
                </button>
                <button
                  onClick={() => handleOpenEdit(anak)}
                  className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  title="Edit Data"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(anak.id, anak.nama)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Balita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editId ? 'Edit Data Balita' : 'Tambah Balita Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Balita *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.tgl_lahir}
                    onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="L">Laki-laki (👦)</option>
                    <option value="P">Perempuan (👧)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua (Ibu/Ayah) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rina"
                    value={formData.nama_ortu}
                    onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp Ortu *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.no_wa}
                    onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">NIK (Opsional)</label>
                  <input
                    type="text"
                    placeholder="16 Digit NIK Balita"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Domisili</label>
                  <textarea
                    rows="2"
                    placeholder="RT/RW, Dusun/Kelurahan"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
