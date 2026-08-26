# 📋 Konsep Proyek: PosyanduSmart
### Platform Digitalisasi KMS & Deteksi Dini Stunting

---

## 1. Apa Itu PosyanduSmart?

Selama ini, kader Posyandu mencatat hasil timbang badan/tinggi anak balita secara **manual di buku KMS (Kartu Menuju Sehat)**. Cara ini punya beberapa masalah:

- Sulit mendeteksi lebih awal apakah anak berisiko **stunting**
- Orang tua sering tidak tahu hasil pengukuran anaknya secara cepat
- Puskesmas kesulitan merekap laporan bulanan dari banyak posyandu

**PosyanduSmart** **adalah aplikasi web sederhana yang mengubah proses ini jadi digital:
kader tinggal input berat & tinggi anak → sistem **otomatis menghitung status gizi** anak berdasarkan standar WHO → hasilnya **otomatis dikirim ke WhatsApp orang tua**.

---

## 2. Kenapa Proyek Ini Penting?

Stunting (anak pendek karena kurang gizi kronis) adalah masalah nasional. Deteksi dini adalah kunci utamanya — semakin cepat orang tua tahu, semakin cepat bisa ditangani. Proyek kalian bukan sekadar tugas sekolah, tapi solusi yang benar-benar bisa dipakai posyandu sungguhan. 💪

---

## 3. Siapa yang Akan Memakai Aplikasi Ini?

| Pengguna | Kebutuhan Utama |
|---|---|
| 👩‍⚕️ **Kader Posyandu** | Tampilan super simpel, tombol besar, tetap bisa dipakai walau sinyal internet lemah |
| 👨‍👩‍👧 **Orang Tua Balita** | Cukup terima info hasil timbang lewat WhatsApp, tidak perlu install apa-apa |
| 🏥 **Puskesmas / Admin** | Dashboard untuk melihat data semua posyandu + bisa unduh laporan bulanan |

---

## 4. Bagaimana Alur Kerjanya? (Gambaran Sederhana)

```
Kader ukur berat & tinggi anak
        │
        ▼
Kader input data lewat HP (di aplikasi)
        │
        ▼
Sistem hitung otomatis: "Anak ini normal / berisiko stunting?"
        │
        ▼
Data tersimpan + WhatsApp otomatis terkirim ke orang tua
        │
        ▼
Puskesmas bisa lihat rekap semua data lewat dashboard
```

Sesederhana itu konsepnya — tapi di baliknya ada 3 bagian teknis yang perlu dibangun: **tampilan aplikasi**, **otak penghitung status gizi**, dan **jembatan ke WhatsApp**.

---

## 5. Fitur Utama yang Akan Dibangun

**Untuk Kader:**
- Login sederhana
- Form tambah data anak & orang tua
- Form input hasil timbang (tombol besar, mudah dipakai)
- Riwayat pertumbuhan tiap anak

**Untuk Orang Tua
- Notifikasi WhatsApp otomatis setelah anak ditimbang
- Isi pesan: berat, tinggi, dan status gizi anak dalam bahasa yang mudah dipahami

**Untuk Puskesmas/Admin:**
- Dashboard grafik pertumbuhan anak
- Statistik jumlah anak stunting per wilayah
- Tombol unduh laporan bulanan

---

## 6. Teknologi yang Akan Dipakai

| Bagian | Teknologi | Kenapa dipilih? |
|---|---|---| 
| Tampilan Aplikasi (Frontend) | React + Tailwind CSS | Ringan, modern, gampang dibuat responsif untuk HP |
| Bisa dipakai offline | PWA (Progressive Web App) | Hemat kuota, bisa dipasang di HP kader seperti aplikasi biasa |
| Otak Sistem (Backend) | Node.js + Express | Menangani logika hitung status gizi & komunikasi data |
| Database | MySQL | Tempat menyimpan semua data anak, timbang, dan standar WHO |
| Kirim WhatsApp | Fonnte / Wablas (WA Gateway) | Layanan API WhatsApp yang terjangkau untuk proyek sekolah |

---

## 7. Pembagian Tim

| Siswa | Peran | Fokus Utama |
|---|---|---|
| **Siswa A** | Frontend & UI/UX | Membangun semua tampilan yang dilihat kader & admin, memastikan aplikasi enak dipakai di HP |
| **Siswa B** | Backend & Database | Membangun "otak" sistem — mulai dari database, rumus hitung status gizi, sampai koneksi ke WhatsApp |

Keduanya **wajib sepakat dulu di awal** soal bentuk data yang dikirim antara tampilan dan otak sistem, supaya saat digabung nanti tidak bentrok.

---

## 8. Garis Besar Waktu Pengerjaan (2 Minggu) ⏱️

> Deadline dipadatkan jadi 2 minggu — artinya rancang & bangun fitur inti digabung di minggu 1, langsung tancap gas.

| Minggu | Fokus |
|---|---|
| 1 (Hari 1–7) | Rancang tampilan & database di 1–2 hari pertama, lalu langsung bangun fitur inti masing-masing (paralel) |
| 2 (Hari 8–14) | Gabungkan Frontend + Backend, uji coba WhatsApp, perbaikan, lalu aplikasi siap dipakai (deploy) |

**Prioritas kalau waktu makin mepet** (urutan yang boleh disederhanakan/ditunda dulu):
1. Fitur export laporan Excel/PDF → bisa menyusul setelah fitur inti jalan
2. Mode offline (PWA) → boleh disederhanakan jadi web biasa yang responsif
3. Statistik dashboard admin → cukup grafik dasar dulu, detail bisa ditambah belakangan

**Yang TIDAK BOLEH dikorbankan:** input penimbangan → hitung status gizi → notifikasi WhatsApp ke orang tua. Ini adalah inti dari PosyanduSmart.

---

## 🎯 Semangat untuk Tim PKL

Proyek ini kalian yang membangun dari nol — mulai dari ide, desain, sampai kode. Kalau ada bagian yang bingung, tanyakan ke mentor kapan saja. Yang penting: **jalan dulu step by step jangan buru-buru sempurna.** Selamat membangun PosyanduSmart! 🚀