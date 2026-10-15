'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useTeacherClasses,
  useAttendanceStudents,
  guruApi,
  TeacherAttendanceStudent,
} from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import {
  CheckSquare,
  ArrowLeft,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeacherAttendanceSessionPage() {
  const { data: classes = [], isLoading: isLoadingClasses } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState<string>('');

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const { data: initialStudents = [], isLoading: isLoadingStudents } = useAttendanceStudents(selectedClassId);
  const [students, setStudents] = useState<TeacherAttendanceStudent[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudents.length > 0) {
      setStudents(initialStudents);
    }
  }, [initialStudents]);

  const handleStatusChange = (studentId: string, status: 'present' | 'sick' | 'permission' | 'unexcused') => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, notes } : s))
    );
  };

  const handleSetAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setIsSaving(true);
    setSuccessMessage(null);
    try {
      const res = await guruApi.recordAttendanceSession({
        classId: selectedClassId,
        subjectId: 'sub-mat',
        sessionDate,
        sessionTopic,
        attendees: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          notes: s.notes,
        })),
      });
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      // Fallback
    } finally {
      setIsSaving(false);
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const presentCount = students.filter((s) => s.status === 'present').length;
  const sickCount = students.filter((s) => s.status === 'sick').length;
  const permissionCount = students.filter((s) => s.status === 'permission').length;
  const unexcusedCount = students.filter((s) => s.status === 'unexcused').length;

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
            <CheckSquare className="h-6 w-6 text-brand-blue" />
            <span>Presensi Siswa per Sesi KBM</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input kehadiran tatap muka kelas binaan secara realtime melalui perangkat Anda.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-emerald-50 text-status-success border-emerald-200 text-xs px-2.5 py-1">
            Hadir: {presentCount}
          </Badge>
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs px-2.5 py-1">
            Sakit: {sickCount}
          </Badge>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
            Izin: {permissionCount}
          </Badge>
          {unexcusedCount > 0 && (
            <Badge className="bg-red-50 text-status-danger border-red-200 text-xs px-2.5 py-1">
              Alpa: {unexcusedCount}
            </Badge>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-status-success text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Class Selector & Controls */}
      <Card className="border-slate-200">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Kelas KBM
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount} Siswa)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Sesi KBM
              </label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Topik / Materi (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Contoh: Operasi Bentuk Aljabar"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Kelas aktif: <strong className="text-slate-800">{activeClass?.name}</strong> • Mapel: <strong className="text-slate-800">Matematika</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetAllPresent}
              className="gap-1.5 text-xs text-brand-blue border-blue-200 hover:bg-blue-50"
            >
              <Check className="h-4 w-4" />
              <span>Set Semua Hadir</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Attendance Roster */}
      {isLoadingClasses || isLoadingStudents ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat daftar siswa..." size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="Tidak Ada Siswa di Kelas Ini"
          description="Rombongan belajar kelas ini belum memiliki siswa yang terdaftar aktif."
          icon={<Users className="h-8 w-8 text-slate-400" />}
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {students.map((student, idx) => (
              <div
                key={student.studentId}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{student.studentName}</h4>
                    <p className="text-[11px] text-slate-400">NISN: {student.nisn} {student.nis && `• NIS: ${student.nis}`}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Status Pills */}
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    {(
                      [
                        { id: 'present', label: 'Hadir', activeClass: 'bg-emerald-600 text-white' },
                        { id: 'sick', label: 'Sakit', activeClass: 'bg-amber-500 text-white' },
                        { id: 'permission', label: 'Izin', activeClass: 'bg-blue-600 text-white' },
                        { id: 'unexcused', label: 'Alpa', activeClass: 'bg-red-600 text-white' },
                      ] as const
                    ).map((statusOption) => (
                      <button
                        key={statusOption.id}
                        type="button"
                        onClick={() => handleStatusChange(student.studentId, statusOption.id)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                          student.status === statusOption.id
                            ? statusOption.activeClass
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )}
                      >
                        {statusOption.label}
                      </button>
                    ))}
                  </div>

                  {/* Notes Input */}
                  <Input
                    type="text"
                    placeholder="Catatan (opsional)..."
                    value={student.notes || ''}
                    onChange={(e) => handleNotesChange(student.studentId, e.target.value)}
                    className="h-8 text-xs max-w-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="md" isLoading={isSaving} className="gap-2 font-bold px-6">
              <Save className="h-4 w-4" />
              <span>Simpan Presensi KBM</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
