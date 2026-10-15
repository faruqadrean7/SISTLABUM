'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useTeacherClasses,
  useTeacherGradeComponents,
  useTeacherStudentGrades,
  guruApi,
  TeacherStudentGrade,
} from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import {
  FileText,
  ArrowLeft,
  Save,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function TeacherGradesPage() {
  const { data: classes = [] } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const { data: components = [], isLoading: isLoadingComponents } = useTeacherGradeComponents(selectedClassId, 'sub-mat');
  const { data: initialGrades = [], isLoading: isLoadingGrades } = useTeacherStudentGrades(selectedClassId, 'sub-mat');

  const [grades, setGrades] = useState<TeacherStudentGrade[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialGrades.length > 0) {
      setGrades(initialGrades);
    }
  }, [initialGrades]);

  const handleScoreChange = (studentId: string, componentId: string, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setGrades((prev) =>
      prev.map((g) => {
        if (g.studentId !== studentId) return g;
        const newScores = { ...g.scores, [componentId]: num };

        // Kalkulasi ulang nilai akhir berdasarkan bobot komponen
        let totalWeight = 0;
        let weightedSum = 0;
        components.forEach((c) => {
          const s = newScores[c.id] ?? 0;
          weightedSum += s * (c.weight / 100);
          totalWeight += c.weight;
        });
        const finalScore = Number(weightedSum.toFixed(1));
        const letterGrade =
          finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
        const isPassed = finalScore >= 75;

        return { ...g, scores: newScores, finalScore, letterGrade, isPassed };
      })
    );
  };

  const handleSaveBulk = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      const res = await guruApi.updateBulkGrades(selectedClassId, 'sub-mat', grades);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      // Fallback
    } finally {
      setIsSaving(false);
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

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
            <FileText className="h-6 w-6 text-brand-blue" />
            <span>Buku Nilai Mata Pelajaran</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan komponen asesmen formatif, sumatif, dan input nilai massal siswa.
          </p>
        </div>

        <Button onClick={handleSaveBulk} isLoading={isSaving} size="sm" className="gap-2 font-bold px-5">
          <Save className="h-4 w-4" />
          <span>Simpan Perubahan Nilai</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-status-success text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Class Selector & Components Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-bold">Pilih Kelas</CardDescription>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue mt-1"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} Siswa)
                </option>
              ))}
            </select>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold">Komponen Penilaian & Bobot Nilai</CardDescription>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {components.map((comp) => (
                <Badge key={comp.id} variant="outline" className="px-2.5 py-1 text-xs bg-slate-50 text-slate-700">
                  <span className="font-bold">{comp.name} ({comp.code})</span>: {comp.weight}%
                </Badge>
              ))}
              <Badge className="bg-blue-50 text-brand-blue border-blue-200 text-xs px-2.5 py-1 font-bold">
                KKTP: 75
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grade Table */}
      {isLoadingGrades || isLoadingComponents ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat buku nilai..." size="lg" />
        </div>
      ) : grades.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Nilai"
          description="Belum ada siswa yang terdaftar di kelas binaan ini."
          icon={<FileText className="h-8 w-8 text-slate-400" />}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 min-w-[180px]">Nama Siswa</th>
                  {components.map((c) => (
                    <th key={c.id} className="p-3 text-center min-w-[90px]">
                      {c.code} ({c.weight}%)
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[80px]">Nilai Akhir</th>
                  <th className="p-3 text-center min-w-[60px]">Predikat</th>
                  <th className="p-3 text-center min-w-[90px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((st, idx) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{st.studentName}</div>
                      <div className="text-[10px] text-slate-400">NISN: {st.nisn}</div>
                    </td>
                    {components.map((c) => (
                      <td key={c.id} className="p-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={st.scores[c.id] ?? ''}
                          onChange={(e) => handleScoreChange(st.studentId, c.id, e.target.value)}
                          className="h-8 w-16 text-center text-xs font-bold mx-auto"
                        />
                      </td>
                    ))}
                    <td className="p-3 text-center font-black text-sm text-slate-900">
                      {st.finalScore}
                    </td>
                    <td className="p-3 text-center font-bold text-xs text-brand-blue">
                      {st.letterGrade}
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        className={
                          st.isPassed
                            ? 'bg-emerald-50 text-status-success border-emerald-200'
                            : 'bg-red-50 text-status-danger border-red-200'
                        }
                      >
                        {st.isPassed ? 'Tuntas' : 'Remidi'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
