/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Patient } from '../types';
import LogoUEU from '../assets/logo-ueu.png';
import { X, Printer, Download, CreditCard, ShieldCheck } from 'lucide-react';

interface KIBCardProps {
  patient: Patient;
  onClose: () => void;
}

export const KIBCard: React.FC<KIBCardProps> = ({ patient, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    alert(`Mensimulasikan pencetakan Kartu Identitas Berobat (KIB) untuk pasien: ${patient.name} (${patient.rmNumber}).\nPrinter termal terhubung di jaringan admisi.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Cetak Kartu Identitas Berobat (KIB)</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Card Preview */}
        <div className="p-6 flex flex-col items-center bg-slate-100">
          
          {/* Card Container */}
          <div 
            ref={cardRef}
            className="w-full max-w-sm aspect-[1.58/1] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-xl shadow-lg p-4 text-white relative overflow-hidden border border-blue-600 font-sans"
          >
            {/* Background decorative watermark */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-blue-600/20 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>

            {/* Card Header Brand */}
            <div className="flex justify-between items-start border-b border-white/20 pb-2 mb-3">
              <div className="flex items-center space-x-1.5">
                <div className="bg-white p-0.5 rounded">
                  <img 
                    src={LogoUEU} 
                    alt="Logo UEU" 
                    className="h-5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold tracking-wider leading-none">SYMPHONY SIMRS</h4>
                  <p className="text-[7px] text-blue-200 leading-none">Universitas Esa Unggul</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-bold bg-emerald-500/80 px-1.5 py-0.5 rounded border border-emerald-400 font-mono">
                  PASIEN AKTIF
                </span>
              </div>
            </div>

            {/* Card Content Grid */}
            <div className="grid grid-cols-5 gap-2">
              {/* Patient Core Info */}
              <div className="col-span-3 space-y-1.5 text-left">
                <div>
                  <p className="text-[7px] text-blue-200 uppercase tracking-wider font-semibold">Nama Lengkap</p>
                  <p className="text-xs font-bold leading-tight truncate">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <p className="text-[7px] text-blue-200 uppercase tracking-wider font-semibold">Tanggal Lahir</p>
                    <p className="text-[10px] font-bold">{patient.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-[7px] text-blue-200 uppercase tracking-wider font-semibold">Jenis Kelamin</p>
                    <p className="text-[10px] font-bold truncate">{patient.gender.split(' ')[0]}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[7px] text-blue-200 uppercase tracking-wider font-semibold">NIK (Identity Number)</p>
                  <p className="text-[9px] font-mono leading-none tracking-tight">{patient.nik}</p>
                </div>
              </div>

              {/* Unique RM Box */}
              <div className="col-span-2 flex flex-col justify-between items-end border-l border-white/10 pl-2">
                <div className="text-right">
                  <p className="text-[7px] text-blue-200 uppercase tracking-wider font-semibold">Nomor RM</p>
                  <p className="text-base font-black font-mono tracking-wider leading-none text-yellow-300">
                    {patient.rmNumber}
                  </p>
                </div>

                {/* Simulated Barcode */}
                <div className="w-full flex flex-col items-center bg-white p-1 rounded">
                  <div className="h-5 w-full flex justify-between overflow-hidden">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-black" 
                        style={{ width: `${[1, 2, 1, 3, 1, 4, 2, 1, 2, 3][i % 10]}px` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[6px] font-mono font-bold text-black leading-none mt-0.5">
                    *{patient.rmNumber.replace(/-/g, '')}*
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="absolute bottom-1.5 left-4 right-4 flex justify-between items-center text-[7px] text-blue-200/90 border-t border-white/10 pt-1">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="h-2 w-2 text-emerald-400" />
                <span>RME Hybrid Verified</span>
              </span>
              <span>Daftar: {patient.createdAt.split(' ')[0]}</span>
            </div>

          </div>

          <p className="text-[11px] text-slate-500 font-sans mt-3 text-center">
            *Kartu Identitas Berobat (KIB) wajib dibawa setiap kali melakukan kunjungan ulang di RSUD / Klinik Jejaring Esa Unggul.
          </p>
        </div>

        {/* Modal Footer Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Klinik: <span className="font-bold text-slate-700">{patient.clinic}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak KIB</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
