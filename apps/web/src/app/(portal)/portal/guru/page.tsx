'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import {
  useTeacherSchedules,
  useTeacherAssignments,
  useTeacherSelfAttendance,
} from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckSquare,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Bell,
  Award,
  Layers,
  DollarSign,
  UserCheck,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data: schedules = [], isLoading: isLoadingSchedules } = useTeacherSchedules();
  const { data: assignments = [], isLoading: isLoadingAssignments } = useTeacherAssignments();
  const { data: selfAttendance } = useTeacherSelfAttendance();

  const teacherName =
    user?.profile?.name ||
    user?.profile?.fullName ||
    user?.username ||
    'Bapak/Ibu Guru';

  const todayDayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const todaySchedules = schedules.filter((s) => s.dayOfWeek === (todayDayOfWeek || 1));
  const unrecordedSchedules = todaySchedules.filter((s) => !s.isAttendanceRecorded);
  const pendingAssignments = assignments.filter((a) => a.submittedCount > a.gradedCount);

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-brand-blue rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal KBM Guru • Semester Gasal 2024/2025</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Selamat Pagi, {teacherName} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Siap menginspirasi siswa hari ini? Berikut ringkasan agenda mengajar dan tugas KBM Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Presensi Kerja</span>
            <span className="text-xs font-bold text-status-success flex items-center justify-end gap-1">
              <span className="h-2 w-2 rounded-full bg-status-success" />
              {selfAttendance?.checkInTime ? `Masuk: ${selfAttendance.checkInTime}` : 'Belum Absen'}
            </span>
          </div>
          <Link href="/portal/guru/presensi-saya">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Presensi Mandiri</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Unrecorded Attendance Alert Banner */}
      {unrecordedSchedules.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Ada {unrecordedSchedules.length} Sesi KBM Hari Ini yang Belum Diabsen
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Segera catat kehadiran siswa per sesi agar rekapitulasi presensi sekolah tetap akurat.
              </p>
            </div>
          </div>
          <Link href="/portal/guru/presensi">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shrink-0">
              <CheckSquare className="h-4 w-4" />
              <span>Input Presensi Sekarang</span>
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4">
            <CardDescription className="text-xs font-medium">Jadwal Mengajar Hari Ini</CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900">
              {todaySchedules.length} <span className="text-xs font-normal text-slate-500">sesi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-slate-500">
            {unrecordedSchedules.length} belum diabsen
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4">
            <CardDescription className="text-xs font-medium">Tugas Perlu Dinilai</CardDescription>
            <CardTitle className="text-2xl font-black text-brand-blue">
              {pendingAssignments.length} <span className="text-xs font-normal text-slate-500">tugas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-slate-500">
            Dari kelas 7-A & 7-B
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4">
            <CardDescription className="text-xs font-medium">Jam Mengajar Bulan Ini</CardDescription>
            <CardTitle className="text-2xl font-black text-status-success">
              {selfAttendance?.workHoursThisMonth || 128} <span className="text-xs font-normal text-slate-500">/ 160 jam</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-slate-500">
            Target 24 jam tatap muka/minggu
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4">
            <CardDescription className="text-xs font-medium">Slip Gaji Terakhir</CardDescription>
            <CardTitle className="text-base font-black text-purple-700">
              Oktober 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sudah Cair</span>
            <Link href="/portal/guru/slip-gaji" className="text-brand-blue font-bold hover:underline">
              Unduh PDF
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Schedule Today & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Schedule Today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <span>Jadwal Mengajar Hari Ini</span>
            </h2>
            <Link href="/portal/guru/jadwal" className="text-xs text-brand-blue font-bold hover:underline">
              Lihat Seluruh Minggu ➔
            </Link>
          </div>

          {isLoadingSchedules ? (
            <div className="min-h-[200px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
              <LoadingSpinner label="Memuat jadwal hari ini..." size="md" />
            </div>
          ) : todaySchedules.length === 0 ? (
            <Card className="border-slate-200 py-8 text-center">
              <CardContent>
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Tidak ada jadwal tatap muka hari ini.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Manfaatkan waktu untuk memeriksa tugas atau menyiapkan modul ajar.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-brand-blue transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue font-black text-xs shrink-0 mt-0.5">
                      {item.startTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{item.subjectName}</h4>
                        <Badge className="bg-blue-50 text-brand-blue border-blue-200 text-[10px]">
                          {item.className}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.roomName} • {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.isAttendanceRecorded ? (
                      <Badge className="bg-emerald-50 text-status-success border-emerald-200 gap-1 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Sudah Diabsen</span>
                      </Badge>
                    ) : (
                      <Link href="/portal/guru/presensi">
                        <Button size="sm" className="gap-1 font-bold">
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Absen Kelas</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Action Menu & Notices */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-blue" />
            <span>Menu Cepat Guru</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/portal/guru/jurnal"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col items-center text-center group"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors mb-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Tulis Jurnal</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Catatan KBM harian</span>
            </Link>

            <Link
              href="/portal/guru/nilai"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col items-center text-center group"
            >
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Buku Nilai</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Input nilai massal</span>
            </Link>

            <Link
              href="/portal/guru/materi"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col items-center text-center group"
            >
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Upload Modul</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Bahan ajar siswa</span>
            </Link>

            <Link
              href="/portal/guru/tugas"
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col items-center text-center group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 text-status-success group-hover:bg-status-success group-hover:text-white transition-colors mb-2">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Nilai Tugas</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Koreksi lembar kerja</span>
            </Link>
          </div>

          {/* Announcements Card */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-blue" />
                <CardTitle className="text-sm font-bold">Pengumuman Sekolah</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] text-slate-400 font-bold">14 Oktober 2026</span>
                <p className="font-bold text-slate-800 mt-0.5">Batas Penguncian Nilai PTS</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Bapak/Ibu guru diharapkan menyelesaikan input nilai PTS sebelum Jumat, 17 Oktober 2026.
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold">12 Oktober 2026</span>
                <p className="font-bold text-slate-800 mt-0.5">Rapat Koordinasi P5</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Rapat persiapan gelar karya P5 akan diadakan di Aula Lantai 2 pukul 13.00 WIB.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
