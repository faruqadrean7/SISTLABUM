'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MonitorPlay, 
  KeyRound, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { MOCK_STUDENT_EXAMS } from '@/lib/mock-student-data';

export default function StudentCBTListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'aktif' | 'terjadwal' | 'riwayat'>('aktif');
  const [tokenInput, setTokenInput] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const activeExams = MOCK_STUDENT_EXAMS.filter(e => e.status === 'aktif');
  const upcomingExams = MOCK_STUDENT_EXAMS.filter(e => e.status === 'terjadwal');
  const pastExams = MOCK_STUDENT_EXAMS.filter(e => e.status === 'selesai');

  const handleStartExam = (examId: string, requiredToken: string) => {
    setSelectedExamId(examId);
    setTokenInput('');
    setTokenError(null);
  };

  const handleVerifyTokenAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const exam = MOCK_STUDENT_EXAMS.find(ex => ex.id === selectedExamId);
    if (!exam) return;

    if (tokenInput.trim().toUpperCase() !== exam.token_required) {
      setTokenError(`Token tidak valid! Pastikan Anda memasukkan token yang tertulis di papan pengawas lab (contoh: ${exam.token_required})`);
      return;
    }

    // Masuk ke exam workspace
    router.push(`/siswa/cbt/${exam.id}`);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── HEADER TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-700 text-white shadow-xs">
              Computer-Based Test (CBT)
            </span>
            <span className="text-xs text-slate-500 font-semibold">Labschool Exam Engine v2.0</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ruang Asesmen & Ujian Digital Siswa
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Kerjakan asesmen sumatif, penilaian harian, dan kuis diagnostik melalui workstation lab komputer sekolah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('aktif')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'aktif'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Ujian Hari Ini ({activeExams.length})
          </button>
          <button
            onClick={() => setActiveTab('terjadwal')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'terjadwal'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Mendatang ({upcomingExams.length})
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'riwayat'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Riwayat Nilai ({pastExams.length})
          </button>
        </div>
      </div>

      {/* ─── TATA TERTIB INTEGRITAS UJIAN (SOLID NAVY NOTICE) ─── */}
      <div className="p-4 rounded-lg bg-blue-900 text-white border-2 border-blue-950 flex items-start gap-3.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-extrabold text-sm text-white">Tata Tertib & Protokol Integritas CBT SMP Labschool UM:</p>
          <p className="text-blue-100 font-medium">
            1. Sistem mendeteksi aktivitas jendela peramban. Dilarang berpindah tab atau meminimalkan jendela selama ujian. 
            Maksimal 3 kali pelanggaran akan menyebabkan sesi terkunci otomatis.
          </p>
          <p className="text-blue-100 font-medium">
            2. Jawaban Anda tersimpan otomatis setiap detik ke server database lokal sekolah. Jika komputer mendadak restart, Anda dapat melanjutkan sesi tanpa kehilangan progres.
          </p>
        </div>
      </div>

      {/* ─── TAB 1: UJIAN HARI INI / AKTIF ─── */}
      {activeTab === 'aktif' && (
        <div className="space-y-4">
          {activeExams.length === 0 ? (
            <div className="school-card p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-800">Tidak ada sesi ujian aktif hari ini</p>
              <p className="text-xs text-slate-500 mt-1">Seluruh jadwal ujian Anda hari ini telah selesai atau belum dimulai.</p>
            </div>
          ) : (
            activeExams.map((exam) => (
              <div
                key={exam.id}
                className="school-card p-6 border-l-4 border-l-rose-700 bg-white space-y-4 shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-700 text-white shadow-xs">
                        Ujian Aktif Sekarang
                      </span>
                      <span className="text-xs font-bold text-slate-700">{exam.subject_name} ({exam.subject_code})</span>
                    </div>
                    <h3 className="font-black text-lg text-slate-900 mt-1">{exam.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">Guru Pengampu: {exam.teacher_name}</p>
                  </div>

                  <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 self-start md:self-auto">
                    KKTP Minimum: {exam.kktp}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                    <p className="text-slate-500 font-semibold">Waktu Ujian</p>
                    <p className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      {exam.time_range}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                    <p className="text-slate-500 font-semibold">Durasi Pengerjaan</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {exam.duration_minutes} Menit (30 Butir Soal)
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                    <p className="text-slate-500 font-semibold">Lokasi Ruang Lab</p>
                    <p className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      {exam.room_name}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                    <p className="text-slate-500 font-semibold">Token Ruang Pengawas</p>
                    <p className="font-mono font-black text-rose-700 mt-0.5 text-sm">
                      {exam.token_required}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500 font-medium">
                    *Pastikan workstation Anda berada dalam mode layar penuh (fullscreen) sebelum menekan tombol mulai.
                  </p>
                  <button
                    onClick={() => handleStartExam(exam.id, exam.token_required)}
                    className="px-5 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <KeyRound className="w-4 h-4 text-white" />
                    <span>Masukkan Token & Mulai Ujian</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TAB 2: JADWAL MENDATANG ─── */}
      {activeTab === 'terjadwal' && (
        <div className="space-y-4">
          {upcomingExams.map((exam) => (
            <div key={exam.id} className="school-card p-5 border-l-4 border-l-blue-900 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
                    Terjadwal
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900 mt-1">{exam.title}</h4>
                  <p className="text-xs text-slate-600 font-medium">Mapel: {exam.subject_name} • Guru: {exam.teacher_name}</p>
                </div>
                <span className="px-3 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 self-start sm:self-auto">
                  {exam.date_str}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-900" /> {exam.time_range} ({exam.duration_minutes} Menit)
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" /> {exam.room_name}
                </span>
                <span className="font-semibold text-slate-800">
                  Target KKTP: {exam.kktp}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 3: RIWAYAT NILAI UJIAN ─── */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          <div className="school-card overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Riwayat Ujian CBT yang Telah Diselesaikan</h3>
              <span className="text-xs font-bold text-slate-600">{pastExams.length} Riwayat Ujian</span>
            </div>

            <div className="divide-y divide-slate-200">
              {pastExams.map((exam) => (
                <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-700 text-white">
                        Selesai Dinilai
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{exam.date_str}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{exam.title}</h4>
                    <p className="text-xs text-slate-600">{exam.subject_name} • {exam.room_name}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-semibold block">Skor Akhir:</span>
                      <span className="text-2xl font-black text-slate-900">{exam.score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>

                    <span className="px-3 py-1 rounded text-xs font-black bg-emerald-700 text-white shadow-xs">
                      TUNTAS (KKTP: {exam.kktp})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL INPUT TOKEN RUANG CBT ─── */}
      {selectedExamId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-slate-300 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Validasi Token Ruang CBT</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Lab Komputer 1 • Labschool UM</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExamId(null)}
                className="w-7 h-7 rounded-md border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyTokenAndProceed} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Perhatian Sebelum Memulai:</p>
                <p>Mintalah token 6–8 karakter kepada pengawas lab di depan kelas. Setelah menekan tombol Mulai, jendela ujian akan memasuki mode layar penuh dan timer mulai berjalan.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Token Ruang Ujian:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LAB-9X7B"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 text-center font-mono font-black text-xl uppercase tracking-widest text-slate-900 focus:outline-none focus:border-rose-700"
                  autoFocus
                />
              </div>

              {tokenError && (
                <div className="p-3 rounded-lg bg-rose-800 text-white text-xs font-medium flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{tokenError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedExamId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black tracking-wider uppercase transition-colors shadow-xs"
                >
                  Verifikasi & Buka Ujian ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
