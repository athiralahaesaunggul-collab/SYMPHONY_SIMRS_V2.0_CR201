/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  FileText,
  Hash,
  Archive,
  PieChart,
  Activity,
  LogOut,
  Clock,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentStaff, logout, currentTab, setTab, resetToDefault } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Running live clock ticking every second
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setTimeStr(`${hh}:${mm}:${ss}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDB = () => {
    if (confirm('Apakah Anda yakin ingin me-reset seluruh database RME ke data sampel standar Universitas Esa Unggul? Tindakan ini akan mengosongkan entri kustom Anda.')) {
      resetToDefault();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'admisi', label: 'Loket Admisi', icon: Users },
    { id: 'soap', label: 'SOAP CPPT Klinis', icon: FileText },
    { id: 'koding', label: 'Unit Koding ICD-10', icon: Hash },
    { id: 'berkas', label: 'Pelacakan Berkas', icon: Archive },
    { id: 'audit', label: 'Audit Trail Forensic', icon: Activity },
  ];

  // Helper to get staff details for the profile modal
  const getStaffDetails = (role: string) => {
    switch (role) {
      case 'Admin Loket':
        return {
          nip: '199408122022032001',
          unit: 'Loket Pendaftaran & Admisi Rawat Jalan',
          bidang: 'Administrasi Rekam Medis',
          degree: 'A.Md.PK - D3 Rekam Medis & Infokes UEU',
          status: 'Pegawai Negeri Sipil / Tetap',
          clearance: 'Level 1: Registrasi & Pendaftaran'
        };
      case 'Dokter IGD':
        return {
          nip: '198104112010021003',
          unit: 'Instalasi Gawat Darurat (IGD)',
          bidang: 'Pelayanan Medis Klinis',
          degree: 'dr., Sp.PD - Dokter Spesialis Penyakit Dalam',
          status: 'Dokter Spesialis Madya / Tetap',
          clearance: 'Level 2: Pemeriksaan & SOAP Klinis'
        };
      case 'Koder':
        return {
          nip: '199201152018041002',
          unit: 'Unit Kerja Koding & Klasifikasi Diagnostik',
          bidang: 'Manajemen Informasi Kesehatan',
          degree: 'S.Tr.Kes - D4 Rekam Medis & Infokes UEU',
          status: 'Auditor Koding Senior / Tetap',
          clearance: 'Level 3: Sertifikasi ICD-10 & Audit Medis'
        };
      case 'Direktur':
        return {
          nip: '197005121998032001',
          unit: 'Manajemen Eksekutif (Direksi)',
          bidang: 'Pimpinan & Kebijakan SIMRS',
          degree: 'Dr. dr., M.A.R.S - Magister Administrasi RS',
          status: 'Direktur Utama Rumah Sakit',
          clearance: 'Level 5: Super-View & Biostatistik Komprehensif'
        };
      case 'Kepala RMIK':
      default:
        return {
          nip: '199602282020052002',
          unit: 'Instalasi Rekam Medis (IRM)',
          bidang: 'Pimpinan Pelayanan RMIK',
          degree: 'S.Tr.RMIK - D4 Rekam Medis & Infokes UEU',
          status: 'Kepala Instalasi RME / Koordinator',
          clearance: 'Level 4: Pengawas Audit Trail & Kelengkapan Berkas'
        };
    }
  };

  if (!currentStaff) return null;

  const details = getStaffDetails(currentStaff.role);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left brand layout */}
          <div className="flex items-center space-x-3">
            {/* LOGO BARU DIBAWAH INI LANGSUNG MENGARAH KE FOLDER PUBLIC */}
            <img
              src="/logo-ueu.png"
              alt="Logo Universitas Esa Unggul"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                SYMPHONY <span className="text-[#1E3A8A] font-extrabold ml-1">SIMRS V2.0</span>
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded font-bold">
                  v2.0 HYBRID
                </span>
              </h1>
              <p className="text-[10px] font-sans text-slate-500 font-medium text-left">
                Sistem Informasi Rekam Medis Elektronik
              </p>
            </div>
          </div>

          {/* Right staff info, ticking timer, reset DB, and logout buttons */}
          <div className="flex items-center space-x-4">

            {/* Staff Info and Blinking clock (Clickable) */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfile(true)}
                title="Lihat Profil Petugas"
                className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer text-right group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-tight">
                    {currentStaff.name}
                  </p>
                  <div className="flex items-center justify-end space-x-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <p className="text-[10px] font-mono font-semibold text-slate-500 group-hover:text-slate-700">
                      {currentStaff.role}
                    </p>
                  </div>
                </div>
              </button>

              <div className="h-7 w-[1px] bg-slate-200"></div>

              {/* Ticking Clock with Blinking Green Heartbeat */}
              <div className="flex items-center space-x-2 bg-white px-2 py-0.5 rounded border border-slate-200">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-mono font-bold text-slate-700 select-none">
                  {timeStr}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            {/* Reset Database Button */}
            <button
              onClick={handleResetDB}
              title="Reset Database ke Sampel"
              className="p-2 hover:bg-yellow-50 hover:border-yellow-300 rounded-lg border border-slate-200 text-amber-600 transition duration-150 flex items-center cursor-pointer bg-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition duration-150 cursor-pointer shadow-sm shadow-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>

          </div>

        </div>

        {/* Tab-based workstation navigation */}
        <div className="flex space-x-1 -mb-[1px] overflow-x-auto select-none scrollbar-none py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm shadow-blue-100'
                  : 'text-slate-600 hover:text-slate-950 border-transparent hover:bg-slate-100'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Kepegawaian Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base tracking-tight">KARTU KEPEGAWAIAN RS</h3>
                <p className="text-[10px] text-blue-100 font-mono mt-0.5">Symphony SIMRS Secure Registry</p>
              </div>
              <div className="bg-white/10 p-1.5 rounded">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                <div className="bg-blue-50 border border-blue-200 h-14 w-14 rounded-full flex items-center justify-center text-blue-700 font-black text-lg shadow-inner">
                  {currentStaff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{currentStaff.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-1">{currentStaff.role}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Induk Pegawai (NIP)</p>
                  <p className="font-mono font-bold text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200/60 mt-1">{details.nip}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Kerja / Instalasi</p>
                  <p className="font-bold text-slate-700 mt-0.5">{details.unit}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendidikan Terakhir / Kualifikasi</p>
                  <p className="font-semibold text-indigo-700 mt-0.5">{details.degree}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Kepegawaian</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{details.status}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hak Akses Keamanan RME</p>
                  <p className="font-bold text-emerald-700 mt-0.5 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>
                    {details.clearance}
                  </p>
                </div>
              </div>

              {/* Logo Esa Unggul inside profile */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mt-4">
                <div className="text-[10px] text-slate-500 font-sans max-w-[200px]">
                  Terdaftar resmi dalam program Capstone RMIK <strong>Universitas Esa Unggul</strong>.
                </div>
                <img
                  src="/logo-ueu.png"
                  alt="Logo Esa Unggul"
                  className="h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Tutup Kartu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};