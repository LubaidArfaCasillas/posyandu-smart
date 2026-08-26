const axios = require('axios');

/**
 * Format nomor WhatsApp ke format Indonesia (628xxx)
 */
function formatNoWA(nomor) {
  if (!nomor) return '';
  let clean = nomor.toString().replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  }
  return clean;
}

/**
 * Buat template pesan WhatsApp hasil timbang
 */
function buatPesanKMS(data) {
  const { namaAnak, usiaBulan, berat, tinggi, statusGizi, saran, tglTimbang, namaPosyandu } = data;
  
  return `📢 *HASIL PENIMBANGAN POSYANDUSMART* 📢
━━━━━━━━━━━━━━━━━━━━
Halo Ayah / Bunda! Berikut adalah hasil penimbangan balita Anda:

👶 *Nama Balita:* ${namaAnak}
📅 *Tanggal Timbang:* ${tglTimbang || new Date().toLocaleDateString('id-ID')}
⏳ *Usia:* ${usiaBulan} Bulan
🏢 *Posyandu:* ${namaPosyandu || 'Posyandu'}

📊 *Hasil Pengukuran:*
⚖️ Berat Badan : *${berat} kg*
📏 Tinggi Badan: *${tinggi} cm*
🩺 Status Gizi : *${statusGizi}*

💡 *Catatan & Saran Kader:*
_${saran || 'Jaga terus asupan gizi seimbang si kecil!'}_

━━━━━━━━━━━━━━━━━━━━
_PosyanduSmart - Bersama Kita Cegah Stunting Demi Masa Depan Anak Indonesia._`;
}

/**
 * Kirim pesan WhatsApp menggunakan Fonnte API
 */
async function kirimNotifikasiWA(noWA, pesanData) {
  const token = process.env.FONNTE_TOKEN;
  const target = formatNoWA(noWA);
  const message = buatPesanKMS(pesanData);

  // Jika token belum disetting, jalankan mode simulasi (Development friendly)
  if (!token || token === 'YOUR_FONNTE_TOKEN_HERE') {
    console.log('\n📲 [WA SIMULASI] Pesan WhatsApp Berhasil Dibuat (Mode Offline/Dev):');
    console.log('Target:', target);
    console.log('--------------------------------------------------');
    console.log(message);
    console.log('--------------------------------------------------\n');
    return {
      success: true,
      mode: 'simulation',
      message: 'Pesan berhasil disimulasikan di console (Fonnte token belum diset)',
    };
  }

  try {
    const response = await axios.post(
      'https://api.fonnte.com/send',
      {
        target: target,
        message: message,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return {
      success: true,
      mode: 'live',
      data: response.data,
    };
  } catch (error) {
    console.error('❌ [WA Error] Gagal kirim pesan via Fonnte:', error.response?.data || error.message);
    return {
      success: false,
      mode: 'live',
      error: error.response?.data || error.message,
    };
  }
}

module.exports = {
  formatNoWA,
  buatPesanKMS,
  kirimNotifikasiWA,
};
