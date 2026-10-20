'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Globe,
  BookCheck,
  HeartHandshake,
  Sparkles,
  Shield,
  Building,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  RotateCw,
  GraduationCap,
  ChevronRight,
  Award,
} from 'lucide-react';
import { publicApi } from '@/features/public-site/public-api';
import {
  HERO_CONTENT,
  PROFILE_SUMMARY,
  EDUCATIONAL_PROGRAMS,
  APPROACH_PILLARS,
  PPDB_BANNER_CONTENT,
} from '@/features/public-site/content/homepage';
import { SCHOOL_CONTACT_INFO } from '@/features/public-site/content/navigation';
import { formatPhoneLink, formatWaLink } from '@/features/public-site/utils';
import { formatTanggalIndo } from '@/lib/utils';

export default function HomePage() {
  // Query 3 publikasi berita terbaru dari backend
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['public-latest-posts'],
    queryFn: () => publicApi.getLatestPosts(3),
    staleTime: 5 * 60 * 1000,
  });

  // Query gelombang aktif PPDB
  const { data: activeWave } = useQuery({
    queryKey: ['public-active-wave'],
    queryFn: () => publicApi.getActiveWave(),
    staleTime: 5 * 60 * 1000,
  });

  // Query profil situs dan pengaturan publik (BE-CMS-01)
  const { data: siteData } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: () => publicApi.getPublicSite(),
    staleTime: 5 * 60 * 1000,
  });

  // Derived dynamic values with robust fallbacks
  const tagline = siteData?.identity?.tagline || HERO_CONTENT.tagline;
  const schoolName = siteData?.identity?.name || HERO_CONTENT.badgeSchool;
  const accreditationGrade = siteData?.profile?.accreditation?.grade;
  const accreditationBadge = accreditationGrade
    ? `Terakreditasi ${accreditationGrade} (Unggul)`
    : HERO_CONTENT.accreditationBadge;

  const principalName = siteData?.profile?.principal_greeting?.principal_name || PROFILE_SUMMARY.principal.name;
  const principalQuote = siteData?.profile?.principal_greeting?.greeting_text || PROFILE_SUMMARY.principal.greetingQuote;
  const logoUrl = siteData?.identity?.logo_url || '/images/logo.png';

  const phoneDisplay = siteData?.contact?.phone || SCHOOL_CONTACT_INFO.phone.display;
  const phoneTel = `tel:${formatPhoneLink(phoneDisplay)}`;

  const waDisplay = siteData?.contact?.whatsapp || SCHOOL_CONTACT_INFO.whatsapp.display;
  const waUrl = `https://wa.me/${formatWaLink(waDisplay)}`;

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section
        aria-labelledby="hero-heading"
        className="relative min-h-[600px] lg:min-h-[660px] flex items-center py-20 overflow-hidden bg-pub-navy-deep text-white"
      >
        {/* Background Poster & Video Overlay */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-pub-navy-deep">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url('${HERO_CONTENT.videoThumbnail}')` }}
          />
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] pointer-events-none border-0 opacity-100"
            src={HERO_CONTENT.youtubeEmbedUrl}
            title="Video Profil SMP Laboratorium"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="eager"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-pub-navy-deep/90 via-pub-navy-deep/60 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Badges Afiliasi & Akreditasi */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-pub-gold text-pub-navy-deep font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {tagline}
              </span>
              <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                {HERO_CONTENT.badgeAffiliation}
              </span>
              <span className="bg-pub-green/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-pub-green/40">
                {accreditationBadge}
              </span>
            </div>

            {/* Headline Utama */}
            <h1
              id="hero-heading"
              className="font-pub-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-md tracking-tight"
            >
              Mewujudkan Generasi <span className="text-pub-gold">Beriman, Berkarakter</span>, Berprestasi, dan Berbudaya
            </h1>

            {/* Deskripsi Singkat */}
            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl drop-shadow">
              {HERO_CONTENT.description}
            </p>

            {/* Tombol Call to Action */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href={HERO_CONTENT.ctaPrimary.href}
                className="bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-sm sm:text-base px-6 py-3.5 rounded-[10px] shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>{HERO_CONTENT.ctaPrimary.label}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href={HERO_CONTENT.ctaSecondary.href}
                className="bg-transparent hover:bg-white/15 text-white border border-white/50 hover:border-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-[10px] transition-all backdrop-blur-sm inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>{HERO_CONTENT.ctaSecondary.label}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PROFIL SINGKAT & SAMBUTAN PIMPINAN
          ========================================================================= */}
      <section aria-labelledby="profile-heading" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Kolom Kiri: Kartu Identitas Kepala Sekolah */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-pub-navy via-pub-navy-deep to-pub-navy rounded-2xl p-7 text-white border border-pub-navy-light/40 shadow-elevated flex flex-col justify-between space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-2 shrink-0">
                    <Image
                      src={logoUrl}
                      alt={`Logo ${schoolName}`}
                      width={52}
                      height={52}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-pub-gold-soft block">
                      Kepemimpinan Sekolah
                    </span>
                    <h3 className="font-pub-heading text-lg sm:text-xl font-bold text-white leading-snug">
                      {principalName}
                    </h3>
                    <span className="text-xs text-white/80">
                      {PROFILE_SUMMARY.principal.role}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-xs sm:text-sm text-white/90 italic leading-relaxed">
                  &ldquo;{principalQuote}&rdquo;
                </div>

                <div className="pt-2 border-t border-white/15">
                  <Link
                    href={PROFILE_SUMMARY.principal.href}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-pub-gold-soft hover:text-white transition-colors focus:outline-none focus:underline"
                  >
                    <span>{PROFILE_SUMMARY.principal.ctaLabel}</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Deskripsi Identitas & Pendekatan Sekolah */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block bg-pub-navy-subtle text-pub-navy font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                {PROFILE_SUMMARY.sectionBadge}
              </span>
              <h2
                id="profile-heading"
                className="font-pub-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy-deep leading-tight"
              >
                {PROFILE_SUMMARY.title}
              </h2>
              <p className="text-pub-text-muted text-sm sm:text-base leading-relaxed">
                {PROFILE_SUMMARY.descriptionParagraph1}
              </p>
              <p className="text-pub-text-muted text-sm sm:text-base leading-relaxed">
                {PROFILE_SUMMARY.descriptionParagraph2}
              </p>
              <div className="pt-2">
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-2 text-sm font-bold text-pub-navy hover:text-pub-gold transition-colors focus:outline-none focus:underline"
                >
                  <span>Pelajari Sejarah, Visi, dan Misi Sekolah</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. EMPAT PROGRAM AKADEMIK UNGGULAN
          ========================================================================= */}
      <section aria-labelledby="programs-heading" className="py-16 sm:py-20 bg-pub-bg-app border-y border-pub-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="inline-block bg-pub-navy-subtle text-pub-navy font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
              Kurikulum & Layanan Belajar
            </span>
            <h2
              id="programs-heading"
              className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy-deep"
            >
              4 Program Akademik Unggulan
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base">
              Dirancang untuk mengakomodasi minat, bakat, potensi religius, serta kecakapan masa depan setiap siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EDUCATIONAL_PROGRAMS.map((prog) => {
              const renderIcon = () => {
                switch (prog.iconName) {
                  case 'book-open':
                    return <BookOpen className="w-6 h-6 text-pub-navy" aria-hidden="true" />;
                  case 'globe':
                    return <Globe className="w-6 h-6 text-pub-green" aria-hidden="true" />;
                  case 'book-check':
                    return <BookCheck className="w-6 h-6 text-pub-gold" aria-hidden="true" />;
                  case 'heart-handshake':
                    return <HeartHandshake className="w-6 h-6 text-indigo-600" aria-hidden="true" />;
                }
              };

              return (
                <article
                  key={prog.id}
                  className="bg-white border border-pub-border rounded-xl p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-pub-navy-subtle flex items-center justify-center">
                      {renderIcon()}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pub-text-muted block">
                      {prog.category}
                    </span>
                    <h3 className="font-pub-heading font-bold text-lg text-pub-navy-deep group-hover:text-pub-navy transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-pub-border/70">
                    <Link
                      href={prog.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-pub-navy hover:text-pub-gold transition-colors focus:outline-none focus:underline"
                    >
                      <span>Lihat Informasi Program</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="text-center text-xs text-pub-text-muted mt-8">
            Seluruh program akademik diselenggarakan berpedoman pada kurikulum resmi SMP Laboratorium UM.
          </p>
        </div>
      </section>

      {/* =========================================================================
          4. PENDEKATAN MODEL & KEUNGGULAN
          ========================================================================= */}
      <section aria-labelledby="approach-heading" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="inline-block bg-pub-gold-subtle text-pub-gold font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-pub-gold-soft">
              Pilar Ekosistem
            </span>
            <h2
              id="approach-heading"
              className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy-deep"
            >
              Pendekatan Pembelajaran Model
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base">
              Menghubungkan riset universitas, pembentukan karakter mandiri, dan fasilitas belajar terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {APPROACH_PILLARS.map((pillar) => {
              const renderPillarIcon = () => {
                switch (pillar.iconName) {
                  case 'building':
                    return <Building className="w-6 h-6 text-pub-navy" aria-hidden="true" />;
                  case 'sparkles':
                    return <Sparkles className="w-6 h-6 text-pub-gold" aria-hidden="true" />;
                  case 'users':
                    return <Users className="w-6 h-6 text-pub-green" aria-hidden="true" />;
                  case 'shield':
                    return <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />;
                }
              };

              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-xl bg-pub-bg-app border border-pub-border shadow-sm space-y-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-white border border-pub-border flex items-center justify-center shadow-xs">
                    {renderPillarIcon()}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pub-gold block">
                    {pillar.category}
                  </span>
                  <h3 className="font-pub-heading font-bold text-base text-pub-navy-deep">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-pub-text-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. KABAR & PUBLIKASI TERKINI (KONEKSI API PUBLIK REAL)
          ========================================================================= */}
      <section aria-labelledby="news-heading" className="py-16 sm:py-20 bg-pub-bg-app border-t border-pub-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1">
              <span className="inline-block bg-pub-navy-subtle text-pub-navy font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                Publikasi Sekolah
              </span>
              <h2
                id="news-heading"
                className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy-deep"
              >
                Kabar & Pengumuman Terbaru
              </h2>
              <p className="text-pub-text-muted text-sm">
                Informasi resmi seputar agenda akademik, prestasi, dan aktivitas kesiswaan.
              </p>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pub-navy hover:text-pub-gold transition-colors focus:outline-none focus:underline self-start sm:self-auto"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Kondisi 1: Loading Skeleton */}
          {isLoadingPosts && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-busy="true" aria-label="Memuat publikasi berita">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-pub-border rounded-xl p-6 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-16 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/4 pt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Kondisi 2: Error State */}
          {!isLoadingPosts && isPostsError && (
            <div className="p-6 rounded-xl bg-white border border-red-200 text-center max-w-lg mx-auto space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">
                Tidak dapat memuat publikasi berita saat ini.
              </p>
              <p className="text-xs text-slate-500">
                Silakan periksa koneksi Anda atau coba muat kembali data.
              </p>
              <button
                type="button"
                onClick={() => refetchPosts()}
                className="inline-flex items-center gap-2 bg-pub-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-pub-navy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* Kondisi 3: Data Kosong */}
          {!isLoadingPosts && !isPostsError && (!posts || posts.length === 0) && (
            <div className="p-8 rounded-xl bg-white border border-pub-border text-center max-w-md mx-auto space-y-3">
              <Calendar className="w-8 h-8 text-pub-text-muted mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-pub-text-main">
                Belum ada publikasi berita terbaru yang diterbitkan.
              </p>
              <p className="text-xs text-pub-text-muted">
                Informasi dan pengumuman sekolah akan ditampilkan di sini setelah dirilis secara resmi.
              </p>
              <div className="pt-2">
                <Link
                  href="/berita"
                  className="text-xs font-bold text-pub-navy hover:underline inline-block"
                >
                  Kunjungi Halaman Berita
                </Link>
              </div>
            </div>
          )}

          {/* Kondisi 4: Menampilkan Daftar Berita Nyata */}
          {!isLoadingPosts && !isPostsError && posts && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-pub-border rounded-xl p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-pub-text-muted">
                      {post.category && (
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-pub-navy-subtle text-pub-navy text-[11px]">
                          {post.category.name}
                        </span>
                      )}
                      <span>{formatTanggalIndo(post.published_at || post.created_at)}</span>
                    </div>

                    <h3 className="font-pub-heading font-bold text-base text-pub-navy-deep group-hover:text-pub-navy transition-colors line-clamp-2 leading-snug">
                      <Link href="/berita" className="focus:outline-none focus:underline">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-pub-text-muted line-clamp-3 leading-relaxed">
                      {(post.content || '').replace(/<[^>]+>/g, '').slice(0, 140)}...
                    </p>
                  </div>

                  <div className="pt-3 border-t border-pub-border/60">
                    <Link
                      href="/berita"
                      className="inline-flex items-center gap-1 text-xs font-bold text-pub-navy group-hover:text-pub-gold transition-colors focus:outline-none focus:underline"
                    >
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          6. BANNER CALL TO ACTION PPDB 2026/2027
          ========================================================================= */}
      <section aria-labelledby="ppdb-cta-heading" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-pub-navy-deep via-pub-navy to-pub-navy-deep rounded-2xl p-8 sm:p-12 text-white shadow-xl border border-pub-gold/40 relative overflow-hidden">
            <div className="max-w-3xl space-y-5 relative z-10">
              <span className="inline-block bg-pub-gold text-pub-navy-deep font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                {PPDB_BANNER_CONTENT.badge}
              </span>

              <h2
                id="ppdb-cta-heading"
                className="font-pub-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
              >
                {PPDB_BANNER_CONTENT.title}
              </h2>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-2xl">
                {PPDB_BANNER_CONTENT.description}
                {activeWave && (
                  <span className="block mt-2 font-semibold text-pub-gold-soft">
                    Gelombang aktif saat ini: {activeWave.name}.
                  </span>
                )}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href={PPDB_BANNER_CONTENT.ctaRegister.href}
                  className="bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-sm sm:text-base px-6 py-3 rounded-[10px] shadow-lg transition-all inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
                >
                  <span>{PPDB_BANNER_CONTENT.ctaRegister.label}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href={PPDB_BANNER_CONTENT.ctaInfo.href}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white font-semibold text-sm sm:text-base px-5 py-3 rounded-[10px] transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pub-gold focus:ring-offset-2 focus:ring-offset-pub-navy"
                >
                  <span>{PPDB_BANNER_CONTENT.ctaInfo.label}</span>
                </Link>
                <Link
                  href={PPDB_BANNER_CONTENT.ctaHelp.href}
                  className="text-xs sm:text-sm text-white/80 hover:text-pub-gold-soft transition-colors underline underline-offset-4 focus:outline-none"
                >
                  {PPDB_BANNER_CONTENT.ctaHelp.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. PUSAT LAYANAN & BANTUAN INFORMASI
          ========================================================================= */}
      <section aria-labelledby="contact-heading" className="py-12 bg-pub-bg-app border-t border-pub-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 id="contact-heading" className="font-pub-heading text-lg sm:text-xl font-bold text-pub-navy-deep">
                Butuh Informasi Lebih Lanjut Mengenai Layanan Sekolah?
              </h2>
              <p className="text-xs sm:text-sm text-pub-text-muted">
                Sekretariat SMP Laboratorium siap melayani pertanyaan seputar akademik, perizinan, dan program sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-pub-navy-deep">
              <a
                href={phoneTel}
                className="inline-flex items-center gap-2 hover:text-pub-gold transition-colors font-medium focus:outline-none focus:underline"
              >
                <Phone className="w-4 h-4 text-pub-gold" aria-hidden="true" />
                <span>{phoneDisplay}</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-pub-green transition-colors font-semibold text-pub-green focus:outline-none focus:underline"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp: {waDisplay}</span>
              </a>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-1.5 bg-pub-navy hover:bg-pub-navy-deep text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <span>Lihat Alamat & Lokasi Kampus</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
