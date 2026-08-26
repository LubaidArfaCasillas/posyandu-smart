const pool = require('../config/db');
const { hitungUsiaBulan, hitungStatusGizi } = require('../utils/whoCalculator');
const { kirimNotifikasiWA } = require('../utils/waSender');

// POST /api/penimbangan/preview (Kalkulasi realtime tanpa simpan)
function previewGizi(req, res) {
  try {
    const { jenis_kelamin, usia_bulan, tgl_lahir, tgl_timbang, berat_badan, tinggi_badan } = req.body;
    
    let usia = parseInt(usia_bulan, 10);
    if (isNaN(usia) && tgl_lahir) {
      usia = hitungUsiaBulan(tgl_lahir, tgl_timbang || new Date());
    }

    const hasil = hitungStatusGizi(jenis_kelamin, usia, berat_badan, tinggi_badan);
    res.json({ success: true, data: hasil });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal kalkulasi status gizi', error: error.message });
  }
}

// POST /api/penimbangan (Simpan hasil timbang & kirim WA otomatis)
async function createPenimbangan(req, res) {
  try {
    const { anak_id, tgl_timbang, berat_badan, tinggi_badan, lingkar_kepala, catatan, petugas_id, send_wa } = req.body;

    if (!anak_id || !tgl_timbang || !berat_badan || !tinggi_badan) {
      return res.status(400).json({
        success: false,
        message: 'Anak, tanggal timbang, berat badan, dan tinggi badan wajib diisi',
      });
    }

    // Ambil data anak untuk dapat tgl lahir & no WA
    const [anakRows] = await pool.query(
      `SELECT a.*, p.nama_posyandu FROM anak a LEFT JOIN posyandu p ON a.posyandu_id = p.id WHERE a.id = ?`,
      [anak_id]
    );

    if (anakRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan' });
    }

    const anak = anakRows[0];
    const usiaBulan = hitungUsiaBulan(anak.tgl_lahir, tgl_timbang);

    // Hitung status gizi WHO
    const hasilGizi = hitungStatusGizi(anak.jenis_kelamin, usiaBulan, berat_badan, tinggi_badan);

    // Simpan ke database
    const [result] = await pool.query(
      `INSERT INTO penimbangan 
       (anak_id, tgl_timbang, usia_bulan, berat_badan, tinggi_badan, lingkar_kepala, 
        status_bb_u, status_tb_u, status_bb_tb, status_gizi, catatan, petugas_id, status_wa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        anak_id,
        tgl_timbang,
        usiaBulan,
        berat_badan,
        tinggi_badan,
        lingkar_kepala || null,
        hasilGizi.status_bb_u,
        hasilGizi.status_tb_u,
        hasilGizi.status_bb_tb,
        hasilGizi.status_gizi,
        catatan || hasilGizi.saran,
        petugas_id || null,
      ]
    );

    const penimbanganId = result.insertId;
    let waResult = null;

    // Kirim notifikasi WhatsApp otomatis jika diminta (default: true)
    if (send_wa !== false && anak.no_wa) {
      waResult = await kirimNotifikasiWA(anak.no_wa, {
        namaAnak: anak.nama,
        tglTimbang: tgl_timbang,
        usiaBulan: usiaBulan,
        berat: berat_badan,
        tinggi: tinggi_badan,
        statusGizi: hasilGizi.status_gizi,
        saran: catatan || hasilGizi.saran,
        namaPosyandu: anak.nama_posyandu,
      });

      const statusWA = waResult.success ? 'sent' : 'failed';
      await pool.query(
        `UPDATE penimbangan SET status_wa = ?, wa_response = ? WHERE id = ?`,
        [statusWA, JSON.stringify(waResult), penimbanganId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Hasil penimbangan berhasil disimpan' + (waResult ? ' & notifikasi WA diproses' : ''),
      data: {
        id: penimbanganId,
        usia_bulan: usiaBulan,
        hasil_gizi: hasilGizi,
        wa_result: waResult,
      },
    });
  } catch (error) {
    console.error('Error createPenimbangan:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan penimbangan', error: error.message });
  }
}

// GET /api/penimbangan/riwayat/:anak_id
async function getRiwayatAnak(req, res) {
  try {
    const { anak_id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, a.nama AS nama_anak, a.jenis_kelamin, a.tgl_lahir
       FROM penimbangan p
       JOIN anak a ON p.anak_id = a.id
       WHERE p.anak_id = ?
       ORDER BY p.tgl_timbang ASC, p.id ASC`,
      [anak_id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getRiwayatAnak:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat', error: error.message });
  }
}

// POST /api/penimbangan/:id/resend-wa
async function resendWA(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, a.nama AS nama_anak, a.no_wa, pos.nama_posyandu
       FROM penimbangan p
       JOIN anak a ON p.anak_id = a.id
       LEFT JOIN posyandu pos ON a.posyandu_id = pos.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data penimbangan tidak ditemukan' });
    }

    const item = rows[0];
    const waResult = await kirimNotifikasiWA(item.no_wa, {
      namaAnak: item.nama_anak,
      tglTimbang: item.tgl_timbang,
      usiaBulan: item.usia_bulan,
      berat: item.berat_badan,
      tinggi: item.tinggi_badan,
      statusGizi: item.status_gizi,
      saran: item.catatan,
      namaPosyandu: item.nama_posyandu,
    });

    const statusWA = waResult.success ? 'sent' : 'failed';
    await pool.query(`UPDATE penimbangan SET status_wa = ?, wa_response = ? WHERE id = ?`, [
      statusWA,
      JSON.stringify(waResult),
      id,
    ]);

    res.json({ success: true, message: 'Pesan WA dikirim ulang', data: waResult });
  } catch (error) {
    console.error('Error resendWA:', error);
    res.status(500).json({ success: false, message: 'Gagal kirim ulang WA', error: error.message });
  }
}

module.exports = {
  previewGizi,
  createPenimbangan,
  getRiwayatAnak,
  resendWA,
};
