import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

// Load environment variables
dotenv.config();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can make requests to this server
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Set JSON payload size limit to handle base64 PDF uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Symphony SIMRS Backend Server is running.',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to test database connectivity
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS connection_test');
    const [tables] = await pool.query('SHOW TABLES');
    res.json({
      status: 'success',
      message: 'Koneksi ke database MySQL lokal berhasil!',
      details: {
        database: process.env.DB_NAME || 'symphony_simrs_v2.0_cr201',
        host: process.env.DB_HOST || 'localhost',
        test_query_result: rows,
        tables_count: Array.isArray(tables) ? tables.length : 0,
        tables: tables
      }
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal melakukan koneksi ke database MySQL.',
      error: error.message || 'Unknown database error'
    });
  }
});

// GET /api/sync - Real-time synchronization equivalent
app.get('/api/sync', async (req: Request, res: Response) => {
  try {
    // 1. Fetch patients (format dates to YYYY-MM-DD or YYYY-MM-DD HH:mm:ss for consistency)
    const [patients] = await pool.query(`
      SELECT 
        id, 
        rmNumber, 
        name, 
        nik, 
        DATE_FORMAT(birthDate, "%Y-%m-%d") as birthDate, 
        gender, 
        insurance, 
        clinic, 
        age, 
        status, 
        DATE_FORMAT(createdAt, "%Y-%m-%d %H:%i:%s") as createdAt 
      FROM patients 
      ORDER BY id ASC
    `);

    // 2. Fetch soaps & map to Record<string, SOAP>
    const [soaps] = await pool.query(`
      SELECT 
        patientId, 
        patientRm, 
        patientName, 
        td, 
        nadi, 
        suhu, 
        subjektif, 
        objektif, 
        asesmen, 
        plan, 
        DATE_FORMAT(updatedAt, "%Y-%m-%d %H:%i:%s") as updatedAt, 
        updatedBy 
      FROM soaps
    `);
    const soapsMap: Record<string, any> = {};
    for (const s of soaps as any[]) {
      soapsMap[s.patientId] = s;
    }

    // 3. Fetch kodings & map to Record<string, Koding>
    const [kodings] = await pool.query(`
      SELECT 
        patientId, 
        patientRm, 
        patientName, 
        primaryCode, 
        primaryDescription, 
        secondaryCode, 
        secondaryDescription, 
        alertMessage, 
        isValid, 
        DATE_FORMAT(updatedAt, "%Y-%m-%d %H:%i:%s") as updatedAt, 
        updatedBy 
      FROM kodings
    `);
    const kodingsMap: Record<string, any> = {};
    for (const k of kodings as any[]) {
      kodingsMap[k.patientId] = {
        ...k,
        isValid: !!k.isValid
      };
    }

    // 4. Fetch berkas & map to Record<string, Berkas>
    const [berkas] = await pool.query(`
      SELECT 
        patientId, 
        rmNumber, 
        patientName, 
        rakCode, 
        isLengkap, 
        checklist_identity, 
        checklist_informedConsent, 
        checklist_soap, 
        checklist_coding, 
        isScanPdf, 
        pdfFileName, 
        pdfDataUrl, 
        uploadedSlots, 
        DATE_FORMAT(updatedAt, "%Y-%m-%d %H:%i:%s") as updatedAt 
      FROM berkas
    `);
    const berkasMap: Record<string, any> = {};
    for (const b of berkas as any[]) {
      berkasMap[b.patientId] = {
        patientId: b.patientId,
        rmNumber: b.rmNumber,
        patientName: b.patientName,
        rakCode: b.rakCode,
        isLengkap: !!b.isLengkap,
        checklist: {
          identity: !!b.checklist_identity,
          informedConsent: !!b.checklist_informedConsent,
          soap: !!b.checklist_soap,
          coding: !!b.checklist_coding,
        },
        isScanPdf: !!b.isScanPdf,
        pdfFileName: b.pdfFileName,
        pdfDataUrl: b.pdfDataUrl,
        uploadedSlots: b.uploadedSlots ? (typeof b.uploadedSlots === 'string' ? JSON.parse(b.uploadedSlots) : b.uploadedSlots) : {},
        updatedAt: b.updatedAt
      };
    }

    // 5. Fetch audit logs
    const [auditLogs] = await pool.query(`
      SELECT 
        id, 
        DATE_FORMAT(timestamp, "%Y-%m-%d %H:%i:%s") as timestamp, 
        user, 
        role, 
        action, 
        module, 
        details 
      FROM audit_logs 
      ORDER BY timestamp DESC
    `);

    // 6. Fetch CPPT records & map to Record<string, CpptHistoryEntry[]>
    let cpptRecordsMap: Record<string, any[]> = {};
    try {
      const [cpptRows] = await pool.query(`
        SELECT 
          id, patientId, no, tanggal, jam, profesi, petugas,
          subjektif, objektif, asesmen, plan, td, nadi, suhu
        FROM cppt_records
        ORDER BY patientId ASC, no ASC
      `);
      for (const c of cpptRows as any[]) {
        if (!cpptRecordsMap[c.patientId]) cpptRecordsMap[c.patientId] = [];
        cpptRecordsMap[c.patientId].push(c);
      }
    } catch (_) {
      // Table may not exist yet (before migration)
      cpptRecordsMap = {};
    }

    res.json({
      status: 'success',
      data: {
        patients,
        soaps: soapsMap,
        kodings: kodingsMap,
        berkas: berkasMap,
        auditLogs,
        cpptRecords: cpptRecordsMap
      }
    });
  } catch (error: any) {
    console.error('Error syncing data:', error);
    res.status(500).json({ status: 'error', message: 'Gagal sinkronisasi data dari MySQL.', error: error.message });
  }
});

// POST /api/patients - Register patient and berkas tracking
app.post('/api/patients', async (req: Request, res: Response) => {
  const { id, rmNumber, name, nik, birthDate, gender, insurance, clinic, age, status, createdAt, berkas } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert patient
    await connection.query(
      'INSERT INTO patients (id, rmNumber, name, nik, birthDate, gender, insurance, clinic, age, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, rmNumber, name, nik, birthDate, gender, insurance, clinic, age, status, createdAt]
    );

    // Insert berkas tracker
    if (berkas) {
      await connection.query(
        'INSERT INTO berkas (patientId, rmNumber, patientName, rakCode, isLengkap, checklist_identity, checklist_informedConsent, checklist_soap, checklist_coding, isScanPdf, pdfFileName, pdfDataUrl, uploadedSlots, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          berkas.patientId,
          berkas.rmNumber,
          berkas.patientName,
          berkas.rakCode,
          berkas.isLengkap ? 1 : 0,
          berkas.checklist.identity ? 1 : 0,
          berkas.checklist.informedConsent ? 1 : 0,
          berkas.checklist.soap ? 1 : 0,
          berkas.checklist.coding ? 1 : 0,
          berkas.isScanPdf ? 1 : 0,
          berkas.pdfFileName,
          berkas.pdfDataUrl,
          JSON.stringify(berkas.uploadedSlots || {}),
          berkas.updatedAt
        ]
      );
    }

    await connection.commit();
    res.json({ status: 'success', message: 'Pasien baru berhasil didaftarkan.' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error registering patient:', error);
    res.status(500).json({ status: 'error', error: error.message });
  } finally {
    connection.release();
  }
});

// PUT /api/patients/:id/status - Update queue status
app.put('/api/patients/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE patients SET status = ? WHERE id = ?', [status, id]);
    res.json({ status: 'success', message: 'Status pasien berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Error updating patient status:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// POST /api/soaps - Insert or Update SOAP/CPPT record
app.post('/api/soaps', async (req: Request, res: Response) => {
  const { patientId, patientRm, patientName, td, nadi, suhu, subjektif, objektif, asesmen, plan, updatedAt, updatedBy } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Save SOAP
    await connection.query(`
      INSERT INTO soaps 
        (patientId, patientRm, patientName, td, nadi, suhu, subjektif, objektif, asesmen, plan, updatedAt, updatedBy) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        patientRm=?, patientName=?, td=?, nadi=?, suhu=?, subjektif=?, objektif=?, asesmen=?, plan=?, updatedAt=?, updatedBy=?
    `, [
      patientId, patientRm, patientName, td, nadi, suhu, subjektif, objektif, asesmen, plan, updatedAt, updatedBy,
      patientRm, patientName, td, nadi, suhu, subjektif, objektif, asesmen, plan, updatedAt, updatedBy
    ]);

    // 2. Move patient status to 'Sudah Diperiksa'
    await connection.query(
      'UPDATE patients SET status = ? WHERE id = ?',
      ['Sudah Diperiksa', patientId]
    );

    // 3. Update checklist_soap to true and check completeness
    const [berkasRows] = await connection.query(
      'SELECT checklist_identity, checklist_informedConsent, checklist_coding FROM berkas WHERE patientId = ?',
      [patientId]
    );
    if ((berkasRows as any[]).length > 0) {
      const b = (berkasRows as any[])[0];
      const isLengkap = (b.checklist_identity && b.checklist_informedConsent && b.checklist_coding) ? 1 : 0;
      await connection.query(
        'UPDATE berkas SET checklist_soap = 1, isLengkap = ?, updatedAt = ? WHERE patientId = ?',
        [isLengkap, updatedAt, patientId]
      );
    }

    await connection.commit();
    res.json({ status: 'success', message: 'SOAP berhasil disimpan dan berkas diperbarui.' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error saving SOAP:', error);
    res.status(500).json({ status: 'error', error: error.message });
  } finally {
    connection.release();
  }
});

// POST /api/kodings - Insert or Update ICD-10 Coding
app.post('/api/kodings', async (req: Request, res: Response) => {
  const { patientId, patientRm, patientName, primaryCode, primaryDescription, secondaryCode, secondaryDescription, alertMessage, isValid, updatedAt, updatedBy } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Save Coding
    await connection.query(`
      INSERT INTO kodings 
        (patientId, patientRm, patientName, primaryCode, primaryDescription, secondaryCode, secondaryDescription, alertMessage, isValid, updatedAt, updatedBy) 
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        patientRm=?, patientName=?, primaryCode=?, primaryDescription=?, secondaryCode=?, secondaryDescription=?, alertMessage=?, isValid=?, updatedAt=?, updatedBy=?
    `, [
      patientId, patientRm, patientName, primaryCode, primaryDescription, secondaryCode, secondaryDescription, alertMessage, isValid ? 1 : 0, updatedAt, updatedBy,
      patientRm, patientName, primaryCode, primaryDescription, secondaryCode, secondaryDescription, alertMessage, isValid ? 1 : 0, updatedAt, updatedBy
    ]);

    // 2. Move patient status to 'Selesai Koding'
    await connection.query(
      'UPDATE patients SET status = ? WHERE id = ?',
      ['Selesai Koding', patientId]
    );

    // 3. Update checklist_coding to true and check completeness
    const [berkasRows] = await connection.query(
      'SELECT checklist_identity, checklist_informedConsent, checklist_soap FROM berkas WHERE patientId = ?',
      [patientId]
    );
    if ((berkasRows as any[]).length > 0) {
      const b = (berkasRows as any[])[0];
      const isLengkap = (b.checklist_identity && b.checklist_informedConsent && b.checklist_soap) ? 1 : 0;
      await connection.query(
        'UPDATE berkas SET checklist_coding = 1, isLengkap = ?, updatedAt = ? WHERE patientId = ?',
        [isLengkap, updatedAt, patientId]
      );
    }

    await connection.commit();
    res.json({ status: 'success', message: 'Koding ICD-10 berhasil disimpan.' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error saving Koding:', error);
    res.status(500).json({ status: 'error', error: error.message });
  } finally {
    connection.release();
  }
});

// PUT /api/berkas/:patientId/checklist - Update a checklist item manually
app.put('/api/berkas/:patientId/checklist', async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const { item, value, updatedAt } = req.body; // item can be 'identity', 'informedConsent', 'soap', 'coding'

  const colName = `checklist_${item}`;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update checklist item
    await connection.query(
      `UPDATE berkas SET ${colName} = ?, updatedAt = ? WHERE patientId = ?`,
      [value ? 1 : 0, updatedAt, patientId]
    );

    // Recalculate isLengkap
    const [berkasRows] = await connection.query(
      'SELECT checklist_identity, checklist_informedConsent, checklist_soap, checklist_coding FROM berkas WHERE patientId = ?',
      [patientId]
    );

    if ((berkasRows as any[]).length > 0) {
      const b = (berkasRows as any[])[0];
      const isLengkap = (b.checklist_identity && b.checklist_informedConsent && b.checklist_soap && b.checklist_coding) ? 1 : 0;
      await connection.query(
        'UPDATE berkas SET isLengkap = ? WHERE patientId = ?',
        [isLengkap, patientId]
      );
    }

    await connection.commit();
    res.json({ status: 'success', message: 'Checklist kelengkapan berkas berhasil diperbarui.' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error updating checklist:', error);
    res.status(500).json({ status: 'error', error: error.message });
  } finally {
    connection.release();
  }
});

// POST /api/berkas/:patientId/upload - Upload scanned PDF (Alih Media)
app.post('/api/berkas/:patientId/upload', async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const { fileName, fileData, uploadedSlots, updatedAt } = req.body;

  try {
    await pool.query(
      'UPDATE berkas SET isScanPdf = 1, pdfFileName = ?, pdfDataUrl = ?, uploadedSlots = ?, updatedAt = ? WHERE patientId = ?',
      [fileName, fileData, JSON.stringify(uploadedSlots || {}), updatedAt, patientId]
    );
    res.json({ status: 'success', message: 'Berkas scan PDF berhasil diunggah.' });
  } catch (error: any) {
    console.error('Error uploading scan file:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// POST /api/cppt - Save a CPPT clinical note entry
app.post('/api/cppt', async (req: Request, res: Response) => {
  const { id, patientId, no, tanggal, jam, profesi, petugas, subjektif, objektif, asesmen, plan, td, nadi, suhu } = req.body;
  try {
    // Generate ID if not provided
    const entryId = id || `CPPT-${patientId}-${Date.now()}`;
    await pool.query(
      'INSERT INTO cppt_records (id, patientId, no, tanggal, jam, profesi, petugas, subjektif, objektif, asesmen, plan, td, nadi, suhu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [entryId, patientId, no || 1, tanggal || '', jam || '', profesi || '', petugas || '', subjektif || '', objektif || '', asesmen || '', plan || '', td || '', nadi || '', suhu || '']
    );
    res.json({ status: 'success', message: 'Catatan CPPT berhasil disimpan.' });
  } catch (error: any) {
    console.error('Error saving CPPT:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// POST /api/audit-logs - Write audit trail entry
app.post('/api/audit-logs', async (req: Request, res: Response) => {
  const { id, timestamp, user, role, action, module, details } = req.body;
  try {
    await pool.query(
      'INSERT INTO audit_logs (id, timestamp, user, role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, timestamp, user, role, action, module, details]
    );
    res.json({ status: 'success', message: 'Log audit berhasil disimpan.' });
  } catch (error: any) {
    console.error('Error saving audit log:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// POST /api/reset - Reset and seed database using schema.sql
app.post('/api/reset', async (req: Request, res: Response) => {
  console.log('Resetting MySQL database to default state...');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Disable constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // Clean comments and split SQL statements by semicolon
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

    for (const statement of sqlStatements) {
      await connection.query(statement);
    }

    // Re-enable constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    res.json({ status: 'success', message: 'Sistem SIMRS berhasil direset ke database standar.' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Error resetting database:', error);
    res.status(500).json({ status: 'error', error: error.message });
  } finally {
    connection.release();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Backend server running at http://localhost:${PORT}`);
  console.log(` Test DB endpoint: http://localhost:${PORT}/api/test-db`);
  console.log(` Sync endpoint: http://localhost:${PORT}/api/sync`);
  console.log(`==================================================`);
});
