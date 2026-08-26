# 🏥 PosyanduSmart - Platform Digitalisasi KMS & Deteksi Dini Stunting

Proyek PKL: Sistem pencatatan penimbangan balita terintegrasi perhitungan status gizi WHO (deteksi dini stunting) dan notifikasi otomatis via WhatsApp ke orang tua balita.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + PWA
* **Backend**: Node.js + Express.js
* **Database**: MySQL
* **WhatsApp Gateway**: Fonnte API

---

## 🚀 Panduan Setup Cepat untuk Anggota Tim (Clone & Run)

Bagi teman/anggota tim yang baru saja melakukan `git clone` atau `git pull`, ikuti 3 langkah berikut:

### 1. Setup Database MySQL
1. Buka **XAMPP** / **Laragon**, lalu aktifkan **MySQL**.
2. Buka `phpMyAdmin` di browser: `http://localhost/phpmyadmin`
3. Buat database baru bernama `posyandu_smart`.
4. Import file SQL: [database/schema.sql](file:///f:/DOCS/LAC/PKL%20TAHAP%201/POSYAND%20SMART/database/schema.sql) ke dalam database tersebut.

---

### 2. Setup & Jalankan Backend Server
Buka terminal baru di folder proyek:
```bash
cd backend
npm install
npm run dev
```
Server backend akan aktif di `http://localhost:5000`.

*(Catatan: Konfigurasi database ada di file `backend/.env`. Jika MySQL Anda menggunakan password, sesuaikan `DB_PASS` di file tersebut).*

---

### 3. Setup & Jalankan Frontend React
Buka terminal kedua di folder proyek:
```bash
cd frontend
npm install
npm run dev
```
Aplikasi web PosyanduSmart akan otomatis berjalan di `http://localhost:5173`.

---

## 📁 Struktur Folder Proyek

```text
POSYAND SMART/
├── database/                    # Skrip skema database MySQL & sample data
│   └── schema.sql
├── backend/                     # Server API Express.js
│   ├── src/
│   │   ├── config/              # Koneksi MySQL pool
│   │   ├── controllers/         # Logika CRUD Balita, Timbang, Dashboard, Login
│   │   ├── routes/              # Jalur endpoint API (/api/anak, /api/penimbangan, dll)
│   │   └── utils/               # Perhitungan Z-Score WHO & WA Sender
│   ├── .env                     # Variabel environment
│   └── server.js
├── frontend/                    # Aplikasi React + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Navbar, Badge status gizi, dll
│   │   ├── pages/               # Dashboard, FormTimbang, DataAnak, RiwayatKms
│   │   ├── api/                 # Axios HTTP client
│   │   ├── App.jsx
│   │   └── index.css
│   └── public/                  # Aset icon PWA & manifest.json
├── backup_vanilla/              # Arsip kode prototype HTML/CSS/JS lama
└── README.md
```

---

## 👥 Pembagian Tugas Tim
* **Siswa A (Frontend & UI/UX)**: Fokus pada folder `frontend/src/` (Form input kader, tampilan grafik KMS, responsive layout di HP, dan PWA).
* **Siswa B (Backend & Database)**: Fokus pada folder `backend/` dan `database/` (Query database, penyempurnaan batas rumus WHO, dan integrasi token WhatsApp Fonnte).
