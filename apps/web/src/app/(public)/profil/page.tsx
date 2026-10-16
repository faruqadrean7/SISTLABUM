'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Award,
  BookOpen,
  Compass,
  History,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Quote,
} from 'lucide-react';
import {
  PROFILE_HERO,
  PRINCIPAL_STATEMENT,
  LAB_MODEL_ROLE,
  VISION_MISSION,
  SCHOOL_HISTORY,
  SCHOOL_IDENTITY_DETAILS,
} from '@/features/public-site/content/profile';
import { publicApi } from '@/features/public-site/public-api';
import { formatPhoneLink, formatWaLink, getInitials } from '@/features/public-site/utils';

export default function ProfilePage() {
  const { data: siteData } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: () => publicApi.getPublicSite(),
    staleTime: 5 * 60 * 1000,
  });

  // Derived dynamic values with robust verified fallbacks
  const tagline = siteData?.identity?.tagline || PROFILE_HERO.badge;
  const schoolName = siteData?.identity?.name || 'SMP Laboratorium';
  const logoUrl = siteData?.identity?.logo_url || '/images/logo.png';

  const principalName = siteData?.profile?.principal_greeting?.principal_name || PRINCIPAL_STATEMENT.name;
  const principalQuote = siteData?.profile?.principal_greeting?.greeting_text || PRINCIPAL_STATEMENT.quote;
  const principalInitials = getInitials(principalName);
  const principalPhotoUrl = siteData?.profile?.principal_greeting?.principal_photo_url;

  const accreditationGrade = siteData?.profile?.accreditation?.grade;
  const accreditationText = accreditationGrade
    ? `Terakreditasi "${accreditationGrade}" (Unggul)`
    : 'Terakreditasi "A" (Unggul)';

  const phoneDisplay = siteData?.contact?.phone || '(0341) 588550';
  const phoneLink = `tel:${formatPhoneLink(phoneDisplay)}`;

  const waDisplay = siteData?.contact?.whatsapp || '0851-2608-8473';
  const waLink = `https://wa.me/${formatWaLink(waDisplay)}`;

  const emailDisplay = siteData?.contact?.email || 'info@smplab-um.sch.id';
  const emailLink = `mailto:${emailDisplay}`;

  const addressDisplay = siteData?.address?.street
    ? [siteData.address.street, siteData.address.city, siteData.address.postal_code].filter(Boolean).join(', ')
    : 'Jl. Simpang Bogor No. T-7, Sumbersari, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145';

  const identityDetails = [
    { label: 'Nama Resmi', value: schoolName },
    { label: 'Lembaga Pembina', value: 'P2LP Universitas Negeri Malang' },
    { label: 'Status Akreditasi', value: accreditationText },
    { label: 'Tahun Pendirian', value: '1990 (Lebih dari 3 Dekade Mengabdi)' },
    { label: 'Alamat Kampus', value: addressDisplay },
    { label: 'Telepon Kantor', value: phoneDisplay, isLink: true, href: phoneLink },
    { label: 'WhatsApp Layanan', value: waDisplay, isLink: true, href: waLink },
    { label: 'Email Resmi', value: emailDisplay, isLink: true, href: emailLink },
    { label: 'Kepala Sekolah', value: principalName },
    { label: 'Kurikulum', value: 'Kurikulum Merdeka SNP, Cambridge ICP, & Program Adab TaBaQu' },
  ];

  const visionStatement = siteData?.profile?.vision || VISION_MISSION.vision.statement;
  const missionItems = siteData?.profile?.mission && siteData.profile.mission.length > 0
    ? siteData.profile.mission.map((text, idx) => ({ id: idx + 1, text }))
    : VISION_MISSION.mission.items;

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
                Profil Sekolah
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>{tagline}</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {PROFILE_HERO.title}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8">
              {PROFILE_HERO.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ppdb"
                className="inline-flex items-center gap-2 bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-semibold text-sm px-5 py-2.5 rounded-[10px] shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>Pendaftaran Siswa Baru (PPDB)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/akademik"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-[10px] border border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <BookOpen className="w-4 h-4 text-pub-gold-soft" aria-hidden="true" />
                <span>Program &amp; Kurikulum</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IDENTITAS & SAMBUTAN KEPALA SEKOLAH */}
      <section className="py-14 sm:py-20 bg-pub-bg-surface border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Kolom Kiri: Sambutan Resmi Kepala Sekolah */}
            <article className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-pub-navy-subtle text-pub-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                  <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{PRINCIPAL_STATEMENT.badge}</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-pub-navy tracking-tight leading-tight mb-4">
                  {PRINCIPAL_STATEMENT.title}
                </h2>

                <div className="space-y-4 text-pub-text-muted text-sm sm:text-base leading-relaxed mb-6">
                  {PRINCIPAL_STATEMENT.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Highlight Quote */}
                <div className="bg-pub-gold-subtle border-l-4 border-pub-gold p-4 sm:p-5 rounded-r-xl my-6">
                  <div className="flex items-start gap-3">
                    <Quote className="w-6 h-6 text-pub-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="font-heading italic text-pub-navy-deep font-semibold text-sm sm:text-base leading-relaxed">
                      &ldquo;{principalQuote}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Atribusi Pimpinan */}
              <div className="pt-4 border-t border-pub-border flex items-center gap-4">
                {principalPhotoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={principalPhotoUrl}
                    alt={`Foto ${principalName}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-pub-gold flex-shrink-0"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full bg-pub-navy text-pub-gold font-heading font-bold text-lg flex items-center justify-center flex-shrink-0 border-2 border-pub-gold"
                  >
                    {principalInitials}
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-pub-navy text-base">
                    {principalName}
                  </h3>
                  <p className="text-xs text-pub-text-muted">{PRINCIPAL_STATEMENT.role}</p>
                </div>
              </div>
            </article>

            {/* Kolom Kanan: Kartu Profil & Identitas Resmi */}
            <aside aria-label="Informasi Pokok Institusi" className="lg:col-span-5 bg-pub-bg-app border border-pub-border rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-4 pb-5 border-b border-pub-border">
                <div className="w-14 h-14 relative flex-shrink-0 bg-white p-2 rounded-xl shadow-xs border border-pub-border flex items-center justify-center">
                  <Image
                    src={logoUrl}
                    alt={`Logo ${schoolName}`}
                    width={48}
                    height={48}
                    className="w-11 h-11 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-pub-navy text-lg leading-tight">
                    {schoolName}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-pub-green bg-pub-green-soft/50 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Terakreditasi &ldquo;{accreditationGrade || 'A'}&rdquo; (Unggul)
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-3.5 text-xs sm:text-sm">
                {identityDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-pub-border/70 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-pub-text-muted font-medium flex-shrink-0 sm:w-36">
                      {detail.label}
                    </dt>
                    <dd className="font-semibold text-pub-navy sm:text-right">
                      {detail.isLink && detail.href ? (
                        <a
                          href={detail.href}
                          className="text-pub-navy hover:text-pub-navy-light underline decoration-pub-gold underline-offset-4 focus:outline-none focus:ring-2 focus:ring-pub-gold rounded px-1"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* 3. VISI & MISI SEKOLAH */}
      <section className="py-16 sm:py-20 bg-pub-bg-app border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Pedoman Mutu &amp; Nilai Dasar</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              Visi &amp; Misi Sekolah
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-2">
              Landasan filosofis, komitmen karakter, dan langkah nyata mencetak generasi pembelajar unggul.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Visi Sekolah */}
            <div className="lg:col-span-5 bg-pub-bg-surface border border-pub-border rounded-2xl p-6 sm:p-8 border-t-4 border-t-pub-gold shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-xl bg-pub-gold-soft text-pub-navy-deep font-heading font-extrabold flex items-center justify-center text-lg shadow-xs"
                  >
                    V
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-pub-navy">
                      {VISION_MISSION.vision.title}
                    </h3>
                    <p className="text-xs text-pub-text-muted">{VISION_MISSION.vision.subtitle}</p>
                  </div>
                </div>

                <div className="bg-pub-gold-subtle border-l-4 border-pub-gold p-5 rounded-r-xl my-4">
                  <p className="font-heading font-bold italic text-pub-navy text-base sm:text-lg leading-relaxed">
                    &ldquo;{visionStatement}&rdquo;
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed mt-4">
                  {VISION_MISSION.vision.explanation}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-pub-border text-xs text-pub-text-muted font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0" aria-hidden="true" />
                <span>{VISION_MISSION.vision.authority}</span>
              </div>
            </div>

            {/* Misi Sekolah */}
            <div className="lg:col-span-7 bg-pub-bg-surface border border-pub-border rounded-2xl p-6 sm:p-8 border-t-4 border-t-pub-navy shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-xl bg-pub-navy-subtle text-pub-navy font-heading font-extrabold flex items-center justify-center text-lg shadow-xs"
                  >
                    M
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-pub-navy">
                      {VISION_MISSION.mission.title}
                    </h3>
                    <p className="text-xs text-pub-text-muted">{VISION_MISSION.mission.subtitle}</p>
                  </div>
                </div>

                <ol className="space-y-3 mt-4" aria-label="Daftar Misi Sekolah">
                  {missionItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-pub-bg-app/60 border border-pub-border/50 hover:bg-pub-navy-subtle/40 transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="w-6 h-6 rounded-full bg-pub-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        {item.id}
                      </span>
                      <p className="text-xs sm:text-sm text-pub-text-main leading-relaxed">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-pub-border flex flex-wrap gap-2 text-xs">
                <span className="bg-pub-navy-subtle text-pub-navy font-semibold px-2.5 py-1 rounded-md">
                  Pembelajaran Universal
                </span>
                <span className="bg-pub-gold-soft text-pub-navy-deep font-semibold px-2.5 py-1 rounded-md">
                  Iptek &amp; Seni
                </span>
                <span className="bg-pub-green-soft text-pub-green font-semibold px-2.5 py-1 rounded-md">
                  Budaya Lingkungan 3R
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERAN SEBAGAI LABORATORIUM PENDIDIKAN UM */}
      <section className="py-16 sm:py-20 bg-pub-bg-surface border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-navy-subtle text-pub-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{LAB_MODEL_ROLE.badge}</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              {LAB_MODEL_ROLE.title}
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-3 leading-relaxed">
              {LAB_MODEL_ROLE.lead}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LAB_MODEL_ROLE.points.map((point, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-pub-bg-app border border-pub-border hover:border-pub-navy/30 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-pub-border flex items-center justify-center text-pub-navy mb-4 shadow-2xs">
                    {idx === 0 && <Sparkles className="w-5 h-5 text-pub-gold" aria-hidden="true" />}
                    {idx === 1 && <GraduationCap className="w-5 h-5 text-pub-navy" aria-hidden="true" />}
                    {idx === 2 && <BookOpen className="w-5 h-5 text-pub-green" aria-hidden="true" />}
                    {idx === 3 && <HeartHandshake className="w-5 h-5 text-pub-gold" aria-hidden="true" />}
                  </div>
                  <h3 className="font-heading font-bold text-pub-navy text-lg mb-2">
                    {point.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEJARAH & TRANSFORMASI SEKOLAH */}
      <section className="py-16 sm:py-20 bg-pub-bg-app border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Rekam Jejak Historis</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              Sejarah Perkembangan Sekolah
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-3 leading-relaxed">
              Perjalanan dedikasi SMP Laboratorium mendidik tunas bangsa sejak awal pendirian hingga era keunggulan digital dan berwawasan global.
            </p>
          </div>

          <div className="relative border-l-2 border-pub-border ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-10">
            {SCHOOL_HISTORY.map((item, idx) => (
              <div key={idx} className="relative group">
                <div
                  aria-hidden="true"
                  className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-pub-navy group-hover:border-pub-gold transition-colors"
                />
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-pub-navy text-white mb-2 shadow-2xs">
                  {item.period}
                </span>
                <h3 className="font-heading font-bold text-pub-navy text-lg sm:text-xl mb-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed max-w-3xl">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION PENDAFTARAN & KONTAK */}
      <section className="py-14 sm:py-18 bg-pub-navy text-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-pub-gold-soft text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Gerbang Masa Depan Gemilang</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Bergabung Bersama Keluarga Besar SMP Laboratorium UM
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Wujudkan potensi terbaik putra-putri Anda melalui ekosistem pendidikan berkarakter, berstandar unggul, dan didukung penuh oleh para pakar pendidikan Universitas Negeri Malang.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/ppdb"
                className="inline-flex items-center gap-2 bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-sm px-6 py-3 rounded-[10px] shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>Daftar Siswa Baru Sekarang</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-[10px] border border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <Phone className="w-4 h-4 text-pub-gold-soft" aria-hidden="true" />
                <span>Hubungi Kami</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
