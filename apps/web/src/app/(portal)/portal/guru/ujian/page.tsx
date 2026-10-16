'use client';

import React from 'react';
import Link from 'next/link';
import { useTeacherExams } from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Monitor,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function TeacherExamsPage() {
  const { data: exams = [], isLoading } = useTeacherExams();

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
            <Monitor className="h-6 w-6 text-brand-blue" />
            <span>Asesmen Digital & Pengawas CBT</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jadwal ujian berbasis komputer untuk mapel yang diampu dan penugasan pengawas ruang lab.
          </p>
        </div>

        <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-blue-50 text-brand-blue border-blue-200">
          Laboratorium Komputer Terpadu
        </Badge>
      </div>

      {/* Exam List */}
      {isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat jadwal ujian CBT..." size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          title="Tidak Ada Jadwal Ujian Aktif"
          description="Saat ini belum ada sesi penilaian tengah semester atau ujian harian CBT yang dijadwalkan."
          icon={<Monitor className="h-8 w-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((ex) => (
            <Card
              key={ex.id}
              className="border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <Badge variant="outline" className="font-bold text-slate-700 bg-slate-50 text-[10px]">
                      {ex.subjectName}
                    </Badge>
                    {ex.isProctor ? (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px] gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>Anda Bertugas Pengawas</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                        Guru Pengampu
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {ex.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Sasaran: {ex.classNames.join(', ')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 text-xs space-y-2 border-t border-slate-100 mt-2">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-medium block">Waktu Sesi:</span>
                      <span className="font-bold text-slate-800">{ex.startTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Durasi & Soal:</span>
                      <span className="font-bold text-slate-800">
                        {ex.durationMinutes} Menit ({ex.totalQuestions} Soal)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Status: <strong className="text-brand-blue capitalize">{ex.status}</strong>
                </span>
                {ex.isProctor && (
                  <Badge className="bg-brand-blue text-white font-bold text-[11px] py-1 px-3">
                    Buka Ruang Pengawas di Lab
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
