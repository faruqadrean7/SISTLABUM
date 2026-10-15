'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useTeacherJournals,
  useTeacherClasses,
  guruApi,
  TeacherJournalItem,
} from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';

export default function TeacherJournalPage() {
  const { data: initialJournals = [], isLoading } = useTeacherJournals();
  const { data: classes = [] } = useTeacherClasses();

  const [journals, setJournals] = useState<TeacherJournalItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-7a');
  const [journalDate, setJournalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 - 09:20');
  const [lessonTopic, setLessonTopic] = useState('');
  const [competenceIndicator, setCompetenceIndicator] = useState('');
  const [learningObstacles, setLearningObstacles] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialJournals.length > 0) {
      setJournals(initialJournals);
    }
  }, [initialJournals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTopic.trim() || !competenceIndicator.trim()) return;

    setIsSubmitting(true);
    try {
      const activeClass = classes.find((c) => c.id === selectedClassId);
      const newJrn = await guruApi.createJournal({
        classId: selectedClassId,
        className: activeClass?.name || '7-A Unggulan',
        subjectId: 'sub-mat',
        subjectName: 'Matematika',
        date: journalDate,
        timeSlot,
        lessonTopic,
        competenceIndicator,
        learningObstacles,
        studentAbsentees: [],
      });
      setJournals((prev) => [newJrn, ...prev]);
      setSuccessMessage('Jurnal mengajar harian berhasil disimpan.');
      setIsModalOpen(false);
      setLessonTopic('');
      setCompetenceIndicator('');
      setLearningObstacles('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
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
            <BookOpen className="h-6 w-6 text-brand-blue" />
            <span>Jurnal Mengajar Harian</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dokumentasi materi KBM, capaian pembelajaran, dan catatan refleksi per sesi tatap muka.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" />
          <span>Buat Jurnal Baru</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-status-success text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Journals List */}
      {isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat jurnal mengajar..." size="lg" />
        </div>
      ) : journals.length === 0 ? (
        <EmptyState
          title="Belum Ada Jurnal Mengajar"
          description="Anda belum mencatat jurnal mengajar untuk periode ini. Klik tombol di atas untuk membuat catatan KBM baru."
          icon={<BookOpen className="h-8 w-8 text-slate-400" />}
          actionLabel="Buat Jurnal Baru"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {journals.map((jrn) => (
            <Card key={jrn.id} className="border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold text-slate-700 bg-slate-50">
                      {jrn.className}
                    </Badge>
                    <span className="font-bold text-slate-900">{jrn.subjectName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {jrn.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-slate-400 font-medium">{jrn.date}</span>
                    {jrn.isLocked ? (
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 text-[10px]">
                        <Lock className="h-3 w-3" />
                        <span>Terkunci</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-status-success border-emerald-200 text-[10px]">
                        Draf Terbuka
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                  {jrn.lessonTopic}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 leading-relaxed mt-1">
                  <strong>Indikator:</strong> {jrn.competenceIndicator}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 text-xs space-y-2 border-t border-slate-100 mt-2">
                {jrn.learningObstacles && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    💡 <strong>Catatan & Kendala:</strong> {jrn.learningObstacles}
                  </p>
                )}
                {jrn.studentAbsentees.length > 0 && (
                  <div className="text-[11px] text-amber-700">
                    Siswa tidak hadir: {jrn.studentAbsentees.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Jurnal Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-blue" />
                <span>Buat Jurnal Mengajar Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal KBM</label>
                  <Input
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slot Waktu / Jam Mengajar</label>
                <Input
                  type="text"
                  placeholder="Contoh: 08:00 - 09:20"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi / Pokok Bahasan</label>
                <Input
                  type="text"
                  placeholder="Contoh: Operasi Hitung Campuran Bentuk Aljabar"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Indikator Capaian Pembelajaran</label>
                <Textarea
                  placeholder="Tuliskan indikator kompetensi yang dicapai siswa pada sesi ini..."
                  value={competenceIndicator}
                  onChange={(e) => setCompetenceIndicator(e.target.value)}
                  className="text-xs h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kendala / Refleksi KBM (Opsional)</label>
                <Textarea
                  placeholder="Catatan mengenai kendala siswa atau hal yang perlu dievaluasi..."
                  value={learningObstacles}
                  onChange={(e) => setLearningObstacles(e.target.value)}
                  className="text-xs h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting} className="font-bold">
                  Simpan Jurnal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
