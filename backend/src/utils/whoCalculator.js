/**
 * WHO Child Growth Standards & Kemenkes RI Z-Score Calculator
 * PosyanduSmart - Deteksi Dini Stunting & Status Gizi Balita
 */

// Estimasi median & SD standar WHO untuk anak usia 0-60 bulan (Laki-laki & Perempuan)
// Rumus umum Z-Score: (Nilai_Ukur - Median) / SD

/**
 * Hitung selisih umur dalam bulan dari tanggal lahir ke tanggal timbang
 */
function hitungUsiaBulan(tglLahir, tglTimbang = new Date()) {
  const birth = new Date(tglLahir);
  const check = new Date(tglTimbang);
  let months = (check.getFullYear() - birth.getFullYear()) * 12 + (check.getMonth() - birth.getMonth());
  if (check.getDate() < birth.getDate()) {
    months--;
  }
  return Math.max(0, months);
}

/**
 * Hitung Status Gizi Berdasarkan Standar WHO / Kemenkes
 * @param {string} jenisKelamin - 'L' atau 'P'
 * @param {number} usiaBulan - Usia balita dalam bulan (0-60)
 * @param {number} beratKg - Berat badan dalam kg
 * @param {number} tinggiCm - Tinggi badan dalam cm
 */
function hitungStatusGizi(jenisKelamin, usiaBulan, beratKg, tinggiCm) {
  const jk = (jenisKelamin || 'L').toUpperCase();
  const usia = Math.max(0, parseInt(usiaBulan, 10) || 0);
  const bb = parseFloat(beratKg) || 0;
  const tb = parseFloat(tinggiCm) || 0;

  // 1. Perkiraan Standar WHO Tinggi Badan menurut Umur (TB/U)
  // Referensi median TB anak (cm)
  let medianTB = jk === 'L' ? 50.0 + usia * 0.9 : 49.5 + usia * 0.88;
  if (usia > 24) {
    medianTB = jk === 'L' ? 87.0 + (usia - 24) * 0.6 : 86.0 + (usia - 24) * 0.58;
  }
  const sdTB = 3.2 + usia * 0.04;
  const zScoreTB = (tb - medianTB) / sdTB;

  let statusTBU = 'Normal';
  let isStunting = false;
  if (zScoreTB < -3) {
    statusTBU = 'Sangat Pendek (Severely Stunted)';
    isStunting = true;
  } else if (zScoreTB < -2) {
    statusTBU = 'Pendek (Stunted)';
    isStunting = true;
  } else if (zScoreTB > 3) {
    statusTBU = 'Tinggi';
  } else {
    statusTBU = 'Normal';
  }

  // 2. Perkiraan Standar WHO Berat Badan menurut Umur (BB/U)
  let medianBB = jk === 'L' ? 3.3 + usia * 0.55 : 3.2 + usia * 0.52;
  if (usia > 24) {
    medianBB = jk === 'L' ? 12.2 + (usia - 24) * 0.22 : 11.5 + (usia - 24) * 0.21;
  }
  const sdBB = 0.8 + usia * 0.035;
  const zScoreBB = (bb - medianBB) / sdBB;

  let statusBBU = 'Berat Badan Normal';
  if (zScoreBB < -3) {
    statusBBU = 'Berat Badan Sangat Kurang';
  } else if (zScoreBB < -2) {
    statusBBU = 'Berat Badan Kurang';
  } else if (zScoreBB > 1) {
    statusBBU = 'Risiko Berat Badan Lebih';
  } else {
    statusBBU = 'Berat Badan Normal';
  }

  // 3. Perkiraan Standar WHO Berat Badan menurut Tinggi Badan (BB/TB - Wasting)
  // Ideal BB untuk tinggi tertentu (estimasi kurva WHO)
  const idealBB = (tb - 45) * 0.25 + 3.0;
  const sdBBTB = 1.2;
  const zScoreBBTB = (bb - idealBB) / sdBBTB;

  let statusBBTB = 'Gizi Baik (Normal)';
  if (zScoreBBTB < -3) {
    statusBBTB = 'Gizi Buruk (Severely Wasted)';
  } else if (zScoreBBTB < -2) {
    statusBBTB = 'Gizi Kurang (Wasted)';
  } else if (zScoreBBTB > 3) {
    statusBBTB = 'Obesitas';
  } else if (zScoreBBTB > 2) {
    statusBBTB = 'Gizi Lebih (Overweight)';
  } else if (zScoreBBTB > 1) {
    statusBBTB = 'Berisiko Gizi Lebih';
  } else {
    statusBBTB = 'Gizi Baik (Normal)';
  }

  // Kesimpulan Utama untuk Kader & Ortu
  let kesimpulan = 'Gizi Baik (Normal)';
  let saran = 'Tumbuh kembang anak baik. Pertahankan asupan makanan bergizi seimbang dan ASI/MPASI rutin.';
  let badgeColor = 'green';

  if (isStunting) {
    kesimpulan = zScoreTB < -3 ? 'Stunting Berat (Perlu Rujukan)' : 'Berisiko Stunting';
    saran = 'Tinggi badan anak di bawah garis standar. Perbanyak asupan protein hewani (telur, ikan, daging), zat besi, dan konsultasikan ke Bidan/Puskesmas.';
    badgeColor = 'red';
  } else if (zScoreBB < -2 || zScoreBBTB < -2) {
    kesimpulan = 'Gizi Kurang';
    saran = 'Berat badan anak perlu ditingkatkan. Berikan makanan padat gizi, porsi kecil tapi sering, serta pantau kenaikan BB bulan depan.';
    badgeColor = 'yellow';
  } else if (zScoreBBTB > 2) {
    kesimpulan = 'Gizi Lebih / Risiko Obesitas';
    saran = 'Batasi makanan manis dan camilan berlemak. Ajak anak lebih aktif bergerak.';
    badgeColor = 'purple';
  }

  return {
    usiaBulan: usia,
    zScore: {
      bb_u: parseFloat(zScoreBB.toFixed(2)),
      tb_u: parseFloat(zScoreTB.toFixed(2)),
      bb_tb: parseFloat(zScoreBBTB.toFixed(2)),
    },
    status_bb_u: statusBBU,
    status_tb_u: statusTBU,
    status_bb_tb: statusBBTB,
    status_gizi: kesimpulan,
    is_stunting: isStunting,
    saran: saran,
    badgeColor: badgeColor,
  };
}

module.exports = {
  hitungUsiaBulan,
  hitungStatusGizi,
};
