'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  CheckSquare, 
  LayoutDashboard, 
  LogOut, 
  GraduationCap, 
  Bell, 
  School,
  CalendarCheck,
  FileSpreadsheet,
  MonitorPlay,
  Calendar,
  UserCheck,
  Users
} from 'lucide-react';
import { CURRENT_TEACHER, MOCK_CLASSES, MOCK_SUBJECTS } from '@/lib/mock-lms-data';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedClassId, setSelectedClassId] = useState(MOCK_CLASSES[0].id);
  const [selectedSubjectId, setSelectedSubjectId] = useState(MOCK_SUBJECTS[0].id);

  const navLinks = [
    {
      name: 'Jurnal & Presensi',
      href: '/guru/jurnal',
      icon: CalendarCheck,
      badge: 'Hari Ini',
      badgeColor: 'bg-emerald-700 text-white',
    },
    {
      name: 'Jadwal Pelajaran',
      href: '/guru/jadwal',
      icon: Calendar,
    },
    {
      name: 'Tugas & Penilaian',
      href: '/guru/tugas',
      icon: CheckSquare,
      badge: '4 Aktif',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      name: 'Buku Nilai Ledger',
      href: '/guru/nilai',
      icon: FileSpreadsheet,
    },
    {
      name: 'Bank Soal & CBT',
      href: '/guru/cbt',
      icon: MonitorPlay,
    },
    {
      name: 'Modul Ajar',
      href: '/guru/materi',
      icon: BookOpen,
      badge: '3 Dokumen',
      badgeColor: 'bg-teal-800 text-white',
    },
    {
      name: 'Perizinan Siswa',
      href: '/guru/perizinan',
      icon: UserCheck,
      badge: '2 Menunggu',
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      name: 'Data Siswa & Poin',
      href: '/guru/siswa',
      icon: Users,
    },
    {
      name: 'Ringkasan KBM',
      href: '/guru/dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* ─── SIDEBAR (Width 70 / 280px to avoid any text wrapping) ─── */}
      <aside className="w-70 border-r border-slate-300 bg-white flex flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">LABSCHOOL UM</h1>
            <p className="text-[11px] text-slate-500 font-semibold truncate">Portal Pembelajaran Guru</p>
          </div>
        </div>

        {/* Profil Guru Chip */}
        <div className="mx-4 my-3 p-3 bg-slate-50 rounded-lg border border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
              BS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-900 truncate">{CURRENT_TEACHER.name}</p>
              <p className="text-[11px] text-slate-500 truncate font-mono font-medium">NIP: {CURRENT_TEACHER.nip.slice(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Menu Pembelajaran
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/guru' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{link.name}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                      isActive ? 'bg-blue-950 text-white' : link.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Meta */}
        <div className="p-4 border-t border-slate-200 space-y-2.5 bg-white">
          <div className="rounded-lg bg-teal-800 text-white p-3 flex items-center gap-2.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <div className="text-xs leading-tight min-w-0">
              <span className="font-extrabold block text-white truncate">T.A. 2026/2027 Ganjil</span>
              <span className="text-teal-200 text-[11px] font-medium">Kurikulum Merdeka</span>
            </div>
          </div>

          <a
            href="http://localhost:3000/masuk.html"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-700 hover:text-white rounded-lg hover:bg-rose-700 transition-colors border border-rose-300 hover:border-rose-700 w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi Guru</span>
          </a>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER (FULL FLUID WIDTH, NO ARTIFICIAL MAX-W SQUISHING) ─── */}
      <div className="flex-1 pl-70 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-300 sticky top-0 z-20 flex items-center justify-between px-8 shadow-xs">
          {/* Class & Subject Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs">
              <GraduationCap className="w-4 h-4 text-blue-900 shrink-0" />
              <select
                aria-label="Pilih Kelas"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                {MOCK_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.total_students} Siswa)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs">
              <BookOpen className="w-4 h-4 text-teal-800 shrink-0" />
              <select
                aria-label="Pilih Mata Pelajaran"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                {MOCK_SUBJECTS.map((sbj) => (
                  <option key={sbj.id} value={sbj.id}>
                    {sbj.name} ({sbj.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Status Solid Pill */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-700 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              Sistem Online
            </span>

            {/* Notification Bell */}
            <button
              aria-label="Lihat Notifikasi"
              className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600"></span>
            </button>

            {/* Avatar Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
              <div className="w-8 h-8 rounded-md bg-blue-900 text-white font-black flex items-center justify-center text-xs">
                BS
              </div>
              <span className="text-xs font-bold text-slate-900 hidden md:inline">
                Pak Budi
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport - Fluid Full Width with comfortable padding */}
        <main className="flex-1 px-8 py-6 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
