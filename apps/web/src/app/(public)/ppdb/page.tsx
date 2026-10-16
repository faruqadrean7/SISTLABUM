'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ppdbApi } from '@/features/ppdb/ppdb-api';
import { PPDBWaveItem, PPDBTrackItem, PPDBPublicResult } from '@/types/ppdb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatTanggalIndo } from '@/lib/utils';
import {
  School,
  GraduationCap,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  FileText,
  Award,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Phone,
  MapPin,
  Loader2,
  Check,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function PublicPPDBPage() {
  // Query Active Wave
  const {
    data: activeWave,
    isLoading: isLoadingWave,
  } = useQuery<PPDBWaveItem | null>({
    queryKey: ['ppdb-public-active-wave'],
    queryFn: () => ppdbApi.getActiveWave(),
  });

  // Query Tracks for active wave or all public tracks
  const { data: tracks = [], isLoading: isLoadingTracks } = useQuery<PPDBTrackItem[]>({
    queryKey: ['ppdb-public-tracks', activeWave?.id],
    queryFn: () => ppdbApi.listPublicTracks(activeWave?.id),
    enabled: true,
  });

  // State Cek Status Seleksi
  const [searchRegNo, setSearchRegNo] = useState('');
  const [searchBirthDate, setSearchBirthDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<PPDBPublicResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError(null);
    setCheckResult(null);

    const regNo = searchRegNo.trim();
    const birthDate = searchBirthDate.trim();

    if (!regNo) {
      setCheckError('Nomor pendaftaran wajib diisi.');
      return;
    }

    if (!birthDate) {
      setCheckError('Tanggal lahir calon siswa wajib diisi.');
      return;
    }

    setIsChecking(true);
    try {
      const result = await ppdbApi.checkPublicResult({
        registration_no: regNo,
        birth_date: birthDate,
      });
      setCheckResult(result);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Pengecekan gagal. Periksa kembali nomor pendaftaran dan tanggal lahir Anda.';
      setCheckError(msg);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-100 selection:text-blue-900">
      {/* Bar Navigasi Seksi SPMB */}
      <nav aria-label="Navigasi Halaman PPDB" className="bg-slate-900 text-white shadow-md border-b border-slate-800 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <School className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-base text-white leading-tight">
                SMP Laboratorium UM
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                P2LP Universitas Negeri Malang
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
            <a href="#info-gelombang" className="hover:text-white transition-colors">
              Gelombang & Kuota
            </a>
            <a href="#jalur-seleksi" className="hover:text-white transition-colors">
              Jalur Pendaftaran
            </a>
            <a href="#alur-pendaftaran" className="hover:text-white transition-colors">
              Alur SPMB
            </a>
            <a href="#cek-status" className="hover:text-amber-400 transition-colors">
              Cek Pengumuman
            </a>
            <a href="#kontak-panitia" className="hover:text-white transition-colors">
              Kontak Panitia
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/ppdb/masuk">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                <span>Masuk Pendaftar</span>
              </Button>
            </Link>
            <Link href="/ppdb/daftar">
              <Button size="sm" className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
                Daftar Baru
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner SPMB */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 space-y-5">
          <div className="inline-flex items-center gap-2 bg-amber-400/90 text-slate-950 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tahun Ajaran 2026/2027</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Sistem Penerimaan Murid Baru (SPMB / PPDB) <br />
            <span className="text-blue-400">SMP Laboratorium UM</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Membentuk generasi pembelajar yang berkarakter, beradab, kreatif, dan berprestasi di bawah binaan langsung Pusat Pengembangan Laboratorium Pendidikan (P2LP) Universitas Negeri Malang.
          </p>

          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link href="/ppdb/daftar">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 shadow-md">
                <span>Daftar Akun Calon Siswa</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/ppdb/masuk">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm px-5 py-2.5"
              >
                <Users className="h-4 w-4 mr-1.5" />
                <span>Masuk Portal Pendaftar</span>
              </Button>
            </Link>
            <a href="#cek-status">
              <Button
                variant="outline"
                className="bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border-blue-400/30 text-xs sm:text-sm px-4 py-2.5"
              >
                <Search className="h-4 w-4 mr-1.5" />
                <span>Cek Hasil Mandiri</span>
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 space-y-16">
        {/* SECTION 1: STATUS GELOMBANG AKTIF */}
        <section id="info-gelombang" className="scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Jadwal & Periode Seleksi
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Gelombang Pendaftaran Aktif
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pastikan Anda mencermati jadwal penting agar tidak melewati batas verifikasi dan daftar ulang.
            </p>
          </div>

          {isLoadingWave ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-xs">Memuat informasi gelombang aktif...</span>
            </div>
          ) : activeWave ? (
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{activeWave.name}</h3>
                    <Badge variant="success" className="text-xs">
                      Pendaftaran Sedang Dibuka
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan lengkapi formulir pendaftaran dan unggah seluruh berkas persyaratan sebelum batas akhir.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href="#alur-pendaftaran">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Panduan Formulir SPMB</span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Grid 3 Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold">
                    <Calendar className="h-4 w-4" />
                    <span>Masa Pendaftaran</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {formatTanggalIndo(activeWave.open_at)} s/d {formatTanggalIndo(activeWave.close_at)}
                  </div>
                  <span className="text-[11px] text-slate-400 block">Pengisian data & upload berkas</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
                    <Sparkles className="h-4 w-4" />
                    <span>Pengumuman Kelulusan</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {formatTanggalIndo(activeWave.result_publish_at)}
                  </div>
                  <span className="text-[11px] text-slate-400 block">Diumumkan online via portal SPMB</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Daftar Ulang Siswa</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    H+3 s/d H+7 Pengumuman
                  </div>
                  <span className="text-[11px] text-slate-400 block">Verifikasi fisik & seragam</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Pendaftaran Gelombang Sedang Ditutup</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Saat ini pendaftaran gelombang PPDB sedang tidak aktif atau menunggu jadwal pembukaan gelombang berikutnya. Anda tetap dapat melakukan pengecekan pengumuman hasil seleksi di bawah.
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: CEK STATUS & PENGUMUMAN SELEKSI ONLINE */}
        <section id="cek-status" className="scroll-mt-20">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/60 p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase">
                <Search className="h-3.5 w-3.5" />
                <span>Portal Resmi Pengumuman Hasil Seleksi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Cek Status Kelulusan SPMB Online 🔍
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Masukkan Nomor Pendaftaran resmi dan Tanggal Lahir calon siswa yang terdaftar saat pengisian formulir.
              </p>
            </div>

            {/* Form Input */}
            <form onSubmit={handleCheckResult} className="max-w-xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Pendaftaran <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: REG-202610-0012"
                    value={searchRegNo}
                    onChange={(e) => setSearchRegNo(e.target.value)}
                    disabled={isChecking}
                    required
                    className="bg-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tanggal Lahir Calon Siswa <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={searchBirthDate}
                    onChange={(e) => setSearchBirthDate(e.target.value)}
                    disabled={isChecking}
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              {checkError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{checkError}</span>
                </div>
              )}

              <div className="text-center pt-2">
                <Button
                  type="submit"
                  disabled={isChecking}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-8 py-2.5 shadow-sm gap-2 w-full sm:w-auto"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memeriksa Database Pengumuman...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Cari & Periksa Status Seleksi</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* HASIL PENGECEKAN STATUS */}
            {checkResult && (
              <div className="mt-8 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                {checkResult.decision === 'diterima' ? (
                  <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-6 text-slate-900 shadow-md space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-emerald-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div>
                        <Badge variant="success" className="text-[11px] mb-1">
                          SELAMAT! ANDA DITERIMA
                        </Badge>
                        <h3 className="text-lg font-extrabold text-emerald-950">
                          {checkResult.full_name}
                        </h3>
                        <p className="text-xs text-emerald-800 font-mono">
                          No. Pendaftaran: {checkResult.registration_no}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Jalur Diterima:</span>
                        <span className="font-bold text-slate-800">
                          {checkResult.track_name || checkResult.track_code || 'Jalur Reguler'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Peringkat / Skor:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          Peringkat #{checkResult.rank || '-'} (Skor: {checkResult.score || '-'})
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
                      <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Petunjuk Langkah Daftar Ulang:</span>
                      </h4>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {checkResult.instruction}
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 pt-1">
                        <li>Membawa cetak formulir pendaftaran resmi</li>
                        <li>Membawa fotokopi & asli Kartu Keluarga (KK) serta Akta Kelahiran</li>
                        <li>Fotokopi Rapor SD/MI legalisir dan surat keterangan lulus</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-emerald-700 italic">
                        SMP Laboratorium Universitas Negeri Malang
                      </span>
                      <Button
                        size="sm"
                        onClick={() => window.print()}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Cetak Bukti Kelulusan</span>
                      </Button>
                    </div>
                  </div>
                ) : checkResult.decision === 'cadangan' ? (
                  <div className="rounded-2xl border-2 border-amber-500 bg-amber-50/90 p-6 text-slate-900 shadow-md space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-amber-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                        <AlertTriangle className="h-7 w-7" />
                      </div>
                      <div>
                        <Badge variant="warning" className="text-[11px] mb-1">
                          STATUS: CADANGAN (WAITLIST)
                        </Badge>
                        <h3 className="text-lg font-extrabold text-amber-950">
                          {checkResult.full_name}
                        </h3>
                        <p className="text-xs text-amber-800 font-mono">
                          No. Pendaftaran: {checkResult.registration_no}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                      <h4 className="font-bold text-amber-900">Pemberitahuan Status Cadangan:</h4>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {checkResult.instruction}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-900 shadow-md space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                        <XCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[11px] mb-1">
                          BELUM LOLOS SELEKSI
                        </Badge>
                        <h3 className="text-lg font-extrabold text-slate-800">
                          {checkResult.full_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          No. Pendaftaran: {checkResult.registration_no}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {checkResult.instruction}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: 4 PILIHAN JALUR PENDAFTARAN */}
        <section id="jalur-seleksi" className="scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Program Penerimaan Siswa
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Jalur Pendaftaran SPMB
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih jalur yang sesuai dengan kualifikasi, bakat, dan prestasi calon murid baru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Jalur 1: Reguler */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">1. Jalur Reguler</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seleksi berbasis penilaian nilai rapor SD/MI semester 7-11 serta tes pemetaan kemampuan skolastik & wawancara minat.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>• Kuota: <strong>60% Total Rombel</strong></div>
                <div>• Bebas biaya SPP pendaftar awal</div>
              </div>
            </div>

            {/* Jalur 2: Prestasi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-amber-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">2. Jalur Prestasi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bagi peraih juara kejuaraan akademik (OSN, Matematika/IPA) maupun non-akademik (FLS2N, O2SN, Olahraga & Seni).
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>• Sertifikat min. Tk. Kota/Kabupaten</div>
                <div>• Bebas tes tulis akademik</div>
              </div>
            </div>

            {/* Jalur 3: Afirmasi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-teal-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">3. Jalur Afirmasi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Komitmen pemerataan kesempatan pendidikan bagi calon siswa pemegang KIP / PKH / DTKS dari keluarga prasejahtera.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>• Melampirkan kartu KIP / KKS aktif</div>
                <div>• Bantuan subsidi pembiayaan</div>
              </div>
            </div>

            {/* Jalur 4: Tahfidz */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 transition-all space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">4. Jalur Tahfidz</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jalur khusus calon santri/siswa penghafal Al-Qur&apos;an minimal 2 Juz mutqin dengan sertifikat syahadah resmi.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>• Tes tasmi&apos; hafalan langsung</div>
                <div>• Beasiswa pembinaan tahfidz</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: 5 LANGKAH ALUR PENDAFTARAN */}
        <section id="alur-pendaftaran" className="scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Panduan Praktis
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              5 Langkah Mudah Alur Pendaftaran SPMB
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh proses pendaftaran dilakukan secara online transparan dan akuntabel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                title: 'Buat Akun',
                desc: 'Registrasi data email/WhatsApp dan peroleh kode verifikasi OTP.',
              },
              {
                step: '02',
                title: 'Isi Biodata',
                desc: 'Lengkapi identitas calon murid, NIK, NISN, dan data orang tua/wali.',
              },
              {
                step: '03',
                title: 'Unggah Berkas',
                desc: 'Upload scan rapor, kartu keluarga, akta lahir, dan piagam prestasi.',
              },
              {
                step: '04',
                title: 'Verifikasi',
                desc: 'Panitia sekolah memeriksa keabsahan berkas (cek status berkala).',
              },
              {
                step: '05',
                title: 'Daftar Ulang',
                desc: 'Cetak surat kelulusan dan konfirmasi daftar ulang resmi di sekolah.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-center"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-mono font-bold text-xs">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: KONTAK & BANTUAN PANITIA */}
        <section id="kontak-panitia" className="scroll-mt-20">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">Butuh Informasi Lebih Lanjut Mengenai SPMB?</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Sekretariat panitia SPMB SMP Laboratorium Universitas Negeri Malang siap melayani pertanyaan seputar pendaftaran, jadwal seleksi, dan beasiswa.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Jl. Simpang Bogor No. 7 Kota Malang
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Senin - Jumat, 08.00 - 15.00 WIB
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  WhatsApp: (0341) 551312
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2">
              <a href="https://wa.me/62341551312" target="_blank" rel="noopener noreferrer">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Chat WhatsApp Panitia</span>
                </Button>
              </a>
              <Link href="/masuk">
                <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800 text-xs">
                  Masuk Portal Sekolah
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
