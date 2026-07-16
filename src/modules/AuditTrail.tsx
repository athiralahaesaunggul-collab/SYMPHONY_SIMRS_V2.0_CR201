/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Search, 
  Filter, 
  ShieldAlert, 
  Clock, 
  User
} from 'lucide-react';

// No division label helper needed anymore, using log.user directly

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('Semua');

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.includes(searchTerm);

    const matchesModule = selectedModule === 'Semua' || log.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  const modules = ['Semua', 'Loket Admisi', 'Workstation Klinis', 'Unit Koding', 'Pelacakan Berkas Hybrid', 'Keamanan / Auth', 'Sistem'];

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">AUDIT TRAIL SISTEM &amp; FORENSIC SECURITY LOGS</h2>
        </div>
        <Activity className="h-10 w-10 text-white/60 hidden md:block" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-sm text-slate-800">Forensic Activity Logger</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Cari aktivitas, detail, timestamp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            {/* Dropdown module filter */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="block w-full sm:w-48 px-2.5 py-1.5 border border-slate-300 bg-white rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 font-semibold"
              >
                {modules.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table — Kolom "Aksi Aktivitas" DIHAPUS */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner max-h-[500px]">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-[#F8FAFC] text-slate-700 border-b border-slate-200 font-mono text-[10px] tracking-wider uppercase sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-1/5">Timestamp Log</th>
                <th className="px-4 py-3 w-1/5">Nama Petugas</th>
                <th className="px-4 py-3 w-3/5">Detail Forensic Security</th>
              </tr>
            </thead>
            <tbody className="bg-white text-slate-800 divide-y divide-slate-200 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-500 font-semibold">
                    Tidak ada log keamanan yang terdaftar untuk kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  // Gunakan nama asli petugas dari log
                  const petugasLabel = log.user || 'Sistem';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col text-left">
                          <span className="text-slate-800 font-bold flex items-center">
                            <User className="h-3 w-3 mr-1 text-slate-500" />
                            {petugasLabel}
                          </span>
                          <span className="text-[9px] text-slate-500">{log.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 leading-normal max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Security Warning Footnote */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-2.5 text-left text-[10px] text-red-950">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <p className="font-extrabold uppercase tracking-wide text-red-700">Pernyataan Hukum &amp; Kepatuhan Keamanan (Non-Repudiasi):</p>
            <p className="text-slate-700 font-sans leading-relaxed">
              Semua aktivitas rekam medis di dalam sistem SIMRS diproteksi secara dinamis. Perubahan, penghapusan, atau manipulasi entri RME akan secara otomatis dicatat pada Audit Trail Forensic dengan status cryptographically-assigned token virtual. Data logs bersifat <strong>READ-ONLY</strong> dan tidak dapat dihapus oleh pengguna level manapun.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
