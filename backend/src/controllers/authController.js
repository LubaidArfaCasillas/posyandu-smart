const pool = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nama_lengkap, u.role, u.posyandu_id, p.nama_posyandu
       FROM users u
       LEFT JOIN posyandu p ON u.posyandu_id = p.id
       WHERE u.username = ? AND u.password = ?`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = rows[0];
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login', error: error.message });
  }
}

// GET /api/posyandu
async function getPosyanduList(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM posyandu ORDER BY nama_posyandu ASC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar posyandu', error: error.message });
  }
}

module.exports = {
  login,
  getPosyanduList,
};
