'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '@/features/public-site/content/navigation';
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
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Header Sticky Utama */}
      <header className="sticky top-0 z-40 transition-all duration-200 bg-pub-navy shadow-md py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo & Identitas Institusi */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy rounded-lg p-0.5"
          >
            <Image
              src="/images/logo.png"
              alt="Logo SMP Laboratorium"
              width={44}
              height={44}
              priority
              className="w-11 h-11 object-contain flex-shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-pub-heading text-[1.05rem] font-bold text-white leading-tight tracking-wide">
                SMP Laboratorium
              </span>
              <span className="text-[0.75rem] text-pub-gold-soft font-medium tracking-wider">
                P2LP Universitas Negeri Malang
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navigasi Utama">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-[6px] text-sm font-medium transition-colors relative focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy ${
                    isActive
                      ? "text-pub-gold-soft font-semibold after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-pub-gold after:rounded-full"
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/ppdb"
              className="bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-semibold text-sm px-4 py-2 rounded-[10px] shadow-sm hover:shadow transition-all inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
            >
              PPDB Online
            </Link>
            <PublicAuthNav variant="desktop" />
          </div>

          {/* Tombol Pemicu Drawer Mobile (Hamburger) */}
          <button
            ref={menuTriggerRef}
            id="mobileMenuBtn"
            type="button"
            onClick={openMobileMenu}
            aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            className="lg:hidden p-2 rounded-[6px] border border-white/20 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer Modal Mobile (Hanya dirender ke DOM saat terbuka agar tidak ada kebocoran fokus / screen reader saat tertutup) */}
      {isMobileMenuOpen && (
        <>
          <div
            data-testid="mobile-backdrop"
            onClick={() => closeMobileMenu(true)}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden transition-opacity backdrop-blur-sm"
            aria-hidden="true"
          />

          <aside
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi mobile"
            className="fixed top-0 right-0 bottom-0 w-[min(320px,85vw)] bg-pub-navy z-50 p-6 flex flex-col shadow-2xl lg:hidden animate-in slide-in-from-right duration-200"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/logo.png"
                  alt="Logo SMP Laboratorium"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain flex-shrink-0"
                />
                <span className="font-pub-heading font-bold text-white text-base">SMP Laboratorium</span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMobileMenu(true)}
                aria-label="Tutup panel navigasi"
                className="p-1.5 rounded-[6px] text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Daftar Menu Mobile */}
            <nav className="flex flex-col gap-1.5" aria-label="Menu Mobile">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => closeMobileMenu(false)}
                    className={`px-4 py-2.5 rounded-[6px] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy ${
                      isActive
                        ? 'bg-white/15 text-pub-gold-soft font-semibold'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA Bawah Drawer Mobile */}
            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/ppdb"
                onClick={() => closeMobileMenu(false)}
                className="w-full text-center bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-semibold text-sm py-2.5 rounded-[10px] shadow transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                Daftar PPDB Online
              </Link>
              <PublicAuthNav variant="mobile" onNavigate={() => closeMobileMenu(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
