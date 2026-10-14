'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MonitorPlay, 
  HelpCircle, 
  Key, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Sparkles, 
  Eye, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  Award,
  PenTool,
  Send
} from 'lucide-react';
import { lmsApi } from '@/lib/api-client';
import { CBTExam, CBTQuestion, CognitiveLevel, QuestionType } from '@/types/lms';
import { toast } from 'sonner';

export default function CBTGuruPage() {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'bank_soal' | 'koreksi_uraian'>('jadwal');
  const [selectedExamId, setSelectedExamId] = useState<string>('exm-001');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [filterCognitive, setFilterCognitive] = useState<string>('ALL');
  const [searchQuestion, setSearchQuestion] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>('qst-001');

  // Queries
  const { data: exams = [], isLoading: isLoadingExams } = useQuery({
    queryKey: ['cbt-exams'],
    queryFn: () => lmsApi.getCBTExams('cls-9a', 'sbj-inf'),
  });

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['cbt-questions'],
    queryFn: () => lmsApi.getCBTQuestions('sbj-inf'),
  });

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    if (filterCognitive !== 'ALL' && q.cognitive_level !== filterCognitive) return false;
    if (searchQuestion && !q.question_text.toLowerCase().includes(searchQuestion.toLowerCase()) && !q.topic.toLowerCase().includes(searchQuestion.toLowerCase())) return false;
    return true;
  });

  // Mock Active Exam Student Monitor Data
  const monitorStudents = [
    { id: 'ms-1', nis: '240901', name: 'Ahmad Fauzan Maulana', status: 'mengerjakan', progress: '28/30', timeLeft: '34 menit', ip: '192.168.1.101' },
    { id: 'ms-2', nis: '240902', name: 'Nabila Putri Andini', status: 'selesai', progress: '30/30', timeLeft: 'Terkumpul', ip: '192.168.1.102', score: 94 },
    { id: 'ms-3', nis: '240903', name: 'Rizky Pratama Wijaya', status: 'mengerjakan', progress: '19/30', timeLeft: '32 menit', ip: '192.168.1.103' },
    { id: 'ms-4', nis: '240904', name: 'Siti Aisyah Rahmawati', status: 'selesai', progress: '30/30', timeLeft: 'Terkumpul', ip: '192.168.1.104', score: 88 },
    { id: 'ms-5', nis: '240905', name: 'Bima Aditya Nugraha', status: 'mengerjakan', progress: '22/30', timeLeft: '33 menit', ip: '192.168.1.105' },
    { id: 'ms-6', nis: '240906', name: 'Citra Dewi Lestari', status: 'mengerjakan', progress: '25/30', timeLeft: '35 menit', ip: '192.168.1.106' },
    { id: 'ms-7', nis: '240907', name: 'Dimas Anggara Putra', status: 'terputus', progress: '14/30', timeLeft: '31 menit', ip: '192.168.1.107', warning: 'Koneksi browser terputus 2m lalu' },
    { id: 'ms-8', nis: '240908', name: 'Eka Nur Azizah', status: 'mengerjakan', progress: '27/30', timeLeft: '36 menit', ip: '192.168.1.108' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              CBT Digital Examination
            </span>
            <span className="text-xs text-slate-500 font-semibold">• BE-CBT-01 & BE-CBT-02 (P0)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Bank Soal & Pengawasan Ujian Digital (CBT)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Kelola butir soal berstandar kurikulum Merdeka (HOTS/MOTS), jadwal asesmen sumatif, distribusi token ruang ujian, dan monitoring status live siswa.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'jadwal'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Jadwal & Pengawasan Sesi</span>
          </button>
          <button
            onClick={() => setActiveTab('bank_soal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bank_soal'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Bank Butir Soal ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('koreksi_uraian')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'koreksi_uraian'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Koreksi Uraian</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-black">
              2 Lembar
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: JADWAL & LIVE MONITORING UJIAN ─── */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          {/* Active Exam Overview Card */}
          {activeExam && (
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white">
                      SESI UJIAN AKTIF
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Kelas IX-A • Informatika & Desain Web
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {activeExam.title}
                  </h2>
                </div>

                {/* Room Token Display (Solid High Contrast) */}
                <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      TOKEN RUANG UJIAN
                    </span>
                    <span className="text-xl font-black font-mono tracking-widest text-amber-400">
                      {activeExam.room_token}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyToken(activeExam.room_token)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    title="Salin Token Ujian"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copiedToken && (
                    <span className="text-[11px] font-bold text-emerald-400">Tersalin!</span>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Durasi Pengerjaan</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {activeExam.duration_minutes} Menit
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Ambang KKTP</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {activeExam.kktp} Poin
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Jumlah Butir Soal</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {activeExam.total_questions} Butir (Acak)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Peserta Terdaftar</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {activeExam.total_participants} Siswa
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Proctoring Monitor Grid */}
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Live Proctoring Monitor Lab Komputer
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Pantau aktivitas pengerjaan, koneksi workstation siswa, dan progres submit secara realtime.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan Monitor</span>
                </button>
              </div>
            </div>

            {/* Monitor Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-24">NIS</th>
                      <th className="py-2.5 px-3 min-w-48">Nama Siswa</th>
                      <th className="py-2.5 px-3 w-32 text-center">Status Ujian</th>
                      <th className="py-2.5 px-3 w-28 text-center">Progres Soal</th>
                      <th className="py-2.5 px-3 w-28 text-center">Sisa Waktu</th>
                      <th className="py-2.5 px-3 w-32 font-mono text-center">IP Workstation</th>
                      <th className="py-2.5 px-3 w-36 text-center">Aksi Pengawas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {monitorStudents.map((ms, idx) => (
                      <tr key={ms.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {ms.nis}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {ms.name}
                          {ms.warning && (
                            <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                              ⚠️ {ms.warning}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {ms.status === 'mengerjakan' && (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white">
                              Mengerjakan
                            </span>
                          )}
                          {ms.status === 'selesai' && (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-900 text-white">
                              Tuntas ({ms.score})
                            </span>
                          )}
                          {ms.status === 'terputus' && (
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-800 text-white">
                              Terputus
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-black text-slate-800">
                          {ms.progress}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                          {ms.timeLeft}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {ms.ip}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {ms.status === 'terputus' ? (
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                            >
                              Reset Sesi
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={ms.status === 'selesai'}
                              className="px-2 py-1 rounded text-[10px] font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              Log Aktivitas
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: BANK BUTIR SOAL ─── */}
      {activeTab === 'bank_soal' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari butir soal berdasarkan teks atau topik..."
                value={searchQuestion}
                onChange={(e) => setSearchQuestion(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-medium"
              />
            </div>

            {/* Cognitive Level Filters (Solid Buttons) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
              <button
                type="button"
                onClick={() => setFilterCognitive('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterCognitive === 'ALL'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Semua Level ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCognitive('HOTS')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterCognitive === 'HOTS'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                HOTS (C4-C6)
              </button>
              <button
                type="button"
                onClick={() => setFilterCognitive('MOTS')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterCognitive === 'MOTS'
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                MOTS (C3)
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div 
                  key={q.id}
                  className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">
                        {q.topic}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        q.cognitive_level === 'HOTS' ? 'bg-purple-900 text-white' : 'bg-teal-900 text-white'
                      }`}>
                        Level {q.cognitive_level}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                        Bobot: {q.points} Poin
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="text-xs font-bold text-slate-800 leading-relaxed">
                    {q.question_text}
                  </div>

                  {/* Options List */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            opt.is_correct
                              ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black uppercase text-[11px] w-5 text-slate-500">
                              {opt.id.replace('opt-', '')}.
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {opt.is_correct && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white shrink-0">
                              KUNCI JAWABAN
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Collapsible Explanation / Pembahasan */}
                  {isExpanded && q.explanation && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pembahasan Pedagogik & Rubrik:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: KOREKSI SOAL URAIAN CBT (ADM-CBT-05 & BE-CBT-05) ─── */}
      {activeTab === 'koreksi_uraian' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-900 text-white">
                    Rubrik Penilaian Esai
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Sumatif Tengah Semester • Butir Soal #30 (Bobot Maksimal 20 Poin)
                  </span>
                </div>
                <h2 className="text-sm font-black text-slate-900">
                  Soal: Jelaskan perbedaan mendasar antara properti align-items dan justify-content pada container flexbox saat flex-direction bernilai row!
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800">
                  Progres: 30 / 32 Lembar Terkoreksi
                </span>
              </div>
            </div>

            {/* Rubrik Acuan Guru */}
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1">
              <span className="font-extrabold text-amber-950 uppercase text-[10px] tracking-wider block">
                Pedoman Kunci Jawaban Resmi:
              </span>
              <p className="text-amber-900 leading-relaxed font-medium">
                Siswa wajib menjelaskan bahwa justify-content mengatur penataan elemen di sepanjang sumbu utama (main-axis / horizontal), sedangkan align-items di sepanjang sumbu silang (cross-axis / vertikal). Skor penuh (20) jika menyebutkan kedua sumbu dengan tepat.
              </p>
            </div>

            {/* Antrean Jawaban Siswa */}
            <div className="space-y-4 pt-2">
              {[
                {
                  id: 'ans-1',
                  studentName: 'Ahmad Fauzan Maulana',
                  nis: '240901',
                  answerText: 'justify-content mengatur posisi anak elemen pada sumbu utama (main-axis) yaitu horizontal jika row. Sedangkan align-items mengatur posisi pada sumbu silang (cross-axis) yaitu vertikal.',
                  score: 20,
                  feedback: 'Jawaban sempurna dan tepat menggunakan peristilahan baku flexbox.',
                  status: 'graded'
                },
                {
                  id: 'ans-2',
                  studentName: 'Rizky Pratama Wijaya',
                  nis: '240903',
                  answerText: 'justify-content itu untuk meratakan flex items secara mendatar kiri tengah kanan, kalau align-items untuk meratakan dari atas bawah.',
                  score: 16,
                  feedback: 'Konsep sudah benar secara visual, namun belum menyebut istilah teknis main-axis dan cross-axis.',
                  status: 'pending'
                }
              ].map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-300 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">{item.studentName}</span>
                      <span className="font-mono text-xs text-slate-500">({item.nis})</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'graded' ? 'bg-emerald-800 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {item.status === 'graded' ? 'Terkoreksi' : 'Menunggu Koreksi'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 leading-relaxed">
                    "{item.answerText}"
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex-1 max-w-lg">
                      <input
                        type="text"
                        defaultValue={item.feedback}
                        placeholder="Catatan umpan balik untuk siswa..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-900 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span>Skor (0-20):</span>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          defaultValue={item.score}
                          className="w-16 px-2 py-1 text-center font-black text-xs rounded border border-slate-300 focus:border-blue-900"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => toast.success(`Nilai esai untuk ${item.studentName} berhasil disimpan dan disinkronkan ke Buku Nilai!`)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-900 hover:bg-blue-950 text-white shadow-xs cursor-pointer"
                      >
                        Simpan Nilai
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
