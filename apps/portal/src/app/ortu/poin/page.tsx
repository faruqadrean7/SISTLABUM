'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Medal, 
  Info,
  Calendar,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Download,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian } from '@/lib/guardian-context';

export default function GuardianPoinPage() {
  const { activeChild, activePoints } = useGuardian();
  const [filterType, setFilterType] = useState<'all' | 'prestasi' | 'pelanggaran'>('all');

  const filteredPoints = activePoints.filter(p => {
    if (filterType === 'all') return true;
    return p.kind === filterType;
  });

  const prestasiCount = activePoints.filter(p => p.kind === 'prestasi').length;
  const pelanggaranCount = activePoints.filter(p => p.kind === 'pelanggaran').length;

  const violationPoints = activeChild.points_pelanggaran;
  const violationPercentage = Math.min(Math.round((violationPoints / 50) * 100), 100);

  // Dynamic status badge based on violation points
  const getDisciplineStatus = () => {
    if (violationPoints === 0) {
      return {
        label: 'Disiplin: Tertib Prima',
        badgeClass: 'bg-emerald-800 text-white',
        icon: ShieldCheck,
      };
    }
    if (violationPoints < 25) {
      return {
        label: `Disiplin: Pembinaan Rutin (${violationPoints} Poin)`,
        badgeClass: 'bg-blue-800 text-white',
        icon: ShieldCheck,
      };
    }
    if (violationPoints < 50) {
      return {
        label: `Peringatan: Walas (${violationPoints}/50 Poin)`,
        badgeClass: 'bg-amber-600 text-white',
        icon: AlertTriangle,
      };
    }
    return {
      label: `Perhatian: Pemanggilan Ortu (${violationPoints}/50 Poin)`,
      badgeClass: 'bg-rose-700 text-white',
      icon: ShieldAlert,
    };
  };

  const disciplineStatus = getDisciplineStatus();
  const StatusIcon = disciplineStatus.icon;

  const handleDownloadPdf = () => {
    toast.success(`Mengunduh Rekapitulasi Buku Poin Karakter ${activeChild.name} (PDF)...`);
  };

  return (
    <div className="flex flex-col gap-3.5 max-w-full min-h-full pb-6">
      {/* ─── 1. HEADER BAR (FLUID RESPONSIVE & WELL-PROPORTIONED) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
              Buku Poin Karakter & Prestasi ({activeChild.name.split(' ')[0]})
            </h1>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-lg bg-emerald-800 text-white text-[10px] sm:text-xs font-bold shadow-2xs">
              Kelas {activeChild.class_name.replace('Kelas ', '')}
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-[10px] sm:text-xs font-mono font-semibold">
              NIS: {activeChild.nis}
            </span>
            <span className={`px-2 sm:px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold shadow-2xs flex items-center gap-1.5 ${disciplineStatus.badgeClass}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{disciplineStatus.label}</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal">
            Transparansi catatan apresiasi prestasi dan pemantauan tata tertib siswa Labschool UM.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 hover:shadow"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Unduh Rekap Poin</span>
          </button>
        </div>
      </div>

      {/* ─── 2. REKAPITULASI POIN & METER AMBANG BATAS (4 EQUAL CARDS STRIP) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
        {/* Metric 1: Saldo Poin Bersih */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Saldo Poin Bersih</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              activeChild.points_balance >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}>
              {activeChild.points_balance > 0 ? `+${activeChild.points_balance}` : activeChild.points_balance}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Poin Bersih</span>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Prestasi dikurangi pelanggaran
            </p>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">Predikat</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
              activeChild.points_balance >= 0 ? 'bg-emerald-800 text-white' : 'bg-rose-700 text-white'
            }`}>
              {activeChild.points_balance >= 0 ? 'Predikat Positif' : 'Perlu Evaluasi'}
            </span>
          </div>
        </div>

        {/* Metric 2: Apresiasi Prestasi */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Apresiasi Prestasi</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-800">
              +{activeChild.points_prestasi}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Poin</span>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              {prestasiCount} Catatan Lomba & Bakat
            </p>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">Apresiasi</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-emerald-800 text-white">
              Sertifikat
            </span>
          </div>
        </div>

        {/* Metric 3: Catatan Disiplin */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Catatan Disiplin</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-1 sm:my-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeChild.points_pelanggaran}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Poin</span>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              {pelanggaranCount} Catatan Tata Tertib
            </p>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">Batas Maks</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
              violationPoints === 0 ? 'bg-slate-800 text-white' : 'bg-rose-700 text-white'
            }`}>
              50 Poin
            </span>
          </div>
        </div>

        {/* Metric 4: Integrated Ambang Batas Gauge */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ambang Batas Panggilan
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold ${
              violationPoints < 25 ? 'bg-emerald-100 text-emerald-900' :
              violationPoints < 50 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
            }`}>
              {violationPoints} / 50 Poin ({violationPercentage}%)
            </span>
          </div>

          <div className="my-1 sm:my-1.5 space-y-1.5">
            {/* Progress track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                style={{ width: `${Math.max(violationPercentage, 3)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  violationPoints < 25 ? 'bg-emerald-700' :
                  violationPoints < 50 ? 'bg-amber-600' : 'bg-rose-700'
                }`}
              />
            </div>

            {/* Threshold segment pills */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center text-[9px] sm:text-[10px]">
              <div className={`py-0.5 sm:py-1 px-0.5 sm:px-1 rounded-md border font-bold ${
                violationPoints < 25 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span>0-24: Aman</span>
              </div>
              <div className={`py-0.5 sm:py-1 px-0.5 sm:px-1 rounded-md border font-bold ${
                violationPoints >= 25 && violationPoints < 50 ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span>25-49: Teguran</span>
              </div>
              <div className={`py-0.5 sm:py-1 px-0.5 sm:px-1 rounded-md border font-bold ${
                violationPoints >= 50 ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span>≥50: Surat BK</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            {50 - violationPoints > 0 
              ? `Tersisa ${50 - violationPoints} poin toleransi sebelum konferensi kasus.` 
              : 'Ambang batas tercapai. Mohon penuhi jadwal BK.'}
          </p>
        </div>
      </div>

      {/* ─── 3. DUA KOLOM: TABEL RIWAYAT POIN & PANDUAN PEMBINAAN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* KOLOM KIRI: TABEL KRONOLOGIS RIWAYAT POIN (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          {/* Header Bar dengan Filter Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-slate-100 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  Riwayat Pencatatan Karakter ({activeChild.name.split(' ')[0]})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shrink-0">
                  {activePoints.length} Catatan
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 truncate">
                Daftar kronologis apresiasi prestasi dan catatan tata tertib siswa.
              </p>
            </div>

            {/* Filter Tabs (Full-width segmented on mobile) */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({activePoints.length})
              </button>
              <button
                onClick={() => setFilterType('prestasi')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  filterType === 'prestasi'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prestasi ({prestasiCount})
              </button>
              <button
                onClick={() => setFilterType('pelanggaran')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  filterType === 'pelanggaran'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disiplin ({pelanggaranCount})
              </button>
            </div>
          </div>

          {/* Mobile Card List View (sm:hidden) */}
          <div className="sm:hidden space-y-2 mt-2.5 max-h-[460px] overflow-y-auto pr-0.5">
            {filteredPoints.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-medium">Tidak ada catatan poin untuk kategori ini.</p>
              </div>
            ) : (
              filteredPoints.map((item, idx) => {
                const isPrestasi = item.kind === 'prestasi';
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs border-l-4 ${
                      isPrestasi ? 'border-l-emerald-700' : 'border-l-rose-600'
                    } space-y-2`}
                  >
                    {/* Header Row: Date & Kind Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-xs text-slate-800">
                          {item.point_date}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-2xs ${
                        isPrestasi ? 'bg-emerald-800 text-white' : 'bg-rose-700 text-white'
                      }`}>
                        {item.kind}
                      </span>
                    </div>

                    {/* Title & Points Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {item.category}
                        </p>
                      </div>
                      <span className={`font-mono font-extrabold text-sm sm:text-base px-2 py-0.5 rounded-lg shrink-0 ${
                        isPrestasi ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {item.points > 0 ? `+${item.points}` : item.points} Poin
                      </span>
                    </div>

                    {/* Teacher & Note Box */}
                    <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                      <p className="text-[10px] font-medium text-slate-500">
                        Pencatat: <span className="font-semibold text-slate-700">{item.recorder_name}</span>
                      </p>
                      <p className="text-slate-700 leading-relaxed font-normal">
                        {item.note}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table Container (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto max-h-[500px] overflow-y-auto mt-2.5 border border-slate-200 rounded-xl">
            <table className="w-full min-w-[650px] text-left text-[11px] sm:text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 shadow-2xs">
                <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
                  <th className="py-2 sm:py-2.5 px-2.5 sm:px-3">Tanggal</th>
                  <th className="py-2 sm:py-2.5 px-2.5 sm:px-3">Jenis & Kategori</th>
                  <th className="py-2 sm:py-2.5 px-2.5 sm:px-3">Peristiwa / Prestasi</th>
                  <th className="py-2 sm:py-2.5 px-2 text-center">Poin</th>
                  <th className="py-2 sm:py-2.5 px-2.5 sm:px-3">Guru Pencatat</th>
                  <th className="py-2 sm:py-2.5 px-2.5 sm:px-3">Catatan Pembinaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredPoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 sm:py-12 text-center text-slate-500 font-medium">
                      Tidak ada catatan poin untuk kategori ini.
                    </td>
                  </tr>
                ) : (
                  filteredPoints.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.point_date}
                      </td>
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase ${
                          item.kind === 'prestasi' ? 'bg-emerald-800 text-white' : 'bg-rose-700 text-white'
                        }`}>
                          {item.kind}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 font-medium">{item.category}</p>
                      </td>
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 font-bold text-slate-900 max-w-xs">
                        {item.title}
                      </td>
                      <td className="py-2 sm:py-2.5 px-2 text-center font-mono font-extrabold text-xs sm:text-sm">
                        <span className={item.points > 0 ? 'text-emerald-800' : 'text-rose-700'}>
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                      </td>
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-700 font-medium whitespace-nowrap">
                        {item.recorder_name}
                      </td>
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-600 text-[11px] sm:text-xs leading-relaxed max-w-xs">
                        {item.note}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN: PANDUAN TATA TERTIB & LAYANAN BK (5 COLS - NO DEAD VOID) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-3.5 sm:gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  Pedoman Tata Tertib & Apresiasi
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                  Sistem reward & punishment karakter Labschool UM
                </p>
              </div>
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-800 text-white text-[10px] sm:text-xs font-bold shadow-2xs">
                SK Kepala Sekolah
              </span>
            </div>

            {/* List of 2 Distinct Policy & Guidance Cards */}
            <div className="space-y-2.5 my-3">
              {/* Card 1: Regulasi Poin Pelanggaran */}
              <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all border-l-4 border-l-rose-600">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-rose-700 text-white">
                      Aturan Pelanggaran
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-mono">
                      Pedoman #1
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    Ambang 50 Poin
                  </span>
                </div>

                {/* Policy Body */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Sanksi & Akumulasi Kedisiplinan Siswa
                    </p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed pl-5">
                    • Keterlambatan masuk: 2 - 5 poin per kejadian.<br />
                    • Kerapian & kelengkapan seragam: 3 - 5 poin.<br />
                    • Akumulasi mencapai 50 poin memicu surat panggilan orang tua dari Guru BK.
                  </p>
                </div>

                {/* Footer Row */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-slate-800 text-white">
                    Pendampingan Walas
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                    Sumber: <strong className="text-slate-800 font-semibold">Buku Saku Tata Tertib</strong>
                  </span>
                </div>
              </div>

              {/* Card 2: Apresiasi Prestasi & Bakat */}
              <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all border-l-4 border-l-emerald-600">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-emerald-800 text-white">
                      Apresiasi Prestasi
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 font-mono">
                      Insentif #2
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    Poin Reward
                  </span>
                </div>

                {/* Reward Content */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Medal className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Konversi Poin untuk Rekomendasi Beasiswa
                    </p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed pl-5">
                    Siswa dengan saldo prestasi positif &gt; 25 poin berhak memperoleh piagam penghargaan karakter teladan saat wisuda semester dan prioritas kuota lomba eksternal.
                  </p>
                </div>

                {/* Footer Row */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-emerald-800 text-white">
                    Piagam Karakter
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                    Kesiswaan Labschool UM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Solid Information Card & Fast Contact */}
          <div className="pt-2 border-t border-slate-100 shrink-0 space-y-2">
            {/* Kebijakan Konseling */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-[11px] sm:text-xs text-slate-700 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Pusat Konseling Bimbingan Karakter Siswa:</span>
              </div>
              <p className="text-slate-600 leading-normal text-[10px] sm:text-[11px] font-normal">
                Orang tua dapat meminta sesi konsultasi tatap muka bersama Wali Kelas & Guru BK untuk pendampingan studi dan kedisiplinan siswa di sekolah.
              </p>
            </div>

            {/* Kontak Guru BK */}
            <div className="p-2 sm:p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block leading-tight text-[11px] sm:text-xs truncate">Guru BK: Dra. Hj. Ratna Dewi</span>
                  <span className="text-slate-600 text-[10px] sm:text-[11px] block truncate">Ruang Konseling BK: 07.30 - 15.00 WIB</span>
                </div>
              </div>
              <Link
                href="/ortu/konseling"
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] sm:text-xs font-bold shrink-0 transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-center"
              >
                <span>+ Temu BK</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
