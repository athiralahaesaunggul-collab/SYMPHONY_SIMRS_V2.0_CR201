<?php
/**
 * API Rekam Medis - Symphony SIMRS v2.0
 * Menerima POST request JSON dari React dan menyimpan ke MySQL
 */

// === CORS Headers ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan. Gunakan POST."]);
    http_response_code(405);
    exit();
}

// Include koneksi database
require_once __DIR__ . '/koneksi.php';

// Baca body JSON dari React
$raw_body = file_get_contents("php://input");
$data = json_decode($raw_body, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Data JSON tidak valid atau kosong."]);
    http_response_code(400);
    exit();
}

// Ambil dan sanitasi field-field yang dikirim dari React
$no_rm       = mysqli_real_escape_string($koneksi, trim($data['no_rm'] ?? ''));
$nama        = mysqli_real_escape_string($koneksi, trim($data['nama'] ?? ''));
$jenis_kelamin = mysqli_real_escape_string($koneksi, trim($data['jenis_kelamin'] ?? ''));
$tanggal     = mysqli_real_escape_string($koneksi, trim($data['tanggal'] ?? date('Y-m-d')));
$jenis_layanan = mysqli_real_escape_string($koneksi, trim($data['jenis_layanan'] ?? ''));
$poli_ruangan = mysqli_real_escape_string($koneksi, trim($data['poli_ruangan'] ?? ''));
$dokter_dpjp = mysqli_real_escape_string($koneksi, trim($data['dokter_dpjp'] ?? ''));
$sip         = mysqli_real_escape_string($koneksi, trim($data['sip'] ?? ''));

// Validasi field wajib
if (empty($no_rm) || empty($nama) || empty($jenis_kelamin)) {
    echo json_encode(["status" => "error", "message" => "Field wajib tidak lengkap: no_rm, nama, dan jenis_kelamin harus diisi."]);
    http_response_code(422);
    exit();
}

// Query INSERT ke tabel rekam_medis
$sql = "INSERT INTO `rekam_medis` 
    (`no_rm`, `nama`, `jenis_kelamin`, `tanggal`, `jenis_layanan`, `poli_ruangan`, `dokter_dpjp`, `sip`) 
    VALUES 
    ('$no_rm', '$nama', '$jenis_kelamin', '$tanggal', '$jenis_layanan', '$poli_ruangan', '$dokter_dpjp', '$sip')";

if (mysqli_query($koneksi, $sql)) {
    $insert_id = mysqli_insert_id($koneksi);
    echo json_encode([
        "status"    => "success",
        "message"   => "Data Pasien Berhasil Disimpan ke Database MySQL XAMPP!",
        "insert_id" => $insert_id,
        "no_rm"     => $no_rm,
        "nama"      => $nama
    ]);
    http_response_code(200);
} else {
    echo json_encode([
        "status"  => "error",
        "message" => "Gagal menyimpan data ke database: " . mysqli_error($koneksi)
    ]);
    http_response_code(500);
}

mysqli_close($koneksi);
?>
