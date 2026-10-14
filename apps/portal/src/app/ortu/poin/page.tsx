'use client';

import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  Medal, 
  Info
} from 'lucide-react';
import { useGuardian } from '@/lib/guardian-context';

export default function GuardianPoinPage() {
  const { activeChild, activePoints } = useGuardian();
  const [filterType, setFilterType] = useState<'all' | 'prestasi' | 'pelanggaran'>('all');

  const filteredPoints = activePoints.filter(p => {
    if (filterType === 'all') return true;
    return p.kind === filterType;
  });

  // Calculate disciplinary percentage for meter (-10 out of -50 is 20%)
  const violationPoints = activeChild.points_pelanggaran;
  const violationPercentage = Math.min(Math.round((violationPoints / 50) * 100), 100);

  return (
    <div className="space-y-6">
      {/* ─── HEADER BANNER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-600 text-white text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-white" />
            <span>Pencatatan Karakter & Tata Tertib Siswa</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Buku Poin Karakter & Prestasi ({activeChild.name})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Transparansi apresiasi prestasi dan pemantauan kedisiplinan berpedoman pada tata tertib sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Kondisi Disiplin: AMAN</span>
          </span>
        </div>
      </div>

      {/* ─── 3 KPI KARTU SALDO POIN ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Poin Bersih */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Saldo Poin Karakter Bersih</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">
              +{activeChild.points_balance}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-800 text-white">
              Predikat Positif
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Akumulasi poin prestasi dikurangi catatan pelanggaran
          </p>
        </div>

        {/* Poin Prestasi */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Apresiasi Prestasi</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-800">
              +{activeChild.points_prestasi}
            </span>
            <span className="text-xs font-bold text-emerald-700">Poin Apresiasi</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Lomba akademik, kejuruan, dan peran aktif organisasi
          </p>
        </div>

        {/* Poin Pelanggaran */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Catatan Disiplin</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">
              {activeChild.points_pelanggaran}
            </span>
            <span className="text-xs font-bold text-emerald-800">Batas Max: 50 Poin</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Jauh di bawah ambang batas pemanggilan orang tua
          </p>
        </div>
      </div>

      {/* ─── VISUAL METER AMBANG BATAS PEMANGGILAN ORANG TUA ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Indikator Ambang Batas Disiplin & Pemanggilan Orang Tua
            </h2>
            <p className="text-xs text-slate-500">
              Sesuai aturan sekolah, pemanggilan wali murid dilaksanakan bila akumulasi poin pelanggaran mencapai 50
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300 self-start sm:self-auto">
            Pelanggaran: {violationPoints} / 50 Poin
          </span>
        </div>

        {/* Meter Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${Math.max(violationPercentage, 3)}%` }}
              className={`h-full transition-all duration-500 ${
                violationPoints < 25 ? 'bg-emerald-700' :
                violationPoints < 50 ? 'bg-amber-600' : 'bg-rose-700'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 text-[11px] font-bold text-slate-600 pt-1 border-t border-slate-100">
            <div>
              <span className="text-emerald-800">● 0 - 24: Kondisi Aman</span>
              <p className="text-[10px] text-slate-500 font-normal">Pembinaan rutin harian</p>
            </div>
            <div className="text-center">
              <span className="text-amber-800">● 25 - 49: Peringatan I Walas</span>
              <p className="text-[10px] text-slate-500 font-normal">Surat peringatan tertulis</p>
            </div>
            <div className="text-right">
              <span className="text-rose-800">● ≥ 50: Pemanggilan Orang Tua</span>
              <p className="text-[10px] text-slate-500 font-normal">Konferensi kasus Guru BK</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABEL BUKU POIN PRESTASI & DISIPLIN ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Buku Catatan Poin ({activeChild.name.split(' ')[0]})
            </h2>
            <p className="text-xs text-slate-500">
              Riwayat lengkap pencatatan prestasi dan kedisiplinan siswa
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-300">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua ({activePoints.length})
            </button>
            <button
              onClick={() => setFilterType('prestasi')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filterType === 'prestasi'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Prestasi ({activePoints.filter(p => p.kind === 'prestasi').length})
            </button>
            <button
              onClick={() => setFilterType('pelanggaran')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filterType === 'pelanggaran'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Disiplin ({activePoints.filter(p => p.kind === 'pelanggaran').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Jenis & Kategori</th>
                <th className="py-2.5 px-3">Peristiwa / Prestasi</th>
                <th className="py-2.5 px-3 text-center">Poin</th>
                <th className="py-2.5 px-3">Guru Pencatat</th>
                <th className="py-2.5 px-3">Catatan Pembinaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                    Tidak ada catatan poin untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredPoints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {item.point_date}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.kind === 'prestasi' ? 'bg-emerald-800 text-white' : 'bg-rose-700 text-white'
                      }`}>
                        {item.kind}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">{item.category}</p>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 max-w-xs">
                      {item.title}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono text-sm font-black ${
                        item.points > 0 ? 'text-emerald-800' : 'text-rose-700'
                      }`}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold whitespace-nowrap">
                      {item.recorder_name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                      {item.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
