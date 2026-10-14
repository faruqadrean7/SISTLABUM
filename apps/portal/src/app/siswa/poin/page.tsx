'use client';

import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Clock, 
  CheckCircle2, 
  Users, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { MOCK_STUDENT_POINTS_LOG, StudentPointLogItem } from '@/lib/mock-student-data';

export default function StudentPoinPage() {
  const [activeTab, setActiveTab] = useState<'poin' | 'ekskul'>('poin');
  const [filterKind, setFilterKind] = useState<'semua' | 'prestasi' | 'pelanggaran'>('semua');

  const totalPrestasi = MOCK_STUDENT_POINTS_LOG
    .filter(p => p.kind === 'prestasi')
    .reduce((acc, curr) => acc + curr.points, 0);

  const totalPelanggaran = Math.abs(
    MOCK_STUDENT_POINTS_LOG
      .filter(p => p.kind === 'pelanggaran')
      .reduce((acc, curr) => acc + curr.points, 0)
  );

  const balancePoints = totalPrestasi - totalPelanggaran;

  const filteredLogs = filterKind === 'semua'
    ? MOCK_STUDENT_POINTS_LOG
    : MOCK_STUDENT_POINTS_LOG.filter(p => p.kind === filterKind);

  const myExtracurriculars = [
    {
      id: 'ekskul-01',
      name: 'Coding & Robotika Club (Robotics Team)',
      coach: 'Budi Santoso, S.Kom., M.T.',
      schedule: 'Setiap Rabu, 15:00 - 17:00 WIB',
      room: 'Lab Komputer 1 & Lab Robotika',
      role: 'Anggota Inti (Programmer)',
      attendance_rate: '100%',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      id: 'ekskul-02',
      name: 'Palang Merah Remaja (PMR Madya)',
      coach: 'Dra. Siti Rahayu, M.Pd.',
      schedule: 'Setiap Sabtu, 08:00 - 10:00 WIB',
      room: 'Ruang UKS & Lapangan Utama',
      role: 'Anggota Reguler',
      attendance_rate: '92.3%',
      badgeColor: 'bg-rose-700 text-white',
    },
  ];

  const availableEkskul = [
    { name: 'Futsal & Sepak Bola', coach: 'Rudi Hartono, S.Pd.', quota: 'Sisa 4 Kuota', schedule: 'Selasa & Jumat' },
    { name: 'Paduan Suara & Orkestra Remaja', coach: 'Yuni Astuti, S.Sn.', quota: 'Sisa 8 Kuota', schedule: 'Kamis Sore' },
    { name: 'Klub Bahasa Inggris & Debat (EDC)', coach: 'Nurul Hidayati, M.Ed.', quota: 'Sisa 6 Kuota', schedule: 'Senin Sore' },
    { name: 'Jurnalistik & Fotografi Sekolah', coach: 'Agus Subekti, S.Pd.', quota: 'Sisa 2 Kuota', schedule: 'Sabtu Pagi' },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── HEADER TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              Kesiswaan & Pembiasaan Karakter
            </span>
            <span className="text-xs text-slate-500 font-semibold">T.A. 2026/2027 Ganjil</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Buku Poin Pembiasaan & Ekstrakurikuler
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Pantau catatan poin kedisiplinan dan apresiasi prestasi, serta jadwal kegiatan ekstrakurikuler sekolah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('poin')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'poin'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Buku Poin Siswa
          </button>
          <button
            onClick={() => setActiveTab('ekskul')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'ekskul'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Ekstrakurikuler ({myExtracurriculars.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: BUKU POIN SISWA ─── */}
      {activeTab === 'poin' && (
        <div className="space-y-5">
          {/* 3 Metric Cards Saldo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="school-card p-5 border-l-4 border-l-emerald-700">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Poin Prestasi</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-extrabold text-emerald-700">+{totalPrestasi}</p>
                <span className="text-xs text-white font-bold bg-emerald-700 px-2 py-0.5 rounded shadow-xs">
                  2 Penghargaan
                </span>
              </div>
            </div>

            <div className="school-card p-5 border-l-4 border-l-rose-700">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Poin Pelanggaran</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-extrabold text-rose-700">-{totalPelanggaran}</p>
                <span className="text-xs text-white font-bold bg-rose-700 px-2 py-0.5 rounded shadow-xs">
                  1 Catatan Ringan
                </span>
              </div>
            </div>

            <div className="school-card p-5 border-l-4 border-l-blue-900">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Saldo Bersih Poin</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-3xl font-extrabold text-blue-900">+{balancePoints}</p>
                <span className="text-xs text-white font-bold bg-blue-900 px-2 py-0.5 rounded shadow-xs">
                  Kategori: Sangat Baik
                </span>
              </div>
            </div>
          </div>

          {/* Indikator Ambang Batas Disiplin Sekolah */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Ambang Batas Kedisiplinan Siswa SMP Labschool UM
              </h4>
              <span className="text-xs font-bold text-emerald-700">Status Anda: AMAN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-300">
                <span className="font-bold text-slate-800 block">Ambang 1: -25 Poin</span>
                <p className="text-slate-600 text-[11px] mt-0.5">Teguran tertulis & pembinaan wali kelas.</p>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">✔ Pelanggaran Anda: 10 poin (Aman)</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-300">
                <span className="font-bold text-slate-800 block">Ambang 2: -50 Poin</span>
                <p className="text-slate-600 text-[11px] mt-0.5">Surat Peringatan 1 & pemanggilan orang tua.</p>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">✔ Belum pernah tercapai</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-300">
                <span className="font-bold text-slate-800 block">Ambang 3: -75 Poin</span>
                <p className="text-slate-600 text-[11px] mt-0.5">Skorsing sementara & konferensi kasus BK.</p>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">✔ Belum pernah tercapai</span>
              </div>
            </div>
          </div>

          {/* Tabel Catatan Riwayat Poin */}
          <div className="school-card overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Riwayat Pencatatan Poin Siswa</h3>
                <p className="text-xs text-slate-500 font-medium">Dicatat oleh guru piket, wali kelas, dan pembina kesiswaan</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterKind('semua')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    filterKind === 'semua' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterKind('prestasi')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    filterKind === 'prestasi' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Prestasi
                </button>
                <button
                  onClick={() => setFilterKind('pelanggaran')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    filterKind === 'pelanggaran' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Pelanggaran
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        log.kind === 'prestasi' ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                      }`}>
                        {log.kind === 'prestasi' ? '+ Prestasi' : '- Pelanggaran'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{log.date_str}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-semibold">{log.category}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">{log.type_name}</h4>
                    <p className="text-xs text-slate-600 font-medium italic">"{log.note}"</p>
                    <p className="text-[11px] text-slate-500">Pencatat: {log.recorder_name}</p>
                  </div>

                  <span className={`text-xl font-black px-3.5 py-1.5 rounded-lg shadow-xs self-start sm:self-auto ${
                    log.kind === 'prestasi' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}>
                    {log.points > 0 ? `+${log.points}` : log.points} Poin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EKSTRAKURIKULER & OSIS ─── */}
      {activeTab === 'ekskul' && (
        <div className="space-y-6">
          {/* Ekskul yang Diikuti */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Ekstrakurikuler Aktif yang Diikuti
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myExtracurriculars.map((ekskul) => (
                <div key={ekskul.id} className="school-card p-5 bg-white border border-slate-300 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${ekskul.badgeColor}`}>
                      {ekskul.role}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Kehadiran: {ekskul.attendance_rate}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{ekskul.name}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1">Pembina: {ekskul.coach}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      <strong>Jadwal:</strong> {ekskul.schedule}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <strong>Lokasi:</strong> {ekskul.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ekskul Lainnya Tersedia */}
          <div className="school-card p-6 bg-white space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">Katalog Ekstrakurikuler Pilihan Lainnya</h3>
              <p className="text-xs text-slate-600 font-medium">Pendaftaran gelombang tambahan dibuka hingga akhir bulan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableEkskul.map((eks, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{eks.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">Pembina: {eks.coach} • {eks.schedule}</p>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {eks.quota}
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`Mengajukan pendaftaran ekstrakurikuler: ${eks.name}`)}
                    className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    Daftar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
