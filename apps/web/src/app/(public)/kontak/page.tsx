'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  CONTACT_HERO,
  VERIFIED_CONTACT_DETAILS,
  OFFICE_HOURS,
  DirectContactChannel,
} from '@/features/public-site/content/contact';
import { CopyContactButton } from '@/features/public-site/components/CopyContactButton';
import { publicApi } from '@/features/public-site/public-api';
import { formatPhoneLink, formatWaLink } from '@/features/public-site/utils';

export default function ContactPage() {
  const { data: siteData } = useQuery({
    queryKey: ['public-site-settings'],
    queryFn: () => publicApi.getPublicSite(),
    staleTime: 5 * 60 * 1000,
  });

  // Derived dynamic contact details with verified fallbacks
  const phoneDisplay = siteData?.contact?.phone || VERIFIED_CONTACT_DETAILS.phone.display;
  const phoneTel = `tel:${formatPhoneLink(phoneDisplay)}`;

  const waDisplay = siteData?.contact?.whatsapp || VERIFIED_CONTACT_DETAILS.whatsapp.display;
  const waUrl = `https://wa.me/${formatWaLink(waDisplay)}`;

  const emailDisplay = siteData?.contact?.email || VERIFIED_CONTACT_DETAILS.email.display;
  const emailMailto = `mailto:${emailDisplay}`;

  const addressFull = siteData?.address?.street
    ? `${siteData.address.street}${siteData.address.city ? ', ' + siteData.address.city : ''}${siteData.address.postal_code ? ' ' + siteData.address.postal_code : ''}`
    : VERIFIED_CONTACT_DETAILS.address.full;

  const schoolName = siteData?.identity?.name || VERIFIED_CONTACT_DETAILS.schoolName;

  const mapsQueryUrl = siteData?.address?.street
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([schoolName, siteData.address.street, siteData.address.city].filter(Boolean).join(' '))}`
    : VERIFIED_CONTACT_DETAILS.address.mapsQueryUrl;

  const mapsEmbedUrl = siteData?.address?.maps_embed_url || VERIFIED_CONTACT_DETAILS.address.mapsEmbedUrl;

  const directChannels: DirectContactChannel[] = [
    {
      id: 'whatsapp-ppdb',
      title: 'Konsultasi PPDB Online',
      subtitle: 'Konsultasi langsung dengan tim admisi seputar jadwal, alur, persyaratan berkas, dan kuota pendaftaran.',
      value: waDisplay,
      displayValue: waDisplay,
      href: waUrl,
      actionLabel: 'Chat WhatsApp PPDB',
      type: 'whatsapp',
      badge: 'Respon Cepat',
    },
    {
      id: 'telepon-kantor',
      title: 'Sekretariat Tata Usaha',
      subtitle: 'Informasi administrasi persuratan, legalisasi dokumen, surat keterangan siswa, dan konfirmasi dinas.',
      value: phoneDisplay,
      displayValue: phoneDisplay,
      href: phoneTel,
      actionLabel: 'Telepon Tata Usaha',
      type: 'phone',
      badge: 'Hari Kerja',
    },
    {
      id: 'email-resmi',
      title: 'Korespondensi & Kemitraan',
      subtitle: 'Pengiriman surat resmi kedinasan, undangan kelembagaan, serta tawaran kerja sama pendidikan.',
      value: emailDisplay,
      displayValue: emailDisplay,
      href: emailMailto,
      actionLabel: 'Kirim Email Resmi',
      type: 'email',
      badge: 'Resmi',
    },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
      {/* 1. HERO SECTION & BREADCRUMB */}
      <section className="bg-gradient-to-r from-pub-navy-deep via-pub-navy to-pub-navy-light text-white py-14 md:py-18 border-b border-pub-navy/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                Kontak
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-pub-gold-soft text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>{CONTACT_HERO.badge}</span>
            </div>
            <h1 className="font-pub-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {CONTACT_HERO.title}
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              {CONTACT_HERO.description}
            </p>
          </div>
        </div>
      </section>

      {/* 2. KANAL KONTAK UTAMA (DIRECT ACTION CARDS) */}
      <section className="py-12 bg-pub-bg-surface border-b border-pub-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-pub-navy bg-pub-navy-subtle px-3 py-1 rounded-full inline-block mb-2">
              Kanal Layanan Cepat
            </span>
            <h2 className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy">
              Saluran Komunikasi Langsung
            </h2>
            <p className="text-pub-text-muted text-sm sm:text-base mt-2 max-w-2xl">
              Pilih kanal resmi di bawah ini untuk terhubung langsung dengan bagian terkait di {schoolName}:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {directChannels.map((channel) => (
              <div
                key={channel.id}
                className="bg-pub-bg-app border border-pub-border rounded-[12px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-[10px] flex items-center justify-center ${
                      channel.type === 'whatsapp'
                        ? 'bg-pub-green-soft text-pub-green'
                        : channel.type === 'phone'
                        ? 'bg-pub-navy-subtle text-pub-navy'
                        : 'bg-pub-gold-subtle text-pub-gold'
                    }`}
                  >
                    {channel.type === 'whatsapp' && (
                      <MessageCircle className="w-6 h-6" aria-hidden="true" />
                    )}
                    {channel.type === 'phone' && (
                      <Phone className="w-6 h-6" aria-hidden="true" />
                    )}
                    {channel.type === 'email' && (
                      <Mail className="w-6 h-6" aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={`text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      channel.type === 'whatsapp'
                        ? 'bg-pub-green-soft text-pub-green'
                        : channel.type === 'phone'
                        ? 'bg-pub-navy-subtle text-pub-navy'
                        : 'bg-pub-gold-subtle text-[#784E07]'
                    }`}
                  >
                    {channel.badge}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-pub-heading font-bold text-lg text-pub-navy mb-1">
                    {channel.title}
                  </h3>
                  <p className="text-pub-text-muted text-xs sm:text-sm leading-relaxed mb-4">
                    {channel.subtitle}
                  </p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-[8px] border border-pub-border">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-pub-text-main select-all">
                      {channel.displayValue}
                    </span>
                    <CopyContactButton
                      textToCopy={channel.value}
                      label={channel.title}
                    />
                  </div>
                </div>

                <div>
                  <a
                    href={channel.href}
                    target={channel.type === 'whatsapp' ? '_blank' : undefined}
                    rel={channel.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
                    className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      channel.type === 'whatsapp'
                        ? 'bg-pub-green hover:bg-[#166037] text-white focus:ring-pub-green'
                        : channel.type === 'phone'
                        ? 'bg-pub-navy hover:bg-pub-navy-light text-white focus:ring-pub-navy'
                        : 'bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep focus:ring-pub-gold'
                    }`}
                  >
                    <span>{channel.actionLabel}</span>
                    {channel.type === 'whatsapp' ? (
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INFORMASI DETAIL SEKRETARIAT & JAM LAYANAN */}
      <section className="py-16 bg-pub-bg-app">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Alamat Fisik & Jam Pelayanan */}
            <div className="lg:col-span-7 space-y-6">
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pub-navy bg-pub-navy-subtle px-3 py-1 rounded-full inline-block mb-2">
                  Sekretariat Sekolah
                </span>
                <h2 className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy">
                  Informasi Alamat &amp; Jam Layanan
                </h2>
                <p className="text-pub-text-muted text-sm sm:text-base mt-2">
                  Layanan administrasi tatap muka dilaksanakan di kantor sekretariat {schoolName}:
                </p>
              </div>

              {/* Kartu Alamat Lengkap */}
              <div className="bg-pub-bg-surface border border-pub-border rounded-[12px] p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[8px] bg-pub-navy-subtle text-pub-navy flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-pub-heading font-bold text-base text-pub-navy mb-1">
                      Alamat Kampus Fisik
                    </h3>
                    <p className="text-pub-text-main text-sm sm:text-base leading-relaxed mb-1 font-medium">
                      {addressFull}
                    </p>
                    <p className="text-pub-text-muted text-xs mb-4">
                      {VERIFIED_CONTACT_DETAILS.address.campusArea}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <CopyContactButton
                        textToCopy={addressFull}
                        label="Alamat Kampus"
                      />
                      <a
                        href={mapsQueryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[6px] bg-pub-navy text-white hover:bg-pub-navy-light transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Buka di Google Maps</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu Jam Pelayanan Tata Usaha */}
              <div className="bg-pub-bg-surface border border-pub-border rounded-[12px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-pub-gold-subtle text-pub-gold flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-pub-heading font-bold text-base text-pub-navy">
                      Jam Operasional Kantor Tata Usaha
                    </h3>
                    <p className="text-pub-text-muted text-xs">
                      Waktu pelayanan administrasi dan loket konsultasi
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-pub-border">
                  {OFFICE_HOURS.map((hour, idx) => (
                    <div key={idx} className="py-3.5 first:pt-1 last:pb-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <span className="font-semibold text-sm text-pub-navy flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
                          {hour.days}
                        </span>
                        <span
                          className={`font-mono text-xs sm:text-sm font-bold px-2 py-0.5 rounded ${
                            hour.isSpecial
                              ? 'bg-pub-gold-subtle text-[#784E07] border border-pub-gold/30'
                              : hour.hours === 'Tutup'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-pub-navy-subtle text-pub-navy'
                          }`}
                        >
                          {hour.hours}
                        </span>
                      </div>
                      <p className="text-pub-text-muted text-xs leading-relaxed">
                        {hour.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Panduan Konsultasi & Kemitraan */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-pub-bg-surface border border-pub-border rounded-[12px] p-6 sm:p-7 shadow-sm border-t-4 border-t-pub-gold">
                <div className="flex items-center gap-2.5 mb-3 text-pub-navy">
                  <Info className="w-5 h-5 text-pub-gold" aria-hidden="true" />
                  <h3 className="font-pub-heading font-bold text-lg text-pub-navy">
                    Panduan Layanan &amp; Konsultasi
                  </h3>
                </div>
                <p className="text-pub-text-muted text-xs sm:text-sm leading-relaxed mb-6">
                  Untuk mempercepat penanganan informasi dan memastikan akurasi data pendaftaran, seluruh konsultasi daring ditangani langsung melalui saluran komunikasi resmi:
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start p-3.5 rounded-[8px] bg-pub-bg-app border border-pub-border">
                    <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-pub-navy mb-0.5">
                        Pertanyaan PPDB &amp; Biaya Pendidikan
                      </h4>
                      <p className="text-pub-text-muted text-xs leading-relaxed">
                        Gunakan WhatsApp Admin di nomor{' '}
                        <strong className="text-pub-text-main font-mono">{waDisplay}</strong> untuk respon cepat seputar jadwal gelombang, persyaratan rapor, dan alur seleksi.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3.5 rounded-[8px] bg-pub-bg-app border border-pub-border">
                    <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-pub-navy mb-0.5">
                        Administrasi &amp; Legalisasi Dokumen
                      </h4>
                      <p className="text-pub-text-muted text-xs leading-relaxed">
                        Hubungi kantor tata usaha di{' '}
                        <strong className="text-pub-text-main font-mono">{phoneDisplay}</strong> pada jam operasional kerja Senin – Jumat untuk koordinasi berkas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3.5 rounded-[8px] bg-pub-bg-app border border-pub-border">
                    <CheckCircle2 className="w-4 h-4 text-pub-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-pub-navy mb-0.5">
                        Undangan Dinas &amp; Kemitraan Kampus
                      </h4>
                      <p className="text-pub-text-muted text-xs leading-relaxed">
                        Surat resmi dan proposal kerja sama dikirimkan ke alamat email resmi{' '}
                        <strong className="text-pub-text-main font-mono">{emailDisplay}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-pub-border">
                  <div className="flex items-center gap-2 text-xs text-pub-text-muted">
                    <Building2 className="w-4 h-4 text-pub-navy flex-shrink-0" aria-hidden="true" />
                    <span>
                      Dikelola oleh <strong>{VERIFIED_CONTACT_DETAILS.affiliation}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Callout Info Media Sosial Resmi */}
              <div className="bg-pub-navy-subtle/70 border border-pub-navy/20 rounded-[12px] p-5">
                <h4 className="font-pub-heading font-bold text-xs uppercase tracking-wider text-pub-navy mb-1.5">
                  Publikasi Resmi &amp; Dokumentasi
                </h4>
                <p className="text-pub-text-muted text-xs leading-relaxed">
                  Seluruh pengumuman resmi, dokumentasi kegiatan, dan prestasi siswa diterbitkan secara berkala melalui halaman{' '}
                  <Link href="/berita" className="text-pub-navy font-semibold hover:underline">
                    Warta &amp; Berita
                  </Link>{' '}
                  serta{' '}
                  <Link href="/galeri" className="text-pub-navy font-semibold hover:underline">
                    Galeri Dokumentasi
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PETA LOKASI KAMPUS (INTERACTIVE MAP) */}
      <section className="py-16 bg-pub-bg-surface border-t border-pub-border" aria-labelledby="map-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pub-navy bg-pub-navy-subtle px-3 py-1 rounded-full inline-block mb-2">
                Peta &amp; Navigasi
              </span>
              <h2 id="map-heading" className="font-pub-heading text-2xl sm:text-3xl font-bold text-pub-navy">
                Lokasi Kampus Sekolah
              </h2>
              <p className="text-pub-text-muted text-sm sm:text-base mt-2 max-w-2xl">
                Terletak di kawasan pendidikan strategis Kota Malang dengan akses mudah di lingkungan kampus Universitas Negeri Malang.
              </p>
            </div>
            <div>
              <a
                href={mapsQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-pub-navy hover:bg-pub-navy-light text-white font-semibold text-sm px-5 py-2.5 rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-pub-gold shadow-sm"
              >
                <span>Petunjuk Arah Google Maps</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Frame Peta */}
          <div className="w-full h-80 sm:h-96 md:h-[450px] bg-slate-100 rounded-[12px] border border-pub-border overflow-hidden shadow-sm relative">
            <iframe
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Peta Lokasi Kampus ${schoolName.includes('UM') ? schoolName : schoolName + ' UM'}`}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-14 sm:py-18 bg-pub-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-pub-gold-soft text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pub-gold" aria-hidden="true" />
              <span>Gerbang Konsultasi Pendidikan</span>
            </div>
            <h2 className="font-pub-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Siap Bergabung dengan {schoolName}?
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Daftarkan putra-putri Anda dalam program penerimaan siswa baru (PPDB) atau pelajari kurikulum unggulan kami.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/ppdb"
                className="inline-flex items-center gap-2 bg-pub-gold hover:bg-pub-gold-hover text-pub-navy-deep font-bold text-sm px-6 py-3 rounded-[10px] shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pub-navy"
              >
                <span>Informasi PPDB Online</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/profil"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-[10px] border border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-pub-gold"
              >
                <span>Lihat Profil Sekolah</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
