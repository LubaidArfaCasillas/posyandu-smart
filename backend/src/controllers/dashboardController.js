const pool = require('../config/db');

// GET /api/dashboard/stats
async function getStats(req, res) {
  try {
    // Total Anak
    const [[{ total_anak }]] = await pool.query(`SELECT COUNT(*) AS total_anak FROM anak`);

    // Total Penimbangan Bulan Ini
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [[{ total_timbang_bulan_ini }]] = await pool.query(
      `SELECT COUNT(*) AS total_timbang_bulan_ini FROM penimbangan WHERE DATE_FORMAT(tgl_timbang, '%Y-%m') = ?`,
      [currentMonth]
    );

    // Statistik Status Gizi Terkini (Kompatibel dengan MySQL 8)
    const [statusCounts] = await pool.query(`
      SELECT 
        p.status_gizi,
        COUNT(*) AS total
      FROM (
        SELECT anak_id, MAX(id) AS max_id
        FROM penimbangan
        GROUP BY anak_id
      ) AS latest
      JOIN penimbangan p ON p.id = latest.max_id
      GROUP BY p.status_gizi
    `);

    // Balita Berisiko Stunting / Perlu Perhatian
    const [stuntingList] = await pool.query(`
      SELECT 
        a.id AS anak_id, a.nama, a.jenis_kelamin, a.nama_ortu, a.no_wa,
        p.tgl_timbang, p.usia_bulan, p.berat_badan, p.tinggi_badan, p.status_tb_u, p.status_gizi, pos.nama_posyandu
      FROM penimbangan p
      JOIN anak a ON p.anak_id = a.id
      LEFT JOIN posyandu pos ON a.posyandu_id = pos.id
      WHERE (p.status_tb_u LIKE '%Pendek%' OR p.status_gizi LIKE '%Stunting%')
      ORDER BY p.tgl_timbang DESC
      LIMIT 10
    `);

    // Aktivitas Penimbangan Terbaru
    const [recentActivity] = await pool.query(`
      SELECT p.*, a.nama AS nama_anak, a.jenis_kelamin, a.nama_ortu, a.tgl_lahir
      FROM penimbangan p
      JOIN anak a ON p.anak_id = a.id
      ORDER BY p.id DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        total_anak,
        total_timbang_bulan_ini,
        statusCounts,
        stuntingList,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error getStats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard', error: error.message });
  }
}

// GET /api/dashboard/export-laporan
async function exportLaporan(req, res) {
  try {
    const { bulan, posyandu_id } = req.query;

    let sql = `
      SELECT 
        p.id,
        DATE_FORMAT(p.tgl_timbang, '%Y-%m-%d') AS tgl_timbang,
        COALESCE(pos.nama_posyandu, 'Posyandu') AS nama_posyandu,
        COALESCE(a.nik, '-') AS nik,
        a.nama AS nama_anak,
        CASE WHEN a.jenis_kelamin = 'L' THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis_kelamin,
        DATE_FORMAT(a.tgl_lahir, '%Y-%m-%d') AS tgl_lahir,
        p.usia_bulan,
        a.nama_ortu,
        a.no_wa,
        p.berat_badan,
        p.tinggi_badan,
        COALESCE(p.lingkar_kepala, '-') AS lingkar_kepala,
        p.status_bb_u,
        p.status_tb_u,
        p.status_bb_tb,
        p.status_gizi,
        COALESCE(p.catatan, '-') AS catatan,
        p.status_wa,
        COALESCE(u.nama_lengkap, '-') AS nama_petugas
      FROM penimbangan p
      JOIN anak a ON p.anak_id = a.id
      LEFT JOIN posyandu pos ON a.posyandu_id = pos.id
      LEFT JOIN users u ON p.petugas_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (bulan && bulan !== 'all') {
      sql += ` AND DATE_FORMAT(p.tgl_timbang, '%Y-%m') = ?`;
      params.push(bulan);
    }

    if (posyandu_id) {
      sql += ` AND a.posyandu_id = ?`;
      params.push(posyandu_id);
    }

    sql += ` ORDER BY p.tgl_timbang DESC, p.id DESC`;

    const [rows] = await pool.query(sql, params);

    res.json({
      success: true,
      data: rows,
      total: rows.length,
      bulan: bulan || 'Semua Periode',
    });
  } catch (error) {
    console.error('Error exportLaporan:', error);
    res.status(500).json({ success: false, message: 'Gagal mengekspor laporan', error: error.message });
  }
}

module.exports = {
  getStats,
  exportLaporan,
};
