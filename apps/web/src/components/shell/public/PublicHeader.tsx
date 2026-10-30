'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Clock, Building, MapPin, ChevronRight, LogOut, ExternalLink, HelpCircle } from 'lucide-react';
import { PUBLIC_NAV_ITEMS, SCHOOL_CONTACT_INFO } from '@/features/public-site/content/navigation';
import { PublicAuthNav } from './PublicAuthNav';

export function PublicHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Buka menu mobile
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // Tutup menu mobile dan kembalikan fokus ke tombol pemicu
  const closeMobileMenu = useCallback((restoreFocus: boolean = true) => {
    setIsMobileMenuOpen(false);
    if (restoreFocus) {
      // Defer focus restoration slightly to prevent scroll jump
      requestAnimationFrame(() => {
        menuTriggerRef.current?.focus();
      });
    }
  }, []);

  // Pengelolaan interaksi keyboard (Escape, Focus trap dasar) & Scroll Lock
  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    // Kunci scroll saat drawer modal terbuka
    document.body.style.overflow = 'hidden';

    // Pindahkan fokus ke tombol tutup di dalam drawer
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tutup via tombol Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileMenu(true);
        return;
      }

      // Sederhana: Focus trap pada elemen interaktif di dalam drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Tutup menu saat berpindah rute
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // =========================================================================
  // 1. ZONA AUTH PPDB (/ppdb/masuk & /ppdb/daftar): AUTH SHELL MINIMALIS
  // =========================================================================
  const isAuthPPDB = pathname === '/ppdb/masuk' || pathname === '/ppdb/daftar';
  if (isAuthPPDB) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5 flex items-center justify-between">
          {/* Sisi Kiri: Logo SMP Lab UM + Teks PPDB Online */}
          <Link
            href="/ppdb"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-[#C89332] rounded-lg p-0.5"
          >
            <Image
              src="/images/logo.png"
              alt="Logo SMP Laboratorium UM"
              width={38}
              height={38}
              priority
              unoptimized
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-pub-heading text-sm sm:text-base font-bold text-[#0A3D62] leading-tight">
                SMP Laboratorium UM
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#C89332] tracking-wide">
                Portal Admisi PPDB Online
              </span>
            </div>
          </Link>

          {/* Sisi Kanan: Bantuan WA & Tautan Kembali ke Info PPDB */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/6285126068473"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#1E7A46] bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#1E7A46]" aria-hidden="true" />
              <span>Bantuan WA Panitia</span>
            </a>
            <Link
              href="/ppdb"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#062940] hover:text-white bg-slate-100 hover:bg-[#062940] px-3.5 py-2 rounded-lg transition-all"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Kembali ke</span>
              <span>Info PPDB</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // 2. ZONA DASHBOARD PENDAFTAR (/ppdb/dashboard): APP SHELL PENDAFTAR
  // =========================================================================
  const isDashboardPPDB = pathname?.startsWith('/ppdb/dashboard');
  if (isDashboardPPDB) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs print:hidden">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3 flex items-center justify-between">
          {/* Sisi Kiri: Logo + Badge Portal Pendaftar */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#C89332] rounded-lg p-0.5"
            >
              <Image
                src="/images/logo.png"
                alt="Logo SMP Laboratorium UM"
                width={36}
                height={36}
                priority
                unoptimized
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-pub-heading text-sm sm:text-base font-bold text-[#0A3D62] leading-tight">
                  SMP Laboratorium UM
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  P2LP Universitas Negeri Malang
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block h-5 w-[1px] bg-gray-200" aria-hidden="true" />
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#062940] bg-[#EBF3F8] px-2.5 py-1 rounded-full">
              <span>Portal Calon Siswa (PPDB)</span>
            </span>
          </div>

          {/* Sisi Kanan: Website Utama, Bantuan & Tombol Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#062940] font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Website Utama</span>
            </Link>
            <a
              href="https://wa.me/6285126068473"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E7A46] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
              title="Hubungi Helpdesk Panitia PPDB via WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Bantuan Panitia</span>
            </a>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const { tokenStorage } = require('@/lib/auth/token-storage');
                  tokenStorage.clearAll();
                  window.location.href = '/ppdb/masuk';
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // 3. ZONA PUBLIK LENGKAP: STANDAR PUBLIC HEADER UTAMA
  // =========================================================================
  return (
    <>
      {/* Header Sticky Utama */}
      <header className="sticky top-0 z-40 transition-all duration-200 bg-white shadow-xs border-b border-gray-100">
        {/* Top Utility Bar (Informasi Kampus & Kontak Resmi Sesuai Mockup) */}
        <div className="hidden lg:block bg-[#062940] border-b border-white/10 text-xs text-white/90 py-3 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full flex items-center justify-between">
            {/* Sisi Kiri: Institusi & Alamat */}
            <div className="flex items-center gap-7">
              <div className="flex items-center gap-2 text-white/95 font-medium">
                <Building className="w-4 h-4 text-white/85" aria-hidden="true" />
                <span>P2LP-Universitas Negeri Malang</span>
              </div>
              <div className="flex items-center gap-2 text-white/85">
                <MapPin className="w-4 h-4 text-white/85" aria-hidden="true" />
                <span>Jl. Simpang Bogor No. T-7, Sumbersari, Malang</span>
              </div>
            </div>

            {/* Sisi Kanan: Telepon & Jam Kantor */}
            <div className="flex items-center gap-7">
              <a
                href={SCHOOL_CONTACT_INFO.phone.tel}
                className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"
                title="Telepon Resmi Sekolah"
              >
                <Phone className="w-4 h-4 text-white/85" aria-hidden="true" />
                <span>(0341) 588550</span>
              </a>
              <div className="flex items-center gap-2 text-white/85">
                <Clock className="w-4 h-4 text-white/85" aria-hidden="true" />
                <span>Senin - Jumat 07.00 - 15.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Navigasi Utama */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3 flex items-center justify-between bg-white">
          {/* Logo Institusi SMP Lab UM */}
          <Link
            href="/"
            scroll={false}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                if (typeof window !== 'undefined' && (window as any).__lenis) {
                  (window as any).__lenis.scrollTo(0);
                } else {
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }
              }
            }}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:ring-offset-2 rounded-lg p-0.5"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Image
                src="/images/logo.png"
                alt="Logo SMP Laboratorium"
                width={40}
                height={40}
                priority
                unoptimized
                className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain flex-shrink-0 drop-shadow-xs transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-pub-heading text-sm sm:text-base lg:text-[1.25rem] font-bold text-[#0A3D62] leading-tight tracking-tight">
                SMP Laboratorium
              </span>
              <span className="text-[9px] sm:text-[11px] lg:text-xs text-[#4A6B82] font-medium tracking-tight">
                P2LP Universitas Negeri Malang
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi Utama">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  onClick={(e) => {
                    if (pathname === item.href) {
                      e.preventDefault();
                      if (typeof window !== 'undefined' && (window as any).__lenis) {
                        (window as any).__lenis.scrollTo(0);
                      } else {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`relative py-1 text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#C89332] rounded ${isActive
                    ? 'text-[#062940]'
                    : 'text-gray-700 hover:text-[#062940]'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C89332] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Tombol Aksi Kanan (Desktop): PPDB Online & Masuk Portal */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/ppdb"
              className="bg-[#C89332] hover:bg-[#B57C23] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-xs hover:shadow transition-all inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:ring-offset-2"
            >
              <span>PPDB Online</span>
            </Link>
            <PublicAuthNav variant="desktop" />
          </div>

          {/* Tombol Hamburger Menu (Mobile/Tablet) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/ppdb"
              className="bg-[#C89332] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-2xs"
            >
              <span>PPDB</span>
            </Link>
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={openMobileMenu}
              aria-label="Buka menu navigasi"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-lg border border-gray-200 text-[#062940] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C89332]"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer / Off-canvas Menu Mobile */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Gelap */}
          <div
            onClick={() => closeMobileMenu(true)}
            className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-2xs lg:hidden"
            aria-hidden="true"
          />

          {/* Container Panel Drawer */}
          <aside
            ref={drawerRef}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi Utama Mobile"
            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden animate-in slide-in-from-right duration-200 overflow-y-auto"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="Logo SMP Laboratorium"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-pub-heading text-sm font-bold text-[#062940]">
                    SMP Laboratorium
                  </span>
                  <span className="text-[10px] text-gray-500">P2LP UM</span>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMobileMenu(true)}
                aria-label="Tutup panel navigasi"
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0A3D62] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C89332]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Daftar Navigasi Utama */}
            <nav className="py-5 flex flex-col gap-1.5 shrink-0" aria-label="Menu Mobile">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    scroll={false}
                    onClick={() => {
                      closeMobileMenu(false);
                      if (pathname === item.href) {
                        if (typeof window !== 'undefined' && (window as any).__lenis) {
                          (window as any).__lenis.scrollTo(0);
                        } else {
                          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        }
                      }
                    }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C89332] ${isActive
                      ? 'bg-[#062940] text-white font-semibold shadow-xs'
                      : 'text-gray-700 hover:text-[#0A3D62] hover:bg-gray-50 font-medium'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-[#C89332]' : 'text-gray-400 group-hover:text-[#0A3D62]'
                        }`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & Informasi Kontak */}
            <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col gap-3.5 shrink-0">
              <div className="bg-[#062940] text-white rounded-xl p-3.5 border border-white/5 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 text-[#C89332]">
                    <Building className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    P2LP Universitas Negeri Malang
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-white/85">
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-white/70">
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <a
                      href={SCHOOL_CONTACT_INFO.phone.tel}
                      className="font-medium hover:text-[#C89332] hover:underline transition-colors"
                    >
                      (0341) 588550
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5 text-white/85">
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-white/70">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <span className="font-normal text-white/80">Senin - Jumat: 07.00 - 15.00 WIB</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-white/85">
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-white/70 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <span className="text-xs text-white/75 leading-snug">
                      Jl. Simpang Bogor No. T-7, Sumbersari, Malang
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/ppdb"
                  onClick={() => closeMobileMenu(false)}
                  className="w-full bg-[#C89332] hover:bg-[#B57C23] text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-xs hover:shadow transition-all text-center inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:ring-offset-2"
                >
                  PPDB Online
                </Link>
                <PublicAuthNav variant="mobile" onNavigate={() => closeMobileMenu(false)} />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
