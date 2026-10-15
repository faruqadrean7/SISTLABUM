'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminSidebar } from '@/components/shell/admin/admin-sidebar';
import { AdminTopbar } from '@/components/shell/admin/admin-topbar';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AccessDenied } from '@/components/shared/access-denied';
import { canAccessShell, hasPermission } from '@/lib/rbac/evaluator';
import { getAdminRoutePermission } from '@/lib/rbac/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/masuk?redirect=/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner label="Memverifikasi hak akses administratif..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Cek otorisasi peran terhadap Shell Admin
  const isAuthorized = canAccessShell((user?.roles as string[]) || [], 'admin');
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <AccessDenied
          title="Akses Dibatasi"
          description="Akun Anda terdaftar sebagai Siswa atau Orang Tua. Halaman manajemen ini hanya dapat diakses oleh staf sekolah dan guru."
        />
      </div>
    );
  }

  // Cek otorisasi izin spesifik modul rute saat ini
  const requiredPermission = getAdminRoutePermission(pathname || '/admin');
  const isModuleAuthorized = !requiredPermission || hasPermission(user, requiredPermission);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigasi */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Konten Utama */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {isModuleAuthorized ? (
              children
            ) : (
              <AccessDenied
                title="Akses Modul Terbatas"
                description="Akun Anda tidak memiliki izin untuk mengakses modul ini. Silakan gunakan menu navigasi di samping untuk menuju modul yang diizinkan."
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
