'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  AlertCircle, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  className: string;
  type: 'sakit' | 'izin' | 'dispensasi';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
  attachmentName?: string;
  submittedAt: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  parentName: string;
  decisionNote?: string;
}

export default function PerizinanSiswaPage() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<LeaveRequestItem | null>(null);

  const [requests, setRequests] = useState<LeaveRequestItem[]>([
    {
      id: 'lr-001',
      studentId: 'std-240907',
      studentName: 'Dimas Anggara Putra',
      nis: '240907',
      className: 'Kelas IX-A',
      type: 'sakit',
      startDate: '2026-10-14',
      endDate: '2026-10-15',
      reason: 'Demam tinggi dan radang tenggorokan. Istirahat dokter 2 hari.',
      attachmentUrl: '#',
      attachmentName: 'Surat_Dokter_Klinik_UM_Dimas.pdf',
      submittedAt: '2026-10-14 06:45 WIB',
      status: 'menunggu',
      parentName: 'Bambang Sudarmono (Ayah)',
    },
    {
      id: 'lr-002',
      studentId: 'std-240914',
      studentName: 'Karina Safitri',
      nis: '240914',
      className: 'Kelas IX-A',
      type: 'dispensasi',
      startDate: '2026-10-14',
      endDate: '2026-10-14',
      reason: 'Mewakili sekolah pada babak penyisihan Olimpiade Sains Nasional (OSN) Bidang Informatika.',
      attachmentUrl: '#',
      attachmentName: 'Surat_Tugas_OSN_Informatika_Karina.pdf',
      submittedAt: '2026-10-13 14:10 WIB',
      status: 'menunggu',
      parentName: 'H. Suryanto (Ayah)',
    },
    {
      id: 'lr-003',
      studentId: 'std-240922',
      studentName: 'Salma Nuraini',
      nis: '240922',
      className: 'Kelas IX-A',
      type: 'izin',
      startDate: '2026-10-09',
      endDate: '2026-10-09',
      reason: 'Menghadiri prosesi akad nikah kakak kandung di luar kota.',
      attachmentUrl: '#',
      attachmentName: 'Surat_Izin_Keluarga_Salma.pdf',
      submittedAt: '2026-10-08 19:20 WIB',
      status: 'disetujui',
      parentName: 'Ibu Ratna (Ibu)',
      decisionNote: 'Disetujui. Tugas mandiri telah diserahkan.'
    }
  ]);

  const handleDecision = (id: string, newStatus: 'disetujui' | 'ditolak') => {
    setRequests(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          decisionNote: newStatus === 'disetujui' ? 'Disetujui oleh Wali Kelas' : 'Ditolak, surat bukti kurang jelas'
        };
      }
      return item;
    }));

    toast.success(
      newStatus === 'disetujui'
        ? 'Permohonan izin disetujui! Status presensi KBM siswa otomatis diperbarui.'
        : 'Permohonan izin ditolak.'
    );
  };

  const filteredRequests = requests.filter(req => {
    if (filterType !== 'ALL' && req.status !== filterType) return false;
    if (searchQuery && !req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) && !req.nis.includes(searchQuery)) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'menunggu').length;

  return (
    <div className="w-full space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              Layanan Perizinan KBM
            </span>
            <span className="text-xs text-slate-500 font-semibold">• BE-ACD-04 & ADM-ACD-04 (P0)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Verifikasi Izin & Sakit Siswa (Wali Kelas)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Tinjau permohonan ketidakhadiran dari orang tua/siswa, verifikasi lampiran surat dokter/keterangan, dan sinkronkan keputusan langsung ke Presensi Jurnal KBM.
          </p>
        </div>

        {/* Counter Pill (Solid) */}
        <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl shadow-xs shrink-0 font-bold text-xs">
          <Clock className="w-4 h-4" />
          <span>{pendingCount} Permohonan Menunggu Verifikasi</span>
        </div>
      </div>

      {/* ─── CONTROLS BAR ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Semua ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('menunggu')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterType === 'menunggu' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Menunggu ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('disetujui')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterType === 'disetujui' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Disetujui
          </button>
        </div>
      </div>

      {/* ─── LIST PERMOHONAN IZIN / SAKIT ─── */}
      <div className="space-y-4">
        {filteredRequests.map((item) => (
          <div 
            key={item.id}
            className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {item.type === 'sakit' ? '🏥' : item.type === 'dispensasi' ? '🏆' : '📝'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{item.studentName}</h3>
                    <span className="font-mono text-xs text-slate-500">({item.nis})</span>
                    <span className="text-[11px] font-bold text-slate-600">• {item.className}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Diajukan oleh: {item.parentName} pada {item.submittedAt}</p>
                </div>
              </div>

              {/* Status Solid Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'menunggu' && (
                  <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                    Menunggu Verifikasi
                  </span>
                )}
                {item.status === 'disetujui' && (
                  <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-emerald-800 text-white shadow-xs">
                    Disetujui
                  </span>
                )}
                {item.status === 'ditolak' && (
                  <span className="px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-rose-800 text-white shadow-xs">
                    Ditolak
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Rentang Tanggal</span>
                <span className="font-extrabold text-slate-900 block">
                  {item.startDate} s/d {item.endDate}
                </span>
                <span className="text-[10px] text-blue-900 font-bold uppercase">
                  Jenis: {item.type.toUpperCase()}
                </span>
              </div>

              <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Alasan / Keterangan</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {item.reason}
                </p>
                {item.attachmentName && (
                  <div className="pt-1.5 flex items-center gap-2 text-[11px] font-bold text-blue-900">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="underline cursor-pointer">{item.attachmentName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar for Pending Requests */}
            {item.status === 'menunggu' && (
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDecision(item.id, 'ditolak')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-rose-300 text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  Tolak Permohonan
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(item.id, 'disetujui')}
                  className="px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Setujui & Sinkron ke Presensi KBM</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
