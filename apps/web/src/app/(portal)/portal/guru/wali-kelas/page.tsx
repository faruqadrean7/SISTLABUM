'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useTeacherHomeroomData } from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AccessDenied } from '@/components/shared/access-denied';
import {
  ShieldCheck,
  ArrowLeft,
  Users,
  CalendarCheck,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Lock,
  Send,
  Award,
} from 'lucide-react';

export default function TeacherHomeroomPage() {
  const { user } = useAuth();

  const isHomeroom = Boolean(
    user?.roles?.includes('homeroom') ||
    user?.roles?.includes('super_admin') ||
    user?.profile?.isHomeroom
  );

  const { data: homeroom, isLoading } = useTeacherHomeroomData(isHomeroom);
  const [isReportLocked, setIsReportLocked] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (homeroom) {
      setIsReportLocked(homeroom.isReportCardLocked);
    }
  }, [homeroom]);

  // Guard: Jika guru bukan wali kelas aktif
  if (!isHomeroom) {
    return (
      <AccessDenied
        title="Akses Khusus Wali Kelas Ditolak (403)"
        description="Menu ini khusus diperuntukkan bagi guru yang ditugaskan resmi sebagai Wali Kelas aktif. Silakan hubungi Wakil Kepala Sekolah Kurikulum jika terdapat kekeliruan penugasan."
      />
    );
  }

  const handleRequestApproval = () => {
    setIsSubmittingApproval(true);
    setTimeout(() => {
      setIsReportLocked(true);
      setIsSubmittingApproval(false);
      setFeedback('E-Rapor kelas binaan berhasil diajukan untuk verifikasi dan persetujuan Kepala Sekolah.');
      setTimeout(() => setFeedback(null), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/portal/guru"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-blue" />
            <span>Manajemen Wali Kelas ({homeroom?.className || '7-A Unggulan'})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring menyeluruh kehadiran, perkembangan adab, dan persetujuan e-rapor siswa kelas perwalian Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isReportLocked ? (
            <Badge className="bg-slate-100 text-slate-700 border-slate-300 gap-1.5 px-3 py-1 text-xs font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>E-Rapor Terkunci</span>
            </Badge>
          ) : (
            <Button
              onClick={handleRequestApproval}
              isLoading={isSubmittingApproval}
              size="sm"
              className="gap-2 font-bold bg-brand-blue hover:bg-blue-800"
            >
              <Send className="h-4 w-4" />
              <span>Ajukan Persetujuan E-Rapor</span>
            </Button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-status-success text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat data kelas binaan..." size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-medium">Siswa Perwalian</CardDescription>
                <CardTitle className="text-2xl font-black text-slate-900">
                  {homeroom?.totalStudents || 32} <span className="text-xs font-normal text-slate-500">anak</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-slate-500">
                Semester {homeroom?.semester} TA {homeroom?.academicYear}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-medium">Presensi Kelas Rata-Rata</CardDescription>
                <CardTitle className="text-2xl font-black text-status-success">
                  {homeroom?.attendanceRecap.averageRate || 97.4}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-slate-500">
                Sakit: {homeroom?.attendanceRecap.sickDays} • Izin: {homeroom?.attendanceRecap.leaveDays}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-medium">Catatan Karakter P5</CardDescription>
                <CardTitle className="text-2xl font-black text-brand-blue">
                  {homeroom?.characterRecapCount || 32} / 32
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-slate-500">
                100% siswa telah dinilai
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-medium">Status Buku Rapor</CardDescription>
                <CardTitle className="text-base font-black text-purple-700">
                  {isReportLocked ? 'Terkunci & Sah' : 'Draf Pengajuan'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-slate-500">
                {isReportLocked ? 'Menunggu penandatanganan' : 'Dapat diperbaiki'}
              </CardContent>
            </Card>
          </div>

          {/* Student Class Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Daftar Siswa Kelas Binaan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rekapitulasi nilai dan kehadiran siswa kelas binaan</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {homeroom?.students.length || 0} Siswa Terdaftar
              </Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {homeroom?.students.map((st) => (
                <div
                  key={st.id}
                  className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-black text-brand-blue shrink-0">
                      #{st.rank}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                      <p className="text-[11px] text-slate-400">NISN: {st.nisn} • NIS: {st.nis}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Rata-Rata Nilai</span>
                      <span className="text-sm font-black text-slate-900">{st.averageScore}</span>
                    </div>

                    <div className="text-right pl-3 border-l border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Kehadiran</span>
                      <span className="text-sm font-black text-status-success">{st.attendanceRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
