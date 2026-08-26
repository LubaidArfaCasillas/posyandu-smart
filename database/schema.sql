-- =======================================================
-- POSYANDUSMART DATABASE SCHEMA
-- Platform Digitalisasi KMS & Deteksi Dini Stunting
-- =======================================================

CREATE DATABASE IF NOT EXISTS `posyandu_smart` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `posyandu_smart`;

-- -------------------------------------------------------
-- 1. Tabel Posyandu / Wilayah Kerja
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `posyandu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_posyandu` VARCHAR(100) NOT NULL,
  `desa_kelurahan` VARCHAR(100) NOT NULL,
  `kecamatan` VARCHAR(100) NOT NULL,
  `kota_kabupaten` VARCHAR(100) NOT NULL DEFAULT 'Kota/Kabupaten Setempat',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 2. Tabel Users (Kader & Admin Puskesmas)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` ENUM('kader', 'admin_puskesmas') NOT NULL DEFAULT 'kader',
  `posyandu_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 3. Tabel Anak / Balita
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `anak` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik` VARCHAR(20) NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `tgl_lahir` DATE NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `nama_ortu` VARCHAR(100) NOT NULL,
  `no_wa` VARCHAR(20) NOT NULL,
  `alamat` TEXT NULL,
  `posyandu_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`posyandu_id`) REFERENCES `posyandu`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 4. Tabel Penimbangan & Hasil Pengukuran
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `penimbangan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `anak_id` INT NOT NULL,
  `tgl_timbang` DATE NOT NULL,
  `usia_bulan` INT NOT NULL,
  `berat_badan` DECIMAL(5,2) NOT NULL COMMENT 'kg',
  `tinggi_badan` DECIMAL(5,2) NOT NULL COMMENT 'cm',
  `lingkar_kepala` DECIMAL(5,2) NULL COMMENT 'cm',
  `status_bb_u` VARCHAR(50) NULL COMMENT 'Berat Badan menurut Usia (Gizi Kurang/Normal/Lebih)',
  `status_tb_u` VARCHAR(50) NULL COMMENT 'Tinggi Badan menurut Usia (Sangat Pendek/Pendek/Normal/Tinggi)',
  `status_bb_tb` VARCHAR(50) NULL COMMENT 'BB menurut TB (Gizi Buruk/Kurang/Normal/Beresiko/Obesitas)',
  `status_gizi` VARCHAR(50) NOT NULL COMMENT 'Kesimpulan: Normal / Berisiko Stunting / Stunting / Gizi Kurang',
  `status_wa` ENUM('pending', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  `wa_response` TEXT NULL,
  `catatan` TEXT NULL,
  `petugas_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`anak_id`) REFERENCES `anak`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`petugas_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- SEED DATA AWAL (Sample Data untuk Pengujian)
-- -------------------------------------------------------
INSERT INTO `posyandu` (`id`, `nama_posyandu`, `desa_kelurahan`, `kecamatan`, `kota_kabupaten`) VALUES
(1, 'Posyandu Melati 01', 'Sukamaju', 'Cilodong', 'Depok'),
(2, 'Posyandu Mawar 03', 'Mekarjaya', 'Sukmajaya', 'Depok')
ON DUPLICATE KEY UPDATE `nama_posyandu` = VALUES(`nama_posyandu`);

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`, `posyandu_id`) VALUES
(1, 'kader1', '123456', 'Ibu Siti Rahmawati', 'kader', 1),
(2, 'admin', 'admin123', 'dr. Budi Santoso (Puskesmas)', 'admin_puskesmas', NULL)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

INSERT INTO `anak` (`id`, `nik`, `nama`, `tgl_lahir`, `jenis_kelamin`, `nama_ortu`, `no_wa`, `alamat`, `posyandu_id`) VALUES
(1, '3276012301220001', 'Muhammad Rizky Pratama', '2024-02-15', 'L', 'Ahmad Fadillah', '081234567890', 'Jl. Kenanga No. 12, RT 02/RW 04', 1),
(2, '3276012301220002', 'Aisyah Putri Azzahra', '2023-08-10', 'P', 'Rina Wulandari', '089876543210', 'Jl. Mawar No. 05, RT 01/RW 03', 1)
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

INSERT INTO `penimbangan` (`id`, `anak_id`, `tgl_timbang`, `usia_bulan`, `berat_badan`, `tinggi_badan`, `lingkar_kepala`, `status_bb_u`, `status_tb_u`, `status_bb_tb`, `status_gizi`, `status_wa`, `catatan`, `petugas_id`) VALUES
(1, 1, '2024-08-15', 6, 7.80, 67.50, 43.00, 'Normal (Gizi Baik)', 'Normal', 'Normal', 'Gizi Baik (Normal)', 'sent', 'Tumbuh kembang sangat baik, lanjutkan ASI & MPASI.', 1),
(2, 2, '2024-08-15', 12, 8.20, 71.00, 44.50, 'Kurang', 'Pendek (Stunting)', 'Gizi Kurang', 'Berisiko Stunting', 'sent', 'Perlu evaluasi asupan protein hewani & konsultasi bidan.', 1)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);
