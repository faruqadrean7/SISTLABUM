'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Newspaper,
  ChevronRight,
  Search,
  Calendar,
  AlertCircle,
  RotateCw,
  ArrowRight,
  Tag,
  ChevronLeft,
  X,
  FileText,
} from 'lucide-react';
import { publicApi } from '@/features/public-site/public-api';

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

export default function NewsIndexPage() {
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['public-post-categories'],
    queryFn: () => publicApi.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch paginated posts
  const {
    data: postsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-posts', page, selectedCategory, activeSearch],
    queryFn: () =>
      publicApi.getPublicPosts({
        page,
        limit: 6,
        category_slug: selectedCategory || undefined,
        search: activeSearch || undefined,
      }),
    staleTime: 1000 * 60 * 3,
  });

  const posts = postsData?.data || [];
  const meta = postsData?.meta;
  const totalPages = meta?.totalPages || 1;

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

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
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
                Berita &amp; Pengumuman
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Publikasi Resmi Sekolah</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              Warta &amp; Pengumuman Sekolah
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              Ikuti kabar terbaru seputar prestasi peserta didik, kegiatan laboratorium pembelajaran, agenda sekolah, dan pengumuman resmi SMP Laboratorium UM.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section aria-label="Filter dan Pencarian Berita" className="bg-pub-bg-surface border-b border-pub-border py-6">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <label htmlFor="search-posts" className="sr-only">
                Cari Berita atau Pengumuman
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-pub-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="search-posts"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita atau agenda..."
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

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold ${
                  selectedCategory === ''
                    ? 'bg-pub-navy text-white shadow-xs'
                    : 'bg-pub-bg-app text-pub-text-muted hover:bg-pub-navy-subtle hover:text-pub-navy border border-pub-border'
                }`}
              >
                Semua Kategori
              </button>
              {categories &&
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold ${
                      selectedCategory === cat.slug
                        ? 'bg-pub-navy text-white shadow-xs'
                        : 'bg-pub-bg-app text-pub-text-muted hover:bg-pub-navy-subtle hover:text-pub-navy border border-pub-border'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {activeSearch && (
            <div className="mt-4 flex items-center gap-2 text-xs text-pub-text-muted">
              <span>Menampilkan hasil pencarian untuk: <strong>&ldquo;{activeSearch}&rdquo;</strong></span>
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

      {/* 3. POSTS LISTING */}
      <section aria-label="Daftar Berita" className="py-12 sm:py-16 bg-pub-bg-app flex-1">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          {/* Kondisi 1: Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Memuat warta berita">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-pub-border rounded-2xl p-6 shadow-xs space-y-4 animate-pulse flex flex-col justify-between h-64"
                >
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-12 bg-slate-200 rounded w-full" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 pt-2 border-t border-slate-100" />
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
                  Gagal Memuat Publikasi Berita
                </h2>
                <p className="text-xs text-pub-text-muted leading-relaxed">
                  Terjadi kendala saat menghubungi server data berita. Silakan periksa koneksi Anda dan coba kembali.
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
          {!isLoading && !isError && posts.length === 0 && (
            <div className="p-10 sm:p-14 rounded-2xl bg-white border border-pub-border text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-pub-navy-subtle flex items-center justify-center text-pub-navy mx-auto">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-pub-navy-deep">
                  Belum Ada Berita yang Sesuai
                </h2>
                <p className="text-xs text-pub-text-muted leading-relaxed">
                  {activeSearch || selectedCategory
                    ? 'Tidak ditemukan warta dengan filter atau kata kunci yang dipilih. Coba atur ulang filter pencarian Anda.'
                    : 'Publikasi warta dan pengumuman resmi sekolah akan ditampilkan di sini setelah dirilis.'}
                </p>
              </div>
              {(activeSearch || selectedCategory) && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch();
                    setSelectedCategory('');
                  }}
                  className="inline-flex items-center gap-2 bg-pub-navy-subtle text-pub-navy hover:bg-pub-navy hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <span>Tampilkan Semua Berita</span>
                </button>
              )}
            </div>
          )}

          {/* Kondisi 4: Menampilkan Grid Berita Nyata */}
          {!isLoading && !isError && posts.length > 0 && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white border border-pub-border rounded-2xl p-6 sm:p-7 shadow-xs hover:border-pub-navy/30 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {(() => {
                        const coverUrl = post.cover_file?.url || post.coverFile?.url || (post as any).cover?.url;
                        if (!coverUrl) return null;
                        return (
                          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-pub-border bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverUrl}
                              alt={`Sampul warta ${post.title}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })()}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        {post.category ? (
                          <span className="font-semibold px-2.5 py-0.5 rounded-full bg-pub-navy-subtle text-pub-navy text-[11px] inline-flex items-center gap-1">
                            <Tag className="w-3 h-3" aria-hidden="true" />
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-pub-text-muted text-[11px]">
                            Umum
                          </span>
                        )}

                        <div className="flex items-center gap-1 text-[11px] text-pub-text-muted">
                          <Calendar className="w-3.5 h-3.5 text-pub-text-muted flex-shrink-0" aria-hidden="true" />
                          <span>{formatTanggalIndo(post.published_at || post.created_at)}</span>
                        </div>
                      </div>

                      <h2 className="font-heading font-bold text-lg text-pub-navy group-hover:text-pub-navy-light transition-colors line-clamp-2 leading-snug">
                        <Link
                          href={`/berita/${post.slug}`}
                          className="focus:outline-none focus:underline"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-pub-text-muted line-clamp-3 leading-relaxed">
                        {post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 150) : ''}...
                      </p>
                    </div>

                    <div className="pt-4 border-t border-pub-border/70">
                      <Link
                        href={`/berita/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pub-navy group-hover:text-pub-gold transition-colors focus:outline-none focus:underline rounded"
                      >
                        <span>Baca Selengkapnya</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginasi Halaman Berita"
                  className="flex items-center justify-between border-t border-pub-border pt-6"
                >
                  <p className="text-xs text-pub-text-muted">
                    Halaman <strong className="text-pub-navy">{page}</strong> dari{' '}
                    <strong className="text-pub-navy">{totalPages}</strong> (Total {meta?.total || 0} warta)
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

      {/* 4. CALL TO ACTION PPDB */}
      <section className="py-12 bg-pub-navy-deep text-white border-t border-pub-navy/20">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Ingin Mengetahui Lebih Banyak tentang SMP Laboratorium?
              </h2>
              <p className="text-xs sm:text-sm text-white/80">
                Kunjungi informasi pendaftaran peserta didik baru atau kenali program pendidikan unggulan kami.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/ppdb"
                className="bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
              >
                Informasi PPDB
              </Link>
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
