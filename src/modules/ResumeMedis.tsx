import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  UserCheck,
  CheckCircle,
  Printer,
  ArrowLeft
} from 'lucide-react';

const ResumeMedis: React.FC = () => {
  const { setTab, cpptRecords, selectedPatientIdForSoap, patients } = useApp();

  const selectedPatient = patients.find(p => p.id === selectedPatientIdForSoap);


  // Form State — semua dikosongkan
  const [anamnesis, setAnamnesis] = useState('');
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState('');
  const [pemeriksaanPenunjang, setPemeriksaanPenunjang] = useState('');
  const [diagnosisUtama, setDiagnosisUtama] = useState('');
  const [diagnosisSekunder, setDiagnosisSekunder] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [terapi, setTerapi] = useState('');
  const [kondisiPulang, setKondisiPulang] = useState('Perbaikan');
  const [caraPulang, setCaraPulang] = useState('Atas Izin Dokter');
  const [obatPulang, setObatPulang] = useState('');
  const [edukasi, setEdukasi] = useState('');
  const [jadwalKontrol, setJadwalKontrol] = useState('');
  const [namaDokter, setNamaDokter] = useState('');
  const [sipDokter, setSipDokter] = useState('');

  // Track apakah form sudah di-autofill untuk pasien saat ini
  const autoFilledForRef = useRef<string | null>(null);

  // AUTO-SINKRONISASI DARI DATA SOAP (CPPT)
  // Jalan saat: (1) pasien berubah, atau (2) data CPPT tiba untuk pasien ini untuk pertama kali
  useEffect(() => {
    if (!selectedPatientIdForSoap) {
      autoFilledForRef.current = null;
      return;
    }
    const entries = cpptRecords[selectedPatientIdForSoap];
    if (!entries || entries.length === 0) return;

    // Jika sudah pernah di-autofill untuk pasien ini, JANGAN override lagi
    // (biar user bisa edit manual tanpa ter-reset)
    if (autoFilledForRef.current === selectedPatientIdForSoap) return;

    const latest = entries[entries.length - 1];
    autoFilledForRef.current = selectedPatientIdForSoap; // tandai sudah diisi

    setAnamnesis(latest.subjektif || '');

    const vitalSigns = [
      latest.td    ? `TD: ${latest.td} mmHg`   : '',
      latest.nadi  ? `Nadi: ${latest.nadi} bpm` : '',
      latest.suhu  ? `Suhu: ${latest.suhu} °C`  : '',
    ].filter(Boolean).join(' | ');
    const fisikText = [vitalSigns, latest.objektif].filter(Boolean).join('\n');
    setPemeriksaanFisik(fisikText);

    setPemeriksaanPenunjang(latest.objektif || '');
    setDiagnosisUtama(latest.asesmen || '');
    setDiagnosisSekunder('');
    setTindakan(latest.plan || '');
    setTerapi(latest.plan || '');

    if (selectedPatient?.dpjp) {
      setNamaDokter(selectedPatient.dpjp);
      setSipDokter(`SIP. 440/0${selectedPatient.dpjp.length}0/DINKES/2026`);
    }
  }, [selectedPatientIdForSoap, cpptRecords, selectedPatient]); // cpptRecords PERLU ada agar bisa load data async


  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Resume Medis berhasil disimpan.');
  };

  const handleCetak = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <>
      {/* ====================================== */}
      {/* PRINT CSS – hanya tampil saat @print    */}
      {/* ====================================== */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm 1.5cm 2cm 1.5cm;
          }
          body * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            background: #fff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            color: #000;
            line-height: 1.5;
          }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-table td, .print-table th {
            border: 1px solid #000;
            padding: 4px 6px;
            font-size: 9.5pt;
            vertical-align: top;
          }
          .print-table th {
            background-color: #e8e8e8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold;
            text-align: left;
          }
          .print-section-title {
            background-color: #1E3A8A !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #fff !important;
            font-weight: bold;
            padding: 4px 8px;
            font-size: 9.5pt;
            margin-bottom: 0;
          }
          .print-divider { border-top: 2px solid #000; margin: 8px 0; }
          .print-divider-thin { border-top: 1px solid #ccc; margin: 4px 0; }
        }
      `}</style>

      {/* ====================================== */}
      {/* UI SCREEN (hidden saat print)           */}
      {/* ====================================== */}
      <div className="space-y-6 pb-10 print:hidden">

        {/* Module Banner */}
        <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
          <div>
            <p className="text-xl font-extrabold tracking-tight">RESUME MEDIS PASIEN</p>
            <p className="text-white text-xs mt-1 font-medium">Ringkasan klinis & instruksi pemulangan pasien</p>
          </div>
          <ClipboardList className="h-10 w-10 text-white opacity-60 hidden md:block" />
        </div>

        {/* Identitas Ringkas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
            <UserCheck className="h-5 w-5 text-[#1E3A8A]" />
            <span className="font-bold text-sm text-slate-800">Identitas Pasien</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'No. RM', val: selectedPatient?.rmNumber || '–' },
              { label: 'Nama Pasien', val: selectedPatient?.name || '–' },
              { label: 'Umur / JK', val: selectedPatient ? `${selectedPatient.age} / ${selectedPatient.gender}` : '–' },
              { label: 'DPJP', val: selectedPatient?.dpjp || '–' },
              { label: 'Poli / Ruangan', val: selectedPatient?.clinic || '–' },
              { label: 'Asuransi', val: selectedPatient?.insurance || '–' },
              { label: 'Tgl Masuk', val: selectedPatient?.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString('id-ID') : '–' },
              { label: 'Tgl Pulang', val: new Date().toLocaleDateString('id-ID') },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-slate-400 font-semibold mb-0.5">{item.label}</p>
                <p className="font-bold text-slate-800">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSimpan} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              {[
                { label: 'Anamnesis Singkat', val: anamnesis, setter: setAnamnesis, rows: 3 },
                { label: 'Pemeriksaan Fisik', val: pemeriksaanFisik, setter: setPemeriksaanFisik, rows: 3 },
                { label: 'Pemeriksaan Penunjang', val: pemeriksaanPenunjang, setter: setPemeriksaanPenunjang, rows: 3 },
                { label: 'Diagnosis Utama (ICD-10)', val: diagnosisUtama, setter: setDiagnosisUtama, rows: 2 },
                { label: 'Diagnosis Sekunder', val: diagnosisSekunder, setter: setDiagnosisSekunder, rows: 2 },
                { label: 'Tindakan / Prosedur (ICD-9-CM)', val: tindakan, setter: setTindakan, rows: 2 },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">{f.label}</label>
                  <textarea rows={f.rows} value={f.val} onChange={e => f.setter(e.target.value)} disabled className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-slate-100 cursor-not-allowed text-slate-600 font-medium" />
                </div>
              ))}
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Terapi / Pengobatan</label>
                <textarea rows={3} value={terapi} onChange={e => setTerapi(e.target.value)} disabled className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-slate-100 cursor-not-allowed text-slate-600 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Kondisi Pulang</label>
                  <select value={kondisiPulang} onChange={e => setKondisiPulang(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]">
                    <option>Sembuh</option><option>Perbaikan</option><option>Belum Sembuh</option><option>Meninggal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cara Pulang</label>
                  <select value={caraPulang} onChange={e => setCaraPulang(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]">
                    <option>Atas Izin Dokter</option><option>Pulang Paksa</option><option>Dirujuk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Obat Dibawa Pulang</label>
                <textarea rows={2} value={obatPulang} onChange={e => setObatPulang(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Edukasi / Instruksi Pulang</label>
                <textarea rows={2} value={edukasi} onChange={e => setEdukasi(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Jadwal Kontrol</label>
                <input type="date" value={jadwalKontrol} onChange={e => setJadwalKontrol(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nama DPJP</label>
                  <input type="text" value={namaDokter} onChange={e => setNamaDokter(e.target.value)} disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-slate-100 cursor-not-allowed text-slate-600 font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor SIP</label>
                  <input type="text" value={sipDokter} onChange={e => setSipDokter(e.target.value)} disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] bg-slate-100 cursor-not-allowed text-slate-600 font-medium" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-between items-center">
            <button type="button" onClick={() => setTab('dashboard')} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={handleCetak} className="px-5 py-2 bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 text-[#1E3A8A] rounded-lg text-xs font-bold flex items-center gap-2 transition border border-[#1E3A8A]/20">
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
              <button type="submit" className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-sm">
                <CheckCircle className="w-4 h-4" /> Simpan Resume
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ====================================== */}
      {/* AREA CETAK (visible hanya saat print)   */}
      {/* ====================================== */}
      <div id="resume-print-area" className="hidden print:block">
        {/* ===== HEADER ===== */}
        <table className="print-table" style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '15%', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                <img
                  src="src/components/logo-ueu-unggul-15012025-No-BG (1).png"
                  alt="Logo UEU"
                  style={{ height: '52px', display: 'block', margin: '0 auto' }}
                />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '4px 8px' }}>
                <div style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  UNIVERSITAS ESA UNGGUL
                </div>
                <div style={{ fontSize: '10pt', fontWeight: '600' }}>SIMRS SYMPHONY v2.0 – Capstone Project RMIK</div>
                <div style={{ fontSize: '8.5pt', color: '#444' }}>Jl. Arjuna Utara No. 9, Kebon Jeruk, Jakarta Barat 11530</div>
                <div style={{ fontSize: '8.5pt', color: '#444' }}>Telp: (021) 5674223 · Fax: (021) 5674248 · www.esaunggul.ac.id</div>
              </td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>
                  RESUME MEDIS
                </div>
                <div style={{ marginTop: '4px', border: '1px solid #888', padding: '3px 6px', fontSize: '9pt' }}>
                  No. RM: <strong>{selectedPatient?.rmNumber || '–'}</strong>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== IDENTITAS PASIEN ===== */}
        <div className="print-section-title">I. IDENTITAS PASIEN</div>
        <table className="print-table" style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '20%' }}><strong>Nama Lengkap</strong></td>
              <td style={{ width: '30%' }}>{selectedPatient?.name || '–'}</td>
              <td style={{ width: '20%' }}><strong>Tanggal Lahir</strong></td>
              <td style={{ width: '30%' }}>{selectedPatient?.birthDate || '–'}</td>
            </tr>
            <tr>
              <td><strong>NIK</strong></td>
              <td style={{ fontFamily: 'Courier New, monospace' }}>{selectedPatient?.nik || '–'}</td>
              <td><strong>Umur / JK</strong></td>
              <td>{selectedPatient ? `${selectedPatient.age} / ${selectedPatient.gender}` : '–'}</td>
            </tr>
            <tr>
              <td><strong>Alamat</strong></td>
              <td colSpan={3}>{selectedPatient?.address || '–'}</td>
            </tr>
            <tr>
              <td><strong>Poli / Ruangan</strong></td>
              <td>{selectedPatient?.clinic || '–'}</td>
              <td><strong>Asuransi</strong></td>
              <td>{selectedPatient?.insurance || '–'}</td>
            </tr>
            <tr>
              <td><strong>DPJP</strong></td>
              <td>{selectedPatient?.dpjp || '–'}</td>
              <td><strong>LOS</strong></td>
              <td>–</td>
            </tr>
            <tr>
              <td><strong>Tanggal Masuk</strong></td>
              <td>{selectedPatient?.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString('id-ID') : '–'}</td>
              <td><strong>Tanggal Pulang</strong></td>
              <td>{new Date().toLocaleDateString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        {/* ===== KLINIS ===== */}
        <div className="print-section-title">II. RINGKASAN KLINIS</div>
        <table className="print-table" style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <th style={{ width: '28%' }}>1. Anamnesis Singkat</th>
              <td>{anamnesis || '–'}</td>
            </tr>
            <tr>
              <th>2. Pemeriksaan Fisik</th>
              <td>{pemeriksaanFisik || '–'}</td>
            </tr>
            <tr>
              <th>3. Pemeriksaan Penunjang</th>
              <td>{pemeriksaanPenunjang || '–'}</td>
            </tr>
          </tbody>
        </table>

        {/* ===== KODING ===== */}
        <div className="print-section-title">III. DIAGNOSIS & TINDAKAN (ICD)</div>
        <table className="print-table" style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <th style={{ width: '28%' }}>Diagnosis Utama (ICD-10)</th>
              <td><strong>{diagnosisUtama || '–'}</strong></td>
            </tr>
            <tr>
              <th>Diagnosis Sekunder</th>
              <td>{diagnosisSekunder || '–'}</td>
            </tr>
            <tr>
              <th>Tindakan / Prosedur (ICD-9-CM)</th>
              <td>{tindakan || '–'}</td>
            </tr>
          </tbody>
        </table>

        {/* ===== TERAPI & PULANG ===== */}
        <div className="print-section-title">IV. TERAPI & PEMULANGAN</div>
        <table className="print-table" style={{ marginBottom: '6px' }}>
          <tbody>
            <tr>
              <th style={{ width: '28%' }}>Terapi / Pengobatan</th>
              <td>{terapi || '–'}</td>
            </tr>
            <tr>
              <th>Kondisi Saat Pulang</th>
              <td>{kondisiPulang} — {caraPulang}</td>
            </tr>
            <tr>
              <th>Obat Dibawa Pulang</th>
              <td>{obatPulang || '–'}</td>
            </tr>
            <tr>
              <th>Edukasi / Instruksi</th>
              <td>{edukasi || '–'}</td>
            </tr>
            <tr>
              <th>Jadwal Kontrol</th>
              <td>{jadwalKontrol ? new Date(jadwalKontrol).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '–'}</td>
            </tr>
          </tbody>
        </table>

        {/* ===== TTD DOKTER ===== */}
        <table className="print-table" style={{ marginTop: '12px' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', border: '1px solid #000', padding: '8px', fontSize: '9pt', color: '#555' }}>
                <strong>Catatan Penting:</strong> Dokumen ini merupakan ringkasan medis resmi yang disimpan sebagai
                bagian dari berkas Rekam Medis Elektronik (RME) sesuai Permenkes No. 24 Tahun 2022 tentang Rekam Medis.
                Dilarang memperbanyak/mendistribusikan tanpa izin.
              </td>
              <td style={{ width: '40%', border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                <div style={{ marginBottom: '4px' }}>Jakarta, {printDate}</div>
                <div style={{ fontWeight: 'bold' }}>Dokter Penanggung Jawab Pelayanan</div>
                <div style={{ height: '56px', borderBottom: '1px dotted #000', margin: '6px 16px' }}></div>
                <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{namaDokter}</div>
                <div style={{ fontSize: '8.5pt', color: '#555', marginTop: '2px' }}>{sipDokter}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== FOOTER ===== */}
        <div style={{
          borderTop: '2px solid #000',
          marginTop: '8px',
          paddingTop: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '8pt',
          color: '#555'
        }}>
          <span>SIMRS Symphony v2.0 – Universitas Esa Unggul | Fakultas Ilmu-Ilmu Kesehatan | Program Studi RMIK</span>
          <span>Halaman 1 / 1</span>
        </div>
      </div>
    </>
  );
};

export default ResumeMedis;