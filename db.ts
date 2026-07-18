import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables dari file .env (untuk development lokal)
// Di Vercel, env vars diinject langsung oleh platform – dotenv tidak diperlukan tapi tidak merusak
dotenv.config();

// ─── Validasi Environment Variables ───────────────────────────────────────────
// Pastikan semua variabel wajib tersedia sebelum pool dibuat.
// Jika ada yang kosong, server langsung crash dengan pesan jelas daripada
// diam-diam terhubung ke host yang salah (misal: localhost).
const REQUIRED_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PORT'] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `[db.ts] Environment variable '${key}' tidak ditemukan. ` +
      `Pastikan sudah diset di Vercel Dashboard > Settings > Environment Variables.`
    );
  }
}

// ─── Buat Connection Pool ──────────────────────────────────────────────────────
// Semua nilai murni dari process.env – tidak ada hardcoded fallback.
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD, // boleh kosong jika memang tidak ada password
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT as string, 10),

  // SSL diperlukan oleh Clever Cloud MySQL (managed cloud database)
  ssl: { rejectUnauthorized: false },

  // Pool settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
