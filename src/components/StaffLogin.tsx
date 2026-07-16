/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Staff } from '../types';
import { Shield, Key, UserCheck, AlertCircle } from 'lucide-react';

export const PRESET_CREDENTIALS = [
  { username: 'admisi', password: 'admisi123', name: 'Azka Nabila, A.Md.PK', role: 'Admin Loket' as const },
  { username: 'dokter', password: 'dokter123', name: 'Dr. Athira Laha, Sp.PD', role: 'Dokter IGD' as const },
  { username: 'koder', password: 'koder123', name: 'Mayday Intan, S.Tr.Kes', role: 'Koder' as const },
  { username: 'direktur', password: 'direktur123', name: 'Dr. dr. H. Ahmad Fauzi, M.A.R.S', role: 'Direktur' as const },
  { username: 'rmik', password: 'rmik123', name: 'Juwita Wahyu, S.Tr.RMIK', role: 'Kepala RMIK' as const },
];

export const StaffLogin: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate cryptographic processing/delay (JWT signature)
    setTimeout(() => {
      const matched = PRESET_CREDENTIALS.find(
        cred => cred.username === username.toLowerCase().trim() && cred.password === password
      );

      if (matched) {
        login(matched.name, matched.role);
      } else {
        setError('Kombinasi Username dan Password tidak cocok dengan database kepegawaian!');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleSelectPreset = (cred: typeof PRESET_CREDENTIALS[0]) => {
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Medical Grid/Glow Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />

      {/* Subtle Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* University Brand Header */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center justify-center h-22 w-auto mb-5 transition-transform duration-300 hover:scale-105">
            <img
              src="src/components/logo-ueu-unggul-15012025-No-BG (1).png"
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
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-3xl border border-slate-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username Petugas
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#1E3A8A] hover:bg-[#162d6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
