import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Starting MySQL database migration...');
  
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const dbName = process.env.DB_NAME || 'symphony_simrs_v2.0_cr201';

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port
    });
    console.log('Connected to MySQL server successfully.');
  } catch (error: any) {
    console.error('Failed to connect to MySQL server:', error.message);
    console.error('Hint: Make sure Apache and MySQL modules are started in XAMPP Control Panel.');
    process.exit(1);
  }

  try {
    // 1. Create database if it does not exist
    console.log(`Creating database "${dbName}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" check/creation completed.`);

    // 2. Select the database
    await connection.query(`USE \`${dbName}\``);
    console.log(`Switched to database "${dbName}".`);

    // 3. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading SQL schema from: ${schemaPath}`);
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // 4. Clean comments and split SQL statements by semicolon
    const cleanSql = sqlContent
      .split(/\r?\n/)
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('--') || trimmed.startsWith('#')) {
          return '';
        }
        return line;
      })
      .join('\n');

    const sqlStatements = cleanSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`Found ${sqlStatements.length} SQL statements to execute.`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      try {
        await connection.query(statement);
      } catch (err: any) {
        console.error(`Error executing statement #${i + 1}:`);
        console.error(statement);
        console.error('Error Details:', err.message);
        throw err;
      }
    }

    console.log('==================================================');
    console.log(' Migration completed successfully!');
    console.log(` Database "${dbName}" is initialized and seeded.`);
    console.log('==================================================');
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
