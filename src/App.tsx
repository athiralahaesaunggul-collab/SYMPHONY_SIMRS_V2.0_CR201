import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StaffLogin, PRESET_CREDENTIALS } from './components/StaffLogin';
import { Admisi } from './modules/Admisi';
import { Soap } from './modules/Soap';
import ResumeMedis from './modules/ResumeMedis';
import { Koding } from './modules/Koding';
import { Berkas } from './modules/Berkas';
import { DashboardSIMRS } from './DashboardSIMRS';
import { AuditTrail } from './modules/AuditTrail';
import LogoUEU from './assets/logo-ueu.png';
import { Staff } from './types';

// Helper function to check Role-Based Access Control (RBAC)
export const hasMenuAccess = (role: Staff['role'], menuId: string): boolean => {
  if (role === 'Direktur') return true;
  if (menuId === 'dashboard') return true;

  switch (role) {
    case 'Admin Loket':
      return menuId === 'admisi';
    case 'Dokter IGD':
      return menuId === 'soap' || menuId === 'resume';
    case 'Koder':
      return menuId === 'koding';
    case 'Kepala RMIK':
      return menuId === 'koding' || menuId === 'berkas';
    default:
      return false;
  }
};

import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  LogOut,
  Clock,
  Activity,
  RefreshCw,
  Key,
  UserCheck,
  AlertCircle,
  ClipboardList,
  BookOpenCheck,
  Archive
} from 'lucide-react';

// --- WORKSTATION CONTAINER ---
const WorkstationContainer: React.FC = () => {
  const { currentStaff, currentTab, setTab, logout, login, resetToDefault } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Re-login form states
  const [reUsername, setReUsername] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [reError, setReError] = useState<string | null>(null);
  const [reLoading, setReLoading] = useState(false);

  // Helper to get staff details for the profile modal
  const getStaffDetails = (role: string) => {
    switch (role) {
      case 'Admin Loket':
        return {
          unit: 'Loket Pendaftaran & Admisi Rawat Jalan',
          bidang: 'Administrasi Rekam Medis',
          degree: 'A.Md.PK - D3 Rekam Medis & Infokes UEU',
          clearance: 'Level 1: Registrasi & Pendaftaran'
        };
      case 'Dokter IGD':
        return {
          unit: 'Instalasi Gawat Darurat (IGD)',
          bidang: 'Pelayanan Medis Klinis',
          degree: 'dr., Sp.PD - Profesi Dokter Spesialis',
          clearance: 'Level 2: Pemeriksaan & SOAP Klinis'
        };
      case 'Koder':
        return {
          unit: 'Unit Kerja Koding & Klasifikasi Diagnostik',
          bidang: 'Manajemen Informasi Kesehatan',
          degree: 'S.Tr.Kes - D4 Rekam Medis & Infokes UEU',
          clearance: 'Level 3: Sertifikasi ICD-10 & Audit Medis'
        };
      case 'Direktur':
        return {
          unit: 'Manajemen Eksekutif (Direksi)',
          bidang: 'Pimpinan & Kebijakan SIMRS',
          degree: 'Dr. dr., M.A.R.S - Magister Administrasi RS',
          clearance: 'Level 5: Super-View & Biostatistik Komprehensif'
        };
      case 'Kepala RMIK':
      default:
        return {
          unit: 'Instalasi Rekam Medis (IRM)',
          bidang: 'Pimpinan Pelayanan RMIK',
          degree: 'S.Tr.RMIK - D4 Rekam Medis & Infokes UEU',
          clearance: 'Level 4: Pengawas Audit Trail & Kelengkapan Berkas'
        };
    }
  };

  // Clock ticking
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('id-ID'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Protect tab routes from unauthorized access (Protected Route redirect)
  useEffect(() => {
    if (currentStaff && !hasMenuAccess(currentStaff.role, currentTab)) {
      setTab('dashboard');
    }
  }, [currentStaff, currentTab, setTab]);

  // Logout: call context logout + show re-login screen
  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi Symphony SIMRS?')) {
      logout();
      setShowLoginScreen(true);
      setReUsername('');
      setRePassword('');
      setReError(null);
    }
  };

  // Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'SYMPHONY SIMRS', icon: null },
    { id: 'admisi', label: 'PENDAFTARAN PASIEN', icon: Users },
    { id: 'soap', label: 'SOAP (CPPT)', icon: FileText },
    { id: 'koding', label: 'ICD-10 & KODING', icon: BookOpenCheck },
    { id: 'resume', label: 'RESUME MEDIS', icon: ClipboardList },
    { id: 'berkas', label: 'PELACAKAN BERKAS', icon: Archive },
    { id: 'audit', label: 'AUDIT TRAIL', icon: Activity }
  ];

  // Tab routing renderer
  const renderModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardSIMRS />;
      case 'admisi':
        return <Admisi />;
      case 'soap':
        return <Soap />;
      case 'resume':
        return <ResumeMedis />;
      case 'koding':
        return <Koding />;
      case 'berkas':
        return <Berkas />;
      case 'audit':
        return <AuditTrail />;
      default:
        return <DashboardSIMRS />;
    }
  };

  // Re-login form submit handler
  const handleReSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReError(null);
    setReLoading(true);
    setTimeout(() => {
      const matched = PRESET_CREDENTIALS.find(
        c => c.username === reUsername.toLowerCase().trim() && c.password === rePassword
      );
      if (matched) {
        login(matched.name, matched.role);
        setShowLoginScreen(false);
      } else {
        setReError('Username atau password tidak cocok!');
      }
      setReLoading(false);
    }, 600);
  };

  // --- LAYAR LOGOUT / RE-LOGIN SCREEN ---
  if (showLoginScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950 flex flex-col items-center justify-center font-sans antialiased px-4 relative overflow-hidden">
        {/* Background Decorative Medical Grid/Glow Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
        
        {/* Subtle Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="flex flex-col items-center justify-center mb-8 relative z-10 w-full max-w-md">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center justify-center h-22 w-auto mb-5 transition-transform duration-300 hover:scale-105">
            <img 
              src={LogoUEU} 
              alt="Logo Universitas Esa Unggul" 
              className="max-h-16 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Symphony <span className="text-blue-400 font-extrabold">SIMRS v2.0</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300 font-medium">
            Fasyankes Academic Simulation Engine | Esa Unggul University Hospital
          </p>
          <p className="text-center text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full mt-2 tracking-wide uppercase">
            UNIVERSITAS ESA UNGGUL
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm text-left overflow-hidden relative z-10">
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] p-5 text-white">
            <h2 className="font-black text-base">Sesi Telah Berakhir</h2>
            <p className="text-[11px] text-blue-100 mt-0.5">Masukkan kembali kredensial Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleReSubmit} className="p-6 space-y-4">
            {reError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center space-x-2 text-xs text-red-700 font-medium">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{reError}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username Petugas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={reUsername}
                  onChange={e => setReUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={rePassword}
                  onChange={e => setRePassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={reLoading}
              className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#162d6b] text-white font-bold rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
            >
              {reLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TAMPILKAN STAFFLOGIN JIKA BELUM LOGIN ---
  if (!currentStaff) {
    return <StaffLogin />;
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200 flex flex-col font-sans antialiased text-slate-800">
      <style>{`
        /* Global Glassmorphism for existing Cards/Containers */
        .bg-white.rounded-xl,
        .bg-white.rounded-2xl {
          background-color: rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        /* Ensure input fields and selects remain fully opaque for readability */
        input.bg-white, select.bg-white, textarea.bg-white,
        .bg-white.rounded-xl input, .bg-white.rounded-xl select, .bg-white.rounded-xl textarea {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(203, 213, 225, 0.8) !important;
        }
      `}</style>
      {/* TOP HEADER & NAVBAR LAYOUT */}
      <header className="bg-white border-b border-slate-200/80 shadow-md sticky top-0 z-50 transition-all">
        {/* Top Info Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-slate-100">

          {/* SISI KIRI: BRANDING & LOGO */}
          <div className="flex items-center space-x-3">
            {/* Logo UEU di sebelah kiri Symphony */}
            <img
              src={LogoUEU}
              alt="Logo Universitas Esa Unggul"
              className="h-12 object-contain flex-shrink-0"
            />

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200"></div>

            {/* Symphony SIMRS Brand */}
            <div className="flex items-center space-x-2">
              <div className="text-left">
                <h1 className="text-2xl font-extrabold tracking-wider uppercase leading-none text-[#1E3A8A]">
                  Symphony <span className="text-[#1E3A8A] font-extrabold">SIMRS V2.0</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">
                  Fasyankes Academic Simulation Engine | Esa Unggul University Hospital
                </p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: LIVE CLOCK, STAFF PROFILE, RESET, LOGOUT */}
          <div className="flex items-center space-x-3">
            {/* Live Clock Ticker */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-700 select-none">
              <Clock className="h-3 w-3 text-[#1E3A8A]" />
              <span>{timeStr}</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Staff Profile Card — Clickable */}
            <button
              onClick={() => setShowProfile(true)}
              title="Klik untuk melihat profil petugas"
              className="group bg-slate-50 hover:bg-[#0D9488]/5 border border-slate-200 hover:border-[#0D9488]/40 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition-all duration-200 cursor-pointer"
            >
              <div className="bg-[#0D9488]/10 group-hover:bg-[#0D9488]/20 p-0.5 rounded transition-colors duration-200">
                <ShieldCheck className="w-3 h-3 text-[#0D9488]" />
              </div>
              <div className="text-left">
                <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Petugas Aktif</p>
                <p className="text-[10px] font-bold text-slate-800 group-hover:text-[#0D9488] leading-tight mt-0.5 transition-colors duration-200">{currentStaff.name}</p>
              </div>
            </button>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin mereset semua data simulasi? Semua data pasien, SOAP, koding, dan berkas akan dihapus.')) {
                  resetToDefault();
                }
              }}
              title="Reset Semua Data Simulasi"
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 border border-red-700 text-white rounded-lg text-[9px] font-black transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>RESET DATA</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-[9px] font-black transition-all duration-150 cursor-pointer shadow-sm shadow-red-200"
            >
              <LogOut className="h-3 w-3" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Menu Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 py-2">
            {menuItems
              .filter(item => hasMenuAccess(currentStaff.role, item.id))
              .map((item) => {
                const Icon = item.icon as React.ElementType | null;
                const isActive = currentTab === item.id;
                const isDashboard = item.id === 'dashboard';
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition duration-150 cursor-pointer ${
                      isDashboard
                        ? isActive
                          ? 'text-[#1E3A8A] font-extrabold'
                          : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-100'
                        : isActive
                          ? 'bg-[#1E3A8A] text-white shadow-sm'
                          : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-100'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>

          <div className="text-right hidden md:block">
            <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">
              {menuItems.find(m => m.id === currentTab)?.label || 'Workstation'}
            </span>
          </div>
        </div>
      </header>

      {/* WORKSTATION CONTENT STAGE */}
      <main className="flex-grow overflow-y-auto bg-transparent py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {renderModule()}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1">
          <p className="text-[10px] text-slate-400 font-mono">
            &copy; symphony simrs v2.0 CR201
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Fasyankes Academic Simulation Engine | Esa Unggul University Hospital
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Sesi Aktif: <span className="font-bold text-slate-600">{currentStaff.role}</span>
          </p>
        </div>
      </footer>

    </div>

    {/* Profile Modal Mini */}
    {showProfile && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setShowProfile(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] p-5 text-white flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-lg font-black shrink-0">
              {currentStaff.name.charAt(0)}
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm leading-tight">{currentStaff.name}</h3>
              <p className="text-[11px] text-teal-200 font-semibold mt-0.5">{currentStaff.role}</p>
            </div>
          </div>
          <div className="p-5 space-y-3 text-xs text-left">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unit Kerja</p>
              <p className="font-semibold text-slate-700 mt-0.5">{getStaffDetails(currentStaff.role).unit}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kualifikasi</p>
              <p className="font-semibold text-indigo-700 mt-0.5">{getStaffDetails(currentStaff.role).degree}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hak Akses</p>
              <p className="font-bold text-emerald-700 mt-0.5 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5 shrink-0"></span>
                {getStaffDetails(currentStaff.role).clearance}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
            <button
              onClick={() => { setShowProfile(false); handleLogout(); }}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Sesi</span>
            </button>
            <button
              onClick={() => setShowProfile(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <WorkstationContainer />
    </AppProvider>
  );
}