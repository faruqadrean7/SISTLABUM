"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Award,
  MonitorPlay,
  HeartHandshake,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Layers,
  CheckCircle,
  Menu,
  X,
  Compass,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  permission?: string;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    group: "Ringkasan",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Master Data",
    items: [
      {
        title: "Tahun Ajaran",
        href: "/master/academic-years",
        icon: Calendar,
        permission: "master.academic_year.manage",
      },
      {
        title: "Data Siswa",
        href: "/master/students",
        icon: Users,
        permission: "master.student.read",
      },
      {
        title: "Guru & Staf",
        href: "/master/teachers",
        icon: GraduationCap,
        permission: "master.teacher.manage",
      },
      {
        title: "Kelas & Rombel",
        href: "/master/classes",
        icon: Layers,
        permission: "master.class.manage",
      },
    ],
  },
  {
    group: "PPDB (Penerimaan)",
    items: [
      {
        title: "Pendaftar & Verifikasi",
        href: "/ppdb/applicants",
        icon: FileText,
        badge: "Baru",
        permission: "ppdb.applicant.read",
      },
      {
        title: "Seleksi & Ranking",
        href: "/ppdb/selection",
        icon: Award,
        permission: "ppdb.wave.manage",
      },
    ],
  },
  {
    group: "Akademik & LMS",
    items: [
      {
        title: "Jadwal Pelajaran",
        href: "/akademik/jadwal",
        icon: Calendar,
        permission: "academic.schedule.manage",
      },
      {
        title: "Jurnal & Presensi",
        href: "/akademik/jurnal",
        icon: CheckCircle,
        permission: "academic.journal.write",
      },
      {
        title: "Modul & Tugas",
        href: "/akademik/materi",
        icon: BookOpen,
        permission: "academic.material.read",
      },
    ],
  },
  {
    group: "Penilaian & Rapor",
    items: [
      {
        title: "Buku Nilai Bulanan",
        href: "/nilai/buku-nilai",
        icon: FileText,
        permission: "grade.input.write",
      },
      {
        title: "E-Progress Report",
        href: "/nilai/progress-report",
        icon: Award,
        permission: "grade.progress_report.generate",
      },
      {
        title: "E-Rapor Semester",
        href: "/nilai/rapor",
        icon: GraduationCap,
        permission: "grade.report_card.generate",
      },
    ],
  },
  {
    group: "CBT (Ujian Digital)",
    items: [
      {
        title: "Bank Soal",
        href: "/cbt/bank-soal",
        icon: BookOpen,
        permission: "cbt.question.manage",
      },
      {
        title: "Jadwal & Ruang Ujian",
        href: "/cbt/ujian",
        icon: Calendar,
        permission: "cbt.exam.manage",
      },
      {
        title: "Live Monitor Ujian",
        href: "/cbt/monitor",
        icon: MonitorPlay,
        badge: "Realtime",
        permission: "cbt.monitor.read",
      },
    ],
  },
  {
    group: "Kesiswaan & BK",
    items: [
      {
        title: "Poin Siswa & Prestasi",
        href: "/kesiswaan/poin",
        icon: Award,
        permission: "student.point.read",
      },
      {
        title: "Bimbingan Konseling (BK)",
        href: "/bk/konseling",
        icon: HeartHandshake,
        badge: "Ketat",
        permission: "bk.case.read",
      },
    ],
  },
  {
    group: "Sarpras & Fasilitas",
    items: [
      {
        title: "Booking Fasilitas",
        href: "/sarpras/booking",
        icon: Compass,
        permission: "facility.booking.read",
      },
      {
        title: "Helpdesk & Tiket",
        href: "/sarpras/helpdesk",
        icon: Wrench,
        permission: "ticket.read",
      },
    ],
  },
  {
    group: "Sistem & Konfigurasi",
    items: [
      {
        title: "Manajemen Pengguna",
        href: "/pengaturan/users",
        icon: Users,
        permission: "auth.user.read",
      },
      {
        title: "Matriks Permission",
        href: "/pengaturan/roles",
        icon: Settings,
        permission: "auth.role.manage",
      },
      {
        title: "Log Audit Keamanan",
        href: "/pengaturan/audit-log",
        icon: FileText,
        permission: "audit.read",
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfbfd]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-[#0066FF] rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Menyiapkan Hak Akses Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Vercel-Style Clean White Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">SISTLABUM</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#0066FF] font-semibold border border-blue-200">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">Sekolah Satu Pintu</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {MENU_GROUPS.map((group, groupIdx) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {group.group}
                </p>
                <div className="space-y-0.5 mt-1">
                  {visibleItems.map((item, itemIdx) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? "bg-blue-50 text-[#0066FF] font-semibold border border-blue-100 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? "text-[#0066FF]"
                                : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                              isActive
                                ? "bg-blue-100 text-[#0066FF]"
                                : item.badge === "Realtime"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : item.badge === "Ketat"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-blue-50 text-[#0066FF] border border-blue-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.profile?.fullName || user?.username}
                </p>
                <p className="text-[10px] text-[#0066FF] font-medium truncate capitalize">
                  {user?.roles?.[0]?.replace("_", " ") || "User"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Vercel-Style Clean White Topbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 w-64 lg:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa, jadwal, ujian, tiket... (⌘K)"
                className="bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs w-full"
              />
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Active Academic Year Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-pulse" />
              <span>T.A 2026/2027 Ganjil</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0066FF]" />
            </button>

            {/* User Profile Popover Button */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center">
                  {user?.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {user?.username}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Online</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{user?.email}</p>
                    <p className="text-[10px] text-[#0066FF] font-semibold capitalize mt-0.5">
                      Roles: {user?.roles?.join(", ") || "-"}
                    </p>
                  </div>
                  <Link
                    href="/pengaturan/users"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pengaturan Akun</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors mt-1 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Sesi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fbfbfd]">
          {children}
        </main>
      </div>
    </div>
  );
}
