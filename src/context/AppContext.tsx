/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, SOAP, Koding, Berkas, AuditLog, Staff, CpptHistoryEntry } from '../types';
import {
  generateMedicalRecordNumber,
  generateRakCode,
  getCurrentTimestamp,
  signSimulatedJWT,
  verifySimulatedJWT
} from '../utils/helpers';
import { validateCDSS } from '../data/icd10Database';
// Removed Firebase imports - switching to local Express API

interface AppContextType {
  currentStaff: Staff | null;
  patients: Patient[];
  soaps: Record<string, SOAP>;
  kodings: Record<string, Koding>;
  berkas: Record<string, Berkas>;
  auditLogs: AuditLog[];
  cpptRecords: Record<string, CpptHistoryEntry[]>;
  currentTab: string;
  selectedPatientIdForSoap: string | null;
  selectedPatientIdForKoding: string | null;
  selectedPatientIdForBerkas: string | null;
  admisiDraft: any;
  login: (name: string, role: Staff['role']) => boolean;
  logout: () => void;
  registerPatient: (patientData: any) => Patient;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  saveSOAP: (soapData: any) => void;
  saveKoding: (kodingData: any) => void;
  updateBerkasChecklist: (patientId: string, item: string, value: boolean) => void;
  uploadBerkasScan: (patientId: string, fileName: string, fileData: string, slotKey?: string) => void;
  addAuditLog: (action: string, module: string, details: string) => void;
  setTab: (tab: string) => void;
  setSelectedPatientIdForSoap: (id: string | null) => void;
  setSelectedPatientIdForKoding: (id: string | null) => void;
  setSelectedPatientIdForBerkas: (id: string | null) => void;
  saveCpptEntry: (patientId: string, entry: CpptHistoryEntry) => void;
  setAdmisiDraft: (draft: any) => void;
  clearAdmisiDraft: () => void;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- AUTH STATE & SESSION ---
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  // --- CORE SYSTEM ARRAYS & RECORD MAPS ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [soaps, setSoaps] = useState<Record<string, SOAP>>({});
  const [kodings, setKodings] = useState<Record<string, Koding>>({});
  const [berkas, setBerkas] = useState<Record<string, Berkas>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // --- NAVIGATION & CURRENT SELECTION ---
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPatientIdForSoap, setSelectedPatientIdForSoapState] = useState<string | null>(null);
  const [selectedPatientIdForKoding, setSelectedPatientIdForKodingState] = useState<string | null>(null);
  const [selectedPatientIdForBerkas, setSelectedPatientIdForBerkasState] = useState<string | null>(null);

  // CPPT history
  const [cpptRecords, setCpptRecords] = useState<Record<string, CpptHistoryEntry[]>>(() => {
    try {
      const saved = localStorage.getItem('symphony_cppt');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // --- AUTO-SAVE FORM DRAFT (ADMISI) ---
  const [admisiDraft, setAdmisiDraftState] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('symphony_admisi_draft');
      return saved ? JSON.parse(saved) : {
        name: '',
        nik: '',
        birthDate: '',
        gender: '',
        insurance: '',
        clinic: ''
      };
    } catch {
      return { name: '', nik: '', birthDate: '', gender: '', insurance: '', clinic: '' };
    }
  });

  // Deteksi domain aktif secara dinamis baik di localhost maupun di Vercel produksi/preview
  const BACKEND_URL = (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://symphony-simrs-v2-0-cr-201.vercel.app') + '/api';

  const fetchSyncData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/sync`);
      const result = await response.json();
      if (result.status === 'success') {
        const { patients: pData, soaps: sData, kodings: kData, berkas: bData, auditLogs: aData, cpptRecords: cData } = result.data;

        setPatients(pData);
        setSoaps(sData);
        setKodings(kData);
        setBerkas(bData);
        setAuditLogs(aData);
        // Load CPPT records from DB if available
        if (cData && Object.keys(cData).length > 0) {
          setCpptRecords(cData);
        }

        // Update local storage cache
        localStorage.setItem('symphony_patients', JSON.stringify(pData));
        localStorage.setItem('symphony_soaps', JSON.stringify(sData));
        localStorage.setItem('symphony_kodings', JSON.stringify(kData));
        localStorage.setItem('symphony_berkas', JSON.stringify(bData));
        localStorage.setItem('symphony_audit_logs', JSON.stringify(aData));
      }
    } catch (err) {
      console.error('Error polling data from backend:', err);
    }
  };

  // Load state from localStorage on init & setup local API polling
  useEffect(() => {
    // 1. Authenticate with Token
    const savedToken = localStorage.getItem('symphony_auth_token');
    if (savedToken) {
      const verified = verifySimulatedJWT(savedToken);
      if (verified) {
        setCurrentStaff({
          name: verified.name,
          role: verified.role,
          token: savedToken
        });
      } else {
        localStorage.removeItem('symphony_auth_token');
      }
    }

    // 2. Load Patient Data from LocalStorage first as instantaneous cache fallback
    const savedPatients = localStorage.getItem('symphony_patients');
    const savedSoaps = localStorage.getItem('symphony_soaps');
    const savedKodings = localStorage.getItem('symphony_kodings');
    const savedBerkas = localStorage.getItem('symphony_berkas');
    const savedLogs = localStorage.getItem('symphony_audit_logs');

    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
      if (savedSoaps) setSoaps(JSON.parse(savedSoaps));
      if (savedKodings) setKodings(JSON.parse(savedKodings));
      if (savedBerkas) setBerkas(JSON.parse(savedBerkas));
    }
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    } else {
      const initLog: AuditLog = {
        id: 'LOG-INIT',
        timestamp: getCurrentTimestamp(),
        user: 'Sistem SIMRS',
        role: 'Kepala RMIK',
        action: 'Inisialisasi Sistem',
        module: 'Sistem',
        details: 'Sistem Symphony SIMRS v2.0 berhasil diaktifkan.'
      };
      setAuditLogs([initLog]);
    }

    // Initial sync
    fetchSyncData();

    // Start polling interval every 15 seconds to keep other sessions in sync
    // (diperlambat dari 3s ke 15s agar tidak mengganggu input user)
    const intervalId = setInterval(fetchSyncData, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Save drafts when updated
  const setSelectedPatientIdForBerkas = (id: string | null) => {
    setSelectedPatientIdForBerkasState(id);
  };

  const saveCpptEntry = (patientId: string, entry: CpptHistoryEntry) => {
    setCpptRecords(prev => {
      const patientEntries = prev[patientId] || [];
      const updated = {
        ...prev,
        [patientId]: [...patientEntries, entry]
      };
      localStorage.setItem('symphony_cppt', JSON.stringify(updated));
      return updated;
    });

    // Also save to MySQL backend
    fetch(`${BACKEND_URL}/cppt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, patientId })
    })
      .then(res => res.json())
      .then(() => fetchSyncData())
      .catch(err => console.error('Error saving CPPT to backend:', err));
  };
  const setAdmisiDraft = (draft: any) => {
    setAdmisiDraftState(draft);
    localStorage.setItem('symphony_admisi_draft', JSON.stringify(draft));
  };

  const clearAdmisiDraft = () => {
    const fresh = { name: '', nik: '', birthDate: '', gender: '', insurance: '', clinic: '' };
    setAdmisiDraftState(fresh);
    localStorage.removeItem('symphony_admisi_draft');
  };

  // Helper to push audit logs securely
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: getCurrentTimestamp(),
      user: currentStaff ? currentStaff.name : 'Unauthenticated',
      role: currentStaff ? currentStaff.role : 'Guest',
      action,
      module,
      details
    };

    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('symphony_audit_logs', JSON.stringify(updated));
      return updated;
    });

    // Sync to MySQL via backend
    fetch(`${BACKEND_URL}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error('Error posting audit log:', err));
  };

  // --- INTERMEDIATE ACTION HANDLERS ---

  // LOGIN FUNCTION WITH JWT GENERATION
  const login = (name: string, role: Staff['role']): boolean => {
    if (!name || !role) return false;

    // Generate real secure simulated JWT Token
    const token = signSimulatedJWT({ name, role });
    const staffMember: Staff = { name, role, token };

    setCurrentStaff(staffMember);
    localStorage.setItem('symphony_auth_token', token);

    // Add forensic security log
    const logMsg = `Petugas berhasil login. Sesi JWT diamankan dengan token virtual.`;
    const tempStaffLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: getCurrentTimestamp(),
      user: name,
      role: role,
      action: 'Login Petugas',
      module: 'Keamanan / Auth',
      details: logMsg
    };

    setAuditLogs(prev => {
      const updated = [tempStaffLog, ...prev];
      localStorage.setItem('symphony_audit_logs', JSON.stringify(updated));
      return updated;
    });

    // Save login audit log to MySQL via backend
    fetch(`${BACKEND_URL}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempStaffLog)
    }).catch(err => console.error('Error posting login audit log:', err));

    return true;
  };

  // LOGOUT FUNCTION
  const logout = () => {
    if (currentStaff) {
      addAuditLog('Logout Petugas', 'Keamanan / Auth', `Petugas ${currentStaff.name} mengakhiri sesi rekam medis.`);
    }
    setCurrentStaff(null);
    localStorage.removeItem('symphony_auth_token');
  };

  // REGISTER PATIENT (Loket Admisi)
  const registerPatient = (patientData: Omit<Patient, 'id' | 'rmNumber' | 'status' | 'createdAt'>): Patient => {
    const existingRmNumbers = patients.map(p => p.rmNumber);
    const rmNumber = generateMedicalRecordNumber(existingRmNumbers);
    const id = `PAT-${Date.now()}`;

    const newPatient: Patient = {
      ...patientData,
      id,
      rmNumber,
      status: 'Antre',
      createdAt: getCurrentTimestamp()
    };

    // Auto-generate Berkas Hybrid Track record for this patient
    const newBerkas: Berkas = {
      patientId: id,
      rmNumber,
      patientName: patientData.name,
      rakCode: generateRakCode(),
      isLengkap: false,
      checklist: {
        identity: true, // Demografi dasar dari admisi terisi
        informedConsent: false,
        soap: false,
        coding: false
      },
      isScanPdf: false,
      pdfFileName: null,
      pdfDataUrl: null,
      updatedAt: getCurrentTimestamp()
    };

    // Update Local States immediately
    setPatients(prev => {
      const updated = [...prev, newPatient];
      localStorage.setItem('symphony_patients', JSON.stringify(updated));
      return updated;
    });

    setBerkas(prev => {
      const updated = { ...prev, [id]: newBerkas };
      localStorage.setItem('symphony_berkas', JSON.stringify(updated));
      return updated;
    });

    // Save States to MySQL via Express
    fetch(`${BACKEND_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPatient, berkas: newBerkas })
    })
      .then(res => res.json())
      .then(() => fetchSyncData())
      .catch(err => console.error('Error registering patient on backend:', err));

    // Add Forensic Audit Trail
    addAuditLog(
      'Pendaftaran Pasien Baru',
      'Loket Admisi',
      `Pasien ${newPatient.name} terdaftar dengan No. RM ${rmNumber} untuk ${newPatient.clinic}.`
    );

    // Clear Draft
    clearAdmisiDraft();

    return newPatient;
  };

  // CALL & CHANGE PATIENT STATUS
  const updatePatientStatus = (id: string, status: Patient['status']) => {
    setPatients(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, status } : p);
      localStorage.setItem('symphony_patients', JSON.stringify(updated));
      return updated;
    });

    const target = patients.find(p => p.id === id);
    if (target) {
      // Save status update to MySQL via Express
      fetch(`${BACKEND_URL}/patients/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
        .then(res => res.json())
        .then(() => fetchSyncData())
        .catch(err => console.error('Error updating patient status on backend:', err));

      addAuditLog(
        'Ubah Status Antrean',
        'Loket Admisi',
        `Status antrean pasien ${target.name} (${target.rmNumber}) diubah menjadi [${status}].`
      );
    }
  };

  // SAVE CLINICAL SOAP / CPPT RECORD
  const saveSOAP = (soapData: Omit<SOAP, 'updatedAt' | 'updatedBy'>) => {
    const patientId = soapData.patientId;
    const staffName = currentStaff ? currentStaff.name : 'Dokter';

    const newSoap: SOAP = {
      ...soapData,
      updatedAt: getCurrentTimestamp(),
      updatedBy: staffName
    };

    // Update Local States immediately
    setSoaps(prev => {
      const updated = { ...prev, [patientId]: newSoap };
      localStorage.setItem('symphony_soaps', JSON.stringify(updated));
      return updated;
    });

    setPatients(prev => {
      const updated = prev.map(p => p.id === patientId ? { ...p, status: 'Sudah Diperiksa' as const } : p);
      localStorage.setItem('symphony_patients', JSON.stringify(updated));
      return updated;
    });

    setBerkas(prev => {
      const bRecord = prev[patientId];
      if (bRecord) {
        const updatedChecklist = { ...bRecord.checklist, soap: true };
        const isLengkap = updatedChecklist.identity && updatedChecklist.informedConsent && updatedChecklist.soap && updatedChecklist.coding;
        const updatedRecord: Berkas = {
          ...bRecord,
          checklist: updatedChecklist,
          isLengkap,
          updatedAt: getCurrentTimestamp()
        };
        const updated = { ...prev, [patientId]: updatedRecord };
        localStorage.setItem('symphony_berkas', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    // Save SOAP & Update patient status + berkas checklist to MySQL via Express
    fetch(`${BACKEND_URL}/soaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSoap)
    })
      .then(res => res.json())
      .then(() => fetchSyncData())
      .catch(err => console.error('Error saving SOAP on backend:', err));

    addAuditLog(
      'Simpan SOAP CPPT',
      'Workstation Klinis',
      `SOAP berhasil disimpan untuk pasien ${soapData.patientName} (${soapData.patientRm}) oleh ${staffName}.`
    );
  };

  // SAVE ICD-10 KODING WITH CDSS VALIDATION
  const saveKoding = (kodingData: {
    patientId: string;
    patientRm: string;
    patientName: string;
    primaryCode: string;
    primaryDescription: string;
    secondaryCode: string;
    secondaryDescription: string;
  }) => {
    const patientId = kodingData.patientId;
    const staffName = currentStaff ? currentStaff.name : 'Koder';

    // Get SOAP text to analyze relevance
    const patientSoap = soaps[patientId];
    const soapText = patientSoap
      ? `${patientSoap.subjektif} ${patientSoap.objektif} ${patientSoap.asesmen} ${patientSoap.plan}`
      : '';

    // Run CDSS
    const cdssResult = validateCDSS(
      kodingData.primaryCode,
      kodingData.secondaryCode,
      soapText,
      patientSoap ? patientSoap.asesmen : undefined
    );

    const newKoding: Koding = {
      ...kodingData,
      alertMessage: cdssResult.message,
      isValid: cdssResult.isValid,
      updatedAt: getCurrentTimestamp(),
      updatedBy: staffName
    };

    // Update Local States immediately
    setKodings(prev => {
      const updated = { ...prev, [patientId]: newKoding };
      localStorage.setItem('symphony_kodings', JSON.stringify(updated));
      return updated;
    });

    setPatients(prev => {
      const updated = prev.map(p => p.id === patientId ? { ...p, status: 'Selesai Koding' as const } : p);
      localStorage.setItem('symphony_patients', JSON.stringify(updated));
      return updated;
    });

    setBerkas(prev => {
      const bRecord = prev[patientId];
      if (bRecord) {
        const updatedChecklist = { ...bRecord.checklist, coding: true };
        const isLengkap = updatedChecklist.identity && updatedChecklist.informedConsent && updatedChecklist.soap && updatedChecklist.coding;
        const updatedRecord: Berkas = {
          ...bRecord,
          checklist: updatedChecklist,
          isLengkap,
          updatedAt: getCurrentTimestamp()
        };
        const updated = { ...prev, [patientId]: updatedRecord };
        localStorage.setItem('symphony_berkas', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    // Save Koding & Update patient status + berkas checklist to MySQL via Express
    fetch(`${BACKEND_URL}/kodings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKoding)
    })
      .then(res => res.json())
      .then(() => fetchSyncData())
      .catch(err => console.error('Error saving Koding on backend:', err));

    // Write log
    const logDetails = `Mengodekan Diagnosis Utama: ${kodingData.primaryCode}, Sekunder: ${kodingData.secondaryCode || 'Tidak ada'}. CDSS Status: ${cdssResult.isValid ? 'VALID' : 'MISCODING ALERT'}.`;
    addAuditLog(
      'Input Koding ICD-10',
      'Unit Koding',
      `Koding ICD-10 pasien ${kodingData.patientName} (${kodingData.patientRm}) disimpan oleh ${staffName}. ${logDetails}`
    );
  };

  // UPDATE CHECKLIST INDIVIDUAL FILE KELENGKAPAN BERKAS
  const updateBerkasChecklist = (patientId: string, item: string, value: boolean) => {
    const bRecord = berkas[patientId];
    if (bRecord) {
      const updatedChecklist = { ...bRecord.checklist, [item]: value };
      const isLengkap = updatedChecklist.identity && updatedChecklist.informedConsent && updatedChecklist.soap && updatedChecklist.coding;
      const updatedRecord: Berkas = {
        ...bRecord,
        checklist: updatedChecklist,
        isLengkap,
        updatedAt: getCurrentTimestamp()
      };

      setBerkas(prev => {
        const updated = { ...prev, [patientId]: updatedRecord };
        localStorage.setItem('symphony_berkas', JSON.stringify(updated));
        return updated;
      });

      // Update checklist to MySQL via Express
      fetch(`${BACKEND_URL}/berkas/${patientId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, value, updatedAt: updatedRecord.updatedAt })
      })
        .then(res => res.json())
        .then(() => fetchSyncData())
        .catch(err => console.error('Error updating checklist item on backend:', err));

      addAuditLog(
        'Ubah Kelengkapan Berkas',
        'Pelacakan Berkas Hybrid',
        `Berkas checklist '${item}' untuk pasien ${bRecord.patientName} (${bRecord.rmNumber}) diubah menjadi [${value ? 'Lengkap' : 'Belum Lengkap'}].`
      );
    }
  };

  // UPLOAD SCANNED PDF FOR ALIH MEDIA
  const uploadBerkasScan = (patientId: string, fileName: string, fileData: string, slotKey?: string) => {
    const bRecord = berkas[patientId];
    if (bRecord) {
      const updatedSlots = { ...(bRecord.uploadedSlots || {}) };
      if (slotKey) {
        updatedSlots[slotKey] = { fileName, dataUrl: fileData };
      }
      const updatedRecord: Berkas = {
        ...bRecord,
        isScanPdf: true,
        pdfFileName: fileName,
        pdfDataUrl: fileData,
        uploadedSlots: updatedSlots,
        updatedAt: getCurrentTimestamp()
      };

      setBerkas(prev => {
        const updated = { ...prev, [patientId]: updatedRecord };
        localStorage.setItem('symphony_berkas', JSON.stringify(updated));
        return updated;
      });

      // Upload scan info to MySQL via Express
      fetch(`${BACKEND_URL}/berkas/${patientId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileData,
          uploadedSlots: updatedSlots,
          updatedAt: updatedRecord.updatedAt
        })
      })
        .then(res => res.json())
        .then(() => fetchSyncData())
        .catch(err => console.error('Error uploading scan file on backend:', err));

      const slotInfo = slotKey ? ` (Slot: ${slotKey})` : '';
      addAuditLog(
        'Alih Media Berkas RME',
        'Pelacakan Berkas Hybrid',
        `Alih media berkas pasien ${bRecord.patientName} (${bRecord.rmNumber}) selesai${slotInfo}. File diunggah: ${fileName}.`
      );
    }
  };

  // WRAPPERS FOR SELECTIONS
  const setSelectedPatientIdForSoap = (id: string | null) => {
    setSelectedPatientIdForSoapState(id);
    if (id) {
      const target = patients.find(p => p.id === id);
      if (target) {
        addAuditLog(
          'Pilih Pasien SOAP',
          'Workstation Klinis',
          `Dokter memilih pasien ${target.name} (${target.rmNumber}) untuk entry SOAP.`
        );
      }
    }
  };

  const setSelectedPatientIdForKoding = (id: string | null) => {
    setSelectedPatientIdForKodingState(id);
    if (id) {
      const target = patients.find(p => p.id === id);
      if (target) {
        addAuditLog(
          'Pilih Pasien Koding',
          'Unit Koding',
          `Koder memilih pasien ${target.name} (${target.rmNumber}) untuk koding ICD-10.`
        );
      }
    }
  };

  const setTab = (tab: string) => {
    setCurrentTab(tab);
    addAuditLog('Navigasi Modul', 'Sistem', `Beralih ke modul workstation [${tab.toUpperCase()}].`);
  };

  const resetToDefault = async () => {
    localStorage.removeItem('symphony_auth_token');
    localStorage.removeItem('symphony_patients');
    localStorage.removeItem('symphony_soaps');
    localStorage.removeItem('symphony_berkas');
    localStorage.removeItem('symphony_kodings');
    localStorage.removeItem('symphony_audit_logs');

    try {
      const res = await fetch(`${BACKEND_URL}/reset`, { method: 'POST' });
      const result = await res.json();
      if (result.status === 'success') {
        setSelectedPatientIdForSoapState(null);
        setSelectedPatientIdForKodingState(null);
        await fetchSyncData();

        if (currentStaff) {
          addAuditLog('Database Reset', 'Sistem', 'Seluruh data rekam medis di-reset ke pengaturan standar universitas.');
        }
      }
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentStaff,
        patients,
        soaps,
        kodings,
        berkas,
        auditLogs,
        cpptRecords,
        currentTab,
        selectedPatientIdForSoap,
        selectedPatientIdForKoding,
        selectedPatientIdForBerkas,
        admisiDraft,
        login,
        logout,
        registerPatient,
        updatePatientStatus,
        saveSOAP,
        saveKoding,
        updateBerkasChecklist,
        uploadBerkasScan,
        addAuditLog,
        setTab,
        setSelectedPatientIdForSoap,
        setSelectedPatientIdForKoding,
        setSelectedPatientIdForBerkas,
        saveCpptEntry,
        setAdmisiDraft,
        clearAdmisiDraft,
        resetToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
