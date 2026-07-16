-- ============================================================
-- ALTER TABLE: Hapus keluhan, tambah 6 kolom baru 
-- Database: symphony_simrs_v2.0_cr201
-- ============================================================

ALTER TABLE `rekam_medis`
  DROP COLUMN `keluhan`,
  ADD COLUMN `status_pernikahan` VARCHAR(50)  DEFAULT '' AFTER `sip`,
  ADD COLUMN `agama`             VARCHAR(50)  DEFAULT '' AFTER `status_pernikahan`,
  ADD COLUMN `pendidikan`        VARCHAR(50)  DEFAULT '' AFTER `agama`,
  ADD COLUMN `pekerjaan`         VARCHAR(100) DEFAULT '' AFTER `pendidikan`,
  ADD COLUMN `provinsi`          VARCHAR(100) DEFAULT '' AFTER `pekerjaan`,
  ADD COLUMN `kab_kota`          VARCHAR(100) DEFAULT '' AFTER `provinsi`;
