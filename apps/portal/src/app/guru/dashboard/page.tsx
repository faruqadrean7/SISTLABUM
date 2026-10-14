'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  Calendar, 
  ArrowRight, 
  FileText, 
  School,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CURRENT_TEACHER, MOCK_CLASSES, MOCK_ASSIGNMENTS } from '@/lib/mock-lms-data';

export default function GuruDashboardPage() {
  const recentSubmissions = [
    { id: '1', student: 'Ahmad Fauzan Maulana', class: 'Kelas IX-A', task: 'Tugas Mandiri 03: Desain Web', time: '14:32 WIB', status: 'graded', score: 95 },
    { id: '2', student: 'Nabila Putri Andini', class: 'Kelas IX-A', task: 'Tugas Mandiri 03: Desain Web', time: '16:45 WIB', status: 'pending' },
    { id: '3', student: 'Rizky Pratama Wijaya', class: 'Kelas IX-A', task: 'Tugas Mandiri 03: Desain Web', time: '08:12 WIB', status: 'late' },
    { id: '4', student: 'Siti Aisyah Rahmawati', class: 'Kelas IX-A', task: 'Tugas Mandiri 03: Desain Web', time: '11:20 WIB', status: 'graded', score: 88 },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── WELCOME HERO BANNER (SOLID NAVY) ─── */}
      <div className="school-card p-6 md:p-8 bg-blue-900 text-white relative overflow-hidden shadow-xs border-2 border-blue-950">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-blue-950 text-emerald-300 border border-blue-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            T.A. 2026/2027 • Semester Ganjil
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Selamat Datang, {CURRENT_TEACHER.name}
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed font-medium">
            Kelola kegiatan belajar mengajar, pantau kepatuhan penugasan rombel, dan publikasikan modul ajar Kurikulum Merdeka.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            <Link
              href="/guru/jurnal"
              className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black tracking-wider uppercase transition-all shadow-xs active:scale-98"
            >
              Jurnal & Presensi Hari Ini ➔
            </Link>
            <Link
              href="/guru/tugas"
              className="px-4 py-2.5 rounded-lg bg-blue-950 hover:bg-black text-white text-xs font-bold transition-colors shadow-xs border border-blue-800"
            >
              Tugas & Penilaian
            </Link>
            <Link
              href="/guru/nilai"
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Buku Nilai Ledger
            </Link>
            <Link
              href="/guru/cbt"
              className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Bank Soal & CBT
            </Link>
            <Link
              href="/guru/jadwal"
              className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Jadwal KBM
            </Link>
            <Link
              href="/guru/perizinan"
              className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Perizinan Siswa
            </Link>
            <Link
              href="/guru/siswa"
              className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Data Siswa & Poin
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 4 SUMMARY STAT CARDS (SOLID HIGHLIGHTS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="school-card p-5 border-l-4 border-l-blue-900">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rombel Binaan</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-900">{MOCK_CLASSES.length}</p>
            <span className="text-xs text-white font-bold bg-blue-900 px-2 py-0.5 rounded shadow-xs">IX-A, IX-B, VIII-C</span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-teal-800">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Siswa</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-slate-900">94</p>
            <span className="text-xs text-white font-bold bg-teal-800 px-2 py-0.5 rounded shadow-xs">3 Rombel</span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-blue-900">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tugas Aktif</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-blue-900">{MOCK_ASSIGNMENTS.length}</p>
            <span className="text-xs text-white font-bold bg-blue-900 px-2 py-0.5 rounded shadow-xs">Berjalan</span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-amber-600">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Menunggu Koreksi</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-amber-700">6 Berkas</p>
            <span className="text-xs text-white font-bold bg-amber-600 px-2 py-0.5 rounded shadow-xs">Perlu Review</span>
          </div>
        </div>
      </div>

      {/* ─── 2 COLUMNS: JADWAL KBM & FEED PENGUMPULAN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Jadwal KBM Hari Ini */}
        <div className="lg:col-span-2 school-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Jadwal Tatap Muka KBM Hari Ini</h3>
              <p className="text-xs text-slate-600 font-medium">Rabu, 14 Oktober 2026</p>
            </div>
            <span className="text-xs font-bold text-white bg-teal-800 px-2.5 py-1 rounded-md shadow-xs">
              2 Sesi Mengajar
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-slate-300 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  07:30
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Informatika & Pemrograman</h4>
                  <p className="text-xs text-slate-600 font-medium">Kelas IX-A • Lab Komputer 1 (Lantai 2)</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-700 text-white shadow-xs">
                Selesai KBM
              </span>
            </div>

            <div className="p-4 rounded-lg border-2 border-blue-900 bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-teal-800 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  10:00
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Pemrograman Web & Logika</h4>
                  <p className="text-xs text-slate-600 font-medium">Kelas IX-B • Lab Multimedia (Lantai 3)</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-900 text-white shadow-xs">
                Sesi Berikutnya
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Feed Pengumpulan Siswa Terbaru */}
        <div className="school-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Aktivitas Pengumpulan</h3>
            <Link href="/guru/tugas" className="text-xs font-bold text-blue-900 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-lg border border-slate-300 bg-white text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{sub.student}</span>
                  <span className="text-[10px] text-slate-600 font-mono font-bold">{sub.time}</span>
                </div>
                <p className="text-slate-600 text-[11px] font-medium mt-0.5 truncate">{sub.task}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  {sub.status === 'graded' ? (
                    <span className="text-[10px] font-extrabold text-white bg-emerald-700 px-2 py-0.5 rounded shadow-xs">
                      Nilai: {sub.score}
                    </span>
                  ) : sub.status === 'late' ? (
                    <span className="text-[10px] font-extrabold text-white bg-rose-700 px-2 py-0.5 rounded shadow-xs">
                      Terlambat
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-white bg-amber-600 px-2 py-0.5 rounded shadow-xs">
                      Perlu Koreksi
                    </span>
                  )}
                  <Link
                    href={`/guru/tugas/asg-001/penilaian`}
                    className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Nilai ➔</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
