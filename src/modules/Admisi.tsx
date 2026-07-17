/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateAge } from '../utils/helpers';
import { KIBCard } from '../components/KIBCard';
import { Patient } from '../types';
import {
  UserPlus,
  Users,
  CreditCard,
  Volume2,
  FileText,
  Search,
  User,
  FileCheck,
  AlertCircle
} from 'lucide-react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

type PatientStatusType = 'Baru' | 'Lama';
type ServiceType = 'Rawat Jalan' | 'IGD' | 'Rawat Inap';

// Data 38 Provinsi Indonesia (static, dengan ID Emsifa untuk cascading Kab/Kota)
const STATIC_PROVINCES = [
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '92', name: 'PAPUA' },
  { id: '93', name: 'PAPUA SELATAN' },
  { id: '94', name: 'PAPUA TENGAH' },
  { id: '95', name: 'PAPUA PEGUNUNGAN' },
  { id: '96', name: 'PAPUA BARAT DAYA' },
];

const DOCTORS_BY_CLINIC = {
  'Poli Umum': [
    { name: 'dr. Andi Kurniawan', sip: 'SIP: 503/1001/P-Umum/2024' },
    { name: 'dr. Rina Setiawati', sip: 'SIP: 503/1002/P-Umum/2024' }
  ],
  'Poli Penyakit Dalam': [
    { name: 'dr. Ahmad Fauzi, Sp.PD', sip: 'SIP: 503/2680/PTSP/DKI-B/2024' },
    { name: 'dr. Hera Fitria, Sp.PD', sip: 'SIP: 503/2681/PTSP/DKI-B/2024' }
  ],
  'Poli Bedah Umum': [
    { name: 'dr. Budi Santoso, Sp.B', sip: 'SIP: 503/3050/PTSP/DKI-B/2024' },
    { name: 'dr. Candra Wijaya, Sp.B', sip: 'SIP: 503/3051/PTSP/DKI-B/2024' }
  ],
  'Poli Anak': [
    { name: 'dr. Maya Sari, Sp.A', sip: 'SIP: 503/4001/PTSP/DKI-B/2024' },
    { name: 'dr. Kevin Pratama, Sp.A', sip: 'SIP: 503/4002/PTSP/DKI-B/2024' }
  ],
  'Poli Kandungan/Obgyn': [
    { name: 'dr. Sita Rahayu, Sp.OG', sip: 'SIP: 503/5001/PTSP/DKI-B/2024' },
    { name: 'dr. Farhan Ali, Sp.OG', sip: 'SIP: 503/5002/PTSP/DKI-B/2024' }
  ],
  'Poli Saraf': [
    { name: 'dr. Dimas Anggara, Sp.N', sip: 'SIP: 503/6001/PTSP/DKI-B/2024' },
    { name: 'dr. Lestari Budi, Sp.N', sip: 'SIP: 503/6002/PTSP/DKI-B/2024' }
  ],
  'Poli Mata': [
    { name: 'dr. Anton Wahyudi, Sp.M', sip: 'SIP: 503/7001/PTSP/DKI-B/2024' },
    { name: 'dr. Dina Mariana, Sp.M', sip: 'SIP: 503/7002/PTSP/DKI-B/2024' }
  ],
  'Poli THT': [
    { name: 'dr. Rizki Ramadhan, Sp.THT-KL', sip: 'SIP: 503/8001/PTSP/DKI-B/2024' },
    { name: 'dr. Wulan Ndari, Sp.THT-KL', sip: 'SIP: 503/8002/PTSP/DKI-B/2024' }
  ],
  'Poli Gigi': [
    { name: 'drg. Intan Permata', sip: 'SIP: 503/9001/PTSP/DKI-B/2024' },
    { name: 'drg. Hendra Kusuma', sip: 'SIP: 503/9002/PTSP/DKI-B/2024' }
  ]
};

const getWilayahJsonUrl = (filename: string) => {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${filename}`;
};

export const Admisi: React.FC = () => {
  const {
    patients,
    registerPatient,
    updatePatientStatus,
    setSelectedPatientIdForSoap,
    setTab,
    admisiDraft,
    setAdmisiDraft,
    kodings
  } = useApp();

  // Local Form state derived from AppContext's draft
  const [formData, setFormData] = useState({
    name: admisiDraft.name || '',
    nik: admisiDraft.nik || '',
    birthDate: admisiDraft.birthDate || '',
    gender: admisiDraft.gender || '',
    insurance: admisiDraft.insurance || '',
    clinic: admisiDraft.clinic || '',
    address: admisiDraft.address || '',
    dpjp: admisiDraft.dpjp || '',
    maritalStatus: (admisiDraft as any).maritalStatus || '',
    religion: (admisiDraft as any).religion || '',
    education: (admisiDraft as any).education || '',
    occupation: (admisiDraft as any).occupation || '',
    province: (admisiDraft as any).province || '',
    city: (admisiDraft as any).city || '',
    kecamatan: (admisiDraft as any).kecamatan || '',
    kelurahan: (admisiDraft as any).kelurahan || '',
    caraMasuk: (admisiDraft as any).caraMasuk || ''
  });

  const [liveAge, setLiveAge] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKibPatient, setSelectedKibPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sip, setSip] = useState('');

  const [patientStatus, setPatientStatus] = useState<PatientStatusType>('Baru');
  const [serviceType, setServiceType] = useState<ServiceType>('Rawat Jalan');
  const [searchOldPatient, setSearchOldPatient] = useState('');
  const [isOldPatientFound, setIsOldPatientFound] = useState(false);
  const [roomClass, setRoomClass] = useState('');

  // API Wilayah Emsifa States
  const [listProvinsi, setListProvinsi] = useState<any[]>([]);
  const [listKabupaten, setListKabupaten] = useState<any[]>([]);
  const [listKecamatan, setListKecamatan] = useState<any[]>([]);
  const [listKelurahan, setListKelurahan] = useState<any[]>([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");

  // Maps untuk offline/local lookup wilayah
  const [allKabupatenMap, setAllKabupatenMap] = useState<Record<string, any[]>>({});
  const [allKecamatanMap, setAllKecamatanMap] = useState<Record<string, any[]>>({});
  const [allKelurahanMap, setAllKelurahanMap] = useState<Record<string, any[]>>({});

  // Status koneksi internet
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearchOldPatient = () => {
    if (!searchOldPatient) {
      setErrorMsg('Masukkan No RM / NIK terlebih dahulu');
      return;
    }
    
    const foundPatient = patients.find(p => p.rmNumber === searchOldPatient || p.nik === searchOldPatient);

    if (foundPatient) {
      setErrorMsg(null);
      setFormData({
        ...formData,
        name: foundPatient.name || '',
        nik: foundPatient.nik || '',
        birthDate: foundPatient.birthDate || '',
        gender: foundPatient.gender || '',
        insurance: foundPatient.insurance || '',
        address: foundPatient.address || '',
      });
      setIsOldPatientFound(true);
      setSuccessMsg('Data pasien lama ditemukan! Silakan verifikasi dan lanjutkan pendaftaran.');
    } else {
      setErrorMsg('Data pasien tidak ditemukan. Pastikan No RM atau NIK sudah benar.');
      setIsOldPatientFound(false);
      setSuccessMsg(null);
    }
  };

  // Sync state with draft
  useEffect(() => {
    setFormData({
      name: admisiDraft.name || '',
      nik: admisiDraft.nik || '',
      birthDate: admisiDraft.birthDate || '',
      gender: admisiDraft.gender || '',
      insurance: admisiDraft.insurance || '',
      clinic: admisiDraft.clinic || '',
      address: admisiDraft.address || '',
      dpjp: admisiDraft.dpjp || '',
      maritalStatus: (admisiDraft as any).maritalStatus || '',
      religion: (admisiDraft as any).religion || '',
      education: (admisiDraft as any).education || '',
      occupation: (admisiDraft as any).occupation || '',
      province: (admisiDraft as any).province || '',
      city: (admisiDraft as any).city || '',
      kecamatan: (admisiDraft as any).kecamatan || '',
      kelurahan: (admisiDraft as any).kelurahan || ''
    });

    if (admisiDraft.clinic && admisiDraft.dpjp) {
      const doctors = DOCTORS_BY_CLINIC[admisiDraft.clinic as keyof typeof DOCTORS_BY_CLINIC] || [];
      const doc = doctors.find(d => d.name === admisiDraft.dpjp);
      setSip(doc ? doc.sip : '');
    } else {
      setSip('');
    }
  }, [admisiDraft]);

  // Handle live age calculation when birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      setLiveAge(calculateAge(formData.birthDate));
    } else {
      setLiveAge(0);
    }
  }, [formData.birthDate]);

  // Inisialisasi daftar provinsi langsung dari data statis (tidak perlu fetch API)
  useEffect(() => {
    setListProvinsi(STATIC_PROVINCES);

    // Load kabupaten and kecamatan mappings on load from public folder
    fetch(getWilayahJsonUrl('wilayah_kabupaten.json'))
      .then(res => res.json())
      .then(data => setAllKabupatenMap(data))
      .catch(err => console.error("Gagal load local kabupaten:", err));

    fetch(getWilayahJsonUrl('wilayah_kecamatan.json'))
      .then(res => res.json())
      .then(data => setAllKecamatanMap(data))
      .catch(err => console.error("Gagal load local kecamatan:", err));
  }, []);

  // Helper fallback untuk online fetch jika data lokal belum siap
  const fetchFallbackKabupaten = (provId: string) => {
    fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provId}.json`)
      .then(res => res.json())
      .then(data => setListKabupaten(data))
      .catch(err => console.error("Fallback load kabupaten failed:", err));
  };

  const fetchFallbackKecamatan = (kabId: string) => {
    fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${kabId}.json`)
      .then(res => res.json())
      .then(data => setListKecamatan(data))
      .catch(err => console.error("Fallback load kecamatan failed:", err));
  };

  const fetchFallbackKelurahan = (kecId: string) => {
    fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${kecId}.json`)
      .then(res => res.json())
      .then(data => setListKelurahan(data))
      .catch(err => console.error("Fallback load kelurahan failed:", err));
  };

  // Update daftar kabupaten ketika provinsi terpilih berubah
  useEffect(() => {
    if (selectedProvinsi) {
      if (allKabupatenMap[selectedProvinsi] && allKabupatenMap[selectedProvinsi].length > 0) {
        setListKabupaten(allKabupatenMap[selectedProvinsi]);
      } else {
        fetchFallbackKabupaten(selectedProvinsi);
      }
    } else {
      setListKabupaten([]);
    }
  }, [selectedProvinsi, allKabupatenMap]);

  // Update daftar kecamatan ketika kabupaten terpilih berubah
  useEffect(() => {
    if (selectedKabupaten) {
      if (allKecamatanMap[selectedKabupaten] && allKecamatanMap[selectedKabupaten].length > 0) {
        setListKecamatan(allKecamatanMap[selectedKabupaten]);
      } else {
        fetchFallbackKecamatan(selectedKabupaten);
      }
    } else {
      setListKecamatan([]);
    }
  }, [selectedKabupaten, allKecamatanMap]);

  // Update daftar kelurahan secara lazy ketika kecamatan terpilih berubah
  useEffect(() => {
    if (selectedKecamatan) {
      if (Object.keys(allKelurahanMap).length === 0) {
        // Load file kelurahan secara lazy dari public folder
        fetch(getWilayahJsonUrl('wilayah_kelurahan.json'))
          .then(res => res.json())
          .then(data => {
            setAllKelurahanMap(data);
            if (data[selectedKecamatan] && data[selectedKecamatan].length > 0) {
              setListKelurahan(data[selectedKecamatan]);
            } else {
              fetchFallbackKelurahan(selectedKecamatan);
            }
          })
          .catch(err => {
            console.error("Gagal load local kelurahan:", err);
            fetchFallbackKelurahan(selectedKecamatan);
          });
      } else {
        if (allKelurahanMap[selectedKecamatan] && allKelurahanMap[selectedKecamatan].length > 0) {
          setListKelurahan(allKelurahanMap[selectedKecamatan]);
        } else {
          fetchFallbackKelurahan(selectedKecamatan);
        }
      }
    } else {
      setListKelurahan([]);
    }
  }, [selectedKecamatan, allKelurahanMap]);

  // Synchronize dropdown IDs (selectedProvinsi, etc.) when formData (populated from draft/old patient) is updated
  useEffect(() => {
    if (formData.province) {
      const foundProv = STATIC_PROVINCES.find(p => p.name.toUpperCase() === formData.province.toUpperCase());
      if (foundProv && selectedProvinsi !== foundProv.id) {
        setSelectedProvinsi(foundProv.id);
      }
    } else {
      setSelectedProvinsi('');
    }
  }, [formData.province, selectedProvinsi]);

  useEffect(() => {
    if (selectedProvinsi && formData.city && listKabupaten.length > 0) {
      const foundKab = listKabupaten.find(k => k.name.toUpperCase() === formData.city.toUpperCase());
      if (foundKab && selectedKabupaten !== foundKab.id) {
        setSelectedKabupaten(foundKab.id);
      }
    } else if (!selectedProvinsi || !formData.city) {
      setSelectedKabupaten('');
    }
  }, [selectedProvinsi, formData.city, listKabupaten, selectedKabupaten]);

  useEffect(() => {
    if (selectedKabupaten && formData.kecamatan && listKecamatan.length > 0) {
      const foundKec = listKecamatan.find(k => k.name.toUpperCase() === formData.kecamatan.toUpperCase());
      if (foundKec && selectedKecamatan !== foundKec.id) {
        setSelectedKecamatan(foundKec.id);
      }
    } else if (!selectedKabupaten || !formData.kecamatan) {
      setSelectedKecamatan('');
    }
  }, [selectedKabupaten, formData.kecamatan, listKecamatan, selectedKecamatan]);

  useEffect(() => {
    if (selectedKecamatan && formData.kelurahan && listKelurahan.length > 0) {
      const foundKel = listKelurahan.find(k => k.name.toUpperCase() === formData.kelurahan.toUpperCase());
      if (foundKel && selectedKelurahan !== foundKel.id) {
        setSelectedKelurahan(foundKel.id);
      }
    } else if (!selectedKecamatan || !formData.kelurahan) {
      setSelectedKelurahan('');
    }
  }, [selectedKecamatan, formData.kelurahan, listKelurahan, selectedKelurahan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Strict digit validation for NIK
    if (name === 'nik') {
      const numericValue = value.replace(/\D/g, ''); // Keep only digits
      if (numericValue.length <= 16) {
        const updated = { ...formData, [name]: numericValue };
        setFormData(updated);
        setAdmisiDraft(updated);
      }
    } else if (name === 'clinic') {
      const updated = { ...formData, [name]: value, dpjp: '' };
      setFormData(updated);
      setAdmisiDraft(updated);
      setSip('');
    } else if (name === 'dpjp') {
      const updated = { ...formData, [name]: value };
      setFormData(updated);
      setAdmisiDraft(updated);
      const doctors = DOCTORS_BY_CLINIC[formData.clinic as keyof typeof DOCTORS_BY_CLINIC] || [];
      const doc = doctors.find(d => d.name === value);
      setSip(doc ? doc.sip : '');
    } else {
      const updated = { ...formData, [name]: value };
      setFormData(updated);
      setAdmisiDraft(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form validations - semua field wajib diisi
    if (!formData.name.trim()) {
      setErrorMsg('Nama pasien wajib diisi.');
      return;
    }
    if (formData.nik.length !== 16) {
      setErrorMsg('NIK wajib bernilai tepat 16 digit angka.');
      return;
    }
    if (!formData.birthDate) {
      setErrorMsg('Tanggal lahir wajib ditentukan.');
      return;
    }
    if (!formData.gender) {
      setErrorMsg('Jenis kelamin wajib dipilih.');
      return;
    }
    if (!formData.maritalStatus) {
      setErrorMsg('Status pernikahan wajib dipilih.');
      return;
    }
    if (!formData.religion) {
      setErrorMsg('Agama wajib dipilih.');
      return;
    }
    if (!formData.education) {
      setErrorMsg('Pendidikan terakhir wajib dipilih.');
      return;
    }
    if (!formData.occupation) {
      setErrorMsg('Pekerjaan wajib dipilih.');
      return;
    }
    if (!formData.insurance) {
      setErrorMsg('Jenis asuransi / pembayaran wajib dipilih.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Alamat lengkap wajib diisi.');
      return;
    }
    if (!formData.province) {
      setErrorMsg('Provinsi wajib dipilih.');
      return;
    }
    if (!formData.city) {
      setErrorMsg('Kab/Kota wajib dipilih.');
      return;
    }
    if (!formData.kecamatan) {
      setErrorMsg('Kecamatan wajib dipilih.');
      return;
    }
    if (!formData.kelurahan) {
      setErrorMsg('Kelurahan / Desa wajib dipilih.');
      return;
    }

    let finalClinic = formData.clinic;
    let finalDpjp = formData.dpjp.trim() || '-';

    if (serviceType === 'IGD') {
      finalClinic = 'Instalasi Gawat Darurat';
      finalDpjp = 'Dokter Jaga IGD';
    } else if (serviceType === 'Rawat Inap') {
      if (!roomClass) {
        setErrorMsg('Pilih kelas/ruangan rawat inap.');
        return;
      }
      finalClinic = `Rawat Inap - ${roomClass}`;
    } else {
      if (!formData.clinic) {
        setErrorMsg('Pilih klinik tujuan pelayanan.');
        return;
      }
    }

    try {
      const registered = registerPatient({
        name: formData.name.trim(),
        nik: formData.nik,
        birthDate: formData.birthDate,
        gender: formData.gender as any,
        insurance: formData.insurance as any,
        clinic: finalClinic as any,
        age: liveAge,
        address: formData.address.trim() || '-',
        dpjp: finalDpjp,
        caraMasuk: formData.caraMasuk
      });

      setSuccessMsg(`Pasien ${registered.name} berhasil didaftarkan! No. RM: ${registered.rmNumber}`);

      // === SINKRONISASI KE MYSQL XAMPP VIA PHP API ===
      const phpPayload = {
        no_rm: registered.rmNumber,
        nama: registered.name,
        jenis_kelamin: registered.gender,
        tanggal: new Date().toISOString().split('T')[0],
        jenis_layanan: serviceType,
        poli_ruangan: finalClinic,
        dokter_dpjp: finalDpjp,
        sip: serviceType === 'IGD' ? 'SIP-IGD-001' : sip
      };

      // Deteksi IP/Domain server secara dinamis agar bisa diakses di jaringan lokal (LAN) / Publik
      const host = window.location.hostname;
      const primaryUrl = `http://${host}/symphony_simrs_v2.0_cr201/backend-api/api_rekam_medis.php`;
      const fallbackUrl = `http://${host}/simrs-api/api_rekam_medis.php`;

      const sendToApi = (url: string, isFallback: boolean = false) => {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(phpPayload)
        })
          .then(res => res.json())
          .then(json => {
            if (json.status === 'success') {
              alert('Data Pasien Berhasil Disimpan ke Database MySQL XAMPP!');
            } else {
              console.warn('PHP API Response:', json.message);
            }
          })
          .catch(err => {
            if (!isFallback) {
              console.warn(`Gagal terhubung ke ${url}, mencoba fallback...`);
              sendToApi(fallbackUrl, true);
            } else {
              console.warn('XAMPP tidak tersedia (mode offline):', err);
            }
          });
      };

      sendToApi(primaryUrl);

      // Reset form & clear draft
      setSelectedProvinsi('');
      setSelectedKabupaten('');
      setSelectedKecamatan('');
      setSelectedKelurahan('');
      setListKabupaten([]);
      setListKecamatan([]);
      setListKelurahan([]);
      setFormData({
        name: '',
        nik: '',
        birthDate: '',
        gender: '',
        insurance: '',
        address: '',
        dpjp: '',
        maritalStatus: '',
        religion: '',
        education: '',
        occupation: '',
        province: '',
        city: '',
        kecamatan: '',
        kelurahan: ''
      });
      setLiveAge(0);
      setSip('');
      setIsOldPatientFound(false);
      setSearchOldPatient('');
      setPatientStatus('Baru');
      setServiceType('Rawat Jalan');
      setRoomClass('');
    } catch (err) {
      setErrorMsg('Gagal melakukan registrasi pasien.');
    }
  };

  // Simulated Voice Caller with chime + TTS
  const handleCallPatient = (patient: Patient) => {
    updatePatientStatus(patient.id, 'Dipanggil');

    // Play a chime beep using Web Audio API before TTS
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.30);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        // Start TTS after chime
        setTimeout(() => speakPatient(patient), 700);
      } else {
        speakPatient(patient);
      }
    } catch {
      speakPatient(patient);
    }
  };

  const speakPatient = (patient: Patient) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const message = new SpeechSynthesisUtterance(
        `Nomor rekam medis, ${patient.rmNumber.replace(/-/g, ' ')}, atas nama, ${patient.name}, menuju ke, ${patient.clinic}`
      );
      message.lang = 'id-ID';
      message.rate = 0.85;
      window.speechSynthesis.speak(message);
    } else {
      alert(`ðŸ“¢ MEMANGGIL: "${patient.rmNumber} - ${patient.name} menuju ke ${patient.clinic}"`);
    }
  };

  // Transfer patient directly to SOAP modul
  const handleStartSoap = (patient: Patient) => {
    // Hanya ubah status ke Dipanggil jika pasien masih di status Antre
    if (patient.status === 'Antre') {
      updatePatientStatus(patient.id, 'Dipanggil');
    }
    setSelectedPatientIdForSoap(patient.id);
    setTab('soap');
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const s = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(s) ||
      patient.rmNumber.includes(s) ||
      patient.nik.includes(s) ||
      patient.clinic.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">

      {/* Module Title Banner */}
      <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">LOKET ADMISI PASIEN (REGISTER)</h2>
        </div>
        <Users className="h-10 w-10 text-blue-200 opacity-60 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Form Input (4 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <UserPlus className="h-5 w-5 text-[#1E3A8A]" />
            <h3 className="font-bold text-sm text-slate-800">Formulir Pendaftaran RME</h3>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium flex items-start space-x-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-xs text-emerald-800 font-medium flex items-start space-x-1.5">
              <FileCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">

            {/* Status Pasien & Jenis Layanan */}
            <div className="grid grid-cols-2 gap-3 mb-4 border-b border-slate-100 pb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Pasien
                </label>
                <select
                  value={patientStatus}
                  onChange={(e) => {
                    setPatientStatus(e.target.value as PatientStatusType);
                    setIsOldPatientFound(false);
                  }}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Baru">Pasien Baru</option>
                  <option value="Lama">Pasien Lama</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jenis Layanan
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="IGD">IGD (Gawat Darurat)</option>
                  <option value="Rawat Inap">Rawat Inap</option>
                </select>
              </div>
            </div>

            {patientStatus === 'Lama' && !isOldPatientFound && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pencarian Rekam Medis (Pasien Lama)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchOldPatient}
                    onChange={e => setSearchOldPatient(e.target.value)}
                    placeholder="Masukkan No. RM atau NIK..."
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={handleSearchOldPatient} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 whitespace-nowrap cursor-pointer transition">
                    <Search className="w-3.5 h-3.5" /> <span>Cari</span>
                  </button>
                </div>
              </div>
            )}

            {(patientStatus === 'Baru' || isOldPatientFound) && (
              <>
                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap Pasien *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="cth. Siti Rahmawati"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* NIK */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      NIK Pasien (16 Digit) *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded">
                      {formData.nik.length}/16 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="cth. 3171012304900001"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Tanggal Lahir & Usia Live */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kalkulasi Usia (Live)
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center h-9">
                      {liveAge > 0 ? `${liveAge} Tahun` : '0 Tahun'}
                    </div>
                  </div>
                </div>

                {/* Jenis Kelamin (Must have 5) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Pilih Jenis Kelamin --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Tidak Dapat Diketahui">Tidak Dapat Diketahui</option>
                    <option value="Tidak Dapat Ditentukan">Tidak Dapat Ditentukan</option>
                    <option value="Tidak Dapat Diisi">Tidak Dapat Diisi</option>
                  </select>
                </div>

                {/* Status Pernikahan & Agama */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status Pernikahan <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Janda">Janda</option>
                      <option value="Duda">Duda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Agama <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katholik">Katholik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Kong Hu Chu">Kong Hu Chu</option>
                      <option value="Kepercayaan">Kepercayaan</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>
                </div>

                {/* Pendidikan & Pekerjaan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pendidikan <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Di Bawah Umur">Di Bawah Umur</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="D3">D3</option>
                      <option value="DIV / S1">DIV / S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                      <option value="Tidak Sekolah">Tidak Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pekerjaan <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="belum bekerja">belum bekerja</option>
                      <option value="BUMN">BUMN</option>
                      <option value="buruh">buruh</option>
                      <option value="CPNS">CPNS</option>
                      <option value="dokter">dokter</option>
                      <option value="guru/dosen">guru/dosen</option>
                      <option value="ibu rumah tangga">ibu rumah tangga</option>
                      <option value="lain-lain">lain-lain</option>
                      <option value="mahasiswa">mahasiswa</option>
                      <option value="nelayan">nelayan</option>
                      <option value="pedagang">pedagang</option>
                      <option value="pegawai swasta">pegawai swasta</option>
                      <option value="pelajar">pelajar</option>
                      <option value="pengacara">pengacara</option>
                      <option value="petani">petani</option>
                      <option value="PNS">PNS</option>
                      <option value="polri">polri</option>
                      <option value="PPPK">PPPK</option>
                      <option value="purnawirawan">purnawirawan</option>
                      <option value="sopir">sopir</option>
                      <option value="tenaga medis lain">tenaga medis lain</option>
                      <option value="tidak bekerja">tidak bekerja</option>
                      <option value="tni">tni</option>
                      <option value="wiraswasta">wiraswasta</option>
                    </select>
                  </div>
                </div>

                {/* Provinsi & Kab/Kota */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Provinsi <span className="text-slate-800">*</span>
                    </label>
                    <select
                      value={selectedProvinsi}
                      onChange={(e) => {
                        const prov = listProvinsi.find((p: any) => p.id === e.target.value);
                        setSelectedProvinsi(e.target.value);
                        setSelectedKabupaten('');
                        setSelectedKecamatan('');
                        setSelectedKelurahan('');
                        setListKabupaten([]);
                        setListKecamatan([]);
                        setListKelurahan([]);
                        const updated = { ...formData, province: prov ? prov.name : '', city: '', kecamatan: '', kelurahan: '' };
                        setFormData(updated);
                        setAdmisiDraft(updated);
                      }}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {listProvinsi.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kabupaten / Kota <span className="text-slate-800">*</span>
                    </label>
                    <select
                      value={selectedKabupaten}
                      onChange={(e) => {
                        const kab = listKabupaten.find((k: any) => k.id === e.target.value);
                        setSelectedKabupaten(e.target.value);
                        setSelectedKecamatan('');
                        setSelectedKelurahan('');
                        setListKecamatan([]);
                        setListKelurahan([]);
                        const updated = { ...formData, city: kab ? kab.name : '', kecamatan: '', kelurahan: '' };
                        setFormData(updated);
                        setAdmisiDraft(updated);
                      }}
                      disabled={listKabupaten.length === 0}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Pilih Kab/Kota --</option>
                      {listKabupaten.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kecamatan & Kelurahan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kecamatan <span className="text-slate-800">*</span>
                    </label>
                    <select
                      value={selectedKecamatan}
                      onChange={(e) => {
                        const kec = listKecamatan.find((k: any) => k.id === e.target.value);
                        setSelectedKecamatan(e.target.value);
                        setSelectedKelurahan('');
                        setListKelurahan([]);
                        const updated = { ...formData, kecamatan: kec ? kec.name : '', kelurahan: '' };
                        setFormData(updated);
                        setAdmisiDraft(updated);
                      }}
                      disabled={listKecamatan.length === 0}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Pilih Kecamatan --</option>
                      {listKecamatan.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kelurahan / Desa <span className="text-slate-800">*</span>
                    </label>
                    <select
                      value={selectedKelurahan}
                      onChange={(e) => {
                        const kel = listKelurahan.find((k: any) => k.id === e.target.value);
                        setSelectedKelurahan(e.target.value);
                        const updated = { ...formData, kelurahan: kel ? kel.name : '' };
                        setFormData(updated);
                        setAdmisiDraft(updated);
                      }}
                      disabled={listKelurahan.length === 0}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">-- Pilih Kelurahan/Desa --</option>
                      {listKelurahan.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alamat Lengkap Pasien <span className="text-slate-800">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="cth. Jl. Arjuna Utara No. 9, Kebon Jeruk, Jakarta Barat"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>



                {/* Klinik Tujuan / Layanan - CONDITIONAL */}
                {serviceType === 'Rawat Jalan' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Klinik / Poli Spesialis Tujuan *
                    </label>
                    <select
                      name="clinic"
                      value={formData.clinic}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih Poli --</option>
                      <option value="Poli Umum">Poli Umum</option>
                      <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                      <option value="Poli Bedah Umum">Poli Bedah Umum</option>
                      <option value="Poli Anak">Poli Anak</option>
                      <option value="Poli Kandungan/Obgyn">Poli Kandungan/Obgyn</option>
                      <option value="Poli Saraf">Poli Saraf</option>
                      <option value="Poli Mata">Poli Mata</option>
                      <option value="Poli THT">Poli THT</option>
                      <option value="Poli Gigi">Poli Gigi</option>
                    </select>
                  </div>
                )}

                {serviceType === 'IGD' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Instalasi Tujuan *
                    </label>
                    <div className="block w-full px-3 py-2 border border-red-200 bg-red-50 text-red-700 font-bold rounded-lg text-xs">
                      Instalasi Gawat Darurat (IGD)
                    </div>
                  </div>
                )}

                {serviceType === 'Rawat Inap' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pilihan Kelas / Ruangan Rawat Inap *
                    </label>
                    <select
                      value={roomClass}
                      onChange={e => setRoomClass(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      <option value="VIP">Kelas VIP</option>
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 3">Kelas 3</option>
                    </select>
                  </div>
                )}

                {/* DPJP & SIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama DPJP
                    </label>
                    {serviceType === 'IGD' ? (
                      <div className="block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-700 font-bold rounded-lg text-xs">
                        Dokter Jaga IGD
                      </div>
                    ) : (
                      <select
                        name="dpjp"
                        value={formData.dpjp}
                        onChange={handleChange}
                        disabled={serviceType === 'Rawat Jalan' && !formData.clinic}
                        className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">-- Pilih DPJP --</option>
                        {(DOCTORS_BY_CLINIC[formData.clinic as keyof typeof DOCTORS_BY_CLINIC] || []).map(doc => (
                          <option key={doc.name} value={doc.name}>{doc.name}</option>
                        ))}
                        {serviceType === 'Rawat Inap' && (
                          <>
                            <option value="dr. Rawat Inap 1, Sp.PD">dr. Rawat Inap 1, Sp.PD</option>
                            <option value="dr. Rawat Inap 2, Sp.B">dr. Rawat Inap 2, Sp.B</option>
                          </>
                        )}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nomor SIP Dokter
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={serviceType === 'IGD' ? 'SIP-IGD-001' : sip}
                      placeholder="Terisi otomatis..."
                      className="block w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cara Masuk & Asuransi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cara Masuk Pasien <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="caraMasuk"
                      value={formData.caraMasuk}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih Cara Masuk --</option>
                      <option value="Sendiri">Sendiri</option>
                      <option value="Rujukan/Kiriman FKTP">Rujukan/Kiriman FKTP</option>
                      <option value="Rujukan/Kiriman FKRTL">Rujukan/Kiriman FKRTL</option>
                      <option value="Kontrol">Kontrol</option>
                      <option value="Kontrol Pasca RI">Kontrol Pasca RI</option>
                      <option value="Rujukan Internal">Rujukan Internal</option>
                      <option value="Lahir di RS">Lahir di RS</option>
                      <option value="Kasus Polisi">Kasus Polisi</option>
                      <option value="Iterasi">Iterasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Metode Pembayaran (Asuransi) <span className="text-slate-800">*</span>
                    </label>
                    <select
                      name="insurance"
                      value={formData.insurance}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Pilih Asuransi --</option>
                      <option value="BPJS Kesehatan">1. BPJS Kesehatan</option>
                      <option value="Asuransi Swasta">2. Asuransi Swasta</option>
                      <option value="Mandiri / Umum">3. Mandiri / Umum</option>
                    </select>
                  </div>
                </div>


                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#162d6b] text-white rounded-lg font-bold text-xs shadow-md transition duration-150 cursor-pointer text-center flex items-center justify-center space-x-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Daftarkan Pasien & Generate RM</span>
                  </button>
                </div>
              </>
            )}
          </form>

        </div>

        {/* Right Column: Active Patient Master List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#1E3A8A]" />
              <h3 className="font-bold text-sm text-slate-800">Master Pasien Aktif & Antrean Hari Ini</h3>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Cari RM, Nama, NIK, Klinik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Patient Grid / Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. RM</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identitas Pasien</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Klinik & Pembayaran</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200 text-xs">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400 font-medium">
                      Tidak ada data pasien yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-2 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {patient.rmNumber}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-bold text-slate-900">{patient.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">NIK: {patient.nik}</p>
                        <p className="text-[10px] text-slate-400">
                          {patient.gender.split(' ')[0]} â€¢ {patient.age} Th â€¢ {patient.birthDate}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-700">{patient.clinic}</p>
                        <p className="text-[10px] font-mono font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded px-1 w-max">
                          {patient.insurance}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${patient.status === 'Antre' ? 'bg-amber-100 text-amber-800' :
                              patient.status === 'Dipanggil' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                patient.status === 'Sudah Diperiksa' ? 'bg-purple-100 text-purple-800' :
                                  patient.status === 'Selesai Koding' ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-emerald-100 text-emerald-800'
                            }`}>
                            {patient.status}
                          </span>
                          {kodings[patient.id] && !kodings[patient.id].isValid && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[8px] font-extrabold border border-amber-200 uppercase tracking-wide">
                              âš  Perlu Review
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex justify-center items-center space-x-1">

                          {/* Call voice */}
                          <button
                            onClick={() => handleCallPatient(patient)}
                            title="Panggil Pasien"
                            className="p-1 text-amber-600 hover:text-white hover:bg-amber-500 rounded border border-amber-200 transition cursor-pointer bg-white"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Print KIB */}
                          <button
                            onClick={() => setSelectedKibPatient(patient)}
                            title="Tampilkan Kartu KIB"
                            className="p-1 text-blue-600 hover:text-white hover:bg-blue-500 rounded border border-blue-200 transition cursor-pointer bg-white"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </button>

                          {/* Transfer direct to SOAP / Lihat CPPT */}
                          <button
                            onClick={() => handleStartSoap(patient)}
                            title={patient.status === 'Sudah Diperiksa' || patient.status === 'Selesai Koding' ? 'Lihat Riwayat CPPT' : 'Buka Lembar SOAP'}
                            className="p-1 text-purple-600 hover:text-white hover:bg-purple-500 rounded border border-purple-200 transition cursor-pointer bg-white"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* KIB Modal display */}
      {selectedKibPatient && (
        <KIBCard
          patient={selectedKibPatient}
          onClose={() => setSelectedKibPatient(null)}
        />
      )}

    </div>
  );
};

