import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit2, Trash2, Shield, Building2, Key, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../api/client';

export default function KelolaKader() {
  const [kaderList, setKaderList] = useState([]);
  const [posyanduList, setPosyanduList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPosyandu, setFilterPosyandu] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    posyandu_id: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchKader();
    fetchPosyandu();
  }, []);

  const fetchKader = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kader');
      if (res.data.success) {
        setKaderList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data kader:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosyandu = async () => {
    try {
      const res = await api.get('/posyandu');
      if (res.data.success) {
        setPosyanduList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil posyandu:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      username: '',
      password: '',
      nama_lengkap: '',
      posyandu_id: posyanduList[0]?.id || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      username: item.username,
      password: '', // Biarkan kosong jika tidak diubah
      nama_lengkap: item.nama_lengkap,
      posyandu_id: item.posyandu_id || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun kader '${nama}'?`)) {
      try {
        const res = await api.delete(`/kader/${id}`);
        if (res.data.success) {
          setSuccessMsg(`Kader '${nama}' berhasil dihapus`);
          fetchKader();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus kader');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.username || !formData.nama_lengkap) {
      setErrorMsg('Username dan nama lengkap kader wajib diisi');
      return;
    }

    if (!editingId && !formData.password) {
      setErrorMsg('Password wajib diisi untuk kader baru');
      return;
    }

    try {
      setSubmitLoading(true);
      if (editingId) {
        const res = await api.put(`/kader/${editingId}`, formData);
        if (res.data.success) {
          setSuccessMsg('Data kader berhasil diperbarui');
          setShowModal(false);
          fetchKader();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const res = await api.post('/kader', formData);
        if (res.data.success) {
          setSuccessMsg('Kader baru berhasil ditambahkan');
          setShowModal(false);
          fetchKader();
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kader');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter List
  const filteredKader = kaderList.filter((k) => {
    const matchSearch =
      k.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      k.username.toLowerCase().includes(search.toLowerCase());
    const matchPosyandu = !filterPosyandu || String(k.posyandu_id) === String(filterPosyandu);
    return matchSearch && matchPosyandu;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0077b6]">
            <UserCheck className="w-4 h-4" />
            <span>MANAJEMEN KADER POSYANDU</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Kelola Akun & Petugas Kader
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah, perbarui, atau atur penugasan Kader Posyandu di seluruh wilayah kerja Puskesmas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#0077b6] hover:bg-[#023e8a] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kader Baru</span>
        </button>
      </div>

      {/* Alert Success */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama / username kader..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Posyandu */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filterPosyandu}
            onChange={(e) => setFilterPosyandu(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white"
          >
            <option value="">Semua Posyandu ({posyanduList.length})</option>
            {posyanduList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_posyandu}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data Kader */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Kader / Petugas</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Posyandu Binaan</th>
                <th className="py-3.5 px-5">Terdaftar</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Memuat daftar kader...
                  </td>
                </tr>
              ) : filteredKader.length > 0 ? (
                filteredKader.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-[#0077b6] font-extrabold flex items-center justify-center text-sm">
                          {item.nama_lengkap?.charAt(0).toUpperCase() || 'K'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-400">Peran: Kader Posyandu</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-700">
                      <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span>{item.username}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-[#0077b6] border border-sky-100">
                        {item.nama_posyandu || 'Belum diatur'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-500 text-[11px]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>

                    <td className="py-4 px-5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-[#0077b6] hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Kader"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_lengkap)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Kader"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Tidak ada kader yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Kader */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Data Kader' : 'Tambah Kader Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Nama Lengkap Kader *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Siti Rahmawati"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Posyandu Binaan *</label>
                <select
                  required
                  value={formData.posyandu_id}
                  onChange={(e) => setFormData({ ...formData, posyandu_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white"
                >
                  <option value="">Pilih Posyandu...</option>
                  {posyanduList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_posyandu} ({p.desa_kelurahan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Username (untuk Login) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: kader1"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Password {editingId && <span className="font-normal text-slate-400">(Biarkan kosong jika tidak diubah)</span>} *
                </label>
                <input
                  type="password"
                  placeholder={editingId ? '••••••••' : 'Masukkan password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-[#0077b6] hover:bg-[#023e8a] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitLoading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
