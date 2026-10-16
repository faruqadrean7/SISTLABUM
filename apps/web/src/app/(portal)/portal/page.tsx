'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import {
  resolvePortalDestination,
  getDestinationPath,
  getPortalRoleOptions,
} from '@/lib/rbac/evaluator';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from '@/components/shell/shared/role-switcher';
import {
  GraduationCap,
  Users,
  BookOpen,
  Briefcase,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  GraduationCap,
  Users,
  BookOpen,
  Briefcase,
  Shield,
};

export default function PortalIndexPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const portalOptions = React.useMemo(() => {
    return user ? getPortalRoleOptions(user.roles) : [];
  }, [user]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // Jika hanya memiliki 1 portal, redirect otomatis langsung
    if (portalOptions.length === 1) {
      router.replace(portalOptions[0].href);
      return;
    }

    // Jika tidak memiliki opsi khusus (misal fallback), gunakan resolver standar
    if (portalOptions.length === 0) {
      const dest = resolvePortalDestination(user.roles);
      router.replace(getDestinationPath(dest));
    }
  }, [isLoading, isAuthenticated, user, portalOptions, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner label="Memeriksa peran dan hak akses..." size="lg" />
      </div>
    );
  }

  // Tampilkan pilihan portal jika pengguna memiliki multi-peran
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-brand-blue text-xs font-semibold rounded-full mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Multi-Peran Terdeteksi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Selamat Datang, {user?.profile?.name || user?.username}!
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          Akun Anda memiliki akses ke beberapa portal layanan. Silakan pilih portal kerja yang ingin Anda tuju:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {portalOptions.map((opt) => {
          const IconComponent = ICON_MAP[opt.iconName as keyof typeof ICON_MAP] || Shield;
          return (
            <Card
              key={opt.portal}
              className="group hover:border-brand-blue hover:shadow-md transition-all duration-200 border-slate-200"
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="p-3 rounded-xl bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                    {opt.label}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    {opt.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex justify-end">
                <Link href={opt.href}>
                  <Button size="sm" className="gap-2">
                    <span>Buka Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-500 mb-3">
          Anda juga dapat berganti portal kapan saja melalui menu di bilah navigasi:
        </p>
        <div className="inline-block">
          <RoleSwitcher />
        </div>
      </div>
    </div>
  );
}
