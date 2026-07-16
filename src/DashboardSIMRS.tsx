import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  Activity,
  UserCheck,
  FileCheck2,
  FileText,
} from 'lucide-react';
import { useApp } from './context/AppContext';
import { Berkas } from './types';

const COLORS = {
  primary: '#1E3A8A',
  accent: '#0D9488',
};

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export const DashboardSIMRS: React.FC = () => {
  const { patients, berkas, kodings, cpptRecords } = useApp();
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  // ─── Live KPI calculations ────────────────────────────────────────────────

  // Filter patients by selected year
  const patientsByYear = React.useMemo(() =>
    patients.filter(p => new Date(p.createdAt).getFullYear() === selectedYear),
    [patients, selectedYear]
  );

  const totalPasien = patientsByYear.length;

  // Total CPPT entries for the selected year
  const totalCppt = React.useMemo(() => {
    let count = 0;
    Object.values(cpptRecords).forEach((entries: any) => {
      entries.forEach((e: any) => {
        if (new Date(e.tanggal).getFullYear() === selectedYear) count++;
      });
    });
    return count;
  }, [cpptRecords, selectedYear]);

  // Total koding done for selected year
  const totalKoding = React.useMemo(() =>
    Object.keys(kodings).filter(patientId => {
      const patient = patients.find(p => p.id === patientId);
      return patient && new Date(patient.createdAt).getFullYear() === selectedYear;
    }).length,
    [kodings, patients, selectedYear]
  );

  // KLPCM (berkas lengkap)
  const berkasValues = Object.values(berkas) as Berkas[];
  const berkasLengkap = berkasValues.filter(b => b.isLengkap).length;
  const berkasTotal = berkasValues.length;
  const berkasRate = berkasTotal > 0 ? Math.round((berkasLengkap / berkasTotal) * 100) : 0;

  // Average patient age (from real data)
  const avgAge = React.useMemo(() => {
    if (patientsByYear.length === 0) return 0;
    const sum = patientsByYear.reduce((acc, p) => acc + (p.age || 0), 0);
    return Math.round((sum / patientsByYear.length) * 10) / 10;
  }, [patientsByYear]);

  // Trend per bulan (kunjungan = pendaftaran pasien per bulan)
  const trendData = React.useMemo(() =>
    MONTHS_ID.map((label, i) => {
      const monthPatients = patientsByYear.filter(p => new Date(p.createdAt).getMonth() === i);
      // Group by layanan type using clinic name hints; all go to rawatJalan by default
      const rawatJalan = monthPatients.filter(p =>
        !p.clinic?.toLowerCase().includes('igd') && !p.clinic?.toLowerCase().includes('inap')
      ).length;
      const rawatInap = monthPatients.filter(p =>
        p.clinic?.toLowerCase().includes('inap')
      ).length;
      const igd = monthPatients.filter(p =>
        p.clinic?.toLowerCase().includes('igd')
      ).length;
      return { label, rawatJalan, rawatInap, igd };
    }),
    [patientsByYear]
  );

  // Top 10 diseases from CPPT asesmen text (simple word-frequency approach using ICD koding)
  const topDiseases = React.useMemo(() => {
    const codeCount: Record<string, { name: string; code: string; count: number }> = {};
    Object.entries(kodings).forEach(([patientId, k]: [string, any]) => {
      const patient = patients.find(p => p.id === patientId);
      if (!patient || new Date(patient.createdAt).getFullYear() !== selectedYear) return;
      if (k.primaryCode) {
        const key = k.primaryCode;
        if (!codeCount[key]) codeCount[key] = { name: k.primaryDescription || key, code: key, count: 0 };
        codeCount[key].count++;
      }
    });
    return Object.values(codeCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [kodings, patients, selectedYear]);

  // Age demographics from real patient data
  const ageDemographics = React.useMemo(() => {
    const ranges = [
      { range: '0-5 th', min: 0, max: 5 },
      { range: '6-12 th', min: 6, max: 12 },
      { range: '13-25 th', min: 13, max: 25 },
      { range: '26-45 th', min: 26, max: 45 },
      { range: '46-65 th', min: 46, max: 65 },
      { range: '65+ th', min: 66, max: 999 },
    ];
    return ranges.map(r => ({
      range: r.range,
      count: patientsByYear.filter(p => (p.age || 0) >= r.min && (p.age || 0) <= r.max).length
    }));
  }, [patientsByYear]);

  return (
    <div className="w-full space-y-6">

      {/* TITLE ROW */}
      <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-left w-full sm:w-auto">
          <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">
            REKAPITULASI DATA PER TAHUN
          </h2>
          <p className="text-white/70 text-xs mt-0.5 font-medium">Data real-time dari sistem pendaftaran dan rekam medis</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-blue-200">Pilih Tahun:</label>
          <select
            className="bg-white/10 border border-white/30 px-3 py-1.5 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/60"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2024} className="text-[#1E3A8A]">2024</option>
            <option value={2025} className="text-[#1E3A8A]">2025</option>
            <option value={2026} className="text-[#1E3A8A]">2026</option>
            <option value={2027} className="text-[#1E3A8A]">2027</option>
          </select>
        </div>
      </div>

      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pasien Terdaftar', value: totalPasien, icon: Users, suffix: 'Pasien' },
          { label: 'Kelengkapan KLPCM', value: berkasRate, icon: FileCheck2, suffix: '%' },
          { label: 'Rata-Rata Usia Pasien', value: avgAge, icon: Activity, suffix: 'Tahun' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="bg-[#1E3A8A]/10 p-2 rounded-lg">
                <kpi.icon className="w-4 h-4 text-[#1E3A8A]" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-[#1E3A8A] font-mono leading-none">
                {kpi.value.toLocaleString('id-ID')}
                <span className="text-xs font-sans font-bold text-slate-400 ml-1">{kpi.suffix}</span>
              </h3>
            </div>
          </div>
        ))}
      </div>


      {/* ROW 3: TREND CHART */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">
            Trend Kunjungan Per Bulan — {selectedYear}
          </h2>
          <div className="flex gap-3 text-[10px] font-bold hidden sm:flex">
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-[#1E3A8A] rounded" /> RJ</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-[#0D9488] rounded" /> RI</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-red-500 rounded" /> IGD</span>
          </div>
        </div>
        <div className="h-72 w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRJ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIGD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" />
              <YAxis tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="rawatJalan" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorRJ)" name="Rawat Jalan" />
              <Area type="monotone" dataKey="rawatInap" stroke={COLORS.accent} strokeWidth={2} fillOpacity={1} fill="url(#colorRI)" name="Rawat Inap" />
              <Area type="monotone" dataKey="igd" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorIGD)" name="IGD" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ROW 4: 50/50 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Top Diseases */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">10 Besar Penyakit (ICD-10)</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Berdasarkan data koding per tahun</p>
          </div>
          {topDiseases.length > 0 ? (
            <div className="h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiseases} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: '#111827', fontSize: 9, fontWeight: 600 }} stroke="#E2E8F0" allowDecimals={false} />
                  <YAxis dataKey="code" type="category" tick={{ fill: '#111827', fontSize: 10, fontWeight: 700 }} stroke="#E2E8F0" />
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => [`${value} Kasus`, `${props.payload.name} (${props.payload.code})`]}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold italic">
              Belum ada data koding ICD-10 untuk tahun {selectedYear}.
            </div>
          )}
        </section>

        {/* Right: Age Demographics */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider">Distribusi Demografi Usia</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Klasifikasi usia pasien terdaftar per tahun</p>
          </div>
          {patientsByYear.length > 0 ? (
            <div className="h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDemographics} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={true} vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Pasien`, 'Jumlah']}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Pasien" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold italic">
              Belum ada data pasien terdaftar untuk tahun {selectedYear}.
            </div>
          )}
        </section>

      </div>

    </div>
  );
};

export default DashboardSIMRS;