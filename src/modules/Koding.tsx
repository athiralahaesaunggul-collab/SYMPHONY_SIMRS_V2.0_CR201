import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { validateCDSS, CDSS_RULES } from '../data/icd10Database';

const CDSS_RULES_COUNT = CDSS_RULES.length;
import {
  Search,
  Save,
  Stethoscope,
  Activity,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react';

// ─── Type Definitions ────────────────────────────────────────────────────────
interface ICD10Item {
  code: string;
  description: string;
  type?: string;
}

interface ICD9Item {
  code: string;
  description: string;
}

// ─── Lazy-loaded ICD data (avoids blocking main thread) ──────────────────────
let _icd10Cache: ICD10Item[] | null = null;
let _icd9Cache: ICD9Item[] | null = null;

async function loadIcd10(): Promise<ICD10Item[]> {
  if (_icd10Cache) return _icd10Cache;
  const mod = await import('../data/icd10.json');
  _icd10Cache = mod.default as ICD10Item[];
  return _icd10Cache;
}

async function loadIcd9(): Promise<ICD9Item[]> {
  if (_icd9Cache) return _icd9Cache;
  const mod = await import('../data/icd9.json');
  // icd9.json menyimpan 'code' sebagai number, kita konversi ke string
  _icd9Cache = (mod.default as any[]).map(item => ({
    code: String(item.code),
    description: item.description
  }));
  return _icd9Cache;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Koding: React.FC = () => {
  const { 
    currentStaff, 
    patients, 
    selectedPatientIdForKoding, 
    setSelectedPatientIdForKoding,
    soaps, 
    cpptRecords, 
    saveKoding,
    kodings
  } = useApp();

  const selectedPatient = patients.find(p => p.id === selectedPatientIdForKoding);

  // Patient Sidebar Search
  const [patientSearch, setPatientSearch] = useState('');

  // ─── Search Inputs and Selected State ─────────────────────────────────────
  const [utamaCode, setUtamaCode] = useState('');
  const [utamaDesc, setUtamaDesc] = useState('');
  const [searchUtama, setSearchUtama] = useState('');
  const [utamaSug, setUtamaSug] = useState<ICD10Item[]>([]);
  const [showUtamaSug, setShowUtamaSug] = useState(false);

  const [sekunderCode, setSekunderCode] = useState('');
  const [sekunderDesc, setSekunderDesc] = useState('');
  const [searchSekunder, setSearchSekunder] = useState('');
  const [sekunderSug, setSekunderSug] = useState<ICD10Item[]>([]);
  const [showSekunderSug, setShowSekunderSug] = useState(false);

  const [tindakanCode, setTindakanCode] = useState('');
  const [tindakanDesc, setTindakanDesc] = useState('');
  const [searchTindakan, setSearchTindakan] = useState('');
  const [tindakanSug, setTindakanSug] = useState<ICD9Item[]>([]);
  const [showTindakanSug, setShowTindakanSug] = useState(false);

  // Ref untuk kodings agar tidak masuk dependency useEffect
  // (polling setiap 3 detik akan update kodings tapi TIDAK reset form input user)
  const kodingsRef = useRef(kodings);
  useEffect(() => {
    kodingsRef.current = kodings;
  }, [kodings]);

  // Load existing coding when patient is selected
  // HANYA jalankan saat selectedPatientIdForKoding berubah (bukan saat kodings di-polling)
  useEffect(() => {
    const existing = selectedPatientIdForKoding
      ? kodingsRef.current[selectedPatientIdForKoding]
      : null;

    if (selectedPatientIdForKoding && existing) {
      setUtamaCode(existing.primaryCode || '');
      setUtamaDesc(existing.primaryDescription || '');
      setSearchUtama(existing.primaryCode ? `${existing.primaryCode} - ${existing.primaryDescription}` : '');

      setSekunderCode(existing.secondaryCode || '');
      setSekunderDesc(existing.secondaryDescription || '');
      setSearchSekunder(existing.secondaryCode ? `${existing.secondaryCode} - ${existing.secondaryDescription}` : '');

      setTindakanCode('');
      setTindakanDesc('');
      setSearchTindakan('');
    } else {
      setUtamaCode('');
      setUtamaDesc('');
      setSearchUtama('');

      setSekunderCode('');
      setSekunderDesc('');
      setSearchSekunder('');

      setTindakanCode('');
      setTindakanDesc('');
      setSearchTindakan('');
    }
  }, [selectedPatientIdForKoding]); // <-- kodings DIHAPUS dari dependency!

  // ─── Filtered Patients for Sidebar ──────────────────────────────────────────
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = patientSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.rmNumber.includes(q) ||
        p.nik.includes(q)
      );
    });
  }, [patients, patientSearch]);

  // ─── ICD-10 Search Handlers ────────────────────────────────────────────────
  const handleSearchUtama = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUtamaSug([]);
      setShowUtamaSug(false);
      return;
    }
    const data = await loadIcd10();
    const q = query.toLowerCase();
    const results = (data as any[])
      .filter(item =>
        (item.code || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
    setUtamaSug(results);
    setShowUtamaSug(true);
  }, []);

  const handleSearchSekunder = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSekunderSug([]);
      setShowSekunderSug(false);
      return;
    }
    const data = await loadIcd10();
    const q = query.toLowerCase();
    const results = (data as any[])
      .filter(item =>
        (item.code || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
    setSekunderSug(results);
    setShowSekunderSug(true);
  }, []);

  const handleSearchTindakan = useCallback(async (query: string) => {
    if (query.length < 2) {
      setTindakanSug([]);
      setShowTindakanSug(false);
      return;
    }
    const data = await loadIcd9();
    const q = query.toLowerCase();
    const results = (data as any[])
      .filter(item =>
        String(item.code || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
    setTindakanSug(results);
    setShowTindakanSug(true);
  }, []);

  // ─── Fetch Active Patient's SOAP ──────────────────────────────────────────
  const patientSoap = useMemo(() => {
    if (!selectedPatientIdForKoding) return null;
    if (soaps && soaps[selectedPatientIdForKoding]) {
      return soaps[selectedPatientIdForKoding];
    }
    const history = cpptRecords && cpptRecords[selectedPatientIdForKoding];
    if (history && history.length > 0) {
      const last = history[history.length - 1];
      return {
        td: last.td,
        nadi: last.nadi,
        suhu: last.suhu,
        subjektif: last.subjektif,
        objektif: last.objektif,
        asesmen: last.asesmen,
        plan: last.plan,
        patientId: selectedPatientIdForKoding,
        patientRm: selectedPatient?.rmNumber || '',
        patientName: selectedPatient?.name || '',
        updatedAt: last.tanggal + ' ' + last.jam,
        updatedBy: last.petugas
      };
    }
    return null;
  }, [selectedPatientIdForKoding, soaps, cpptRecords, selectedPatient]);

  const soapText = useMemo(() => {
    if (!patientSoap) return '';
    return `${patientSoap.subjektif} ${patientSoap.objektif} ${patientSoap.asesmen} ${patientSoap.plan}`;
  }, [patientSoap]);

  // ─── CDSS Real-time Validation ───────────────────────────────────────────
  const cdssResult = useMemo(() => {
    return validateCDSS(
      utamaCode,
      sekunderCode,
      soapText,
      patientSoap ? patientSoap.asesmen : undefined,
      selectedPatient?.gender,
      selectedPatient?.age
    );
  }, [utamaCode, sekunderCode, soapText, patientSoap, selectedPatient]);

  const miscodingDuplikat = useMemo(() => {
    return utamaCode !== '' && utamaCode === sekunderCode;
  }, [utamaCode, sekunderCode]);

  const hasDuplicates = useMemo(() => {
    return false; // Checked directly by miscodingDuplikat
  }, []);

  const hasUnspecified = useMemo(() => {
    const isUnspec = (c: string) => c.endsWith('.9') || (c.split('.').length === 1 && c.length <= 3);
    return (utamaCode !== '' && isUnspec(utamaCode)) || (sekunderCode !== '' && isUnspec(sekunderCode));
  }, [utamaCode, sekunderCode]);

  // ─── Save Coding Handler ──────────────────────────────────────────────────
  const handleSimpanKoding = () => {
    if (!selectedPatient) {
      alert('Pilih pasien terlebih dahulu.');
      return;
    }
    if (!utamaCode) {
      alert('Peringatan Miscoding: Kode Utama Wajib Diisi!');
      return;
    }
    if (miscodingDuplikat) {
      alert('Peringatan Miscoding: Kode Utama dan Sekunder tidak boleh duplikat!');
      return;
    }

    saveKoding({
      patientId: selectedPatient.id,
      patientRm: selectedPatient.rmNumber,
      patientName: selectedPatient.name,
      primaryCode: utamaCode,
      primaryDescription: utamaDesc,
      secondaryCode: sekunderCode,
      secondaryDescription: sekunderDesc
    });

    alert('✅ Data Koding ICD berhasil disimpan ke Rekam Medis Pasien.');
    setSelectedPatientIdForKoding(null);
  };

  return (
    <div className="flex flex-col bg-slate-100 rounded-2xl overflow-hidden shadow-md">
      
      {/* ─── BANNER / HEADER ─────────────────────────────────────────────── */}
      <div className="bg-[#1E3A8A] p-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight uppercase">UNIT KODING &amp; CDSS WORKSTATION (ICD-10)</h2>
          <p className="text-white/80 text-[10px] font-semibold mt-0.5">
            Verifikasi Sandi Diagnosis &amp; Tindakan Pasien Terintegrasi Clinical Decision Support System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full font-bold text-[10px]">
            Koder Aktif: {currentStaff?.name || 'Petugas Koder'}
          </span>
        </div>
      </div>

      {/* ─── MAIN 3-COLUMN WORKSPACE ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 min-h-[580px]">
        
        {/* =========================================================================
            KOLOM 1: ADMISI / KODING PASIEN (COL-SPAN 3)
            ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col flex-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2">
              <User className="w-4 h-4 text-[#1E3A8A]" />
              Admisi / Koding Pasien
            </h3>

            {/* Patient Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                placeholder="Cari Pasien (RM/Nama)..."
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>

            {/* Patients Scroll List */}
            <div className="flex-1 overflow-y-auto max-h-[220px] lg:max-h-[300px] space-y-2 pr-1 mb-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-[11px] italic">
                  Tidak ada pasien ditemukan.
                </div>
              ) : (
                filteredPatients.map(p => {
                  const isSelected = p.id === selectedPatientIdForKoding;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientIdForKoding(p.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-[#1E3A8A]/5 border-[#1E3A8A] text-[#1E3A8A] font-bold shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[10px] font-black">{p.rmNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                          p.status === 'Selesai Koding'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Sudah Diperiksa'
                            ? 'bg-amber-100 text-amber-800 font-black animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <span className="font-extrabold text-[11px] truncate">{p.name}</span>
                      <span className="text-[9px] opacity-75">{p.clinic}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Patient Details Info Card */}
            {selectedPatient ? (
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 text-xs space-y-2 mt-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">No. Rekam Medis</span>
                  <span className="font-mono font-bold text-slate-700">{selectedPatient.rmNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Nama Lengkap</span>
                  <span className="font-bold text-slate-700 truncate max-w-[140px]">{selectedPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">No. NIK</span>
                  <span className="font-mono text-slate-600">{selectedPatient.nik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Jenis Kelamin</span>
                  <span className="font-medium text-slate-700">{selectedPatient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Umur Pasien</span>
                  <span className="font-medium text-slate-700">{selectedPatient.age} Tahun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Jenis Penjamin</span>
                  <span className="font-extrabold text-blue-600 text-[10px]">{selectedPatient.insurance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Tujuan Klinik</span>
                  <span className="font-bold text-[#1E3A8A]">{selectedPatient.clinic}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-400 italic mt-auto">
                Silakan pilih pasien di atas untuk melihat detail data admisi.
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            KOLOM 2: RESUME MEDIS PASIEN / SOAP (COL-SPAN 4)
            ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col flex-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-4 h-4 text-[#1E3A8A]" />
              Resume Medis Pasien: {selectedPatient ? selectedPatient.name : ''}
            </h3>

            {selectedPatient ? (
              patientSoap ? (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  
                  {/* Vital Signs Row */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/55">
                    <div className="text-center">
                      <p className="text-[9px] font-extrabold uppercase text-slate-400">Tensi Darah</p>
                      <p className="font-mono font-black text-slate-700 text-xs mt-0.5">
                        {patientSoap.td ? `${patientSoap.td}` : '-'} <span className="text-[9px] font-normal text-slate-500">mmHg</span>
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <p className="text-[9px] font-extrabold uppercase text-slate-400">Nadi (HR)</p>
                      <p className="font-mono font-black text-slate-700 text-xs mt-0.5">
                        {patientSoap.nadi ? `${patientSoap.nadi}` : '-'} <span className="text-[9px] font-normal text-slate-500">bpm</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-extrabold uppercase text-slate-400">Suhu Tubuh</p>
                      <p className="font-mono font-black text-slate-700 text-xs mt-0.5">
                        {patientSoap.suhu ? `${patientSoap.suhu}` : '-'} <span className="text-[9px] font-normal text-slate-500">°C</span>
                      </p>
                    </div>
                  </div>

                  {/* SOAP Contents */}
                  <div className="space-y-3">
                    
                    {/* Subjektif */}
                    <div className="bg-blue-50/50 border-l-4 border-blue-500 p-2.5 rounded-r-lg">
                      <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Subjektif (S)</h4>
                      <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-line leading-relaxed font-medium">
                        {patientSoap.subjektif}
                      </p>
                    </div>

                    {/* Objektif */}
                    <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-2.5 rounded-r-lg">
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Objektif (O)</h4>
                      <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-line leading-relaxed font-medium">
                        {patientSoap.objektif}
                      </p>
                    </div>

                    {/* Asesmen */}
                    <div className="bg-amber-50/50 border-l-4 border-amber-500 p-2.5 rounded-r-lg">
                      <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Asesmen (A)</h4>
                      <p className="text-[11px] text-slate-800 mt-1 whitespace-pre-line leading-relaxed font-bold">
                        {patientSoap.asesmen}
                      </p>
                    </div>

                    {/* Plan */}
                    <div className="bg-purple-50/50 border-l-4 border-purple-500 p-2.5 rounded-r-lg">
                      <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Plan (P)</h4>
                      <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-line leading-relaxed font-medium">
                        {patientSoap.plan}
                      </p>
                    </div>

                  </div>

                  {/* Examiner Sign-off */}
                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Diperiksa: {patientSoap.updatedAt}</span>
                    <span className="font-bold text-slate-500">Oleh: {patientSoap.updatedBy}</span>
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <AlertCircle className="w-10 h-10 text-amber-500 opacity-60 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Catatan SOAP Belum Diisi</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    Dokter belum melakukan pemeriksaan SOAP/CPPT. Silakan isi terlebih dahulu di modul SOAP (CPPT).
                  </p>
                </div>
              )
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <FileText className="w-10 h-10 text-slate-400 opacity-40 mb-2" />
                <p className="text-xs font-bold text-slate-500">Pilih Pasien Terlebih Dahulu</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pilih pasien dari daftar admisi di sebelah kiri untuk melihat resume medis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            KOLOM 3: VERIFIKASI SANDI ICD-10 & TINDAKAN & CDSS (COL-SPAN 5)
            ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col flex-1 relative">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2">
              <Stethoscope className="w-4 h-4 text-[#1E3A8A]" />
              Verifikasi Sandi ICD-10
            </h3>

            {selectedPatient ? (
              <div className="flex-grow flex flex-col space-y-3">
                
                {/* ── DIAGNOSIS UTAMA (ICD-10) ── */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Diagnosis Utama (ICD-10)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchUtama}
                      onChange={e => {
                        setSearchUtama(e.target.value);
                        setUtamaCode('');
                        setUtamaDesc('');
                        handleSearchUtama(e.target.value);
                      }}
                      onBlur={() => setTimeout(() => setShowUtamaSug(false), 200)}
                      onFocus={() => utamaSug.length > 0 && setShowUtamaSug(true)}
                      placeholder="Cari & Pilih diagnosis utama..."
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  {showUtamaSug && utamaSug.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-0.5 max-h-48 overflow-y-auto">
                      {utamaSug.map((item, i) => (
                        <button
                          key={`s-ut-${i}`}
                          type="button"
                          onMouseDown={() => {
                            setUtamaCode(item.code);
                            setUtamaDesc(item.description);
                            setSearchUtama(`${item.code} - ${item.description}`);
                            setShowUtamaSug(false);
                          }}
                          className="w-full text-left px-2.5 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-0 flex gap-2 items-start"
                        >
                          <span className="font-mono font-bold text-[#1E3A8A] text-[10px] shrink-0 mt-0.5">{item.code}</span>
                          <span className="text-[11px] text-slate-700 line-clamp-1">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── DIAGNOSIS SEKUNDER (ICD-10) ── */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Diagnosis Sekunder (ICD-10)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchSekunder}
                      onChange={e => {
                        setSearchSekunder(e.target.value);
                        setSekunderCode('');
                        setSekunderDesc('');
                        handleSearchSekunder(e.target.value);
                      }}
                      onBlur={() => setTimeout(() => setShowSekunderSug(false), 200)}
                      onFocus={() => sekunderSug.length > 0 && setShowSekunderSug(true)}
                      placeholder="Cari & Pilih diagnosis sekunder..."
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  {showSekunderSug && sekunderSug.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-0.5 max-h-48 overflow-y-auto">
                      {sekunderSug.map((item, i) => (
                        <button
                          key={`s-sek-${i}`}
                          type="button"
                          onMouseDown={() => {
                            setSekunderCode(item.code);
                            setSekunderDesc(item.description);
                            setSearchSekunder(`${item.code} - ${item.description}`);
                            setShowSekunderSug(false);
                          }}
                          className="w-full text-left px-2.5 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-0 flex gap-2 items-start"
                        >
                          <span className="font-mono font-bold text-[#1E3A8A] text-[10px] shrink-0 mt-0.5">{item.code}</span>
                          <span className="text-[11px] text-slate-700 line-clamp-1">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── TINDAKAN (ICD-9-CM) ── */}
                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Tindakan / Prosedur (ICD-9-CM)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchTindakan}
                      onChange={e => {
                        setSearchTindakan(e.target.value);
                        setTindakanCode('');
                        setTindakanDesc('');
                        handleSearchTindakan(e.target.value);
                      }}
                      onBlur={() => setTimeout(() => setShowTindakanSug(false), 200)}
                      onFocus={() => tindakanSug.length > 0 && setShowTindakanSug(true)}
                      placeholder="Cari & Pilih tindakan medis..."
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  {showTindakanSug && tindakanSug.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-0.5 max-h-48 overflow-y-auto">
                      {tindakanSug.map((item, i) => (
                        <button
                          key={`s-tind-${i}`}
                          type="button"
                          onMouseDown={() => {
                            setTindakanCode(item.code);
                            setTindakanDesc(item.description);
                            setSearchTindakan(`${item.code} - ${item.description}`);
                            setShowTindakanSug(false);
                          }}
                          className="w-full text-left px-2.5 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-0 flex gap-2 items-start"
                        >
                          <span className="font-mono font-bold text-[#0D9488] text-[10px] shrink-0 mt-0.5">{item.code}</span>
                          <span className="text-[11px] text-slate-700 line-clamp-1">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── CDSS VALIDATION BOX (REAL-TIME ALERTS) ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      CDSS — Clinical Decision Support
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full font-bold">
                      {CDSS_RULES_COUNT} Aturan Aktif
                    </span>
                  </div>

                  {!utamaCode ? (
                    <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black text-red-800">Diagnosis Utama Kosong</p>
                        <p className="text-[10px] text-red-700 mt-0.5 font-bold">Harap cari dan pilih Diagnosis Utama (ICD-10) untuk memulai validasi CDSS.</p>
                      </div>
                    </div>
                  ) : cdssResult.isValid ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-black text-emerald-800">✔ Koding Valid &amp; Sesuai Kaidah</p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Tidak ada pelanggaran aturan CDSS. Koding selaras dengan rekam medis dan kaidah ICD-10.</p>
                        {utamaCode && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">Utama: {utamaCode}</span>
                            {sekunderCode && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">Sekunder: {sekunderCode}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={`p-2.5 rounded-lg flex items-start gap-2 border ${cdssResult.isRuleViolation ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${cdssResult.isRuleViolation ? 'text-red-600' : 'text-amber-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-black ${cdssResult.isRuleViolation ? 'text-red-800' : 'text-amber-800'}`}>
                          {cdssResult.isRuleViolation ? '🚨 Miscoding Alert — Pelanggaran Kaidah' : '⚠️ Peringatan Relevansi Klinis'}
                        </p>
                        <p className={`text-[10px] mt-0.5 font-bold leading-normal break-words ${cdssResult.isRuleViolation ? 'text-red-700' : 'text-amber-700'}`}>
                          {cdssResult.message}
                        </p>
                        {cdssResult.suggestions.length > 0 && (
                          <ul className={`list-disc pl-3.5 mt-1.5 space-y-0.5 text-[9px] font-semibold leading-tight ${cdssResult.isRuleViolation ? 'text-red-600' : 'text-amber-600'}`}>
                            {cdssResult.suggestions.map((sug, idx) => (
                              <li key={idx}>{sug}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Duplicate check */}
                  {miscodingDuplikat && (
                    <div className="bg-red-50 border border-red-200 p-2 rounded-lg flex items-start gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-red-800 font-bold">⚠ Duplikat: Diagnosis Utama dan Sekunder tidak boleh sama!</p>
                    </div>
                  )}

                  {/* Unspecified code warning */}
                  {hasUnspecified && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-1.5 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-amber-800 font-semibold leading-snug">
                        <strong>Kode Tidak Spesifik:</strong> Kode berakhiran .9 atau 3 digit terlalu umum. Disarankan pakai kode lebih spesifik.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── SAVE WORK BUTTON ── */}
                <button
                  type="button"
                  onClick={handleSimpanKoding}
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition mt-auto shrink-0 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Hasil Koding
                </button>

              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Stethoscope className="w-10 h-10 text-slate-400 opacity-40 mb-2" />
                <p className="text-xs font-bold text-slate-500">Pilih Pasien Terlebih Dahulu</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pilih pasien dari daftar admisi di sebelah kiri untuk melakukan verifikasi sandi ICD.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};