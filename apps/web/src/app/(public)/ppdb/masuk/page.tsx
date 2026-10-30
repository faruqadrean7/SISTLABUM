'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ppdbApi } from '@/features/ppdb/ppdb-api';
import { tokenStorage } from '@/lib/auth/token-storage';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  UserCheck,
  HelpCircle,
  ExternalLink,
  Eye,
  EyeOff,
  MessageCircle,
  FileText,
  CheckCircle2,
  School,
  KeyRound,
} from 'lucide-react';

export default function PPDBLoginPage() {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Periksa apakah pengguna dialihkan karena sesi berakhir
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('session_expired') === '1') {
        setSessionExpiredNotice(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Nomor registrasi, email, atau nomor HP wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ppdbApi.login({
        identifier: identifier.trim(),
        password,
      });

      // Simpan token via tokenStorage & legacy localStorage
      if (res.accessToken) {
        tokenStorage.setTokens(res.accessToken);
        if (res.user) {
          tokenStorage.setUser(res.user as any);
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', res.accessToken);
          localStorage.setItem('user_role', 'guest');
        }
      }

      // Redirect ke dashboard
      router.push('/ppdb/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Gagal masuk. Periksa kembali nomor registrasi/email dan kata sandi Anda.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none bg-white">
      {/* =========================================================================
          1. BREADCRUMB NAVIGASI MINIMALIS (BERSIH DENGAN LATAR PUTIH)
          ========================================================================= */}
      <div className="bg-white border-b border-gray-100 py-3 w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <nav aria-label="Navigasi Halaman">
            <ol className="flex items-center gap-2 text-xs text-gray-500">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#062940] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C89332] rounded"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                /
              </li>
              <li>
                <Link
                  href="/ppdb"
                  className="hover:text-[#062940] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C89332] rounded"
                >
                  PPDB Online
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                /
              </li>
              <li aria-current="page" className="font-semibold text-[#062940]">
                Masuk Pendaftar
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* =========================================================================
          2. KONTEN UTAMA: INFO/PETUNJUK (KIRI) vs. FORMULIR MASUK (KANAN)
          Didesain berbeda: Kiri bernuansa informatif/panduan, Kanan berupa
          kartu putih elevated dengan aksen border penegas sebagai pusat aksi.
          ========================================================================= */}
      <section aria-label="Area Masuk Portal Pendaftar" className="py-8 sm:py-12 w-full flex-1 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ===================================================================
                KOLOM KIRI: INFO & PETUNJUK (Span 5 / 12)
                Menggunakan latar lembut #F8FAFC agar terlihat beda dengan form
                =================================================================== */}
            <div className="lg:col-span-5 space-y-5">
              {/* Kartu 1: Fasilitas Dashboard Pendaftar */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0A3D62] flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5 text-[#0A3D62]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-pub-heading font-bold text-base text-[#062940]">
                      Fasilitas Dashboard Pendaftar
                    </h2>
                    <p className="text-gray-500 text-xs">Akses personal untuk calon murid baru</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1E7A46] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="text-gray-800 block">Lengkapi Formulir 5 Langkah</strong>
                      <span className="text-gray-500 leading-relaxed">
                        Data diri, orang tua/wali, sekolah asal, peminatan jalur, dan unggah berkas.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1E7A46] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="text-gray-800 block">Pantau Validasi &amp; Catatan Revisi</strong>
                      <span className="text-gray-500 leading-relaxed">
                        Lihat status pemeriksaan berkas secara transparan oleh tim verifikator panitia.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1E7A46] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="text-gray-800 block">Cetak Kartu Tanda Peserta PPDB</strong>
                      <span className="text-gray-500 leading-relaxed">
                        Unduh dokumen resmi kartu peserta lengkap dengan kode QR verifikasi keabsahan.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu 2: Belum Terdaftar? */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#062940]">Belum Terdaftar?</span>
                  <span className="text-[11px] font-semibold text-[#1E7A46] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                    PPDB 2026/2027
                  </span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Jika Anda belum pernah membuat akun pendaftar, silakan lakukan registrasi akun terlebih dahulu untuk mendapatkan nomor registrasi resmi.
                </p>
                <Link
                  href="/ppdb/daftar"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#062940] hover:bg-[#0A3D62] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-2xs"
                >
                  <span>Daftar Akun Calon Siswa Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* Kartu 3: Catatan Pembeda Portal Sekolah (/masuk) */}
              <div className="bg-[#F0F5FA] border border-[#D0E2ED] rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-[#0A3D62]">
                  <School className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <h3 className="font-bold text-xs">Bukan Calon Siswa Baru?</h3>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Bagi <strong>Siswa Aktif</strong>, <strong>Guru &amp; Staf</strong>, atau <strong>Orang Tua Murid Terdaftar</strong>, silakan masuk melalui pintu portal akademik sekolah (SISTLABUM):
                </p>
                <Link
                  href="/masuk"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3D62] hover:text-[#C89332] hover:underline"
                >
                  <span>Masuk ke Portal Akademik Sekolah (/masuk)</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* ===================================================================
                KOLOM KANAN: KARTU FORMULIR MASUK (Span 7 / 12)
                Pusat aksi utama: elevated crisp white card dengan aksen border-t-4 navy,
                bayangan terangkat (shadow-xl), dan heading utama di dalamnya.
                =================================================================== */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
              {/* Header Kartu Form */}
              <div className="mb-6 pb-5 border-b border-gray-100">
                {/* <div className="inline-flex items-center gap-1.5 bg-[#EBF3F8] text-[#0A3D62] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  <KeyRound className="w-3.5 h-3.5 text-[#C89332]" aria-hidden="true" />
                  <span>Otorisasi Akses Pendaftar</span>
                </div> */}
                <h1 className="font-pub-heading text-2xl sm:text-3xl font-bold text-[#062940] tracking-tight leading-tight">
                  Masuk ke Dashboard Calon Siswa
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Masukkan salah satu identitas pendaftaran Anda beserta kata sandi yang telah dibuat.
                </p>
              </div>

              {/* Alert Pemberitahuan Sesi Kedaluwarsa */}
              {sessionExpiredNotice && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-900 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <strong className="block font-semibold">Sesi Anda Telah Berakhir</strong>
                    <span className="mt-0.5 block text-xs text-amber-800 leading-relaxed">
                      Sesi masuk akun calon siswa telah kedaluwarsa demi keamanan. Silakan masukkan nomor registrasi/email dan kata sandi Anda kembali.
                    </span>
                  </div>
                </div>
              )}

              {/* Alert Pesan Kesalahan */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-800 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <strong className="block font-semibold">Gagal Masuk:</strong>
                    <span className="mt-0.5 block text-xs text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier: Email / No HP / No Registrasi */}
                <div>
                  <label htmlFor="identifier" className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor Registrasi / Email / No. WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      placeholder="Contoh: REG-202610-0012 atau email@anda.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:border-transparent bg-white shadow-2xs transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Gunakan nomor registrasi resmi yang tertera pada bukti pendaftaran, alamat email, atau nomor HP.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700">
                      Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <a
                      href="https://wa.me/6285126088473?text=Halo%20Panitia%20PPDB,%20saya%20butuh%20bantuan%20reset%20kata%20sandi%20akun%20pendaftar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0A3D62] hover:text-[#C89332] font-semibold transition-colors focus:outline-none"
                    >
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi akun Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:border-transparent bg-white shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Ketentuan Keamanan */}
                <div className="p-3.5 rounded-xl bg-[#EBF3F8]/70 border border-[#D0E2ED] text-xs text-gray-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0A3D62] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed">
                    Koneksi terenkripsi aman SSL 256-bit melindungi seluruh berkas dan data privasi calon siswa.
                  </span>
                </div>

                {/* Tombol Submit Masuk */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#C89332] hover:bg-[#B57C23] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C89332] focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Akun Pendaftar...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Pendaftar</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Opsi Navigasi Tambahan */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-center">
                <p className="text-xs text-gray-600">
                  Belum memiliki akun calon siswa?{' '}
                  <Link href="/ppdb/daftar" className="text-[#062940] font-bold hover:text-[#C89332] transition-colors">
                    Daftar Akun Baru Sekarang &rarr;
                  </Link>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 pt-1">
                  <Link href="/ppdb#cek-status" className="hover:text-[#062940] hover:underline">
                    Cek Pengumuman Tanpa Login
                  </Link>
                  <span>•</span>
                  <a
                    href="https://wa.me/6285126088473"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#1E7A46] hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Bantuan WhatsApp Panitia</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
