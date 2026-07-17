import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'symphony_simrs_v2.0_cr201',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Set MySQL global max_allowed_packet to 128MB on startup to allow large PDF/image uploads
pool.query('SET GLOBAL max_allowed_packet = 134217728')
  .then(() => console.log('Successfully set MySQL GLOBAL max_allowed_packet to 128MB'))
  .catch(err => console.error('Failed to set GLOBAL max_allowed_packet:', err.message));

export default pool;
