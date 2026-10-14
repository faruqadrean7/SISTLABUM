'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Award, 
  Receipt, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  School,
  Bell, 
  Download, 
  Phone, 
  HeartHandshake, 
  BookOpen, 
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useGuardian } from '@/lib/guardian-context';
import { MOCK_GUARDIAN_ANNOUNCEMENTS } from '@/lib/mock-guardian-data';
import { MOCK_STUDENT_SCHEDULES } from '@/lib/mock-student-data';

export default function GuardianDashboardPage() {
  const { guardian, activeChild, setActiveChildId, activeGrades } = useGuardian();

  // Filter today's schedule for active child (Senin / Rabu schedules)
  const todaySchedules = MOCK_STUDENT_SCHEDULES.filter(s => s.day === 'Senin' || s.is_active_today).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ─── HERO GREETING & MULTI-CHILD CARDS BANNER ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-800 text-white text-xs font-bold mb-2">
              <School className="w-3.5 h-3.5 text-white" />
              <span>Portal Terpadu Orang Tua & Wali Murid</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {guardian.name}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Pantau kehadiran presensi gerbang, perkembangan kurikulum merdeka, dan prestasi ananda secara transparan.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/ortu/presensi"
              className="px-3.5 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-white" />
              <span>Ajukan Surat Izin</span>
            </Link>
            <Link
              href="/ortu/nilai"
              className="px-3.5 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Unduh E-Rapor</span>
            </Link>
            <Link
              href="/ortu/konseling"
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors shadow-xs flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-white" />
              <span>Janji Temu Walas</span>
            </Link>
          </div>
        </div>

        {/* Multi-Child Selector Ribbon Cards */}
        <div className="pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pilih Profil Siswa Untuk Memantau:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guardian.children.map((child) => {
              const isSelected = child.id === activeChild.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveChildId(child.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-lg font-black text-sm flex items-center justify-center text-white shrink-0 ${
                      isSelected ? 'bg-emerald-800 ring-2 ring-emerald-500' : 'bg-slate-700'
                    }`}>
                      {child.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-slate-900 truncate">
                          {child.name}
                        </h2>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {child.class_name} • NIS: <span className="font-mono font-bold">{child.nis}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Wali Kelas: <span className="font-bold text-slate-700">{child.homeroom_teacher}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-800 text-white shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      {child.gate_attendance_today.status === 'hadir' ? 'Hadir di Sekolah' : 'Izin'}
                    </span>
                    <p className="text-[10px] text-slate-600 font-mono mt-1 font-bold">
                      Tap: {child.gate_attendance_today.tap_time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── REALTIME GATE & ATTENDANCE BANNER ─── */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-800 border border-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] uppercase font-black tracking-wider">
                Presensi RFID Gerbang Hari Ini
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                Rabu, 14 Oktober 2026
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {activeChild.name} tercatat <span className="text-emerald-300 font-black">HADIR</span> pada pukul {activeChild.gate_attendance_today.tap_time}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Lokasi: {activeChild.gate_attendance_today.location} • Catatan: {activeChild.gate_attendance_today.note}
            </p>
          </div>
        </div>

        <Link
          href="/ortu/presensi"
          className="px-4 py-2 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-extrabold transition-colors shrink-0 flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Buka Kalender Presensi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── 4 KPI SUMMARY CARDS (SOLID BADGES, ZERO SLOP) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kehadiran */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tingkat Kehadiran
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {activeChild.attendance_recap.rate}%
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Sangat Baik
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {activeChild.attendance_recap.hadir} Hadir • {activeChild.attendance_recap.sakit} Sakit • {activeChild.attendance_recap.izin} Izin
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Link 
              href="/ortu/presensi"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Riwayat & Surat Izin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Rerata Nilai */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rerata Akademik
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-900">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {activeChild.grade_average}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-900 text-white">
                KKTP: 75
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Seluruh kompetensi tuntas di atas ambang minimal
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Link 
              href="/ortu/nilai"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <span>Lihat Rincian Rapor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Poin Karakter */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Buku Poin Karakter
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                +{activeChild.points_balance}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-800 text-white">
                Status Aman
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              +{activeChild.points_prestasi} Prestasi • -{activeChild.points_pelanggaran} Disiplin
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Link 
              href="/ortu/poin"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Riwayat Buku Poin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Administrasi TU */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Administrasi Sekolah
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold text-slate-900">
                Bebas Tanggungan
              </span>
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-black bg-emerald-800 text-white">
              SPP Okt 2026 Lunas
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Catatan resmi Bagian Tata Usaha
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <Link 
              href="/ortu/biaya"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Rincian Kwitansi TU</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── TWO COLUMN MAIN SECTION: SCHEDULE & ANNOUNCEMENTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Class Timetable for Selected Child */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Jadwal Pembelajaran Hari Ini ({activeChild.name.split(' ')[0]} - {activeChild.class_name})
                </h3>
                <p className="text-xs text-slate-500">
                  Mata pelajaran aktif yang diikuti ananda pada hari ini
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700">
              3 Mata Pelajaran
            </span>
          </div>

          <div className="space-y-3">
            {todaySchedules.map((item, idx) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {item.subject_name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Guru: <span className="font-semibold text-slate-800">{item.teacher_name}</span> • Ruang: <span className="font-semibold text-slate-800">{item.room_name}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-mono text-[11px] font-bold">
                    {item.time_range}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">
                    {item.period}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice to Contact Homeroom Teacher */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-blue-900 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-950">
                  Wali Kelas: {activeChild.homeroom_teacher}
                </p>
                <p className="text-[11px] text-blue-800">
                  Hubungi nomor resmi atau jadwalkan janji temu konsultasi pendampingan belajar ananda.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${activeChild.homeroom_phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shrink-0 transition-colors"
            >
              WhatsApp Walas
            </a>
          </div>
        </div>

        {/* Right: Announcements & School Agenda for Guardians */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-800" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Agenda & Pengumuman Sekolah
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              Terbaru
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_GUARDIAN_ANNOUNCEMENTS.map((ann) => (
              <div 
                key={ann.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ann.badge_color}`}>
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {ann.date_str}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                  {ann.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-3">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-center">
            <p className="text-[11px] text-slate-600 font-medium">
              Informasi resmi diterbitkan oleh Humas & Tata Usaha Labschool UM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
