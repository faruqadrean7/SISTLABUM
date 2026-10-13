"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  GraduationCap,
  FileCheck2,
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  FileSpreadsheet,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Radio,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      {/* Vercel-Style Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Subtle Decorative Blue Gradient Top Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0066FF] via-sky-400 to-blue-600" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0066FF] text-xs font-semibold mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>Sistem Informasi Sekolah Terpadu (SISTLABUM)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat datang,{" "}
              <span className="text-[#0066FF] capitalize">
                {user?.profile?.fullName || user?.username}
              </span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Hari ini adalah <strong className="text-slate-800 font-semibold">{currentDate}</strong>. Periode aktif:{" "}
              <strong className="text-[#0066FF] font-semibold">Tahun Ajaran 2026/2027 Ganjil</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/akademik/jurnal"
              className="px-4 py-2.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Jurnal & Presensi Hari Ini</span>
            </Link>
            <Link
              href="/cbt/monitor"
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Live Monitor CBT</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid (4 Key Cards in Vercel Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Siswa Aktif */}
        <div className="vercel-card p-5">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Siswa Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1.240</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +4.2%
            </span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Presensi Hari Ini:</span>
            <span className="font-semibold text-emerald-600">98.5% Hadir</span>
          </div>
        </div>

        {/* Card 2: Guru & Pendidik */}
        <div className="vercel-card p-5">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendidik & Staf</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">86</span>
            <span className="text-xs text-slate-500 font-medium">Pengajar & TU</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sesi Mengajar Hari Ini:</span>
            <span className="font-semibold text-slate-700">42 Jadwal Kelas</span>
          </div>
        </div>

        {/* Card 3: Pendaftar PPDB */}
        <div className="vercel-card p-5">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendaftar PPDB</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">348</span>
            <span className="text-xs text-amber-600 font-semibold">Gelombang 1</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Menunggu Verifikasi:</span>
            <span className="font-semibold text-amber-600">28 Berkas Baru</span>
          </div>
        </div>

        {/* Card 4: CBT Realtime Monitor */}
        <div className="vercel-card p-5">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CBT Live Monitor</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">120</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-ping" /> Live
            </span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status Ujian:</span>
            <span className="font-semibold text-emerald-600">0 Pelanggaran Tab</span>
          </div>
        </div>
      </div>

      {/* Two-Column Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live CBT Monitoring & Quick Routines */}
        <div className="lg:col-span-2 space-y-6">
          {/* CBT Realtime Live Status Widget */}
          <div className="vercel-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Monitoring Ujian Aktif (CBT Real-Time)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesi Penilaian Tengah Semester (PTS) Mata Pelajaran Matematika & IPA
                  </p>
                </div>
              </div>
              <Link
                href="/cbt/monitor"
                className="text-xs text-[#0066FF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Buka Layar Penuh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Exam Rooms Visual Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Lab Komputer 1 (Kelas IX-A)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    40/40 Online
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Progres Pengisian:</span>
                    <span className="font-semibold text-slate-900">82%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#0066FF] rounded-full w-[82%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <span>Sisa: <strong className="text-slate-800">24 Menit</strong></span>
                  <span className="text-emerald-600 font-medium">Aman (0 Anomali)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Lab Komputer 2 (Kelas IX-B)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] font-semibold border border-blue-200">
                    38/40 Online
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Progres Pengisian:</span>
                    <span className="font-semibold text-slate-900">65%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#0066FF] rounded-full w-[65%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <span>Sisa: <strong className="text-slate-800">38 Menit</strong></span>
                  <span className="text-amber-600 font-medium">1 Perlu Reset Login</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Routines (≤ 3 Clicks Operation Bar) */}
          <div className="vercel-card p-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
              Aksi Rutin Harian (≤ 3 Klik Selesai)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/akademik/jurnal"
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-all border border-blue-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Isi Jurnal & Presensi Sesi</h4>
                  <p className="text-[11px] text-slate-500 truncate">Input materi dan absensi 1 layar cepat</p>
                </div>
              </Link>

              <Link
                href="/nilai/buku-nilai"
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-emerald-100">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Buku Nilai Spreadsheet</h4>
                  <p className="text-[11px] text-slate-500 truncate">Input nilai massal navigasi keyboard</p>
                </div>
              </Link>

              <Link
                href="/ppdb/applicants"
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all border border-amber-100">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Verifikasi Berkas PPDB</h4>
                  <p className="text-[11px] text-slate-500 truncate">Layar split preview berkas & validasi</p>
                </div>
              </Link>

              <Link
                href="/sarpras/helpdesk"
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all flex items-center gap-3.5 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all border border-rose-100">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Helpdesk Sarpras Kanban</h4>
                  <p className="text-[11px] text-slate-500 truncate">Lapor fasilitas rusak & status tiket</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals & Security Audit Log */}
        <div className="space-y-6">
          {/* Pending Approvals Card */}
          <div className="vercel-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Antrean Persetujuan</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                2 Tertunda
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">E-Progress Report Kelas VII-A</span>
                  <span className="text-[10px] text-slate-400">10m lalu</span>
                </div>
                <p className="text-xs text-slate-500">Diajukan oleh Walas Bpk. Budi Santoso, S.Pd</p>
                <div className="flex items-center gap-2 pt-1">
                  <button className="px-2.5 py-1 rounded-md bg-[#0066FF] hover:bg-[#0052cc] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs">
                    ACC Laporan
                  </button>
                  <button className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer">
                    Pratinjau PDF
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Surat Izin Siswa (Sakit 2 Hari)</span>
                  <span className="text-[10px] text-slate-400">35m lalu</span>
                </div>
                <p className="text-xs text-slate-500">Ahmad Fauzi (Kelas VIII-B) • Bukti foto surat dokter terlampir</p>
                <div className="flex items-center gap-2 pt-1">
                  <button className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs">
                    Setujui Izin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Audit Trail Feed */}
          <div className="vercel-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0066FF]" />
                <span>Log Audit Terakhir</span>
              </h3>
              <Link href="/pengaturan/audit-log" className="text-xs text-[#0066FF] hover:underline font-semibold">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-semibold">Autentikasi Berhasil</p>
                  <p className="text-[11px] text-slate-500">User <code>superadmin</code> masuk melalui Web Portal</p>
                  <span className="text-[10px] text-slate-400">Baru saja</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-2 h-2 rounded-full bg-[#0066FF] mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-semibold">Migrasi Database 14 Modul</p>
                  <p className="text-[11px] text-slate-500">35 skema tabel berhasil disinkronkan ke PostgreSQL</p>
                  <span className="text-[10px] text-slate-400">30 menit lalu</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-slate-800 font-semibold">Seeder Role & Permission</p>
                  <p className="text-[11px] text-slate-500">Matriks hak akses RBAC berhasil diaktifkan</p>
                  <span className="text-[10px] text-slate-400">35 menit lalu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
