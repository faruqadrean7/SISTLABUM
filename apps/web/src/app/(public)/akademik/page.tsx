import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Globe,
  BookCheck,
  HeartHandshake,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Layers,
  GraduationCap,
  Microscope,
  Compass,
  Award,
  Phone,
  Target,
} from 'lucide-react';
import {
  ACADEMIC_HERO,
  ACADEMIC_PROGRAMS,
  LEARNING_APPROACH,
  STUDENT_DEVELOPMENT_AREAS,
} from '@/features/public-site/content/academic';

export const metadata: Metadata = {
  title: 'Program Akademik & Kurikulum',
  description:
    'Informasi kurikulum dan 4 program pendidikan unggulan SMP Laboratorium Universitas Negeri Malang: Program Reguler, Cambridge ICP, Tahfidz Qur\'an, dan Pendidikan Inklusi.',
  openGraph: {
    title: 'Program Akademik & Kurikulum — SMP Laboratorium UM',
    description:
      'Pendidikan holistik berbasis ketuntasan belajar, kurikulum nasional, integrasi internasional Cambridge, pembinaan adab, serta layanan inklusi ramah anak.',
    type: 'website',
  },
};

export default function AcademicPage() {
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
                Akademik &amp; Kurikulum
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>{ACADEMIC_HERO.badge}</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {ACADEMIC_HERO.title}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8">
              {ACADEMIC_HERO.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ppdb"
                className="inline-flex items-center gap-2 bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-semibold text-sm px-5 py-2.5 rounded-[10px] shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>Pendaftaran PPDB 2026/2027</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/profil"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-[10px] border border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <Compass className="w-4 h-4 text-pub-gold-soft" aria-hidden="true" />
                <span>Profil &amp; Visi Sekolah</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 PILIHAN PROGRAM PENDIDIKAN */}
      <section className="py-16 sm:py-20 bg-pub-bg-surface border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-navy-subtle text-pub-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pilihan Jalur Belajar</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              4 Program Pendidikan Unggulan
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-2">
              Dirancang secara terstruktur guna mewadahi keragaman talenta, potensi nalar, dan kebutuhan belajar setiap peserta didik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {ACADEMIC_PROGRAMS.map((program) => (
              <article
                key={program.id}
                className="rounded-2xl border border-pub-border bg-pub-bg-app/50 p-6 sm:p-8 flex flex-col justify-between hover:border-pub-navy/30 transition-all shadow-xs"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-pub-navy bg-pub-navy-subtle px-3 py-1 rounded-full">
                      {program.badge}
                    </span>
                    <span className="text-[0.75rem] font-semibold text-pub-text-muted">
                      {program.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-pub-border flex items-center justify-center text-pub-navy flex-shrink-0 shadow-2xs">
                      {program.id === 'reguler' && <BookOpen className="w-5 h-5 text-pub-navy" aria-hidden="true" />}
                      {program.id === 'icp' && <Globe className="w-5 h-5 text-pub-green" aria-hidden="true" />}
                      {program.id === 'tahfidz' && <BookCheck className="w-5 h-5 text-pub-gold" aria-hidden="true" />}
                      {program.id === 'inklusi' && <HeartHandshake className="w-5 h-5 text-pub-navy" aria-hidden="true" />}
                    </div>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-pub-navy">
                      {program.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-pub-navy-light mb-3">
                    {program.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed mb-6">
                    {program.description}
                  </p>

                  <div className="border-t border-pub-border pt-4 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pub-navy mb-3">
                      Karakteristik Utama Program:
                    </h4>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-pub-text-main">
                      {program.keyFeatures.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-pub-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:px-6 rounded-b-2xl border-t">
                  <div className="flex items-center gap-1.5 text-xs text-pub-text-muted">
                    <Target className="w-4 h-4 text-pub-gold flex-shrink-0" aria-hidden="true" />
                    <span>Fokus: <strong>{program.focusPillars}</strong></span>
                  </div>
                  <Link
                    href="/ppdb"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-pub-navy hover:text-pub-navy-light hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-pub-gold rounded px-1"
                  >
                    <span>Daftar via PPDB</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PENDEKATAN PEMBELAJARAN (LESSON STUDY & MASTERY LEARNING) */}
      <section className="py-16 sm:py-20 bg-pub-bg-app border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-gold-soft text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Microscope className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Metodologi Laboratorium Model</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              Inovasi Pendekatan Pembelajaran
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-3 leading-relaxed">
              Sebagai sekolah laboratorium pendidikan di bawah binaan pakar Universitas Negeri Malang, kami menerapkan metodologi belajar progresif yang memadukan keunggulan sains pedagogi dengan kenyamanan interaksi siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEARNING_APPROACH.map((approach, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-pub-bg-surface border border-pub-border hover:border-pub-navy/30 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pub-navy-subtle flex items-center justify-center text-pub-navy mb-4 shadow-2xs">
                    {idx === 0 && <Microscope className="w-5 h-5 text-pub-navy" aria-hidden="true" />}
                    {idx === 1 && <BookOpen className="w-5 h-5 text-pub-gold" aria-hidden="true" />}
                    {idx === 2 && <Sparkles className="w-5 h-5 text-pub-green" aria-hidden="true" />}
                    {idx === 3 && <HeartHandshake className="w-5 h-5 text-pub-navy" aria-hidden="true" />}
                  </div>
                  <h3 className="font-heading font-bold text-pub-navy text-lg sm:text-xl mb-1">
                    {approach.title}
                  </h3>
                  <p className="text-xs font-semibold text-pub-gold-hover mb-2">
                    {approach.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-pub-text-muted leading-relaxed">
                    {approach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PENGEMBANGAN SISWA: MINAT, BAKAT, & KARAKTER WAJIB */}
      <section className="py-16 sm:py-20 bg-pub-bg-surface border-b border-pub-border">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 bg-pub-navy-subtle text-pub-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pengembangan Holistik</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-pub-navy tracking-tight">
              Pembinaan Karakter, Minat &amp; Bakat
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-2">
              Keseimbangan antara program wajib penempaan budi pekerti berjenjang dengan kebebasan mengeksplorasi potensi diri.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Program Karakter Wajib Berjenjang */}
            <div className="lg:col-span-5 bg-gradient-to-br from-pub-navy-deep via-pub-navy to-[#041a29] text-white p-6 sm:p-8 rounded-2xl shadow-md">
              <span className="bg-pub-gold text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Karakter Wajib Jenjang
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-2">
                Fondasi Kemandirian &amp; Adab
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                Setiap jenjang kelas dibekali program pembentukan karakter esensial yang terintegrasi langsung dalam kegiatan mingguan sekolah:
              </p>

              <div className="space-y-4">
                {STUDENT_DEVELOPMENT_AREAS.mandatoryLevels.map((item, idx) => (
                  <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/15">
                    <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-pub-gold-soft block mb-1">
                      {item.level}
                    </span>
                    <h4 className="font-heading font-bold text-white text-sm sm:text-base mb-1">
                      {item.program}
                    </h4>
                    <p className="text-xs text-white/75 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[0.75rem] text-white/60">
                Wajib diikuti oleh seluruh peserta didik sesuai jenjang kelas masing-masing.
              </div>
            </div>

            {/* Kolom Kanan: 4 Rumpun Eksplorasi Minat & Bakat */}
            <div className="lg:col-span-7 bg-pub-bg-app border border-pub-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-pub-border">
                <div>
                  <span className="bg-pub-green-soft text-pub-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                    Eksplorasi Talenta
                  </span>
                  <h3 className="font-heading text-xl font-bold text-pub-navy">
                    Rumpun Minat &amp; Bakat Siswa
                  </h3>
                </div>
                <span className="text-xs text-pub-text-muted hidden sm:inline-block">
                  Sesuai Minat Pribadi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STUDENT_DEVELOPMENT_AREAS.interestClusters.map((cluster, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-xl bg-white border border-pub-border/70 hover:border-pub-navy/30 transition-all shadow-2xs"
                  >
                    <h4 className="font-heading font-bold text-pub-navy text-sm mb-1">
                      {cluster.name}
                    </h4>
                    <p className="text-xs text-pub-text-muted leading-relaxed">
                      {cluster.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-pub-border/70 text-xs text-pub-text-muted flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0" aria-hidden="true" />
                <span>
                  Pemilihan kegiatan ekstrakurikuler terarah difasilitasi pada awal tahun ajaran baru melalui asesmen minat dan bakat.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION & KONSULTASI AKADEMIK */}
      <section className="py-14 sm:py-18 bg-pub-navy-deep text-white">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-pub-navy via-pub-navy-deep to-[#041a29] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-pub-gold text-pub-navy-deep text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                Penerimaan Peserta Didik Baru
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                Tentukan Program Terbaik untuk Putra-Putri Anda
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Pendaftaran siswa baru tahun ajaran 2026/2027 telah dibuka untuk Program Reguler, Cambridge ICP, Tahfidz Qur&apos;an, dan Inklusi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full sm:w-auto">
              <Link
                href="/ppdb"
                className="w-full sm:w-auto text-center bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pub-navy-deep"
              >
                Daftar Program PPDB
              </Link>
              <Link
                href="/kontak"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 rounded-xl border border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <Phone className="w-4 h-4 text-pub-gold-soft" aria-hidden="true" />
                <span>Konsultasi Akademik</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
