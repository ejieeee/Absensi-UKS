-- ==============================================================
-- DATABASE SCHEMA: PRESENSI LATIHAN PMR WIRA SMKN 7 SAMARINDA
-- Struktur Tabel Siap Pakai untuk MySQL / phpMyAdmin (XAMPP / Laragon)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `db_pmr_smkn7` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_pmr_smkn7`;

-- --------------------------------------------------------
-- 1. Tabel Master Anggota (Kelas 10 & Kelas 11)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_anggota` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nisn` VARCHAR(20) NOT NULL UNIQUE,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `jenis_kelamin` ENUM('L','P') NOT NULL DEFAULT 'L',
  `kelas` VARCHAR(30) NOT NULL,             -- Contoh: 'X RPL 1', 'XI TKJ 2'
  `tingkat` ENUM('10','11') NOT NULL,        -- Sesi Kelas 10 atau Sesi Kelas 11
  `no_telepon` VARCHAR(20) DEFAULT '-',
  `status` ENUM('Aktif','Non-Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Tabel Sesi Latihan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_sesi_latihan` (
  `id_sesi` INT(11) NOT NULL AUTO_INCREMENT,
  `tanggal` DATE NOT NULL,
  `tingkat_kelas` ENUM('10','11') NOT NULL,  -- '10' untuk Kelas 10, '11' untuk Kelas 11
  `materi_latihan` VARCHAR(150) DEFAULT 'Latihan Rutin PMR',
  `pembina_pendamping` VARCHAR(100) DEFAULT 'Pembina PMR',
  `catatan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unik_tgl_sesi` (`tanggal`, `tingkat_kelas`),
  PRIMARY KEY (`id_sesi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Tabel Catatan Presensi Kehadiran
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_presensi` (
  `id_presensi` INT(11) NOT NULL AUTO_INCREMENT,
  `id_sesi` INT(11) NOT NULL,
  `id_anggota` INT(11) NOT NULL,
  `status` ENUM('Hadir','Izin','Sakit','Alpa') NOT NULL DEFAULT 'Hadir',
  `jam_absen` VARCHAR(20) DEFAULT '-',
  `keterangan` VARCHAR(255) DEFAULT '',
  `tanda_tangan` LONGTEXT DEFAULT NULL,      -- Gambar Base64 PNG tanda tangan digital siswa
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_presensi`),
  FOREIGN KEY (`id_sesi`) REFERENCES `tb_sesi_latihan`(`id_sesi`) ON DELETE CASCADE,
  FOREIGN KEY (`id_anggota`) REFERENCES `tb_anggota`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- DATA CONTOH AWAL (SEED DATA KELAS 10 & 11)
-- --------------------------------------------------------
INSERT INTO `tb_anggota` (`nisn`, `nama_lengkap`, `jenis_kelamin`, `kelas`, `tingkat`, `no_telepon`, `status`) VALUES
-- Kelas 10
('0091238841', 'Achmad Dhani Saputra', 'L', 'X RPL 1', '10', '0821-9922-3341', 'Aktif'),
('0092347712', 'Zahra Aulia Rahmadhani', 'P', 'X RPL 2', '10', '0851-2299-4411', 'Aktif'),
('0093456723', 'Fathir Maulana Ihsan', 'L', 'X TKJ 1', '10', '0822-7711-4455', 'Aktif'),
('0094567891', 'Naufal Hadi Wijaya', 'L', 'X DKV 1', '10', '0852-8899-1122', 'Aktif'),
('0095678902', 'Keisha Aurellia Maharani', 'P', 'X DKV 2', '10', '0851-4433-2211', 'Aktif'),
('0096789013', 'Cinta Laura Safitri', 'P', 'X AKL 1', '10', '0853-1122-3344', 'Aktif'),
('0097890124', 'Mutia Dewi Kusuma', 'P', 'X RPL 1', '10', '0822-3344-5566', 'Aktif'),
('0098901235', 'Adinda Putri Rahayu', 'P', 'X TKJ 2', '10', '0812-7788-9900', 'Aktif'),
('0099012346', 'Salsabila Firdausi', 'P', 'X DKV 1', '10', '0853-9900-1122', 'Aktif'),
-- Kelas 11
('0081239845', 'Dinda Ayu Lestari', 'P', 'XI RPL 2', '11', '0852-4411-9923', 'Aktif'),
('0082390144', 'Rizky Aditya Pratama', 'L', 'XI TKJ 1', '11', '0813-5002-3490', 'Aktif'),
('0083419087', 'Siti Nurul Hidayah', 'P', 'XI AKL 1', '11', '0822-5531-8840', 'Aktif'),
('0084561234', 'Tiara Melani Putri', 'P', 'XI DKV 2', '11', '0812-5100-7734', 'Aktif'),
('0085671190', 'Dimas Arya Ramadhan', 'L', 'XI RPL 1', '11', '0813-4412-8877', 'Aktif'),
('0086789012', 'Khadijah Al-Zahra', 'P', 'XI AKL 2', '11', '0812-3344-5566', 'Aktif'),
('0087890123', 'Salwa Nabila Firdaus', 'P', 'XI RPL 1', '11', '0813-7766-5544', 'Aktif'),
('0088901235', 'Gilang Ramadhan', 'L', 'XI TKJ 2', '11', '0812-9988-7766', 'Aktif'),
('0089012346', 'Bayu Aji Pamungkas', 'L', 'XI RPL 2', '11', '0813-2233-4455', 'Aktif');
