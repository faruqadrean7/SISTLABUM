'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useTeacherMaterials,
  useTeacherClasses,
  guruApi,
  TeacherMaterialItem,
} from '@/features/portal/guru';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Layers,
  ArrowLeft,
  Plus,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';

export default function TeacherMaterialsPage() {
  const { data: initialMaterials = [], isLoading } = useTeacherMaterials();
  const { data: classes = [] } = useTeacherClasses();

  const [materials, setMaterials] = useState<TeacherMaterialItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(['cls-7a']);
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialMaterials.length > 0) {
      setMaterials(initialMaterials);
    }
  }, [initialMaterials]);

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedClassIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const classNames = classes
        .filter((c) => selectedClassIds.includes(c.id))
        .map((c) => c.name);

      const newMat = await guruApi.createMaterial({
        title,
        subjectId: 'sub-mat',
        subjectName: 'Matematika',
        classIds: selectedClassIds,
        classNames,
        description,
        fileUrl: fileUrl.trim() || '/documents/modul-pembelajaran.pdf',
      });
      setMaterials((prev) => [newMat, ...prev]);
      setSuccessMessage('Materi dan modul ajar berhasil diunggah.');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
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
            <Layers className="h-6 w-6 text-brand-blue" />
            <span>Materi & Modul Pembelajaran</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unggah dan kelola modul ajar, slide presentasi, dan bahan bacaan siswa.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" />
          <span>Tambah Materi Baru</span>
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-status-success text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Materials List */}
      {isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner label="Memuat materi ajar..." size="lg" />
        </div>
      ) : materials.length === 0 ? (
        <EmptyState
          title="Belum Ada Materi Pembelajaran"
          description="Anda belum mengunggah materi atau modul ajar untuk kelas binaan Anda."
          icon={<Layers className="h-8 w-8 text-slate-400" />}
          actionLabel="Tambah Materi Baru"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <Card
              key={mat.id}
              className="border-slate-200 hover:border-brand-blue hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{mat.createdAt}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Download className="h-3 w-3" />
                      {mat.downloadsCount} kali diunduh
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {mat.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-brand-blue border-blue-200 font-bold">
                      {mat.subjectName}
                    </Badge>
                    {mat.classNames.map((cn) => (
                      <Badge key={cn} variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                        {cn}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-1 text-xs text-slate-600 leading-relaxed">
                  {mat.description}
                </CardContent>
              </div>

              <div className="p-4 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  {mat.fileUrl || 'Link eksternal'}
                </span>
                <a
                  href={mat.fileUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh File</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah Materi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-blue" />
                <span>Unggah Materi Pembelajaran</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Materi / Modul</label>
                <Input
                  type="text"
                  placeholder="Contoh: Modul Ajar Bab 3: Bangun Ruang Sisi Datar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Kelas Pembaca</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {classes.map((c) => {
                    const isChecked = selectedClassIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleClassToggle(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          isChecked
                            ? 'bg-blue-50 text-brand-blue border-brand-blue'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Petunjuk Belajar</label>
                <Textarea
                  placeholder="Tuliskan petunjuk pembelajaran bagi siswa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Dokumen / File Lampiran</label>
                <Input
                  type="text"
                  placeholder="Contoh: /documents/modul-bangun-ruang.pdf atau link Google Drive"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting} className="font-bold">
                  Unggah Materi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
