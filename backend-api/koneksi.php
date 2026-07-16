<?php
/**
 * Koneksi Database MySQL XAMPP
 * Symphony SIMRS v2.0
 */

$host = "localhost";
$username = "root";
$password = "";

// 1. Koneksi awal ke server MySQL (tanpa memilih database dulu agar aman)
$koneksi = @mysqli_connect($host, $username, $password);

if (!$koneksi) {
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Gagal terkoneksi ke MySQL Server XAMPP: " . mysqli_connect_error()
    ]);
    exit();
}

// 2. Tentukan database utama dan database cadangan (sesuai instruksi revisi)
$db_utama = "symphony_simrs_v2.0_cr201";
$db_cadangan = "simr_esaunggul";

$db_selected = false;

// Coba select database utama
if (@mysqli_select_db($koneksi, $db_utama)) {
    $db_selected = $db_utama;
} else if (@mysqli_select_db($koneksi, $db_cadangan)) {
    // Coba select database cadangan jika utama gagal
    $db_selected = $db_cadangan;
} else {
    // Jika keduanya tidak ada, coba buat database utama
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS `$db_utama` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    if (mysqli_query($koneksi, $sql_create_db)) {
        if (mysqli_select_db($koneksi, $db_utama)) {
            $db_selected = $db_utama;
        }
    }
}

if (!$db_selected) {
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memilih atau membuat database: $db_utama atau $db_cadangan"
    ]);
    exit();
}

// 3. Buat Tabel rekam_medis secara otomatis jika belum ada
$sql_create_table = "CREATE TABLE IF NOT EXISTS `rekam_medis` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `no_rm` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `jenis_kelamin` VARCHAR(50) NOT NULL,
    `tanggal` DATE NOT NULL,
    `jenis_layanan` VARCHAR(50) NOT NULL,
    `poli_ruangan` VARCHAR(100) NOT NULL,
    `dokter_dpjp` VARCHAR(150) NOT NULL,
    `sip` VARCHAR(100) NOT NULL,
    `keluhan` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!mysqli_query($koneksi, $sql_create_table)) {
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Gagal membuat tabel rekam_medis: " . mysqli_error($koneksi)
    ]);
    exit();
}
?>
