'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardiansApi } from '@/features/master/guardians-api';
import { GuardianItem, GuardianFormValues } from '@/types/master';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { GuardianDialog } from '@/features/master/guardian-dialog';
import { GuardianDetailDialog } from '@/features/master/guardian-detail-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ArrowLeft,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Phone,
} from 'lucide-react';

export default function GuardiansMasterPage() {
  const queryClient = useQueryClient();

  // State Paginasi & Pencarian
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');

  // State Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<GuardianItem | null>(null);
  const [detailGuardian, setDetailGuardian] = useState<GuardianItem | null>(null);
  const [deletingGuardian, setDeletingGuardian] = useState<GuardianItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TanStack Query: List Guardians
  const {
    data: guardiansData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['guardians', { page, limit: pageSize, q: search }],
    queryFn: () =>
      guardiansApi.list({
        page,
        limit: pageSize,
        q: search || undefined,
      }),
  });

  // Mutasi: Tambah Wali
  const createMutation = useMutation({
    mutationFn: (values: GuardianFormValues) => guardiansApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      setIsCreateOpen(false);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal menambahkan data wali.');
    },
  });

  // Mutasi: Perbarui Wali
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<GuardianFormValues> }) =>
      guardiansApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      setEditingGuardian(null);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal memperbarui data wali.');
    },
  });

  // Mutasi: Hapus Wali
  const deleteMutation = useMutation({
    mutationFn: (id: string) => guardiansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      setDeletingGuardian(null);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal menghapus data wali.');
    },
  });

  // Kolom DataTable
  const columns: ColumnDef<GuardianItem>[] = [
    {
      key: 'full_name',
      header: 'Nama Wali Murid',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{item.full_name}</div>
          <div className="text-[11px] text-slate-400">{item.occupation || 'Wali Murid'}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Kontak Telepon',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700">
          <Phone className="h-3 w-3 text-slate-400" />
          <span>{item.phone}</span>
        </span>
      ),
    },
    {
      key: 'address',
      header: 'Alamat',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1">{item.address || '-'}</span>
      ),
    },
    {
      key: 'students',
      header: 'Anak Asuh / Siswa',
      render: (item) => {
        const count = item.students?.length ?? (item as any).students_count ?? 0;
        return count > 0 ? (
          <Badge variant="info" className="text-[11px]">
            {count} Siswa Terhubung
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs italic">Belum Terhubung</span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-brand-blue"
            title="Lihat Detail Wali & Siswa"
            onClick={() => setDetailGuardian(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            title="Edit Profil Wali"
            onClick={() => setEditingGuardian(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-status-danger"
            title="Hapus Data Wali"
            onClick={() => setDeletingGuardian(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center gap-3">
        <Link href="/admin/master">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Master Data</span>
          </Button>
        </Link>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
              Master Data • ADM-MST-04
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Data Orang Tua / Wali Murid
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Kelola data kontak wali murid, alamat domisili, dan relasi hubungan orang tua dengan siswa aktif.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 gap-1.5 text-xs shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Wali Baru</span>
        </Button>
      </div>

      {/* Banner Error */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Operasi Gagal</p>
            <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabel Data Wali */}
      <DataTable<GuardianItem>
        columns={columns}
        data={guardiansData?.data || []}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        error={queryError ? 'Gagal memuat daftar orang tua/wali dari server API.' : null}
        onRetry={() => refetch()}
        searchable={true}
        searchPlaceholder="Cari berdasarkan nama wali atau nomor telepon..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        pagination={
          guardiansData?.meta
            ? {
                page: guardiansData.meta.page,
                limit: guardiansData.meta.limit,
                total: guardiansData.meta.total,
                totalPages: guardiansData.meta.totalPages,
              }
            : undefined
        }
        onPageChange={(newPage) => setPage(newPage)}
        emptyTitle="Tidak Ada Data Wali Terdaftar"
        emptyDescription="Belum ada data orang tua/wali yang cocok dengan kueri pencarian Anda."
        emptyActionLabel="Tambah Wali Sekarang"
        onEmptyAction={() => setIsCreateOpen(true)}
      />

      {/* Dialog Tambah Wali */}
      <GuardianDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
        isLoading={createMutation.isPending}
      />

      {/* Dialog Edit Wali */}
      <GuardianDialog
        isOpen={!!editingGuardian}
        onClose={() => setEditingGuardian(null)}
        initialData={editingGuardian}
        onSubmit={async (values) => {
          if (editingGuardian) {
            await updateMutation.mutateAsync({ id: editingGuardian.id, values });
          }
        }}
        isLoading={updateMutation.isPending}
      />

      {/* Dialog Detail Wali */}
      <GuardianDetailDialog
        isOpen={!!detailGuardian}
        onClose={() => setDetailGuardian(null)}
        guardian={detailGuardian}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ['guardians'] })}
      />

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={!!deletingGuardian}
        onClose={() => setDeletingGuardian(null)}
        onConfirm={() => {
          if (deletingGuardian) {
            deleteMutation.mutate(deletingGuardian.id);
          }
        }}
        title="Hapus Data Wali?"
        description="Data orang tua/wali akan dihapus dari sistem."
        affectedItemName={deletingGuardian?.full_name}
        confirmLabel="Ya, Hapus Data"
        variant="danger"
        isLoading={deleteMutation.isPending}
        error={errorMessage}
      />
    </div>
  );
}
