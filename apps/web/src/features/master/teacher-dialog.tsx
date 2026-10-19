'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TeacherFormValues, TeacherItem, TeacherEmploymentStatus } from '@/types/master';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus, Save } from 'lucide-react';
import { ProfilePhotoUploader } from '@/components/ui/profile-photo-uploader';

export const teacherSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap guru wajib diisi').max(200, 'Maksimal 200 karakter'),
  nip: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
  nuptk: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
  position: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
  status: z.enum(['tetap', 'honorer', 'kontrak'], {
    required_error: 'Pilih status kepegawaian',
  }),
  photo_file_id: z.string().nullable().optional(),
});

export interface TeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormValues) => Promise<void>;
  initialData?: TeacherItem | null;
  isLoading?: boolean;
}

export function TeacherDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: TeacherDialogProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      full_name: '',
      nip: '',
      nuptk: '',
      position: '',
      status: 'tetap',
      photo_file_id: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        full_name: initialData.full_name || '',
        nip: initialData.nip || '',
        nuptk: initialData.nuptk || '',
        position: initialData.position || '',
        status: initialData.status || 'tetap',
        photo_file_id: initialData.photo_file_id || null,
      });
    } else {
      reset({
        full_name: '',
        nip: '',
        nuptk: '',
        position: '',
        status: 'tetap',
        photo_file_id: null,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
              {isEditing ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Perbarui Data Guru' : 'Tambah Pendidik / Guru Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Mengubah data ${initialData?.full_name}`
                  : 'Lengkapi identitas kepegawaian pendidik'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Komponen Unggah Foto Profil Guru */}
          <ProfilePhotoUploader
            label="Pasfoto Resmi Pendidik"
            name={watch('full_name') || initialData?.full_name}
            currentPhotoUrl={initialData?.photo_file?.url || initialData?.photo_url}
            value={watch('photo_file_id')}
            onChange={(fileId) => setValue('photo_file_id', fileId, { shouldDirty: true })}
            disabled={isLoading || isSubmitting}
            helperText="Format: JPG, PNG, atau WebP (Maks. 2 MB)"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-status-danger">*</span>
            </label>
            <Input
              {...register('full_name')}
              placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
              className="h-9 text-xs"
              disabled={isLoading || isSubmitting}
            />
            {errors.full_name && (
              <p className="mt-1 text-[11px] text-status-danger">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
              <Input
                {...register('nip')}
                placeholder="19750101xxxxxxxxxx"
                className="h-9 text-xs font-mono"
                disabled={isLoading || isSubmitting}
              />
              {errors.nip && <p className="mt-1 text-[11px] text-status-danger">{errors.nip.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NUPTK (Opsional)
              </label>
              <Input
                {...register('nuptk')}
                placeholder="16 Digit NUPTK"
                className="h-9 text-xs font-mono"
                disabled={isLoading || isSubmitting}
              />
              {errors.nuptk && (
                <p className="mt-1 text-[11px] text-status-danger">{errors.nuptk.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan / Penugasan Khusus
              </label>
              <Input
                {...register('position')}
                placeholder="Contoh: Guru Matematika / Waka Kurikulum"
                className="h-9 text-xs"
                disabled={isLoading || isSubmitting}
              />
              {errors.position && (
                <p className="mt-1 text-[11px] text-status-danger">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kepegawaian <span className="text-status-danger">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isLoading || isSubmitting}
              >
                <option value="tetap">Guru Tetap</option>
                <option value="honorer">Guru Honorer</option>
                <option value="kontrak">Guru Kontrak</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-[11px] text-status-danger">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Guru'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
