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
  ArrowLeftRight,
  LogOut,
  Wifi,
  Clock
} from 'lucide-react';
import { CURRENT_STUDENT } from '@/lib/mock-student-data';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    {
      name: 'Ringkasan Siswa',
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
      badgeColor: 'bg-emerald-700 text-white',
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
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* ─── SIDEBAR (Width 280px / w-70 to avoid text wrapping) ─── */}
      <aside className="w-70 border-r border-slate-300 bg-white flex flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">LABSCHOOL UM</h1>
            <p className="text-[11px] text-blue-900 font-bold truncate">Portal Pembelajaran Siswa</p>
          </div>
        </div>

        {/* Profil Siswa Card */}
        <div className="mx-4 my-3 p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
              AF
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{CURRENT_STUDENT.name}</p>
              <p className="text-[11px] text-slate-600 font-mono font-bold truncate">
                NIS: {CURRENT_STUDENT.nis} • {CURRENT_STUDENT.class_name}
              </p>
            </div>
          </div>
          
          {/* Status Tap Gerbang Hari Ini */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Presensi Gerbang:</span>
            <span className="px-2 py-0.5 rounded font-black bg-emerald-700 text-white text-[10px] tracking-wide shadow-xs">
              Hadir ({CURRENT_STUDENT.gate_attendance_today.tap_time})
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Menu Pembelajaran Siswa
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/siswa' && pathname.startsWith(link.href));
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

        {/* Bottom Sidebar Meta & Role Switcher */}
        <div className="p-4 border-t border-slate-200 space-y-2.5 bg-white">
          <div className="rounded-lg bg-teal-800 text-white p-3 flex items-center gap-2.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <div className="text-xs leading-tight min-w-0">
              <span className="font-extrabold block text-white truncate">T.A. 2026/2027 Ganjil</span>
              <span className="text-teal-200 text-[11px] font-medium">Kurikulum Merdeka</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/guru/dashboard"
              className="flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-bold text-blue-900 hover:text-white rounded-lg hover:bg-blue-900 transition-colors border border-blue-900 w-full shadow-xs text-center"
            >
              <ArrowLeftRight className="w-3 h-3 shrink-0" />
              <span>Portal Guru</span>
            </Link>
            <Link
              href="/ortu/dashboard"
              className="flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-bold text-emerald-800 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors border border-emerald-800 w-full shadow-xs text-center"
            >
              <ArrowLeftRight className="w-3 h-3 shrink-0" />
              <span>Portal Ortu</span>
            </Link>
          </div>

          <a
            href="http://localhost:3000/masuk.html"
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:text-white rounded-lg hover:bg-rose-700 transition-colors border border-rose-300 hover:border-rose-700 w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun Siswa</span>
          </a>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT (FLUID FULL WIDTH, NO ARTIFICIAL MAX-W SQUISHING) ─── */}
      <div className="flex-1 pl-70 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-300 sticky top-0 z-20 flex items-center justify-between px-8 shadow-xs">
          {/* Breadcrumb / Title Info */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-blue-900 text-white shadow-xs">
              Siswa SMP Labschool UM
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Rabu, 14 Oktober 2026
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Status Jaringan Lab Komputer */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-700 text-white shadow-xs">
              <Wifi className="w-3.5 h-3.5 text-emerald-200" />
              Koneksi Lab Online
            </span>

            {/* Notification Bell */}
            <button
              aria-label="Lihat Notifikasi Siswa"
              className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600"></span>
            </button>

            {/* Quick Link ke Ujian CBT */}
            <Link
              href="/siswa/cbt"
              className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs hidden md:inline-flex items-center gap-1.5"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-white" />
              <span>Ruang Ujian CBT</span>
            </Link>

            {/* Avatar Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
              <div className="w-8 h-8 rounded-md bg-blue-900 text-white font-black flex items-center justify-center text-xs">
                AF
              </div>
              <span className="text-xs font-bold text-slate-900 hidden lg:inline">
                Fauzan (9A)
              </span>
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main className="flex-1 px-8 py-6 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
