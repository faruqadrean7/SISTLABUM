"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Calendar,
  HelpCircle,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Bell,
  Building,
  School,
  ExternalLink,
} from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<"tendik" | "siswa" | "admin">("admin");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } catch {
      // Error handled via toast in auth-context
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickPreset = (userVal: string, passVal: string) => {
    setIdentifier(userVal);
    setPassword(passVal);
  };

  const getPlaceholder = () => {
    switch (selectedRoleTab) {
      case "tendik":
        return "Masukkan NIP, NUPTK, atau Email Resmi";
      case "siswa":
        return "Masukkan NISN atau Nomor Induk Siswa";
      case "admin":
      default:
        return "Masukkan Username atau Email Administrator";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Bar: Identitas Kementerian / Universitas Negeri Malang */}
      <header className="w-full bg-[#0b3a75] text-white border-b border-[#082b57] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-200">
            <School className="w-4 h-4 text-blue-300" />
            <span className="font-semibold tracking-wide">
              KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
            </span>
            <span className="hidden md:inline text-blue-300">•</span>
            <span className="hidden md:inline text-blue-100 font-medium">
              UNIVERSITAS NEGERI MALANG
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:inline bg-blue-900/60 text-blue-200 px-2.5 py-0.5 rounded text-[11px] font-medium border border-blue-700/50">
              T.A 2026/2027 • Semester Ganjil
            </span>
            <a
              href="mailto:helpdesk.labschool@um.ac.id"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-300" />
              <span>helpdesk.labschool@um.ac.id</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Header Institusi */}
      <div className="w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Lambang Resmi Sekolah Laboratorium UM */}
            <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shadow-xs border border-blue-600 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  SISTLABUM
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0066FF] border border-blue-200">
                  Portal Resmi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Sistem Informasi Sekolah Terpadu • UPT Sekolah Laboratorium Universitas Negeri Malang
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="text-right border-r border-slate-200 pr-4">
              <div className="font-semibold text-slate-800">Unit Sekolah Laboratorium</div>
              <div className="text-slate-500">KB-TK • SD • SMP • SMA Lab UM</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Server Operasional Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri (7 Kolom): Warta Akademik & Gambaran Layanan Institusi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kartu Selamat Datang Resmi */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0066FF] mb-2 uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Pusat Layanan Terpadu Akademik & Sekolah</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                Portal Tunggal Administrasi & Pembelajaran Sekolah Laboratorium UM
              </h2>
              
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Selamat datang di Sistem Informasi Sekolah Terpadu (SISTLABUM). Portal ini melayani seluruh 
                kebutuhan civitas akademika mulai dari presensi terpadu, buku nilai Kurikulum Merdeka, 
                evaluasi berbasis komputer (CBT), bimbingan konseling, hingga pelayanan penerimaan siswa baru.
              </p>

              {/* Status Akreditasi & Afiliasi */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Terakreditasi A (Unggul)</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Kurikulum Merdeka Mandiri Berbagi</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Terintegrasi Pangkalan Data UM</span>
                </div>
              </div>
            </div>

            {/* Warta & Pengumuman Resmi Sekolah */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0066FF]" />
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Warta & Pengumuman Akademik Terbaru
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Oktober 2026</span>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#0066FF] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Asesmen Sumatif Tengah Semester (ASTS)
                    </span>
                    <span className="text-[11px] text-slate-500">12 Okt 2026</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Pelaksanaan ASTS berbasis CBT terpadu dijadwalkan mulai 20 Oktober 2026. Seluruh bapak/ibu guru 
                    diharapkan menyelesaikan finalisasi bank soal pada menu Modul CBT.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Rekapitulasi Nilai & Capaian Belajar
                    </span>
                    <span className="text-[11px] text-slate-500">08 Okt 2026</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pengisian jurnal kelas, asesmen formatif harian, dan verifikasi kehadiran siswa wajib 
                    direkapitulasi sebelum penutupan batas waktu tengah semester.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> Layanan PPDB Digital Tahun 2026/2027
                    </span>
                    <span className="text-[11px] text-slate-500">01 Okt 2026</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verifikasi berkas persyaratan pendaftaran siswa baru untuk jenjang KB-TK, SD, SMP, dan SMA 
                    Laboratorium UM dapat dipantau oleh panitia penerimaan melalui menu PPDB.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Pilar Layanan Terpadu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Manajemen Akademik</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jadwal pelajaran, presensi harian, dan jurnal guru terintegrasi.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Evaluasi & Asesmen CBT</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ujian online dengan pemantauan live dan perlindungan anti-kecurangan.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Buku Nilai & E-Rapor</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pengolahan nilai formatif & sumatif sesuai standar Kurikulum Merdeka.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                  04
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bimbingan & Konseling</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pendampingan karakter siswa dan layanan konseling rahasia terenkripsi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan (5 Kolom): Form Autentikasi Tunggal (SSO Login) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              
              {/* Header Card SSO */}
              <div className="bg-gradient-to-r from-blue-50/70 to-slate-50 border-b border-slate-200 p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autentikasi Tunggal (SSO)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Masuk ke Akun Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan kredensial resmi terdaftar untuk mengakses modul operasional sekolah.
                </p>
              </div>

              <div className="p-6">
                {/* Tab Pemilih Golongan Pengguna */}
                <div className="mb-5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    Kategori Pengguna:
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedRoleTab("admin")}
                      className={`py-1.5 px-2 rounded-md font-medium transition-all text-center cursor-pointer ${
                        selectedRoleTab === "admin"
                          ? "bg-white text-[#0066FF] shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRoleTab("tendik")}
                      className={`py-1.5 px-2 rounded-md font-medium transition-all text-center cursor-pointer ${
                        selectedRoleTab === "tendik"
                          ? "bg-white text-[#0066FF] shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Guru / Tendik
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRoleTab("siswa")}
                      className={`py-1.5 px-2 rounded-md font-medium transition-all text-center cursor-pointer ${
                        selectedRoleTab === "siswa"
                          ? "bg-white text-[#0066FF] shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Siswa / Ortu
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field Identitas Pengguna */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Identitas Pengguna</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {selectedRoleTab === "tendik" ? "NIP / Email" : selectedRoleTab === "siswa" ? "NISN / No Induk" : "Username / NIP"}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={getPlaceholder()}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Field Kata Sandi */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-[11px] text-[#0066FF] hover:underline font-medium cursor-pointer"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] active:bg-[#0047b3] text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting || isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memverifikasi Autentikasi...
                      </span>
                    ) : (
                      <>
                        <span>Masuk ke Portal Sekolah</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Akses Cepat Akun Superadmin Default (Khusus Pengujian Pengembang & Administrator) */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF]" />
                        <span>Akses Cepat Pengujian:</span>
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Super Admin
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal mb-3">
                      Klik tombol di bawah ini untuk mengisi kredensial Administrator utama secara otomatis.
                    </p>

                    <button
                      type="button"
                      onClick={() => fillQuickPreset("superadmin", "Admin123!@#")}
                      className="w-full py-1.5 px-3 rounded-md bg-white hover:bg-blue-50 text-[#0066FF] text-xs font-semibold border border-blue-200 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Gunakan Akun Superadmin (Auto-Fill)</span>
                    </button>
                  </div>
                </div>

                {/* Bantuan Helpdesk */}
                <div className="mt-5 text-center">
                  <p className="text-xs text-slate-500">
                    Kendala akses akun? Hubungi{" "}
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[#0066FF] hover:underline font-semibold cursor-pointer"
                    >
                      Layanan Bantuan TIK
                    </button>
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Resmi Institusi */}
      <footer className="w-full bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-[#0066FF] text-white flex items-center justify-center font-bold text-xs">
                  UM
                </div>
                <span className="font-bold text-slate-900 text-sm">UPT Sekolah Laboratorium UM</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Unit Pelaksana Teknis Sekolah Laboratorium Universitas Negeri Malang menaungi jenjang 
                KB-TK, SD, SMP, dan SMA Laboratorium UM untuk melahirkan insan berprestasi dan berkarakter.
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2 text-xs">Alamat & Kampus</span>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                <strong>Kampus Pusat:</strong> Gedung B3 Kampus Pusat UM, Jl. Semarang No. 5, Kota Malang, Jawa Timur 65145<br />
                <strong>Unit Sekolah:</strong> SD Lab UM (Jl. Bromo 16) • SMP Lab UM (Jl. Simpang Bogor 19) • SMA Lab UM (Jl. Bromo 16)
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2 text-xs">Kontak Layanan Resmi</span>
              <ul className="text-slate-500 space-y-1 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Telepon: (0341) 551312 ext. 364</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email: helpdesk.labschool@um.ac.id</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jam Layanan: Senin - Jumat, 07.00 - 15.30 WIB</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 UPT Sekolah Laboratorium Universitas Negeri Malang. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-4">
              <a href="#privasi" onClick={(e) => { e.preventDefault(); alert("Kebijakan Privasi: Data siswa dan dewan guru dilindungi sesuai UU Perlindungan Data Pribadi (UU PDP)."); }} className="hover:text-slate-600">
                Kebijakan Privasi
              </a>
              <span>•</span>
              <a href="#panduan" onClick={(e) => { e.preventDefault(); alert("Buku Panduan Pengguna (User Manual SISTLABUM v1.1) dapat diunduh melalui portal internal setelah login."); }} className="hover:text-slate-600">
                Panduan Pengguna
              </a>
              <span>•</span>
              <a href="#status" onClick={(e) => { e.preventDefault(); alert("Status Sistem: Seluruh layanan operasional aktif normal (SLA 99.9%)."); }} className="hover:text-slate-600">
                Status Sistem
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Bantuan Login */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0066FF]" />
                <h4 className="font-bold text-slate-900 text-sm">Bantuan Akses & Lupa Kata Sandi</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Bagi sivitas akademika Sekolah Laboratorium UM yang mengalami kendala akses:
              </p>
              
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <strong className="text-slate-800 block">1. Guru & Tenaga Kependidikan:</strong>
                <span>Silakan hubungi bagian Kepegawaian Tata Usaha di unit sekolah masing-masing untuk reset kata sandi atau sinkronisasi NIP/NUPTK.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <strong className="text-slate-800 block">2. Siswa & Orang Tua/Wali:</strong>
                <span>Kredensial akun siswa diberikan oleh Wali Kelas pada awal semester. Hubungi staf TU Kesiswaan jika memerlukan pembaruan kata sandi.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <strong className="text-slate-800 block">3. Helpdesk TIK UM:</strong>
                <span>Gedung Graha Rektorat UM Lt. 2 / Email: <strong>helpdesk.labschool@um.ac.id</strong></span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
