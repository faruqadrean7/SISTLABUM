'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  FileSpreadsheet, 
  Award, 
  Receipt, 
  HeartHandshake, 
  School, 
  Bell, 
  ArrowLeftRight, 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { GuardianProvider, useGuardian } from '@/lib/guardian-context';

function GuardianShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { guardian, activeChild, setActiveChildId } = useGuardian();
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const navLinks = [
    {
      name: 'Ringkasan & Beranda',
      href: '/ortu/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Presensi & Izin Anak',
      href: '/ortu/presensi',
      icon: CalendarCheck,
      badge: 'Surat Izin',
      badgeColor: 'bg-emerald-700 text-white',
    },
    {
      name: 'Capaian Nilai & Rapor',
      href: '/ortu/nilai',
      icon: FileSpreadsheet,
      badge: 'STS Gasal',
      badgeColor: 'bg-blue-900 text-white',
    },
    {
      name: 'Poin Karakter & Disiplin',
      href: '/ortu/poin',
      icon: Award,
      badge: `${activeChild.points_balance > 0 ? '+' : ''}${activeChild.points_balance} Poin`,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      name: 'Administrasi & Biaya TU',
      href: '/ortu/biaya',
      icon: Receipt,
      badge: 'Bebas Tanggungan',
      badgeColor: 'bg-emerald-800 text-white',
    },
    {
      name: 'Konseling & Pertemuan',
      href: '/ortu/konseling',
      icon: HeartHandshake,
      badge: 'Walas & BK',
      badgeColor: 'bg-teal-800 text-white',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* ─── SIDEBAR (Width 280px / w-70) ─── */}
      <aside className="w-70 border-r border-slate-300 bg-white flex flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">LABSCHOOL UM</h1>
            <p className="text-[11px] text-emerald-800 font-bold truncate">Portal Orang Tua / Wali Murid</p>
          </div>
        </div>

        {/* Multi-Anak Active Switcher Card in Sidebar */}
        <div className="mx-4 my-3 p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Anak Yang Dipantau
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-900 text-white">
              {guardian.children.length} Anak
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-md bg-white border border-slate-300 hover:border-emerald-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {activeChild.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{activeChild.name}</p>
                  <p className="text-[10px] text-slate-600 font-mono font-medium truncate">
                    {activeChild.class_name} • NIS: {activeChild.nis}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
            </button>

            {/* Dropdown Options */}
            {isChildDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg py-1 z-40">
                {guardian.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setActiveChildId(child.id);
                      setIsChildDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                      child.id === activeChild.id ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 ${
                      child.id === activeChild.id ? 'bg-emerald-800' : 'bg-slate-600'
                    }`}>
                      {child.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{child.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{child.class_name} • NIS: {child.nis}</p>
                    </div>
                    {child.id === activeChild.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200">
            <span className="font-semibold truncate">Walas: {activeChild.homeroom_teacher.split(',')[0]}</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {activeChild.gate_attendance_today.status === 'hadir' ? 'Hadir' : 'Izin'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Menu Utama Ortu
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">{link.name}</span>
                </div>
                {link.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                      isActive ? 'bg-white text-emerald-900' : link.badgeColor
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher & User Profile Bottom Section */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-2">
          {/* Wali Murid Identity */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
              BM
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{guardian.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-semibold">Wali Murid Terverifikasi</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-900" />
                <span>Beralih Portal / Role</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-300 rounded shadow-lg py-1 z-50">
                <Link
                  href="/siswa/dashboard"
                  onClick={() => setIsRoleDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                  Portal Siswa Web (/siswa)
                </Link>
                <Link
                  href="/guru/dashboard"
                  onClick={() => setIsRoleDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                  Portal Guru & LMS (/guru)
                </Link>
                <Link
                  href="/ortu/dashboard"
                  onClick={() => setIsRoleDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-800"></span>
                  Portal Orang Tua (/ortu)
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 ml-70 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-300 bg-white flex items-center justify-between px-8 sticky top-0 z-20 shadow-xs">
          {/* Left: Active Child Fast Switcher Bar (ORT-DASH-01) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 hidden md:inline">
              Memantau Siswa:
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-300">
              {guardian.children.map((child) => {
                const isSelected = child.id === activeChild.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-400'}`}></span>
                    <span>{child.name.split(' ')[0]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-emerald-950 text-white' : 'bg-slate-300 text-slate-700'}`}>
                      {child.class_name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Attendance Tag Today */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-700 text-white text-xs font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>Gerbang: {activeChild.gate_attendance_today.tap_time}</span>
              <span className="px-1 py-0.2 bg-emerald-900 text-white rounded text-[10px] uppercase font-black">
                {activeChild.gate_attendance_today.status}
              </span>
            </div>
          </div>

          {/* Right: Academic Year Pill & Notifications */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>T.A. 2026/2027 Gasal</span>
            </div>

            <button 
              aria-label="Notifikasi" 
              className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600 border border-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-700 ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                BM
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">H. Ir. Bambang</p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight">Orang Tua / Wali</p>
              </div>
            </div>
          </div>
        </header>

        {/* Fluid Page Body Container */}
        <main className="flex-1 w-full px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardianProvider>
      <GuardianShell>{children}</GuardianShell>
    </GuardianProvider>
  );
}
