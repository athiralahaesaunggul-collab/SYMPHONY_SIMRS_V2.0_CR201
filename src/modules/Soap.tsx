import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  CheckCircle, 
  FileCheck,
  UserCheck,
  RotateCcw,
  Plus,
  X,
  Eye
} from 'lucide-react';

import { CpptHistoryEntry } from '../types';

// DUMMY_CPPT_HISTORY is removed, using state instead

export const Soap: React.FC = () => {
  const { currentStaff, patients, selectedPatientIdForSoap, cpptRecords, saveCpptEntry, saveSOAP, setTab, setSelectedPatientIdForBerkas, setSelectedPatientIdForSoap, setSelectedPatientIdForKoding } = useApp();
  
  const selectedPatient = patients.find(p => p.id === selectedPatientIdForSoap);

  const cpptHistory = selectedPatientIdForSoap ? (cpptRecords[selectedPatientIdForSoap] || []) : [];

  // Form Petugas State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jam, setJam] = useState(new Date().toTimeString().slice(0, 5));
  const [profesi, setProfesi] = useState('Dokter');
  const [namaPetugas, setNamaPetugas] = useState(currentStaff?.name || '');

  // Form SOAP State (semua kosong, tanpa dummy)
  const [subjektif, setSubjektif] = useState('');
  const [objektif, setObjektif] = useState('');
  const [td, setTd] = useState('');
  const [hr, setHr] = useState('');
  const [suhu, setSuhu] = useState('');
  const [rr, setRr] = useState('');
  const [bb, setBb] = useState('');
  const [tb, setTb] = useState('');
  const [asesmen, setAsesmen] = useState('');
  const [plan, setPlan] = useState('');

  // Modal state untuk melihat detail CPPT
  const [selectedCppt, setSelectedCppt] = useState<CpptHistoryEntry | null>(null);

  const handleReset = () => {
    setSubjektif('');
    setObjektif('');
    setTd('');
    setHr('');
    setSuhu('');
    setRr('');
    setBb('');
    setTb('');
    setAsesmen('');
    setPlan('');
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjektif || !objektif || !asesmen || !plan) {
      alert("Harap lengkapi semua isian SOAP!");
      return;
    }
    const newEntry: CpptHistoryEntry = {
      no: cpptHistory.length + 1,
      tanggal,
      jam,
      profesi,
      petugas: namaPetugas,
      subjektif,
      objektif,
      asesmen,
      plan,
      td,
      nadi: hr,
      suhu
    };
    if (selectedPatientIdForSoap) {
      saveCpptEntry(selectedPatientIdForSoap, newEntry);
      saveSOAP({
        patientId: selectedPatientIdForSoap,
        patientRm: selectedPatient?.rmNumber || '',
        patientName: selectedPatient?.name || '',
        subjektif,
        objektif,
        td,
        nadi: hr,
        suhu,
        asesmen,
        plan
      });
    }
    
    const patientIdForKoding = selectedPatientIdForSoap;
    handleReset();
    // JANGAN reset selectedPatientIdForSoap agar riwayat CPPT tetap terlihat
    
    // Tanya user apakah ingin lanjut ke Koding ICD-10
    const lanjutKoding = window.confirm('✅ Data SOAP berhasil disimpan! Riwayat CPPT telah diperbarui.\n\nApakah Anda ingin melanjutkan ke modul ICD-10 & Koding untuk pasien ini?');
    if (lanjutKoding && patientIdForKoding) {
      setSelectedPatientIdForKoding(patientIdForKoding);
      setTab('koding');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Module Banner */}
      <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT)</h2>
          <p className="text-white text-xs mt-1 font-medium">SOAP Medis · Workstation Klinis</p>
        </div>
        <Stethoscope className="h-10 w-10 text-blue-200 opacity-60 hidden md:block" />
      </div>

      {/* Identitas Pasien — Pilih pasien dari Admisi */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
          <UserCheck className="h-5 w-5 text-[#1E3A8A]" />
          <h3 className="font-bold text-sm text-slate-800">Identitas Pasien</h3>
        </div>
        {selectedPatient ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
            <div><span className="text-slate-500">Nama Pasien:</span> <strong className="text-blue-900 block mt-1">{selectedPatient.name}</strong></div>
            <div><span className="text-slate-500">No RM:</span> <strong className="text-blue-900 block mt-1">{selectedPatient.rmNumber}</strong></div>
            <div><span className="text-slate-500">Poli / Tujuan:</span> <strong className="text-blue-900 block mt-1">{selectedPatient.clinic}</strong></div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-[#1E3A8A] rounded-lg p-4 text-xs text-[#1E3A8A] font-medium">
            <span className="text-[#1E3A8A] mr-1">ℹ️</span> Pilih pasien dari modul <strong>Pendaftaran Pasien</strong> dengan mengklik tombol ikon berkas, lalu sistem akan mengarahkan ke halaman SOAP ini secara otomatis.
          </div>
        )}
      </div>

      <form onSubmit={handleSimpan} className="space-y-6">
        
        {/* Form Petugas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
           <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
            <Activity className="h-5 w-5 text-[#1E3A8A]" />
            <h3 className="font-bold text-sm text-slate-800">Detail Pertemuan / Kunjungan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Jam</label>
              <input type="time" value={jam} onChange={e => setJam(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Profesi</label>
              <select value={profesi} onChange={e => setProfesi(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs">
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Apoteker">Apoteker</option>
                <option value="Ahli Gizi">Ahli Gizi</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Petugas</label>
              <input type="text" value={namaPetugas} onChange={e => setNamaPetugas(e.target.value)} placeholder="Nama petugas..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
            </div>
          </div>
        </div>

        {/* Area Catatan SOAP */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
           <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
             <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-[#1E3A8A]" />
                <h3 className="font-bold text-sm text-slate-800">Pencatatan SOAP</h3>
             </div>
             <div className="flex gap-2">
                <button type="button" onClick={handleReset} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Subjective */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">[S] Subjective</label>
              <textarea rows={5} disabled={!selectedPatient} value={subjektif} onChange={e => setSubjektif(e.target.value)} placeholder="Keluhan utama pasien..." className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 resize-none flex-grow disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
            {/* Objective */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">[O] Objective &amp; Tanda-Tanda Vital</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input type="text" disabled={!selectedPatient} placeholder="TD (mmHg)" value={td} onChange={e => setTd(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Tekanan Darah" />
                <input type="number" disabled={!selectedPatient} placeholder="HR (bpm)" value={hr} onChange={e => setHr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Nadi / Heart Rate" />
                <input type="number" disabled={!selectedPatient} placeholder="Suhu (°C)" value={suhu} onChange={e => setSuhu(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Suhu Tubuh" />
                <input type="number" disabled={!selectedPatient} placeholder="RR (x/mnt)" value={rr} onChange={e => setRr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Pernapasan / Respiratory Rate" />
                <input type="number" disabled={!selectedPatient} placeholder="BB (kg)" value={bb} onChange={e => setBb(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Berat Badan" />
                <input type="number" disabled={!selectedPatient} placeholder="TB (cm)" value={tb} onChange={e => setTb(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" title="Tinggi Badan" />
              </div>
              <textarea rows={4} disabled={!selectedPatient} value={objektif} onChange={e => setObjektif(e.target.value)} placeholder="Hasil pemeriksaan fisik/penunjang lainnya..." className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 resize-none flex-grow disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
            {/* Assessment */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">[A] Assessment</label>
              <textarea rows={5} disabled={!selectedPatient} value={asesmen} onChange={e => setAsesmen(e.target.value)} placeholder="Diagnosis kerja/sementara..." className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 resize-none flex-grow disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
            {/* Plan */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="block text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-2">[P] Plan</label>
              <textarea rows={5} disabled={!selectedPatient} value={plan} onChange={e => setPlan(e.target.value)} placeholder="Rencana terapi/tindakan..." className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 resize-none flex-grow disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
          </div>

          {/* CATATAN: Input Koding DIHAPUS dari SOAP, sudah dipindah ke modul ICD-10 & Koding */}

          <div className="mt-6 flex justify-end gap-3">
            <button type="submit" disabled={!selectedPatient} className="px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle className="w-4 h-4" /> Simpan Catatan
            </button>
          </div>
        </div>

      </form>

      {/* Tabel Riwayat CPPT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Riwayat CPPT Pasien {selectedPatient ? `- ${selectedPatient.name}` : ''}</h3>
          </div>
          <button className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Tambah Catatan Baru
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3 font-bold">No</th>
                <th className="p-3 font-bold">Tanggal</th>
                <th className="p-3 font-bold">Jam</th>
                <th className="p-3 font-bold">Profesi</th>
                <th className="p-3 font-bold">Petugas</th>
                <th className="p-3 font-bold w-1/3">Ringkasan SOAP</th>
                <th className="p-3 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!selectedPatient ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-slate-500 font-medium italic">
                    ℹ️ Silakan pilih pasien di Loket Admisi terlebih dahulu untuk melihat riwayat CPPT.
                  </td>
                </tr>
              ) : cpptHistory.length > 0 ? (
                cpptHistory.map((entry) => (
                  <tr key={entry.no} className="hover:bg-slate-50 transition">
                    <td className="p-3">{entry.no}</td>
                    <td className="p-3">{entry.tanggal}</td>
                    <td className="p-3">{entry.jam}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-md font-bold text-[10px] ${entry.profesi === 'Dokter' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {entry.profesi}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{entry.petugas}</td>
                    <td className="p-3">
                      <p className="line-clamp-2 text-slate-600 leading-relaxed">
                        <strong className="text-blue-700">S:</strong> {entry.subjektif} <br/>
                        <strong className="text-blue-700">O:</strong> {entry.objektif}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <button 
                          onClick={() => setSelectedCppt(entry)}
                          className="p-1.5 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition flex items-center justify-center gap-1" title="Lihat Detail CPPT"
                        >
                          <Eye className="w-4 h-4" /> <span className="text-[10px] font-bold">Detail</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (selectedPatientIdForSoap) {
                              setTab('resume');
                            } else {
                              alert('Pilih pasien terlebih dahulu');
                            }
                          }}
                          className="p-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md transition flex items-center justify-center gap-1 shadow-sm" title="Buat Resume Medis"
                        >
                          <FileCheck className="w-4 h-4" /> <span className="text-[10px] font-bold">Resume</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-slate-500 font-medium">
                    Belum ada riwayat CPPT untuk pasien ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail CPPT */}
      {selectedCppt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setSelectedCppt(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Detail Catatan CPPT #{selectedCppt.no}</h3>
                <p className="text-blue-200 text-[11px] mt-0.5">{selectedCppt.tanggal} · {selectedCppt.jam} · {selectedCppt.petugas}</p>
              </div>
              <button onClick={() => setSelectedCppt(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* TTV */}
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-6">
                <div><span className="text-slate-500 font-semibold">TD:</span> <strong>{selectedCppt.td} mmHg</strong></div>
                <div><span className="text-slate-500 font-semibold">Nadi:</span> <strong>{selectedCppt.nadi} bpm</strong></div>
                <div><span className="text-slate-500 font-semibold">Suhu:</span> <strong>{selectedCppt.suhu} °C</strong></div>
                <div><span className="text-slate-500 font-semibold">Profesi:</span> <strong>{selectedCppt.profesi}</strong></div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">[S] Subjective</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">{selectedCppt.subjektif}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">[O] Objective</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">{selectedCppt.objektif}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">[A] Assessment</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">{selectedCppt.asesmen}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">[P] Plan</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">{selectedCppt.plan}</div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button
                onClick={() => setSelectedCppt(null)}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
