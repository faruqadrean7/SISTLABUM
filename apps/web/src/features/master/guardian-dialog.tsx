'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GuardianFormValues, GuardianItem } from '@/types/master';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, Save } from 'lucide-react';

export const guardianSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wali wajib diisi').max(200, 'Maksimal 200 karakter'),
  phone: z.string().min(1, 'Nomor telepon/HP wajib diisi').max(30, 'Maksimal 30 karakter'),
  occupation: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export interface GuardianDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GuardianFormValues) => Promise<void>;
  initialData?: GuardianItem | null;
  isLoading?: boolean;
}

export function GuardianDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: GuardianDialogProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      occupation: '',
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        occupation: initialData.occupation || '',
        address: initialData.address || '',
      });
    } else {
      reset({
        full_name: '',
        phone: '',
        occupation: '',
        address: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
              {isEditing ? <Save className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Perbarui Data Orang Tua / Wali' : 'Tambah Orang Tua / Wali'}
              </h2>
              <p className="text-xs text-slate-500">Informasi kontak dan domisili wali murid</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Wali <span className="text-status-danger">*</span>
            </label>
            <Input
              {...register('full_name')}
              placeholder="Nama lengkap sesuai KTP"
              className="h-9 text-xs"
              disabled={isLoading || isSubmitting}
            />
            {errors.full_name && (
              <p className="mt-1 text-[11px] text-status-danger">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon / WhatsApp <span className="text-status-danger">*</span>
              </label>
              <Input
                {...register('phone')}
                placeholder="0812xxxxxxxx"
                className="h-9 text-xs font-mono"
                disabled={isLoading || isSubmitting}
              />
              {errors.phone && <p className="mt-1 text-[11px] text-status-danger">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pekerjaan / Profesi
              </label>
              <Input
                {...register('occupation')}
                placeholder="PNS / Swasta / Wiraswasta"
                className="h-9 text-xs"
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Domisili
            </label>
            <Input
              {...register('address')}
              placeholder="Alamat tempat tinggal lengkap"
              className="h-9 text-xs"
              disabled={isLoading || isSubmitting}
            />
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Wali'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
