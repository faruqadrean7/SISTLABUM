import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';
import {
  SCHOOL_CONTACT_INFO,
  FOOTER_QUICK_LINKS,
  FOOTER_PORTAL_LINKS,
} from '@/features/public-site/content/navigation';

export function PublicFooter() {
  return (
    <footer className="bg-pub-navy-deep text-white/80 pt-16 border-t-4 border-pub-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
          {/* Kolom 1: Identitas Institusi */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo SMP Laboratorium"
                width={44}
                height={44}
                className="w-11 h-11 object-contain flex-shrink-0 drop-shadow"
              />
              <div className="flex flex-col">
                <span className="font-pub-heading font-bold text-white text-base leading-tight">
                  {SCHOOL_CONTACT_INFO.schoolName}
                </span>
                <span className="text-[0.7rem] text-pub-gold-soft tracking-wider">
                  {SCHOOL_CONTACT_INFO.affiliation}
                </span>
              </div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              Sekolah Menengah Pertama Laboratorium di bawah naungan P2LP Universitas Negeri Malang.
              Membina generasi unggul berkarakter cerdas, religius, dan berwawasan masa depan.
            </p>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h3 className="font-pub-heading text-lg font-bold text-white mb-4 pb-2 border-b-2 border-pub-gold/60 inline-block">
              Tautan Cepat
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-pub-gold transition-colors text-white/80 focus:outline-none focus:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Akses Portal */}
          <div>
            <h3 className="font-pub-heading text-lg font-bold text-white mb-4 pb-2 border-b-2 border-pub-gold/60 inline-block">
              Akses Portal
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {FOOTER_PORTAL_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-pub-gold transition-colors text-white/80 focus:outline-none focus:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Hubungi Kami */}
          <div>
            <h3 className="font-pub-heading text-lg font-bold text-white mb-4 pb-2 border-b-2 border-pub-gold/60 inline-block">
              Hubungi Kami
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-pub-gold flex-shrink-0 mt-1" aria-hidden="true" />
                <span className="text-white/80 leading-relaxed">
                  {SCHOOL_CONTACT_INFO.address}
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-4 h-4 text-pub-gold flex-shrink-0" aria-hidden="true" />
                <a
                  href={SCHOOL_CONTACT_INFO.phone.tel}
                  className="hover:text-pub-gold transition-colors text-white/80 focus:outline-none focus:underline"
                >
                  Telepon: {SCHOOL_CONTACT_INFO.phone.display}
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-4 h-4 text-pub-green flex-shrink-0" aria-hidden="true" />
                <a
                  href={SCHOOL_CONTACT_INFO.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pub-green-soft transition-colors text-white/80 focus:outline-none focus:underline"
                >
                  WhatsApp: {SCHOOL_CONTACT_INFO.whatsapp.display}
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-4 h-4 text-pub-gold flex-shrink-0" aria-hidden="true" />
                <a
                  href={SCHOOL_CONTACT_INFO.email.mailto}
                  className="hover:text-pub-gold transition-colors text-white/80 focus:outline-none focus:underline"
                >
                  {SCHOOL_CONTACT_INFO.email.display}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Hak Cipta */}
        <div className="border-t border-white/10 py-6 text-xs text-white/60 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>{SCHOOL_CONTACT_INFO.copyright}</div>
          <div>{SCHOOL_CONTACT_INFO.affiliation}</div>
        </div>
      </div>
    </footer>
  );
}
