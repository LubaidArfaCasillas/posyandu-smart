const pool = require('../config/db');

// GET /api/kader
async function getAllKader(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nama_lengkap, u.role, u.posyandu_id, u.created_at, p.nama_posyandu
       FROM users u
       LEFT JOIN posyandu p ON u.posyandu_id = p.id
       WHERE u.role = 'kader'
       ORDER BY u.nama_lengkap ASC`
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getAllKader:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kader', error: error.message });
  }
}

// POST /api/kader
async function createKader(req, res) {
  try {
    const { username, password, nama_lengkap, posyandu_id } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, dan nama lengkap kader wajib diisi',
      });
    }

    // Cek username unik
    const [exist] = await pool.query(`SELECT id FROM users WHERE username = ?`, [username]);
    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Username '${username}' sudah digunakan. Gunakan username lain.`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO users (username, password, nama_lengkap, role, posyandu_id)
       VALUES (?, ?, ?, 'kader', ?)`,
      [username, password, nama_lengkap, posyandu_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Petugas Kader berhasil ditambahkan',
      data: { id: result.insertId, username, nama_lengkap, posyandu_id },
    });
  } catch (error) {
    console.error('Error createKader:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data kader', error: error.message });
  }
}

// PUT /api/kader/:id
async function updateKader(req, res) {
  try {
    const { id } = req.params;
    const { username, password, nama_lengkap, posyandu_id } = req.body;

    if (!username || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Username dan nama lengkap wajib diisi',
      });
    }

    // Cek username unik untuk user lain
    const [exist] = await pool.query(`SELECT id FROM users WHERE username = ? AND id != ?`, [username, id]);
    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Username '${username}' sudah digunakan user lain.`,
      });
    }

    if (password && password.trim() !== '') {
      await pool.query(
        `UPDATE users SET username=?, password=?, nama_lengkap=?, posyandu_id=? WHERE id=? AND role='kader'`,
        [username, password, nama_lengkap, posyandu_id || null, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET username=?, nama_lengkap=?, posyandu_id=? WHERE id=? AND role='kader'`,
        [username, nama_lengkap, posyandu_id || null, id]
      );
    }

    res.json({ success: true, message: 'Data kader berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateKader:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data kader', error: error.message });
  }
}

// DELETE /api/kader/:id
async function deleteKader(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = ? AND role = 'kader'`, [id]);
    res.json({ success: true, message: 'Data kader berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteKader:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data kader', error: error.message });
  }
}

module.exports = {
  getAllKader,
  createKader,
  updateKader,
  deleteKader,
};
