/**
 * PosyanduSmart - Core Application Logic
 * Standar Antropometri WHO & Kemenkes RI
 */

// ==========================================
// 1. Data Standar Pertumbuhan WHO (Median & SD)
// ==========================================
// Rentang usia 0-24 bulan (Bulan: [Median_TB_L, SD_TB_L, Median_TB_P, SD_TB_P, Median_BB_L, SD_BB_L, Median_BB_P, SD_BB_P])
const WHO_DATA = {
  0:  { tb_l: 49.9, sd_tb_l: 1.9, tb_p: 49.1, sd_tb_p: 1.9, bb_l: 3.3, sd_bb_l: 0.5, bb_p: 3.2, sd_bb_p: 0.5 },
  3:  { tb_l: 61.4, sd_tb_l: 2.2, tb_p: 59.8, sd_tb_p: 2.2, bb_l: 6.4, sd_bb_l: 0.8, bb_p: 5.8, sd_bb_p: 0.7 },
  6:  { tb_l: 67.6, sd_tb_l: 2.4, tb_p: 65.7, sd_tb_p: 2.4, bb_l: 7.9, sd_bb_l: 0.9, bb_p: 7.3, sd_bb_p: 0.8 },
  9:  { tb_l: 72.0, sd_tb_l: 2.5, tb_p: 70.1, sd_tb_p: 2.5, bb_l: 8.9, sd_bb_l: 1.0, bb_p: 8.2, sd_bb_p: 0.9 },
  12: { tb_l: 75.7, sd_tb_l: 2.6, tb_p: 74.0, sd_tb_p: 2.6, bb_l: 9.6, sd_bb_l: 1.0, bb_p: 8.9, sd_bb_p: 1.0 },
  14: { tb_l: 78.0, sd_tb_l: 2.7, tb_p: 76.4, sd_tb_p: 2.7, bb_l: 10.1, sd_bb_l: 1.1, bb_p: 9.4, sd_bb_p: 1.0 },
  18: { tb_l: 82.3, sd_tb_l: 2.9, tb_p: 80.7, sd_tb_p: 2.9, bb_l: 10.9, sd_bb_l: 1.2, bb_p: 10.2, sd_bb_p: 1.1 },
  24: { tb_l: 87.8, sd_tb_l: 3.2, tb_p: 86.4, sd_tb_p: 3.2, bb_l: 12.2, sd_bb_l: 1.4, bb_p: 11.5, sd_bb_p: 1.3 },
  36: { tb_l: 96.1, sd_tb_l: 3.6, tb_p: 95.1, sd_tb_p: 3.6, bb_l: 14.3, sd_bb_l: 1.7, bb_p: 13.9, sd_bb_p: 1.6 },
  48: { tb_l: 103.3, sd_tb_l: 4.0, tb_p: 102.7, sd_tb_p: 4.0, bb_l: 16.3, sd_bb_l: 2.0, bb_p: 16.1, sd_bb_p: 2.0 },
  60: { tb_l: 110.0, sd_tb_l: 4.4, tb_p: 109.4, sd_tb_p: 4.4, bb_l: 18.3, sd_bb_l: 2.4, bb_p: 18.2, sd_bb_p: 2.4 }
};

// Interpolasi nilai WHO untuk bulan arbitrary 0-60
function getWHOStandard(ageMonth, gender) {
  const ages = Object.keys(WHO_DATA).map(Number).sort((a,b) => a - b);
  let lowerAge = ages[0];
  let upperAge = ages[ages.length - 1];

  for (let i = 0; i < ages.length - 1; i++) {
    if (ageMonth >= ages[i] && ageMonth <= ages[i+1]) {
      lowerAge = ages[i];
      upperAge = ages[i+1];
      break;
    }
  }

  const ratio = lowerAge === upperAge ? 0 : (ageMonth - lowerAge) / (upperAge - lowerAge);
  const isMale = (gender === 'L');

  const lowData = WHO_DATA[lowerAge];
  const upData = WHO_DATA[upperAge];

  const tb_med = isMale 
    ? lowData.tb_l + ratio * (upData.tb_l - lowData.tb_l)
    : lowData.tb_p + ratio * (upData.tb_p - lowData.tb_p);

  const tb_sd = isMale
    ? lowData.sd_tb_l + ratio * (upData.sd_tb_l - lowData.sd_tb_l)
    : lowData.sd_tb_p + ratio * (upData.sd_tb_p - lowData.sd_tb_p);

  const bb_med = isMale
    ? lowData.bb_l + ratio * (upData.bb_l - lowData.bb_l)
    : lowData.bb_p + ratio * (upData.bb_p - lowData.bb_p);

  const bb_sd = isMale
    ? lowData.sd_bb_l + ratio * (upData.sd_bb_l - lowData.sd_bb_l)
    : lowData.sd_bb_p + ratio * (upData.sd_bb_p - lowData.sd_bb_p);

  return { tb_med, tb_sd, bb_med, bb_sd };
}

// ==========================================
// 2. Data Demo Balita Posyandu
// ==========================================
const DEMO_CHILDREN = [
  { name: "Aisyah Putri", gender: "P", age: 14, bb: 9.4, tb: 77.5, phone: "081234567890", date: "24/08/2026" },
  { name: "Muhammad Rayyan", gender: "L", age: 18, bb: 11.2, tb: 83.5, phone: "085712345678", date: "24/08/2026" },
  { name: "Kenzo Alvaro", gender: "L", age: 24, bb: 9.8, tb: 80.0, phone: "081987654321", date: "24/08/2026" },
  { name: "Nadhira Az-Zahra", gender: "P", age: 9, bb: 8.3, tb: 70.5, phone: "082155443322", date: "23/08/2026" },
  { name: "Bima Arya", gender: "L", age: 36, bb: 11.5, tb: 89.2, phone: "087811223344", date: "23/08/2026" }
];

// ==========================================
// 3. State Aplikasi
// ==========================================
let currentGender = 'P';

// ==========================================
// 4. Kalkulator Status Gizi WHO & Stunting
// ==========================================
function calculateNutritionalStatus(name, gender, age, weight, height) {
  const std = getWHOStandard(age, gender);

  // Z-Score TB/U (Tinggi menurut Umur) -> Deteksi Stunting
  const zTBU = (height - std.tb_med) / std.tb_sd;
  
  // Z-Score BB/U (Berat menurut Umur)
  const zBBU = (weight - std.bb_med) / std.bb_sd;

  // Rasio BB/TB
  // Standar ideal BB untuk TB balita
  const idealWeightForHeight = std.bb_med * (height / std.tb_med);
  const zBBTB = (weight - idealWeightForHeight) / (std.bb_sd * 0.9);

  // Evaluasi TB/U (Stunting)
  let statusTBU = { text: "Tinggi Normal", class: "status-normal", code: "normal", advice: "Tinggi badan balita bertumbuh normal dan bebas risiko stunting." };
  if (zTBU < -3.0) {
    statusTBU = { text: "Sangat Pendek (Severely Stunted)", class: "status-danger", code: "severely_stunted", advice: "Perlu rujukan segera ke Dokter / Ahli Gizi Puskesmas untuk evaluasi mendalam." };
  } else if (zTBU < -2.0) {
    statusTBU = { text: "Pendek (Berisiko Stunting)", class: "status-warning", code: "stunted", advice: "Perlu perhatian nutrisi ekstra & konseling pemberian MPASI kaya protein hewani." };
  } else if (zTBU > 3.0) {
    statusTBU = { text: "Tinggi di Atas Rata-rata", class: "status-normal", code: "tall", advice: "Pertumbuhan tinggi badan sangat pesat dan baik." };
  }

  // Evaluasi BB/U
  let statusBBU = { text: "Berat Badan Normal", class: "status-normal", code: "normal", advice: "Berat badan berada dalam rentang ideal usianya." };
  if (zBBU < -3.0) {
    statusBBU = { text: "Berat Badan Sangat Kurang", class: "status-danger", code: "severely_underweight", advice: "Waspada gizi buruk, konsultasikan segera ke Puskesmas." };
  } else if (zBBU < -2.0) {
    statusBBU = { text: "Berat Badan Kurang", class: "status-warning", code: "underweight", advice: "Tingkatkan porsi makanan padat gizi & frekuensi makan." };
  } else if (zBBU > 2.0) {
    statusBBU = { text: "Risiko Berat Lebih", class: "status-warning", code: "overweight", advice: "Perhatikan asupan gula & makanan manis olahan." };
  }

  // Evaluasi BB/TB
  let statusBBTB = { text: "Gizi Baik (Normal)", class: "status-normal", code: "normal", advice: "Proporsi berat seimbang dengan tinggi badan balita." };
  if (zBBTB < -2.0) {
    statusBBTB = { text: "Gizi Kurang (Wasted)", class: "status-warning", code: "wasted", advice: "Perlu tambahan asupan kalori dan protein berkualitas." };
  } else if (zBBTB > 2.0) {
    statusBBTB = { text: "Gizi Lebih (Gemuk)", class: "status-warning", code: "overweight", advice: "Seimbangkan aktivitas fisik bermain dan pola makan sehat." };
  }

  return {
    zTBU: Number(zTBU.toFixed(2)),
    zBBU: Number(zBBU.toFixed(2)),
    zBBTB: Number(zBBTB.toFixed(2)),
    statusTBU,
    statusBBU,
    statusBBTB,
    std
  };
}

// ==========================================
// 5. Update Antarmuka & Simulasi WhatsApp
// ==========================================
function updateUI() {
  const name = document.getElementById('childName').value || 'Balita';
  const age = Math.max(0, Math.min(60, parseInt(document.getElementById('childAge').value) || 0));
  const weight = parseFloat(document.getElementById('childWeight').value) || 0;
  const height = parseFloat(document.getElementById('childHeight').value) || 0;
  const phone = document.getElementById('parentPhone').value || '08xxxxxxxxxx';

  const result = calculateNutritionalStatus(name, currentGender, age, weight, height);

  // Update Status Badges di Form
  const badgeTBU = document.getElementById('badgeTBU');
  const descTBU = document.getElementById('descTBU');
  badgeTBU.className = `ind-badge ${result.statusTBU.class}`;
  badgeTBU.textContent = result.statusTBU.text;
  descTBU.textContent = result.statusTBU.advice;

  const badgeBBU = document.getElementById('badgeBBU');
  const descBBU = document.getElementById('descBBU');
  badgeBBU.className = `ind-badge ${result.statusBBU.class}`;
  badgeBBU.textContent = result.statusBBU.text;
  descBBU.textContent = result.statusBBU.advice;

  const badgeBBTB = document.getElementById('badgeBBTB');
  const descBBTB = document.getElementById('descBBTB');
  badgeBBTB.className = `ind-badge ${result.statusBBTB.class}`;
  badgeBBTB.textContent = result.statusBBTB.text;
  descBBTB.textContent = result.statusBBTB.advice;

  // Format Pesan WhatsApp
  const genderStr = currentGender === 'L' ? 'Laki-laki' : 'Perempuan';
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextDateStr = nextMonth.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Tentukan tag warna WA
  let tbuWaTag = `<span class="wa-tag-green">✅ ${result.statusTBU.text}</span>`;
  if (result.statusTBU.class === 'status-warning') {
    tbuWaTag = `<span class="wa-tag-yellow">⚠️ ${result.statusTBU.text}</span>`;
  } else if (result.statusTBU.class === 'status-danger') {
    tbuWaTag = `<span class="wa-tag-red">🚨 ${result.statusTBU.text}</span>`;
  }

  let giziWaTag = `<span class="wa-tag-green">✅ ${result.statusBBTB.text}</span>`;
  if (result.statusBBTB.class !== 'status-normal') {
    giziWaTag = `<span class="wa-tag-yellow">⚠️ ${result.statusBBTB.text}</span>`;
  }

  let waAdvice = "Pertumbuhan ananda sangat baik! Terus pertahankan asupan gizi seimbang, cukupi protein hewani (telur, ikan, daging, susu), serta jaga kebersihan lingkungan.";
  if (result.statusTBU.code === 'stunted' || result.statusTBU.code === 'severely_stunted') {
    waAdvice = "Tinggi badan ananda di bawah standar usianya. Jangan berkecil hati, kader siap mendampingi pemberian gizi padat protein hewani dan pemantauan berat badan rutin.";
  }

  const waContent = `
    Halo Bapak/Ibu dari Ananda <strong>${name}</strong>! 👋<br><br>
    Berikut laporan hasil penimbangan di Posyandu hari ini:<br>
    📅 <strong>Tanggal:</strong> ${dateStr}<br>
    🎂 <strong>Usia:</strong> ${age} Bulan (${genderStr})<br>
    ⚖️ <strong>Berat Badan:</strong> ${weight} kg<br>
    📏 <strong>Tinggi Badan:</strong> ${height} cm<br><br>
    📊 <strong>STATUS PERTUMBUHAN (WHO):</strong><br>
    • Tinggi / Umur: ${tbuWaTag}<br>
    • Status Gizi: ${giziWaTag}<br><br>
    💡 <strong>Catatan Kader:</strong> ${waAdvice}<br><br>
    🗓️ <em>Jadwal Posyandu Berikutnya: ${nextDateStr}</em>
  `;

  document.getElementById('waMessageContent').innerHTML = waContent;

  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  document.getElementById('waTime').textContent = `${hours}:${minutes}`;

  // Update Caption Grafik
  const chartCaption = document.getElementById('chartCaption');
  if (chartCaption) {
    const zDiff = result.zTBU > 0 ? `+${result.zTBU}` : `${result.zTBU}`;
    let chartZoneDesc = `Zona Normal (${zDiff} SD), berkembang sesuai kurva ideal.`;
    if (result.zTBU < -2.0) {
      chartZoneDesc = `Zona Risiko Stunting (${zDiff} SD), tinggi berada di bawah batas normal.`;
    }
    chartCaption.innerHTML = `
      📌 Posisi ananda <strong>${name}</strong> (${age} bln, ${height} cm) berada di <strong>${chartZoneDesc}</strong>
    `;
  }

  // Gambar ulang grafik
  drawGrowthChart(age, height, currentGender);
}

// ==========================================
// 6. Gambar Grafik Pertumbuhan WHO (Canvas)
// ==========================================
function drawGrowthChart(childAge, childHeight, gender) {
  const canvas = document.getElementById('growthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Bersihkan Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = canvas.width - paddingLeft - paddingRight;
  const chartHeight = canvas.height - paddingTop - paddingBottom;

  // Rentang Sumbu
  const minAge = 0;
  const maxAge = 24; // Fokus grafik 0-24 bulan (Periode Emas 1000 HPK)
  const minTB = 45;
  const maxTB = 95;

  function getX(age) {
    return paddingLeft + (age / maxAge) * chartWidth;
  }

  function getY(tb) {
    return canvas.height - paddingBottom - ((tb - minTB) / (maxTB - minTB)) * chartHeight;
  }

  // Gambar Grid Horizontal
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';

  for (let tb = 50; tb <= 90; tb += 10) {
    const y = getY(tb);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - paddingRight, y);
    ctx.stroke();
    ctx.fillText(`${tb} cm`, paddingLeft - 8, y + 4);
  }

  // Gambar Grid Vertikal (Usia Bulan)
  ctx.textAlign = 'center';
  for (let age = 0; age <= 24; age += 3) {
    const x = getX(age);
    ctx.beginPath();
    ctx.moveTo(x, paddingTop);
    ctx.lineTo(x, canvas.height - paddingBottom);
    ctx.stroke();
    ctx.fillText(`${age} bln`, x, canvas.height - paddingBottom + 18);
  }

  // Sumbu Labels
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Usia Balita (Bulan)', paddingLeft + chartWidth / 2, canvas.height - 8);

  // Fungsi membuat kurva
  function drawCurve(calcFn, strokeColor, lineWidth, isDashed = false) {
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(isDashed ? [4, 4] : []);

    for (let age = 0; age <= 24; age += 1) {
      const std = getWHOStandard(age, gender);
      const val = calcFn(std);
      const x = getX(age);
      const y = getY(val);

      if (age === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 1. Kurva +2 SD (Batas Atas)
  drawCurve(std => std.tb_med + (2 * std.tb_sd), '#38BDF8', 2);

  // 2. Kurva Median WHO (Garis Hijau Tengah)
  drawCurve(std => std.tb_med, '#10B981', 3);

  // 3. Kurva -2 SD (Garis Waspada)
  drawCurve(std => std.tb_med - (2 * std.tb_sd), '#F59E0B', 2);

  // 4. Kurva -3 SD (Garis Stunting)
  drawCurve(std => std.tb_med - (3 * std.tb_sd), '#EF4444', 2.5);

  // 5. Plot Titik Balita Saat Ini
  if (childAge <= maxAge && childHeight >= minTB && childHeight <= maxTB) {
    const childX = getX(childAge);
    const childY = getY(childHeight);

    // Efek Pulsing Glow
    ctx.beginPath();
    ctx.arc(childX, childY, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(childX, childY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tooltip Balita
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${childHeight} cm`, childX, childY - 14);
  }
}

// ==========================================
// 7. Helper & Interaktivitas
// ==========================================
function stepAge(delta) {
  const ageInput = document.getElementById('childAge');
  let currentVal = parseInt(ageInput.value) || 0;
  currentVal = Math.max(0, Math.min(60, currentVal + delta));
  ageInput.value = currentVal;
  updateUI();
}

function showToast(message, icon = '✅') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 8. Render Demo Data Table
// ==========================================
function renderDemoTable() {
  const tbody = document.getElementById('demoTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  DEMO_CHILDREN.forEach((c) => {
    const res = calculateNutritionalStatus(c.name, c.gender, c.age, c.bb, c.tb);
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.gender === 'L' ? '👦 L' : '👧 P'} / ${c.age} Bln</td>
      <td>${c.bb} kg</td>
      <td>${c.tb} cm</td>
      <td><span class="ind-badge ${res.statusTBU.class}">${res.statusTBU.text}</span></td>
      <td><span class="ind-badge ${res.statusBBTB.class}">${res.statusBBTB.text}</span></td>
      <td><span style="color:#15803D; font-size:0.8rem; font-weight:600;">✓ Terkirim</span></td>
      <td>
        <button class="btn-action-table" onclick="loadChildToSimulator('${c.name}', '${c.gender}', ${c.age}, ${c.bb}, ${c.tb}, '${c.phone}')">
          Cek & Analisis
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function loadChildToSimulator(name, gender, age, bb, tb, phone) {
  document.getElementById('childName').value = name;
  document.getElementById('childAge').value = age;
  document.getElementById('childWeight').value = bb;
  document.getElementById('childHeight').value = tb;
  document.getElementById('parentPhone').value = phone.replace(/^0/, '');

  currentGender = gender;
  document.querySelectorAll('.btn-gender').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-gender') === gender);
  });

  updateUI();
  showToast(`Data balita ${name} dimuat ke simulator!`, '👶');

  // Smooth scroll ke form kalkulator
  document.getElementById('kalkulator').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 9. Event Listeners & Inisialisasi
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Input Listeners
  ['childName', 'childAge', 'childWeight', 'childHeight', 'parentPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateUI);
    }
  });

  // Gender Buttons
  document.querySelectorAll('.btn-gender').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-gender').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGender = btn.getAttribute('data-gender');
      updateUI();
    });
  });

  // Tombol Hitung
  document.getElementById('btnCalculate').addEventListener('click', () => {
    updateUI();
    showToast('Status pertumbuhan berhasil diperbarui!', '✨');
  });

  // Tombol Demo Kirim WA
  document.getElementById('btnSendDemoWA').addEventListener('click', () => {
    const name = document.getElementById('childName').value;
    const phone = document.getElementById('parentPhone').value;
    showToast(`Pesan WhatsApp berhasil dikirim ke +62${phone} (${name})!`, '📲');
  });

  // Setup PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('PosyanduSmart Service Worker Terdaftar'))
      .catch(err => console.log('Service Worker Gagal:', err));
  }

  // PWA Install Prompt Banner
  let deferredPrompt;
  const btnInstall = document.getElementById('btnInstallPWA');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstall) {
      btnInstall.style.display = 'inline-flex';
    }
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Terima kasih! PosyanduSmart telah terpasang di HP Anda.', '🎉');
        }
        deferredPrompt = null;
        btnInstall.style.display = 'none';
      }
    });
  }

  // Network Status Monitor
  window.addEventListener('online', () => {
    const badge = document.getElementById('networkStatus');
    badge.innerHTML = `<span class="status-dot"></span><span class="status-text">Online (Siap Offline)</span>`;
    showToast('Koneksi internet kembali aktif.', '🌐');
  });

  window.addEventListener('offline', () => {
    const badge = document.getElementById('networkStatus');
    badge.innerHTML = `<span class="status-dot" style="background:#F59E0B"></span><span class="status-text" style="color:#B45309">Offline (Data Tersimpan Lokal)</span>`;
    showToast('Mode offline aktif. Anda tetap bisa input timbangan!', '📴');
  });

  // Initial Render
  renderDemoTable();
  updateUI();
});
