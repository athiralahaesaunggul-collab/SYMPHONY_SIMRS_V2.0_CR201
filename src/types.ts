/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  rmNumber: string;
  name: string;
  nik: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan' | 'Tidak Dapat Diketahui' | 'Tidak Dapat Ditentukan' | 'Tidak Dapat Diisi';
  insurance: 'BPJS Kesehatan' | 'Asuransi Swasta' | 'Mandiri / Umum';
  clinic: 'Poli Umum' | 'Poli Penyakit Dalam' | 'Poli Bedah Umum' | 'Poli Anak' | 'Poli Kandungan/Obgyn' | 'Poli Saraf' | 'Poli Mata' | 'Poli THT' | 'Poli Gigi' | string;
  age: number;
  address?: string;
  dpjp?: string;
  keluhan?: string;
  caraMasuk?: string;
  status: 'Antre' | 'Dipanggil' | 'Sudah Diperiksa' | 'Selesai Koding' | 'Selesai Pelayanan';
  createdAt: string;
}

export interface SOAP {
  patientId: string;
  patientRm: string;
  patientName: string;
  td: string; // Tensi Darah
  nadi: string; // Nadi (bpm)
  suhu: string; // Suhu (°C)
  subjektif: string;
  objektif: string;
  asesmen: string;
  plan: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Koding {
  patientId: string;
  patientRm: string;
  patientName: string;
  primaryCode: string;
  primaryDescription: string;
  secondaryCode: string;
  secondaryDescription: string;
  alertMessage: string | null;
  isValid: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface BerkasChecklist {
  identity: boolean;
  informedConsent: boolean;
  soap: boolean;
  coding: boolean;
}

export interface Berkas {
  patientId: string;
  rmNumber: string;
  patientName: string;
  rakCode: string; // Random rak code
  isLengkap: boolean;
  checklist: BerkasChecklist;
  isScanPdf: boolean; // Alih Media status
  pdfFileName: string | null;
  pdfDataUrl: string | null; // Simulated uploaded pdf
  uploadedSlots?: {
    identity?: { fileName: string; dataUrl: string } | null;
    informedConsent?: { fileName: string; dataUrl: string } | null;
    soap?: { fileName: string; dataUrl: string } | null;
    coding?: { fileName: string; dataUrl: string } | null;
  };
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  details: string;
}

export interface Staff {
  name: string;
  role: 'Admin Loket' | 'Dokter IGD' | 'Koder' | 'Direktur' | 'Kepala RMIK';
  token?: string;
}

export interface CpptHistoryEntry {
  id?: string;     // unique ID for MySQL PK (auto-generated if not present)
  no: number;
  tanggal: string;
  jam: string;
  profesi: string;
  petugas: string;
  subjektif: string;
  objektif: string;
  asesmen: string;
  plan: string;
  td: string;
  nadi: string;
  suhu: string;
}

export interface RingkasanKeluar {
  patientId: string;
  diagnosisAkhir: string;
  kondisiPulang: 'Sembuh' | 'Dirujuk' | 'Meninggal' | '';
  tindakLanjut: 'Kontrol' | 'Rujuk' | '';
  tanggalKeluar: string;
}
