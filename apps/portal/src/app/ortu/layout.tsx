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
  Users, 
  CheckCircle2, 
  ChevronDown,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { GuardianProvider, useGuardian } from '@/lib/guardian-context';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/role-guard';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
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
      badge: activeChild.gate_attendance_today.status === 'hadir' 
        ? 'Hadir' 
        : activeChild.gate_attendance_today.status === 'sakit' 
        ? 'Sakit' 
        : activeChild.gate_attendance_today.status === 'izin' 
        ? 'Izin' 
        : 'Terlambat',
      badgeColor: activeChild.gate_attendance_today.status === 'hadir' 
        ? 'bg-emerald-800 text-white' 
        : activeChild.gate_attendance_today.status === 'sakit' || activeChild.gate_attendance_today.status === 'izin' 
        ? 'bg-amber-600 text-white' 
        : 'bg-rose-700 text-white',
    },
    {
      name: 'Capaian Nilai & Rapor',
      href: '/ortu/nilai',
      icon: FileSpreadsheet,
      badge: 'STS Gasal',
      badgeColor: 'bg-blue-800 text-white',
    },
    {
      name: 'Poin & Tata Tertib',
      href: '/ortu/poin',
      icon: Award,
      badge: `${activeChild.points_balance > 0 ? '+' : ''}${activeChild.points_balance}`,
      badgeColor: activeChild.points_balance >= 0 ? 'bg-slate-800 text-white' : 'bg-rose-700 text-white',
    },
    {
      name: 'Biaya & SPP Sekolah',
      href: '/ortu/biaya',
      icon: Receipt,
      badge: activeChild.admin_fee_status === 'Menunggu Pembayaran' 
        ? 'Tagihan' 
        : activeChild.admin_fee_status === 'Lunas / Bebas Tanggungan' 
        ? 'Lunas' 
        : 'Verifikasi',
      badgeColor: activeChild.admin_fee_status === 'Lunas / Bebas Tanggungan' 
        ? 'bg-emerald-800 text-white' 
        : activeChild.admin_fee_status === 'Menunggu Verifikasi TU' 
        ? 'bg-blue-800 text-white' 
        : 'bg-amber-600 text-white',
    },
    {
      name: 'Konseling Walas & BK',
      href: '/ortu/konseling',
      icon: HeartHandshake,
      badge: 'Konsultasi',
      badgeColor: 'bg-teal-800 text-white',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight">LABSCHOOL UM</h1>
            <p className="text-xs text-slate-500 font-medium truncate">Portal Wali Murid</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Child Selector in Sidebar */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Siswa Dipantau
          </span>
          <span className="text-xs font-medium text-slate-500">
            {guardian.children.length} Anak
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {activeChild.avatar_url ? (
                <img
                  src={activeChild.avatar_url}
                  alt={activeChild.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {activeChild.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{activeChild.name}</p>
                <p className="text-xs text-slate-500 truncate font-normal">
                  {activeChild.class_name} • NIS: {activeChild.nis}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Dropdown Options */}
          {isChildDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40">
              {guardian.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => {
                    setActiveChildId(child.id);
                    setIsChildDropdownOpen(false);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                    child.id === activeChild.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700 font-normal'
                  }`}
                >
                  {child.avatar_url ? (
                    <img
                      src={child.avatar_url}
                      alt={child.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 ${
                      child.id === activeChild.id ? 'bg-emerald-800' : 'bg-slate-600'
                    }`}>
                      {child.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 truncate">{child.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{child.class_name} • NIS: {child.nis}</p>
                  </div>
                  {child.id === activeChild.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2.5 space-y-1 overflow-y-auto">
        <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama Ortu
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white font-semibold shadow-xs'
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
                    isActive ? 'bg-white text-emerald-950 font-bold shadow-2xs' : link.badgeColor
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
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors text-left group"
          >
            {guardian.avatar_url ? (
              <img
                src={guardian.avatar_url}
                alt={guardian.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {guardian.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-800">
                {guardian.name}
              </p>
              <p className="text-xs text-slate-500 truncate font-normal">
                Wali Murid • <span className="text-emerald-800 font-medium">Beralih Portal</span>
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
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg"
                >
                  <School className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Portal Siswa Web (/siswa)</span>
                </Link>
                <Link
                  href="/guru/dashboard"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg"
                >
                  <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Portal Guru & LMS (/guru)</span>
                </Link>
                <Link
                  href="/ortu/dashboard"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Portal Orang Tua (/ortu)</span>
                </Link>
              </div>
              <div className="pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Keluar Sesi Orang Tua</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuardianShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { guardian, activeChild } = useGuardian();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Auto-close mobile navigation when route changes
  React.useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close mobile navigation on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* ─── DESKTOP SIDEBAR (Width 288px / w-72) ─── */}
      <aside className="hidden lg:flex w-72 border-r border-slate-200/90 bg-white flex-col fixed inset-y-0 left-0 z-30 shadow-xs">
        <SidebarContent />
      </aside>

      {/* ─── MOBILE & TABLET NAVIGATION DRAWER ─── */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside 
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi mobile"
            className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
          >
            <SidebarContent onClose={() => setIsMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0 w-full">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/90 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-xs">
          {/* Left: Mobile Hamburger & Context Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger button for mobile and tablet */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={isMobileNavOpen}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
              <span className="hidden sm:inline font-medium text-slate-400 uppercase tracking-wider text-[11px] shrink-0">
                Portal Orang Tua
              </span>
              <span className="hidden sm:inline text-slate-300 font-light shrink-0">/</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {activeChild.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 font-mono border border-slate-200 shrink-0">
                {activeChild.class_name.replace('Kelas ', '')}
              </span>
            </div>
          </div>

          {/* Right: Academic Year Pill, Notifications, & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>T.A. 2026/2027 Gasal</span>
            </div>

            <button 
              aria-label="Notifikasi" 
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-600" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              {guardian.avatar_url ? (
                <img
                  src={guardian.avatar_url}
                  alt={guardian.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {guardian.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{guardian.name}</p>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">Wali Murid</p>
              </div>
            </div>
          </div>
        </header>

        {/* Fluid Responsive Page Body Container */}
        <main className="flex-1 w-full px-3.5 sm:px-6 xl:px-8 py-3.5 sm:py-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['guardian']} portalName="Portal Orang Tua">
      <GuardianProvider>
        <GuardianShell>{children}</GuardianShell>
      </GuardianProvider>
    </RoleGuard>
  );
}

