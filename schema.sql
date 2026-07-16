-- Enable constraints and use database (checked/created in runner script)
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Patients Table
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` VARCHAR(50) PRIMARY KEY,
  `rmNumber` VARCHAR(20) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `nik` VARCHAR(20) NOT NULL,
  `birthDate` DATE NOT NULL,
  `gender` ENUM('Laki-laki', 'Perempuan', 'Tidak Dapat Diketahui', 'Tidak Dapat Ditentukan', 'Tidak Dapat Diisi') NOT NULL,
  `insurance` ENUM('BPJS Kesehatan', 'Asuransi Swasta', 'Mandiri / Umum') NOT NULL,
  `clinic` ENUM('Poli Umum', 'Poli Penyakit Dalam', 'Poli Bedah Umum') NOT NULL,
  `age` INT NOT NULL,
  `status` ENUM('Antre', 'Dipanggil', 'Sudah Diperiksa', 'Selesai Koding', 'Selesai Pelayanan') NOT NULL DEFAULT 'Antre',
  `createdAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. SOAPs Table
DROP TABLE IF EXISTS `soaps`;
CREATE TABLE `soaps` (
  `patientId` VARCHAR(50) PRIMARY KEY,
  `patientRm` VARCHAR(20) NOT NULL,
  `patientName` VARCHAR(100) NOT NULL,
  `td` VARCHAR(20) NOT NULL,
  `nadi` VARCHAR(20) NOT NULL,
  `suhu` VARCHAR(20) NOT NULL,
  `subjektif` TEXT NOT NULL,
  `objektif` TEXT NOT NULL,
  `asesmen` TEXT NOT NULL,
  `plan` TEXT NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `updatedBy` VARCHAR(100) NOT NULL,
  CONSTRAINT `fk_soaps_patient` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Kodings Table
DROP TABLE IF EXISTS `kodings`;
CREATE TABLE `kodings` (
  `patientId` VARCHAR(50) PRIMARY KEY,
  `patientRm` VARCHAR(20) NOT NULL,
  `patientName` VARCHAR(100) NOT NULL,
  `primaryCode` VARCHAR(20) NOT NULL,
  `primaryDescription` VARCHAR(255) NOT NULL,
  `secondaryCode` VARCHAR(20),
  `secondaryDescription` VARCHAR(255),
  `alertMessage` TEXT,
  `isValid` TINYINT(1) NOT NULL DEFAULT 1,
  `updatedAt` DATETIME NOT NULL,
  `updatedBy` VARCHAR(100) NOT NULL,
  CONSTRAINT `fk_kodings_patient` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Berkas (Hybrid Archiving) Table
DROP TABLE IF EXISTS `berkas`;
CREATE TABLE `berkas` (
  `patientId` VARCHAR(50) PRIMARY KEY,
  `rmNumber` VARCHAR(20) NOT NULL,
  `patientName` VARCHAR(100) NOT NULL,
  `rakCode` VARCHAR(50) NOT NULL,
  `isLengkap` TINYINT(1) NOT NULL DEFAULT 0,
  `checklist_identity` TINYINT(1) NOT NULL DEFAULT 0,
  `checklist_informedConsent` TINYINT(1) NOT NULL DEFAULT 0,
  `checklist_soap` TINYINT(1) NOT NULL DEFAULT 0,
  `checklist_coding` TINYINT(1) NOT NULL DEFAULT 0,
  `isScanPdf` TINYINT(1) NOT NULL DEFAULT 0,
  `pdfFileName` VARCHAR(255) DEFAULT NULL,
  `pdfDataUrl` LONGTEXT DEFAULT NULL,
  `uploadedSlots` JSON DEFAULT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_berkas_patient` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Audit Logs Table
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` DATETIME NOT NULL,
  `user` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. CPPT / Clinical Notes History Table
DROP TABLE IF EXISTS `cppt_records`;
CREATE TABLE `cppt_records` (
  `id` VARCHAR(100) PRIMARY KEY,
  `patientId` VARCHAR(50) NOT NULL,
  `no` INT NOT NULL DEFAULT 1,
  `tanggal` VARCHAR(20) NOT NULL,
  `jam` VARCHAR(10) NOT NULL,
  `profesi` VARCHAR(100) NOT NULL,
  `petugas` VARCHAR(100) NOT NULL,
  `subjektif` TEXT,
  `objektif` TEXT,
  `asesmen` TEXT,
  `plan` TEXT,
  `td` VARCHAR(20),
  `nadi` VARCHAR(20),
  `suhu` VARCHAR(20),
  CONSTRAINT `fk_cppt_patient` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable constraints
SET FOREIGN_KEY_CHECKS = 1;


-- ==================================================
-- SEED DATA (DATA AWAL)
-- ==================================================

-- Seed Patients
INSERT INTO `patients` (`id`, `rmNumber`, `name`, `nik`, `birthDate`, `gender`, `insurance`, `clinic`, `age`, `status`, `createdAt`) VALUES
('PAT-1', 'RM-0001', 'Andi Hermawan', '3171012304900001', '1990-04-23', 'Laki-laki', 'BPJS Kesehatan', 'Poli Bedah Umum', 36, 'Dipanggil', '2026-07-06 20:00:00'),
('PAT-2', 'RM-0002', 'Siti Rahmawati', '3201025511850002', '1985-11-15', 'Perempuan', 'Mandiri / Umum', 'Poli Penyakit Dalam', 40, 'Selesai Koding', '2026-07-06 20:05:00'),
('PAT-3', 'RM-0003', 'Budi Santoso', '3374031201720003', '1972-01-12', 'Laki-laki', 'Asuransi Swasta', 'Poli Umum', 54, 'Antre', '2026-07-06 20:10:00'),
('PAT-4', 'RM-0004', 'Rini Anggraini', '3174094506950004', '1995-06-05', 'Perempuan', 'BPJS Kesehatan', 'Poli Umum', 31, 'Antre', '2026-07-06 20:15:00');

-- Seed SOAPs
INSERT INTO `soaps` (`patientId`, `patientRm`, `patientName`, `td`, `nadi`, `suhu`, `subjektif`, `objektif`, `asesmen`, `plan`, `updatedAt`, `updatedBy`) VALUES
('PAT-2', 'RM-0002', 'Siti Rahmawati', '135/85', '88', '38.2', 
'Pasien datang dengan keluhan mual muntah hebat sejak 2 hari, disertai nyeri hebat di perut bagian kanan atas menjalar hingga ke punggung. Badan terasa meriang dan demam.', 
'KU sedang, komposmentis. TD 135/85 mmHg, Nadi 88x/mnt, S 38.2 C. Pemeriksaan abdomen: nyeri tekan kuadran kanan atas (+), Murphy sign (+).', 
'Suspect Kolesistitis Akut / Batu Empedu Akut (K80.2), DD gastritis kronis.', 
'Rawat inap, puasakan 6 jam, pasang infus RL 20 tpm, injeksi ketorolak 30mg (anti-nyeri), USG abdomen cito, cek darah lengkap.', 
'2026-07-06 20:20:00', 'Dr. Ahmad Fauzi');

-- Seed Kodings
INSERT INTO `kodings` (`patientId`, `patientRm`, `patientName`, `primaryCode`, `primaryDescription`, `secondaryCode`, `secondaryDescription`, `alertMessage`, `isValid`, `updatedAt`, `updatedBy`) VALUES
('PAT-2', 'RM-0002', 'Siti Rahmawati', 'K80.2', 'Kolesistitis Akut / Batu Empedu Akut (K80.2)', 'K29.5', 'Gastritis Kronis (Chronic Gastritis)', NULL, 1, '2026-07-06 20:25:00', 'Sistem SIMRS');

-- Seed Berkas
INSERT INTO `berkas` (`patientId`, `rmNumber`, `patientName`, `rakCode`, `isLengkap`, `checklist_identity`, `checklist_informedConsent`, `checklist_soap`, `checklist_coding`, `isScanPdf`, `pdfFileName`, `pdfDataUrl`, `uploadedSlots`, `updatedAt`) VALUES
('PAT-1', 'RM-0001', 'Andi Hermawan', 'RAK-B-102', 0, 1, 1, 0, 0, 0, NULL, NULL, NULL, '2026-07-06 20:00:00'),
('PAT-2', 'RM-0002', 'Siti Rahmawati', 'RAK-C-405', 1, 1, 1, 1, 1, 1, 'RME_SITI_RAHMAWATI.pdf', 'data:application/pdf,base64,JVBERi0xLjQK...', '{}', '2026-07-06 20:25:00'),
('PAT-3', 'RM-0003', 'Budi Santoso', 'RAK-A-720', 0, 1, 0, 0, 0, 0, NULL, NULL, NULL, '2026-07-06 20:10:00'),
('PAT-4', 'RM-0004', 'Rini Anggraini', 'RAK-E-311', 0, 1, 0, 0, 0, 0, NULL, NULL, NULL, '2026-07-06 20:15:00');

-- Seed Audit Logs
INSERT INTO `audit_logs` (`id`, `timestamp`, `user`, `role`, `action`, `module`, `details`) VALUES
('LOG-INIT', '2026-07-06 20:00:00', 'Sistem SIMRS', 'Kepala RMIK', 'Inisialisasi Sistem', 'Sistem', 'Sistem Symphony SIMRS v2.0 berhasil diaktifkan dengan database MySQL.');
