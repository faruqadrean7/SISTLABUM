'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Eye, 
  Award, 
  CheckCircle2, 
  FileCheck, 
  Printer, 
  QrCode, 
  X, 
  School,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian } from '@/lib/guardian-context';

export default function GuardianNilaiPage() {
  const { activeChild, activeGrades } = useGuardian();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReportPeriod, setSelectedReportPeriod] = useState('sts-gasal');

  const handleDownloadPdf = () => {
    toast.success(`Mengunduh E-Progress Report resmi ${activeChild.name} (PDF)...`);
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER BANNER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-900 text-white text-xs font-bold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Kurikulum Merdeka & Kriteria Ketercapaian (KKTP)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Capaian Kompetensi & Rapor ({activeChild.name})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Transparansi buku nilai formatif, sumatif tengah semester, dan e-rapor berkode QR resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-white" />
            <span>Pratinjau E-Rapor Ber-QR</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* ─── TOP KPI & RADAR/BAR OVERVIEW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Rerata Nilai Akhir</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">{activeChild.grade_average}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-900 text-white">Predikat A</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Standar KKTP Sekolah: 75.0</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Ketuntasan Belajar</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-800">100%</span>
            <span className="text-xs font-bold text-emerald-700">Tuntas</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">{activeGrades.length} Mata Pelajaran Memenuhi Syarat</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Nilai Tertinggi</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-purple-900">
              {Math.max(...activeGrades.map(g => g.final_score))}
            </span>
            <span className="text-xs font-bold text-purple-800 font-mono">
              {activeGrades.find(g => g.final_score === Math.max(...activeGrades.map(x => x.final_score)))?.subject_code}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 truncate">
            {activeGrades.find(g => g.final_score === Math.max(...activeGrades.map(x => x.final_score)))?.subject_name}
          </p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Status E-Rapor</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm font-extrabold text-slate-900">Telah Disahkan</span>
          </div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white">
            QR Terverifikasi Publik
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Oleh Kepala Sekolah & Walas</p>
        </div>
      </div>

      {/* ─── TABEL BUKU NILAI KOMPETENSI KURIKULUM MERDEKA ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Daftar Nilai Capaian Kompetensi Semester Gasal T.A. 2026/2027
            </h2>
            <p className="text-xs text-slate-500">
              Berdasarkan asesmen harian, proyek P5, dan sumatif tengah semester
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Periode:</span>
            <select
              value={selectedReportPeriod}
              onChange={(e) => setSelectedReportPeriod(e.target.value)}
              className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="sts-gasal">Sumatif Tengah Semester (STS) Gasal</option>
              <option value="progress-sep">Progress Report Bulanan (September)</option>
              <option value="progress-aug">Progress Report Bulanan (Agustus)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                <th className="py-3 px-3">Mata Pelajaran & Guru Pengampu</th>
                <th className="py-3 px-3 text-center">KKTP</th>
                <th className="py-3 px-3 text-center">Formatif</th>
                <th className="py-3 px-3 text-center">Sumatif LM</th>
                <th className="py-3 px-3 text-center">STS</th>
                <th className="py-3 px-3 text-center">Nilai Akhir</th>
                <th className="py-3 px-3 text-center">Predikat</th>
                <th className="py-3 px-4">Deskripsi Capaian Kompetensi Kurikulum Merdeka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeGrades.map((grade) => (
                <tr key={grade.subject_code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-extrabold text-slate-900">{grade.subject_name}</p>
                    <p className="text-[11px] text-slate-500">{grade.teacher_name} • <span className="font-mono">{grade.subject_code}</span></p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                    {grade.kktp}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {grade.formative_avg}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {grade.summative_avg}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">
                    {grade.sts_score}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-slate-900 text-sm">
                    {grade.final_score}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white">
                      {grade.predicate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-[11px] leading-relaxed max-w-sm">
                    {grade.competency_desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL PRATINJAU DOKUMEN E-RAPOR RESMI BER-QR CODE ─── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-extrabold">
                    Lembar Resmi E-Progress Report Siswa (T.A. 2026/2027)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Dokumen Sah Laboratorium Universitas Negeri Malang
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Report Document Body (A4 Style) */}
            <div className="p-8 space-y-6 text-slate-900 font-serif">
              {/* Kop Surat Sekolah */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="w-16 h-16 rounded-lg bg-blue-950 text-white font-black text-xl flex items-center justify-center shrink-0">
                  <School className="w-8 h-8 text-white" />
                </div>
                <div className="text-center flex-1 px-4">
                  <h4 className="text-base font-black tracking-wide uppercase text-slate-900">
                    YAYASAN PEMBINA PENDIDIKAN LABSCHOOL UM
                  </h4>
                  <h3 className="text-lg font-black tracking-tight text-blue-950">
                    SMP LABORATORIUM UNIVERSITAS NEGERI MALANG
                  </h3>
                  <p className="text-[11px] font-sans text-slate-600">
                    Jl. Simpang Bogor No. 19, Lowokwaru, Kota Malang | Telp: (0341) 551312 | Web: labschool.um.ac.id
                  </p>
                </div>
                <div className="w-16 h-16 border border-slate-300 rounded p-1 flex items-center justify-center bg-slate-50">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center font-sans space-y-1">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  LAPORAN HASIL KEMAJUAN BELAJAR SISWA (E-PROGRESS REPORT)
                </h4>
                <p className="text-xs text-slate-600">
                  Semester Gasal Tahun Ajaran 2026/2027 • Kurikulum Merdeka
                </p>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-4 font-sans text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-600 inline-block w-28">Nama Siswa:</span> <span className="font-black text-slate-900">{activeChild.name}</span></p>
                  <p><span className="font-bold text-slate-600 inline-block w-28">NIS / NISN:</span> <span className="font-mono">{activeChild.nis} / {activeChild.nisn}</span></p>
                  <p><span className="font-bold text-slate-600 inline-block w-28">Kelas / Fase:</span> <span className="font-bold">{activeChild.class_name} (Fase D)</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-600 inline-block w-28">Wali Kelas:</span> <span className="font-bold">{activeChild.homeroom_teacher}</span></p>
                  <p><span className="font-bold text-slate-600 inline-block w-28">Kehadiran:</span> <span className="font-bold">{activeChild.attendance_recap.rate}% ({activeChild.attendance_recap.hadir} Hadir)</span></p>
                  <p><span className="font-bold text-slate-600 inline-block w-28">Poin Karakter:</span> <span className="font-bold">+{activeChild.points_balance} Poin (Predikat Baik)</span></p>
                </div>
              </div>

              {/* Compact Grades Table */}
              <div className="font-sans">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 font-bold border-b border-slate-300">
                      <th className="py-2 px-2.5">No</th>
                      <th className="py-2 px-2.5">Mata Pelajaran</th>
                      <th className="py-2 px-2 text-center">KKTP</th>
                      <th className="py-2 px-2 text-center">Nilai Akhir</th>
                      <th className="py-2 px-2 text-center">Predikat</th>
                      <th className="py-2 px-3">Capaian Kompetensi Tertinggi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeGrades.map((g, idx) => (
                      <tr key={g.subject_code}>
                        <td className="py-1.5 px-2.5 font-bold">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 font-bold">{g.subject_name}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{g.kktp}</td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900">{g.final_score}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-800">{g.predicate}</td>
                        <td className="py-1.5 px-3 text-[10px] text-slate-600 truncate max-w-xs">{g.competency_desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Verification Token Footer */}
              <div className="pt-4 border-t border-slate-300 font-sans grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui Orang Tua,</p>
                  <p className="mt-12 font-bold text-slate-900 underline">H. Ir. Bambang Maulana</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-50 border border-slate-200">
                  <QrCode className="w-10 h-10 text-slate-900" />
                  <p className="text-[9px] font-mono font-bold mt-1 text-slate-600">
                    TOKEN: VERIFY-REP-{activeChild.nis}-2026
                  </p>
                  <span className="text-[9px] text-emerald-800 font-bold">
                    Tervalidasi Sistem Satu Pintu
                  </span>
                </div>

                <div>
                  <p className="text-slate-600">Kota Malang, 14 Oktober 2026</p>
                  <p className="text-slate-600">Wali Kelas,</p>
                  <p className="mt-8 font-bold text-slate-900 underline">{activeChild.homeroom_teacher}</p>
                  <p className="text-[10px] text-slate-500">NIP. 19780415 200501 2 004</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
