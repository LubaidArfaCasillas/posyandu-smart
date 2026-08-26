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

    // Statistik Status Gizi Terkini
    const [statusCounts] = await pool.query(`
      SELECT 
        p.status_gizi,
        COUNT(*) AS total
      FROM (
        SELECT anak_id, status_gizi, MAX(tgl_timbang) AS max_date
        FROM penimbangan
        GROUP BY anak_id
      ) AS latest
      JOIN penimbangan p ON p.anak_id = latest.anak_id AND p.tgl_timbang = latest.max_date
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
      SELECT p.*, a.nama AS nama_anak, a.jenis_kelamin
      FROM penimbangan p
      JOIN anak a ON p.anak_id = a.id
      ORDER BY p.id DESC
      LIMIT 5
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

module.exports = {
  getStats,
};
