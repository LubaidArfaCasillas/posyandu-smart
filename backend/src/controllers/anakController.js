const pool = require('../config/db');
const { hitungUsiaBulan } = require('../utils/whoCalculator');

// GET /api/anak
async function getAllAnak(req, res) {
  try {
    const { search, posyandu_id } = req.query;
    let sql = `
      SELECT a.*, p.nama_posyandu,
        (SELECT COUNT(*) FROM penimbangan WHERE anak_id = a.id) AS total_timbang,
        (SELECT status_gizi FROM penimbangan WHERE anak_id = a.id ORDER BY tgl_timbang DESC, id DESC LIMIT 1) AS status_terakhir
      FROM anak a
      LEFT JOIN posyandu p ON a.posyandu_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (a.nama LIKE ? OR a.nik LIKE ? OR a.nama_ortu LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (posyandu_id) {
      sql += ` AND a.posyandu_id = ?`;
      params.push(posyandu_id);
    }

    sql += ` ORDER BY a.nama ASC`;

    const [rows] = await pool.query(sql, params);
    
    // Hitung usia bulan saat ini
    const dataWithAge = rows.map(anak => ({
      ...anak,
      usia_sekarang_bulan: hitungUsiaBulan(anak.tgl_lahir),
    }));

    res.json({ success: true, data: dataWithAge });
  } catch (error) {
    console.error('Error getAllAnak:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data anak', error: error.message });
  }
}

// GET /api/anak/:id
async function getAnakById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT a.*, p.nama_posyandu FROM anak a LEFT JOIN posyandu p ON a.posyandu_id = p.id WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan' });
    }

    const anak = rows[0];
    anak.usia_sekarang_bulan = hitungUsiaBulan(anak.tgl_lahir);

    // Ambil riwayat penimbangan
    const [riwayat] = await pool.query(
      `SELECT * FROM penimbangan WHERE anak_id = ? ORDER BY tgl_timbang ASC, id ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...anak,
        riwayat: riwayat,
      },
    });
  } catch (error) {
    console.error('Error getAnakById:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail anak', error: error.message });
  }
}

// POST /api/anak
async function createAnak(req, res) {
  try {
    const { nik, nama, tgl_lahir, jenis_kelamin, nama_ortu, no_wa, alamat, posyandu_id } = req.body;

    if (!nama || !tgl_lahir || !jenis_kelamin || !nama_ortu || !no_wa) {
      return res.status(400).json({
        success: false,
        message: 'Nama, tgl lahir, jenis kelamin, nama orang tua, dan No. WA wajib diisi',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO anak (nik, nama, tgl_lahir, jenis_kelamin, nama_ortu, no_wa, alamat, posyandu_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nik || null, nama, tgl_lahir, jenis_kelamin, nama_ortu, no_wa, alamat || '', posyandu_id || 1]
    );

    res.status(201).json({
      success: true,
      message: 'Data anak berhasil ditambahkan',
      data: { id: result.insertId, ...req.body },
    });
  } catch (error) {
    console.error('Error createAnak:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data anak', error: error.message });
  }
}

// PUT /api/anak/:id
async function updateAnak(req, res) {
  try {
    const { id } = req.params;
    const { nik, nama, tgl_lahir, jenis_kelamin, nama_ortu, no_wa, alamat, posyandu_id } = req.body;

    await pool.query(
      `UPDATE anak SET nik=?, nama=?, tgl_lahir=?, jenis_kelamin=?, nama_ortu=?, no_wa=?, alamat=?, posyandu_id=? WHERE id=?`,
      [nik || null, nama, tgl_lahir, jenis_kelamin, nama_ortu, no_wa, alamat || '', posyandu_id || 1, id]
    );

    res.json({ success: true, message: 'Data anak berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateAnak:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah data anak', error: error.message });
  }
}

// DELETE /api/anak/:id
async function deleteAnak(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM anak WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Data anak berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteAnak:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data anak', error: error.message });
  }
}

module.exports = {
  getAllAnak,
  getAnakById,
  createAnak,
  updateAnak,
  deleteAnak,
};
