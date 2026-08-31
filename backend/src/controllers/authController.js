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
    const [rows] = await pool.query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM anak WHERE posyandu_id = p.id) AS total_balita,
        (SELECT COUNT(*) FROM users WHERE posyandu_id = p.id) AS total_kader
      FROM posyandu p 
      ORDER BY p.nama_posyandu ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar posyandu', error: error.message });
  }
}

// POST /api/posyandu
async function createPosyandu(req, res) {
  try {
    const { nama_posyandu, desa_kelurahan, kecamatan, kota_kabupaten } = req.body;
    if (!nama_posyandu || !desa_kelurahan || !kecamatan) {
      return res.status(400).json({ success: false, message: 'Nama posyandu, kelurahan, dan kecamatan wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO posyandu (nama_posyandu, desa_kelurahan, kecamatan, kota_kabupaten) VALUES (?, ?, ?, ?)`,
      [nama_posyandu, desa_kelurahan, kecamatan, kota_kabupaten || 'Depok']
    );

    res.status(201).json({ success: true, message: 'Posyandu berhasil ditambahkan', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan posyandu', error: error.message });
  }
}

// GET /api/users (Kelola Kader oleh Admin Puskesmas)
async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.username, u.nama_lengkap, u.role, u.posyandu_id, u.created_at, p.nama_posyandu, p.desa_kelurahan
      FROM users u
      LEFT JOIN posyandu p ON u.posyandu_id = p.id
      ORDER BY u.role ASC, u.nama_lengkap ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar pengguna', error: error.message });
  }
}

// POST /api/users (Admin buatkan akun kader baru)
async function createUser(req, res) {
  try {
    const { username, password, nama_lengkap, role, posyandu_id } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({ success: false, message: 'Username, password, dan nama lengkap wajib diisi' });
    }

    // Cek apakah username sudah ada
    const [existing] = await pool.query(`SELECT id FROM users WHERE username = ?`, [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan pilih username lain' });
    }

    const userRole = role === 'admin_puskesmas' ? 'admin_puskesmas' : 'kader';
    const posId = posyandu_id ? parseInt(posyandu_id, 10) : null;

    const [result] = await pool.query(
      `INSERT INTO users (username, password, nama_lengkap, role, posyandu_id) VALUES (?, ?, ?, ?, ?)`,
      [username, password, nama_lengkap, userRole, posId]
    );

    res.status(201).json({
      success: true,
      message: 'Akun kader berhasil dibuat',
      data: { id: result.insertId, username, nama_lengkap, role: userRole, posyandu_id: posId },
    });
  } catch (error) {
    console.error('Error createUser:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat akun kader', error: error.message });
  }
}

// PUT /api/users/:id (Admin update kader / reset password)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, password, nama_lengkap, role, posyandu_id } = req.body;

    let sql = `UPDATE users SET username=?, nama_lengkap=?, role=?, posyandu_id=?`;
    const params = [username, nama_lengkap, role, posyandu_id || null];

    if (password) {
      sql += `, password=?`;
      params.push(password);
    }

    sql += ` WHERE id=?`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ success: true, message: 'Data akun berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateUser:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui akun', error: error.message });
  }
}

// DELETE /api/users/:id (Admin hapus kader)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteUser:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus akun', error: error.message });
  }
}

module.exports = {
  login,
  getPosyanduList,
  createPosyandu,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
