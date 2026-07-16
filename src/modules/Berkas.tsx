/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Berkas as BerkasType } from '../types';
import { 
  Archive, 
  Upload, 
  CheckSquare, 
  Square, 
  Eye, 
  FileCheck2, 
  FileWarning, 
  FileText,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Berkas: React.FC = () => {
  const { berkas, updateBerkasChecklist, uploadBerkasScan } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBerkasIdForReview, setSelectedBerkasIdForReview] = useState<string | null>(null);
  const [dragOverPatientId, setDragOverPatientId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadPatientId, setActiveUploadPatientId] = useState<string | null>(null);
  const [activeUploadSlotKey, setActiveUploadSlotKey] = useState<'identity' | 'informedConsent' | 'soap' | 'coding' | null>(null);
  const [previewFile, setPreviewFile] = useState<{ fileName: string; dataUrl: string; slotName: string } | null>(null);

  // Filter berkas
  const berkasRecords = Object.values(berkas) as BerkasType[];
  const filteredBerkas = berkasRecords.filter(b => {
    const s = searchTerm.toLowerCase();
    return (
      b.patientName.toLowerCase().includes(s) ||
      b.rmNumber.includes(s) ||
      b.rakCode.toLowerCase().includes(s)
    );
  });

  const selectedRecord = selectedBerkasIdForReview ? (berkas[selectedBerkasIdForReview] as BerkasType) : null;

  const getSlotName = (key: string) => {
    switch (key) {
      case 'identity': return 'Ringkasan Masuk Pasien';
      case 'informedConsent': return 'Informed Consent';
      case 'soap': return 'Resume Medis';
      case 'coding': return 'Ringkasan Keluar Pasien';
      default: return key;
    }
  };

  // Sync previewFile when selected patient or berkas record changes
  useEffect(() => {
    if (selectedRecord) {
      const slots = selectedRecord.uploadedSlots || {};
      const firstActiveKey = (['identity', 'informedConsent', 'soap', 'coding'] as const).find(k => slots[k]?.fileName);
      if (firstActiveKey && slots[firstActiveKey]) {
        setPreviewFile({
          fileName: slots[firstActiveKey]!.fileName,
          dataUrl: slots[firstActiveKey]!.dataUrl,
          slotName: getSlotName(firstActiveKey),
        });
      } else if (selectedRecord.isScanPdf && selectedRecord.pdfFileName && selectedRecord.pdfDataUrl) {
        setPreviewFile({
          fileName: selectedRecord.pdfFileName,
          dataUrl: selectedRecord.pdfDataUrl,
          slotName: 'Berkas Gabungan RME',
        });
      } else {
        setPreviewFile(null);
      }
    } else {
      setPreviewFile(null);
    }
  }, [selectedBerkasIdForReview, berkas]);

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, patientId: string, slotKey: 'identity' | 'informedConsent' | 'soap' | 'coding') => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, patientId, slotKey);
    }
    // Reset input value so same file can be re-uploaded
    e.target.value = '';
  };

  const processFile = (file: File, patientId: string, slotKey: 'identity' | 'informedConsent' | 'soap' | 'coding' = 'identity') => {
    if (!file.name.endsWith('.pdf') && !file.type.startsWith('image/')) {
      alert('Pemberitahuan Audit RMIK: Harap unggah dokumen dalam format PDF atau Gambar hasil scan resmi.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadBerkasScan(patientId, file.name, dataUrl, slotKey);
      setPreviewFile({
        fileName: file.name,
        dataUrl,
        slotName: getSlotName(slotKey),
      });
      alert(`Berkas ${file.name} (${(file.size / 1024).toFixed(1)} KB) berhasil dialih-mediakan ke slot ${getSlotName(slotKey)}.`);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent, patientId: string) => {
    e.preventDefault();
    setDragOverPatientId(patientId);
  };

  const handleDragLeave = () => {
    setDragOverPatientId(null);
  };

  const handleDrop = (e: React.DragEvent, patientId: string) => {
    e.preventDefault();
    setDragOverPatientId(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, patientId, 'identity');
    }
  };

  const triggerFileInput = (patientId: string, slotKey: 'identity' | 'informedConsent' | 'soap' | 'coding') => {
    setActiveUploadPatientId(patientId);
    setActiveUploadSlotKey(slotKey);
    setTimeout(() => {
      if (fileInputRef.current) {
        // Reset value first so onChange fires even if same file selected
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 50);
  };

  const SLOTS: { key: 'identity' | 'informedConsent' | 'soap' | 'coding'; label: string; checklistField: 'identity' | 'informedConsent' | 'soap' | 'coding' }[] = [
    { key: 'identity', label: 'Ringkasan Masuk Pasien', checklistField: 'identity' },
    { key: 'informedConsent', label: 'Informed Consent', checklistField: 'informedConsent' },
    { key: 'soap', label: 'Resume Medis', checklistField: 'soap' },
    { key: 'coding', label: 'Ringkasan Keluar Pasien', checklistField: 'coding' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#1E3A8A] p-6 text-white flex items-center justify-between rounded-2xl shadow-md">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">PELACAKAN BERKAS REKAM MEDIS</h1>
          <p className="text-white text-xs mt-1 font-medium">
            Manajemen &amp; Audit Kelengkapan Berkas RME (KLPCM) — Alih Media Digital
          </p>
        </div>
        <Archive className="h-10 w-10 text-white opacity-60 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Archive Table Tracker (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="h-4 w-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-800">Daftar Berkas Rekam Medis</h3>
              <span className="inline-flex items-center bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                {berkasRecords.length} Record
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari No RM / Nama / Rak..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Timeline Records */}
          {filteredBerkas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <Archive className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Belum ada berkas terdaftar</p>
              <p className="text-[10px] text-slate-400 text-center max-w-xs mt-1">
                Berkas rekam medis akan muncul secara otomatis setelah pasien terdaftar melalui modul Admisi.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-teal-200 ml-3 space-y-6 pb-4">
              {filteredBerkas.map((record) => {
                return (
                  <div 
                    key={record.patientId} 
                    onDragOver={(e) => handleDragOver(e, record.patientId)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, record.patientId)}
                    className={`relative pl-6 transition ${
                      dragOverPatientId === record.patientId ? 'bg-blue-50/50 rounded-r-lg border-r-2 border-y-2 border-dashed border-blue-400 py-2' : ''
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm"></div>
                    
                    {/* Timeline Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col sm:flex-row justify-between sm:items-start gap-4"
                         onClick={() => setSelectedBerkasIdForReview(record.patientId)}>
                      
                      {/* Left: Patient Info */}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                            {record.rmNumber}
                          </span>
                          <span className="font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                            Rak: {record.rakCode}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{record.patientName}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Update terakhir: {record.updatedAt.split(' ')[0]}</p>
                      </div>

                      {/* Right: Status Badges */}
                      <div className="flex flex-col items-start sm:items-end space-y-2">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          record.isLengkap 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {record.isLengkap ? <FileCheck2 className="h-3 w-3 mr-1 text-emerald-600" /> : <FileWarning className="h-3 w-3 mr-1 text-amber-600" />}
                          <span>{record.isLengkap ? 'Berkas Tersedia (Lengkap)' : 'Menunggu Berkas Tambahan'}</span>
                        </span>

                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                          record.isScanPdf 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {record.isScanPdf ? 'Digital (Alih Media)' : 'Fisik Saja'}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Audit Panel & PDF Viewer (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CheckSquare className="h-5 w-5 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-800">Evaluasi Dokumen & Alih Media</h3>
          </div>

          {!selectedRecord ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl h-full">
              <FileCheck2 className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Pilih Pasien di Kiri</p>
              <p className="text-[10px] text-slate-400 text-center max-w-xs mt-1">
                Gunakan tombol <strong>Audit & Alih Media</strong> untuk mengunggah dokumen digital di 4 slot rekam medis terpisah.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              
              {/* Patient mini summary */}
              <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100">
                <p className="text-[11px] text-teal-800 font-bold leading-tight uppercase">Pasien Audit</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedRecord.patientName}</p>
                <p className="text-[10px] font-mono font-medium text-purple-700">RM: {selectedRecord.rmNumber} | Rak: {selectedRecord.rakCode}</p>
              </div>

              {/* Document checklists and upload slots */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Checklist & Alih Media Slot Dokumen:
                </p>

                <div className="space-y-3 text-xs">
                  {SLOTS.map((slot) => {
                    const isCodedUploaded = selectedRecord.uploadedSlots?.[slot.key];
                    const isPhysicalChecked = selectedRecord.checklist[slot.checklistField];

                    return (
                      <div 
                        key={slot.key}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col space-y-2.5 shadow-xs"
                      >
                        {/* Header: Label and Checklist Toggle */}
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-800 leading-tight">
                            {slot.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateBerkasChecklist(selectedRecord.patientId, slot.checklistField, !isPhysicalChecked)}
                            title="Tandai fisik lengkap"
                            className="flex items-center space-x-1 cursor-pointer"
                          >
                            <span className="text-[10px] text-slate-400 font-semibold">Fisik:</span>
                            {isPhysicalChecked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* File slot status */}
                        <div className="flex items-center justify-between text-[11px]">
                          {isCodedUploaded ? (
                            <div className="flex items-center space-x-1.5 text-emerald-700 max-w-[70%]">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate font-medium" title={isCodedUploaded.fileName}>
                                {isCodedUploaded.fileName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-red-600">
                              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span className="font-semibold uppercase text-[9px] tracking-wide">Digital Kosong</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            {isCodedUploaded && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFile({
                                    fileName: isCodedUploaded.fileName,
                                    dataUrl: isCodedUploaded.dataUrl,
                                    slotName: slot.label,
                                  });
                                }}
                                className="px-1.5 py-0.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded text-[10px] font-bold cursor-pointer bg-white"
                              >
                                Lihat
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => triggerFileInput(selectedRecord.patientId, slot.key)}
                              className="px-1.5 py-0.5 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded text-[10px] font-bold cursor-pointer bg-white flex items-center space-x-0.5"
                            >
                              <Upload className="h-2.5 w-2.5" />
                              <span>Unggah</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completeness Badge Card */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                selectedRecord.isLengkap 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="text-xs">
                  <p className="font-extrabold uppercase text-[9px] tracking-wide">Analisis Kelengkapan (KLPCM)</p>
                  <p className="font-semibold mt-0.5">
                    {selectedRecord.isLengkap 
                      ? '✓ Dokumen Lengkap (Kualitas Layanan Baik)' 
                      : '⚠️ Dokumen Belum Lengkap (KLPCM Pendinding)'}
                  </p>
                </div>
              </div>

              {/* Digital File Viewer */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1 text-blue-600" />
                    <span>RME Document Viewer (Alih Media)</span>
                  </span>
                </div>
                <div className="p-4 bg-slate-100 flex flex-col items-center justify-center text-center aspect-[1.41/1]">
                  {previewFile ? (
                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center space-x-2 w-max mx-auto">
                        <FileCheck2 className="h-6 w-6 text-blue-600 animate-bounce" />
                        <div className="text-left">
                          <p className="font-extrabold text-[10px] text-indigo-700 uppercase tracking-wide">
                            Slot: {previewFile.slotName}
                          </p>
                          <p className="font-bold text-slate-800 max-w-[160px] truncate" title={previewFile.fileName}>
                            {previewFile.fileName}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">Digitalized • Click to review</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          alert(`Membuka Document Reader PDF RME:\n\nSlot Dokumen: ${previewFile.slotName}\nNama File: ${previewFile.fileName}\nID Pasien: ${selectedRecord.patientId}\n\nDokumen virtual ini diverifikasi dan ditandatangani secara digital oleh Symphony SIMRS.`);
                        }}
                        className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Lihat Dokumen Digital</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 space-y-2 text-[10px]">
                      <FileWarning className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">Dokumen Digital Kosong</p>
                      <p className="max-w-[180px] mx-auto text-slate-400 leading-normal">
                        Pasien belum melewati proses alih media digital. Silakan klik tombol Unggah di slot masing-masing.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Hidden real file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (activeUploadPatientId && activeUploadSlotKey) {
            handleFileChange(e, activeUploadPatientId, activeUploadSlotKey);
          }
        }}
        accept=".pdf,image/*"
        className="hidden"
      />

    </div>
  );
};
