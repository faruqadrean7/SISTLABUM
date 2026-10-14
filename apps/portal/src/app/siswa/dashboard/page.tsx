'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MonitorPlay, 
  Calendar, 
  CheckSquare, 
  Award, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen,
  UserCheck
} from 'lucide-react';
import { 
  CURRENT_STUDENT, 
  MOCK_STUDENT_SCHEDULES, 
  MOCK_STUDENT_EXAMS, 
  MOCK_STUDENT_TASKS 
} from '@/lib/mock-student-data';

export default function StudentDashboardPage() {
  const activeExam = MOCK_STUDENT_EXAMS.find(e => e.status === 'aktif');
  const todaySchedules = MOCK_STUDENT_SCHEDULES.filter(s => s.day === 'Senin' || s.is_active_today);
  const pendingTasks = MOCK_STUDENT_TASKS.filter(t => t.status === 'aktif');

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── WELCOME HERO BANNER (SOLID NAVY) ─── */}
      <div className="school-card p-6 md:p-8 bg-blue-900 text-white relative overflow-hidden shadow-xs border-2 border-blue-950">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-blue-950 text-emerald-300 border border-blue-800">
              NIS: {CURRENT_STUDENT.nis} • NISN: {CURRENT_STUDENT.nisn}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              Presensi: {CURRENT_STUDENT.gate_attendance_today.status.toUpperCase()} ({CURRENT_STUDENT.gate_attendance_today.tap_time})
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-teal-800 text-teal-100">
              {CURRENT_STUDENT.class_name} • T.A. 2026/2027 Ganjil
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Selamat Datang, {CURRENT_STUDENT.name}! 👋
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed font-medium">
            Pantau jadwal tatap muka kelas, kumpulkan tugas tepat waktu, dan ikuti asesmen ujian digital CBT di Lab Komputer dengan integritas tinggi.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            <Link
              href="/siswa/cbt"
              className="px-4 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black tracking-wider uppercase transition-all shadow-xs flex items-center gap-2"
            >
              <MonitorPlay className="w-4 h-4 text-white" />
              <span>Ruang Ujian CBT Aktif ➔</span>
            </Link>
            <Link
              href="/siswa/tugas"
              className="px-4 py-2.5 rounded-lg bg-blue-950 hover:bg-black text-white text-xs font-bold transition-colors shadow-xs border border-blue-800"
            >
              Lihat Tugas ({pendingTasks.length} Berjalan)
            </Link>
            <Link
              href="/siswa/jadwal"
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Jadwal Pelajaran
            </Link>
            <Link
              href="/siswa/nilai"
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Capaian Nilai & Rapor
            </Link>
            <Link
              href="/siswa/poin"
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
            >
              Buku Poin Siswa
            </Link>
          </div>
        </div>
      </div>

      {/* ─── BANNER UJIAN CBT AKTIF HARI INI (SOLID ROSE - HIGH PRIORITY) ─── */}
      {activeExam && (
        <div className="school-card p-5 bg-rose-800 text-white border-2 border-rose-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-rose-800 flex items-center justify-center shrink-0 font-black shadow-xs">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-200 border border-rose-700">
                  Ujian Berlangsung Sekarang
                </span>
                <span className="text-xs text-rose-100 font-bold">{activeExam.subject_name}</span>
              </div>
              <h3 className="font-extrabold text-base md:text-lg text-white mt-1 leading-tight">
                {activeExam.title}
              </h3>
              <p className="text-xs text-rose-100 mt-1 font-medium flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-200" /> {activeExam.time_range} ({activeExam.duration_minutes} Menit)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-200" /> {activeExam.room_name}
                </span>
                <span className="bg-rose-950 px-2 py-0.5 rounded font-mono font-bold text-white text-[11px]">
                  Token: {activeExam.token_required}
                </span>
              </p>
            </div>
          </div>

          <Link
            href={`/siswa/cbt/${activeExam.id}`}
            className="px-5 py-3 rounded-lg bg-white hover:bg-rose-50 text-rose-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs shrink-0 self-stretch md:self-auto text-center"
          >
            Kerjakan Ujian Sekarang ➔
          </Link>
        </div>
      )}

      {/* ─── 4 KPI METRIC CARDS (SOLID HIGHLIGHTS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="school-card p-5 border-l-4 border-l-emerald-700">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kehadiran Siswa</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-emerald-700">97.2%</p>
            <span className="text-xs text-white font-bold bg-emerald-700 px-2 py-0.5 rounded shadow-xs">
              35 Hadir • 1 Sakit
            </span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-emerald-800">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Saldo Poin Siswa</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-emerald-800">+45</p>
            <span className="text-xs text-white font-bold bg-emerald-800 px-2 py-0.5 rounded shadow-xs">
              55 Positif • 10 Minus
            </span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-blue-900">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tugas Aktif Berjalan</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-blue-900">{pendingTasks.length} Tugas</p>
            <span className="text-xs text-white font-bold bg-blue-900 px-2 py-0.5 rounded shadow-xs">
              Tenggat Terdekat
            </span>
          </div>
        </div>

        <div className="school-card p-5 border-l-4 border-l-teal-800">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status KKTP Kurikulum</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-extrabold text-teal-800">Tuntas</p>
            <span className="text-xs text-white font-bold bg-teal-800 px-2 py-0.5 rounded shadow-xs">
              Rerata: 90.3
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2 COLUMNS: JADWAL KBM & TUGAS / PENGUMUMAN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Jadwal KBM Hari Ini & Tugas Mandiri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Tatap Muka Hari Ini */}
          <div className="school-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Jadwal Pelajaran Tatap Muka Hari Ini</h3>
                <p className="text-xs text-slate-600 font-medium">Senin, 14 Oktober 2026 • Kelas IX-A</p>
              </div>
              <Link
                href="/siswa/jadwal"
                className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
              >
                <span>Lihat Jadwal Mingguan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {todaySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 rounded-lg border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-900 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-900 text-white font-black flex flex-col items-center justify-center text-xs shrink-0 shadow-xs">
                      <span className="text-[10px] text-blue-200 uppercase">{sch.period}</span>
                      <span className="text-[11px] font-extrabold">{sch.time_range.slice(0, 5)}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{sch.subject_name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-2">
                        <span>Guru: {sch.teacher_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-blue-900">
                          <MapPin className="w-3 h-3 text-blue-800" /> {sch.room_name}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 self-start sm:self-auto">
                    {sch.time_range}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tugas Mandiri dengan Tenggat Terdekat */}
          <div className="school-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Tugas & Lembar Kerja yang Harus Diselesaikan</h3>
                <p className="text-xs text-slate-600 font-medium">Kumpulkan tepat waktu untuk menghindari pengurangan poin kedisiplinan</p>
              </div>
              <Link
                href="/siswa/tugas"
                className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
              >
                <span>Buka LMS Tugas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-900 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                      <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {task.subject_name}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Tenggat: <strong className="text-slate-800">{task.due_date_str}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-2.5 py-1 rounded text-xs font-black bg-amber-600 text-white shadow-xs">
                      {task.days_left} Hari Lagi
                    </span>
                    <Link
                      href="/siswa/tugas"
                      className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      Unggah Berkas
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pesan Walas, Poin Sikap & Quick Actions */}
        <div className="space-y-6">
          {/* Pesan Wali Kelas (Budi Santoso, S.Kom.) */}
          <div className="school-card p-5 space-y-3 border-t-4 border-t-blue-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                BS
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Pesan dari Wali Kelas</h4>
                <p className="text-[11px] text-slate-500 font-medium">Budi Santoso, S.Kom., M.T. (Walas IX-A)</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium leading-relaxed">
              "Anak-anakku Kelas IX-A, hari ini kita ada sesi Sumatif Tengah Semester (STS) Informatika di Lab Komputer 1. Pastikan hadir 10 menit sebelum jam 08:00 WIB dan simpan barang di loker depan lab. Semangat dan junjung tinggi kejujuran!"
            </div>
          </div>

          {/* Kartu Status Poin Disiplin & Prestasi */}
          <div className="school-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Status Kedisiplinan</h4>
              <Link href="/siswa/poin" className="text-xs font-bold text-blue-900 hover:underline">
                Rincian
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-300">
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">Total Saldo Poin</p>
                <p className="text-xl font-extrabold text-emerald-700">+45 Poin</p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-black bg-emerald-700 text-white shadow-xs">
                Sangat Baik (SAB)
              </span>
            </div>

            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Ambang batas teguran sekolah adalah -25 poin. Terus pertahankan prestasi dan ketertiban belajarmu!
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="school-card p-5 space-y-2.5">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">Layanan Cepat Siswa</h4>

            <Link
              href="/siswa/nilai"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>Unduh E-Progress Report (PDF)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/siswa/konseling"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Janji Temu Bimbingan Guru BK</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/siswa/poin"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-800" />
                <span>Daftar Ekstrakurikuler Sekolah</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
