'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Images,
  ChevronRight,
  Search,
  Calendar,
  AlertCircle,
  RotateCw,
  FolderOpen,
  X,
  Play,
  ExternalLink,
  ChevronLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { publicApi, PublicAlbumItem } from '@/features/public-site/public-api';

function formatTanggalIndo(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

export default function GalleryPage() {
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Fetch paginated public albums
  const {
    data: albumsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-albums', page, activeSearch],
    queryFn: () =>
      publicApi.getPublicAlbums({
        page,
        per_page: 9,
        search: activeSearch || undefined,
      }),
    staleTime: 1000 * 60 * 3,
  });

  // Fetch album detail when modal is open
  const {
    data: albumDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['public-album-detail', selectedAlbumId],
    queryFn: () => publicApi.getPublicAlbumDetail(selectedAlbumId!),
    enabled: Boolean(selectedAlbumId),
    staleTime: 1000 * 60 * 5,
  });

  const albums = albumsData?.data || [];
  const meta = albumsData?.meta;
  const totalPages = meta?.totalPages || 1;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const handleOpenAlbum = (albumId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = event.currentTarget;
    setSelectedAlbumId(albumId);
  };

  const handleCloseAlbum = useCallback(() => {
    setSelectedAlbumId(null);
    requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }, []);

  // Keyboard trap, escape key, focus initialization & body scroll lock
  useEffect(() => {
    if (!selectedAlbumId) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseAlbum();
        return;
      }

      if (e.key === 'Tab' && modalContentRef.current) {
        const focusableElements = modalContentRef.current.querySelectorAll<HTMLElement>(
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
  }, [selectedAlbumId, handleCloseAlbum]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-pub-navy-deep via-pub-navy to-pub-navy-light text-white py-14 md:py-18 border-b border-pub-navy/20">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Navigasi Halaman" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-white/70">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold rounded px-1"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li aria-current="page" className="font-semibold text-pub-gold-soft px-1">
                Galeri Dokumentasi
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
              <Images className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Dokumentasi Visual Sekolah</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              Galeri Kegiatan &amp; Aktivitas Sekolah
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              Dokumentasi visual momen kebersamaan, proses riset inovasi pembelajaran, kegiatan kesiswaan, serta sarana representatif SMP Laboratorium UM.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section aria-label="Pencarian Album Galeri" className="bg-pub-bg-surface border-b border-pub-border py-6">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <label htmlFor="search-albums" className="sr-only">
                Cari Album Galeri
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-pub-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="search-albums"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari album kegiatan..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pub-border text-xs sm:text-sm text-pub-text-main placeholder-pub-text-muted focus:outline-none focus:ring-2 focus:ring-pub-gold focus:border-transparent bg-pub-bg-app/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Hapus kata kunci pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pub-text-muted hover:text-pub-text-main p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            <div className="text-xs text-pub-text-muted">
              {meta ? <span>Total <strong>{meta.total}</strong> album dokumentasi</span> : null}
            </div>
          </div>

          {activeSearch && (
            <div className="mt-4 flex items-center gap-2 text-xs text-pub-text-muted">
              <span>Hasil pencarian album untuk: <strong>&ldquo;{activeSearch}&rdquo;</strong></span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-pub-navy font-semibold hover:underline ml-2"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. ALBUMS GRID LISTING */}
      <section aria-label="Daftar Album Foto" className="py-12 sm:py-16 bg-pub-bg-app flex-1">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {/* Kondisi 1: Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Memuat album galeri">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-pub-border rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col h-72"
                >
                  <div className="h-44 bg-slate-200 w-full" />
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Kondisi 2: Error State */}
          {!isLoading && isError && (
            <div className="p-8 sm:p-12 rounded-2xl bg-white border border-red-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" aria-hidden="true" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-pub-navy-deep">
                  Gagal Memuat Album Galeri
                </h2>
                <p className="text-xs text-pub-text-muted leading-relaxed">
                  Terjadi kendala saat mengambil data album foto dari server. Silakan coba kembali.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 bg-pub-navy text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-pub-navy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* Kondisi 3: Data Kosong */}
          {!isLoading && !isError && albums.length === 0 && (
            <div className="p-10 sm:p-14 rounded-2xl bg-white border border-pub-border text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-pub-navy-subtle flex items-center justify-center text-pub-navy mx-auto">
                <FolderOpen className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-pub-navy-deep">
                  Belum Ada Album Dokumentasi
                </h2>
                <p className="text-xs text-pub-text-muted leading-relaxed">
                  {activeSearch
                    ? 'Tidak ditemukan album dengan kata kunci pencarian tersebut. Coba atur ulang pencarian Anda.'
                    : 'Album dokumentasi foto kegiatan sekolah akan ditampilkan di sini setelah dipublikasikan secara resmi.'}
                </p>
              </div>
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-2 bg-pub-navy-subtle text-pub-navy hover:bg-pub-navy hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <span>Tampilkan Semua Album</span>
                </button>
              )}
            </div>
          )}

          {/* Kondisi 4: Menampilkan Daftar Album Nyata */}
          {!isLoading && !isError && albums.length > 0 && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {albums.map((album: PublicAlbumItem) => (
                  <article
                    key={album.id}
                    className="bg-white border border-pub-border rounded-2xl overflow-hidden shadow-xs hover:border-pub-navy/30 hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    {/* Cover Photo / Thumbnail */}
                    <div className="relative h-48 bg-pub-navy-subtle flex items-center justify-center overflow-hidden">
                      {album.cover?.url ? (
                        <Image
                          src={album.cover.url}
                          alt={`Sampul album ${album.title}`}
                          width={600}
                          height={400}
                          unoptimized
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Graceful fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-pub-navy-subtle');
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-pub-navy/60">
                          <ImageIcon className="w-10 h-10" aria-hidden="true" />
                          <span className="text-[11px] font-medium">Dokumentasi Sekolah</span>
                        </div>
                      )}

                      {/* Item Count Badge */}
                      <span className="absolute bottom-3 right-3 bg-pub-navy-deep/85 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <Images className="w-3 h-3 text-pub-gold" aria-hidden="true" />
                        <span>{album.items_count || 0} Foto</span>
                      </span>
                    </div>

                    {/* Album Info */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-[11px] text-pub-text-muted">
                          <Calendar className="w-3.5 h-3.5 text-pub-text-muted flex-shrink-0" aria-hidden="true" />
                          <span>{formatTanggalIndo(album.created_at)}</span>
                        </div>
                        <h2 className="font-heading font-bold text-lg text-pub-navy group-hover:text-pub-navy-light transition-colors line-clamp-2 leading-snug">
                          {album.title}
                        </h2>
                      </div>

                      <div className="pt-3 border-t border-pub-border/70">
                        <button
                          type="button"
                          onClick={(e) => handleOpenAlbum(album.id, e)}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-pub-navy-subtle text-pub-navy hover:bg-pub-navy hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
                        >
                          <span>Buka Album</span>
                          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginasi Album Galeri"
                  className="flex items-center justify-between border-t border-pub-border pt-6"
                >
                  <p className="text-xs text-pub-text-muted">
                    Halaman <strong className="text-pub-navy">{page}</strong> dari{' '}
                    <strong className="text-pub-navy">{totalPages}</strong> (Total {meta?.total || 0} album)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border border-pub-border bg-white text-pub-navy hover:bg-pub-navy-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border border-pub-border bg-white text-pub-navy hover:bg-pub-navy-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
                    >
                      <span>Berikutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. OFFICIAL DOCUMENTARY VIDEO SECTION */}
      <section aria-labelledby="video-section-heading" className="py-14 sm:py-20 bg-pub-bg-surface border-t border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Play className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Video Dokumenter</span>
            </span>
            <h2
              id="video-section-heading"
              className="font-heading text-2xl sm:text-3xl font-bold text-pub-navy tracking-tight"
            >
              Video Profil &amp; Suasana Belajar
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base leading-relaxed">
              Saksikan gambaran langsung dinamika kegiatan belajar mengajar, sarana prasarana, dan ekosistem ramah anak di SMP Laboratorium UM.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-pub-bg-app border border-pub-border rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
              <iframe
                src="https://www.youtube-nocookie.com/embed/BxQztnwi_74"
                title="Video Profil Resmi SMP Laboratorium UM"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-pub-text-muted px-2">
              <span>Dokumentasi Resmi Profil Sekolah Laboratorium P2LP UM</span>
              <a
                href="https://www.youtube.com/watch?v=BxQztnwi_74"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-pub-navy hover:text-pub-gold transition-colors focus:outline-none focus:underline"
              >
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION PPDB & BERITA */}
      <section className="py-12 bg-pub-navy-deep text-white border-t border-pub-navy/20">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Tertarik Bergabung dengan Keluarga Besar SMP Laboratorium UM?
              </h2>
              <p className="text-xs sm:text-sm text-white/80">
                Penerimaan siswa baru tahun ajaran 2026/2027 telah dibuka melalui portal resmi PPDB.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/ppdb"
                className="bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
              >
                Pendaftaran PPDB
              </Link>
              <Link
                href="/berita"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                Lihat Warta Sekolah
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ACCESSIBLE ALBUM DETAIL MODAL */}
      {selectedAlbumId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="album-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseAlbum}
        >
          <div
            ref={modalContentRef}
            className="bg-white border border-pub-border rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-pub-border flex items-center justify-between gap-4 bg-pub-bg-app/50">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pub-gold block mb-1">
                  Detail Album Dokumentasi
                </span>
                <h2 id="album-modal-title" className="font-heading font-bold text-lg sm:text-xl text-pub-navy">
                  {albumDetail?.title || 'Memuat Album...'}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleCloseAlbum}
                aria-label="Tutup jendela album"
                className="p-2 rounded-xl text-pub-text-muted hover:text-pub-navy hover:bg-pub-navy-subtle transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingDetail && (
                <div className="p-12 text-center space-y-3" aria-busy="true">
                  <div className="w-8 h-8 border-3 border-pub-navy border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-pub-text-muted">Memuat koleksi foto album...</p>
                </div>
              )}

              {!isLoadingDetail && isDetailError && (
                <div className="p-8 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-xs font-semibold text-pub-navy">Gagal memuat detail foto album.</p>
                </div>
              )}

              {!isLoadingDetail && !isDetailError && albumDetail && (
                <div>
                  {(!albumDetail.items || albumDetail.items.length === 0) ? (
                    <div className="p-10 text-center space-y-2">
                      <ImageIcon className="w-10 h-10 text-pub-text-muted mx-auto" />
                      <p className="text-sm font-semibold text-pub-navy">Belum ada foto yang ditambahkan pada album ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {albumDetail.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-pub-border overflow-hidden bg-pub-bg-app shadow-2xs space-y-2 p-2"
                        >
                          <div className="aspect-4/3 rounded-xl overflow-hidden bg-pub-navy-subtle flex items-center justify-center">
                            {item.file?.url ? (
                              <Image
                                src={item.file.url}
                                alt={item.caption || albumDetail.title}
                                width={600}
                                height={450}
                                unoptimized
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-pub-navy/40" />
                            )}
                          </div>
                          {item.caption && (
                            <p className="text-xs text-pub-text-main font-medium px-2 py-1 leading-relaxed">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pub-border bg-pub-bg-app/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAlbumId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-pub-navy text-white hover:bg-pub-navy-deep transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
