'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  Calendar, 
  CheckSquare, 
  FileSpreadsheet, 
  Award, 
  HeartHandshake, 
  School, 
  Bell, 
  LogOut,
  Wifi,
  Clock,
  ChevronDown,
  CheckCircle2,
  Users,
  CalendarCheck
} from 'lucide-react';
import { CURRENT_STUDENT } from '@/lib/mock-student-data';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Distraction-free full-screen kiosk mode for active CBT exam session
  const isExamTakingSession = pathname.startsWith('/siswa/cbt/') && pathname !== '/siswa/cbt';
  if (isExamTakingSession) {
    return <div className="min-h-screen bg-slate-100 font-sans text-slate-900">{children}</div>;
  }

  const navLinks = [
    {
      name: 'Ringkasan & Beranda',
      href: '/siswa/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Ujian CBT Web',
      href: '/siswa/cbt',
      icon: MonitorPlay,
      badge: '1 Aktif',
      badgeColor: 'bg-rose-700 text-white',
    },
    {
      name: 'Jadwal & Kalender',
      href: '/siswa/jadwal',
      icon: Calendar,
      badge: 'Hari Ini',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      name: 'Modul & Tugas LMS',
      href: '/siswa/tugas',
      icon: CheckSquare,
      badge: '2 Tugas',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      name: 'Capaian Nilai & Rapor',
      href: '/siswa/nilai',
      icon: FileSpreadsheet,
      badge: 'KKTP 75',
      badgeColor: 'bg-slate-800 text-white',
    },
    {
      name: 'Poin & Ekstrakurikuler',
      href: '/siswa/poin',
      icon: Award,
      badge: '+45 Poin',
      badgeColor: 'bg-emerald-800 text-white',
    },
    {
      name: 'Konseling & Bantuan',
      href: '/siswa/konseling',
      icon: HeartHandshake,
      badge: 'Privat',
      badgeColor: 'bg-teal-800 text-white',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* ─── SIDEBAR (Width 288px / w-72 matching Guru & Ortu) ─── */}
      <aside className="w-72 border-r border-slate-200/90 bg-white flex flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">LABSCHOOL UM</h1>
            <p className="text-xs text-slate-500 font-medium truncate">Portal Pembelajaran Siswa</p>
          </div>
        </div>

        {/* Profil Siswa Card with Real Avatar */}
        <div className="mx-4 my-3 p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
          <div className="flex items-center gap-2.5">
            {CURRENT_STUDENT.avatar_url ? (
              <img
                src={CURRENT_STUDENT.avatar_url}
                alt={CURRENT_STUDENT.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                AF
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{CURRENT_STUDENT.name}</p>
              <p className="text-xs text-slate-500 font-normal truncate">
                NIS: {CURRENT_STUDENT.nis} • {CURRENT_STUDENT.class_name}
              </p>
            </div>
          </div>
          
          {/* Status Tap Gerbang Hari Ini */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Presensi Gerbang:</span>
            <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] tracking-wide">
              Hadir ({CURRENT_STUDENT.gate_attendance_today.tap_time})
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Pembelajaran Siswa
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/siswa/dashboard' && link.href !== '/siswa' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{link.name}</span>
                </div>
                {link.badge && (
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      isActive ? 'bg-white text-blue-950 font-bold shadow-2xs' : link.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Meta & Role Switcher */}
        <div className="p-3 border-t border-slate-200 bg-white">
          {/* Unified Role Switcher Dropdown (Identical to Guru & Ortu) */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors text-left group cursor-pointer"
            >
              {CURRENT_STUDENT.avatar_url ? (
                <img
                  src={CURRENT_STUDENT.avatar_url}
                  alt={CURRENT_STUDENT.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  AF
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-900">
                  {CURRENT_STUDENT.name}
                </p>
                <p className="text-xs text-slate-500 truncate font-normal">
                  Siswa Kelas IX-A • <span className="text-blue-900 font-medium">Beralih Portal</span>
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 divide-y divide-slate-100">
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pilih Portal Sekolah</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/siswa/dashboard"
                    onClick={() => setIsRoleDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>Portal Siswa Web (/siswa)</span>
                  </Link>
                  <Link
                    href="/guru/dashboard"
                    onClick={() => setIsRoleDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg"
                  >
                    <School className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Portal Guru & LMS (/guru)</span>
                  </Link>
                  <Link
                    href="/ortu/dashboard"
                    onClick={() => setIsRoleDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg"
                  >
                    <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Portal Orang Tua (/ortu)</span>
                  </Link>
                </div>
                <div className="pt-1 px-1">
                  <a
                    href="http://localhost:3000/masuk.html"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Keluar Akun Siswa</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT (MATCHING GURU & ORTU EXACTLY) ─── */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top Navbar Bar (Identical structure to Ortu and Guru) */}
        <header className="h-16 border-b border-slate-200/90 bg-white flex items-center justify-between px-8 sticky top-0 z-20 shadow-xs">
          {/* Left: Clean Context Breadcrumb matching Ortu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
                Portal Siswa
              </span>
              <span className="text-slate-300 font-light">/</span>
              <span className="font-semibold text-slate-900 text-xs">
                {CURRENT_STUDENT.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 font-mono border border-slate-200">
                {CURRENT_STUDENT.class_name}
              </span>
            </div>
          </div>

          {/* Right: Academic Year Pill, Lab Status, Notifications, & User Avatar */}
          <div className="flex items-center gap-3">
            {/* Academic Year Pill (Identical to Ortu) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>T.A. 2026/2027 Gasal</span>
            </div>

            {/* Status Lab Online */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lab Komputer Online</span>
            </div>

            {/* Notification Bell */}
            <button
              aria-label="Notifikasi Siswa"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600"></span>
            </button>

            {/* Avatar & User Details */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              {CURRENT_STUDENT.avatar_url ? (
                <img
                  src={CURRENT_STUDENT.avatar_url}
                  alt={CURRENT_STUDENT.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  AF
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{CURRENT_STUDENT.name}</p>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">Siswa ({CURRENT_STUDENT.class_name})</p>
              </div>
            </div>
          </div>
        </header>

        {/* Fluid Page Body Container (Identical to Ortu) */}
        <main className="flex-1 w-full px-6 xl:px-8 py-4 xl:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
