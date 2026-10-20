'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { resolveUserDestination, getDestinationPath } from '@/lib/rbac/evaluator';

interface PublicAuthNavProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

/**
 * PublicAuthNav Component (Client Island)
 * Mengintegrasikan status autentikasi tanpa mengakses storage langsung.
 * Fallback stabil ke label "Masuk Portal" saat inisialisasi / belum login.
 */
export function PublicAuthNav({ variant = 'desktop', onNavigate }: PublicAuthNavProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Selama loading atau belum login, arahkan ke /masuk
  const destinationPath =
    !isLoading && isAuthenticated && user
      ? getDestinationPath(resolveUserDestination((user.roles as string[]) || []))
      : '/masuk';

  const label = !isLoading && isAuthenticated ? 'Buka Portal Saya' : 'Portal Akademik';

  if (variant === 'mobile') {
    return (
      <Link
        href={destinationPath}
        onClick={onNavigate}
        className="w-full text-center bg-transparent border border-white/30 text-white hover:bg-white/10 font-semibold text-sm py-2.5 rounded-[10px] transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={destinationPath}
      className="bg-transparent hover:bg-white/10 text-white border border-white/40 hover:border-white font-semibold text-sm px-3.5 py-2 rounded-[10px] transition-all inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
    >
      {label}
    </Link>
  );
}
