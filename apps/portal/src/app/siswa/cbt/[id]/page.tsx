'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MonitorPlay, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Lock, 
  Wifi, 
  HelpCircle,
  Volume2,
  FileText
} from 'lucide-react';
import { MOCK_STUDENT_EXAMS, MOCK_ACTIVE_EXAM_QUESTIONS, CBTQuestionDetail } from '@/lib/mock-student-data';

export default function CBTExamWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const exam = MOCK_STUDENT_EXAMS.find(e => e.id === examId) || MOCK_STUDENT_EXAMS[0];

  // Current Question Index
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Timer Countdown in seconds (89 menit 45 detik)
  const [timeLeft, setTimeLeft] = useState(5385);
  
  // Answers state: questionId -> value
  const [answers, setAnswers] = useState<Record<string, any>>({
    'q-01': 'B',
    'q-02': ['A', 'C'],
    'q-03': 'B',
    'q-04': { 0: true, 1: false, 2: true },
    'q-05': { 'HTML5 Semantic': 'Menyusun struktur hierarki dan arti konten dokumen web' },
    'q-06': 'fr',
  });

  // Flagged (Ragu-ragu) state: questionId -> boolean
  const [flagged, setFlagged] = useState<Record<string, boolean>>({
    'q-03': true,
  });

  // Autosave status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('Baru saja');

  // Anti-Cheat: Violation count & Locked State
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [isExamLocked, setIsExamLocked] = useState(false);

  // Submit Confirmation Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Expanded list of 30 questions for grid rail
  const allQuestionIds = Array.from({ length: exam.total_questions }, (_, i) => {
    if (i < MOCK_ACTIVE_EXAM_QUESTIONS.length) {
      return MOCK_ACTIVE_EXAM_QUESTIONS[i].id;
    }
    return `q-${String(i + 1).padStart(2, '0')}`;
  });

  const currentQ: CBTQuestionDetail = MOCK_ACTIVE_EXAM_QUESTIONS[currentIdx] || {
    id: `q-${String(currentIdx + 1).padStart(2, '0')}`,
    number: currentIdx + 1,
    type: 'pg',
    category: 'MOTS',
    points: 3,
    prompt: `Butir Soal Nomor ${currentIdx + 1}: Perhatikan studi kasus pemecahan masalah algoritma pada sistem informasi sekolah berikut...`,
    options: [
      { key: 'A', label: 'Pilihan opsi jawaban pertama' },
      { key: 'B', label: 'Pilihan opsi jawaban kedua' },
      { key: 'C', label: 'Pilihan opsi jawaban ketiga' },
      { key: 'D', label: 'Pilihan opsi jawaban keempat' },
    ],
  };

  // Timer Tick
  useEffect(() => {
    if (isFinished || isExamLocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isExamLocked]);

  // Anti-Cheat: Detect Window Blur / Tab Switch / Minimize
  useEffect(() => {
    if (isFinished || isExamLocked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerViolation('Terdeteksi berpindah tab peramban atau meminimalkan layar ujian');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Terdeteksi jendela ujian kehilangan fokus (membuka aplikasi lain)');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+U, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'C' || e.key === 'V' || e.key === 'U')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        triggerViolation('Percobaan kombinasi tombol salin / inspeksi kode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [violationCount, isFinished, isExamLocked]);

  const triggerViolation = (reason: string) => {
    setViolationCount(prev => {
      const newCount = prev + 1;
      setViolationReason(reason);
      setShowViolationModal(true);
      if (newCount >= 3) {
        setIsExamLocked(true);
      }
      return newCount;
    });
  };

  const handleAnswerChange = (val: any) => {
    setIsSaving(true);
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: val,
    }));
    setTimeout(() => {
      setIsSaving(false);
      const now = new Date();
      setLastSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 300);
  };

  const toggleFlag = () => {
    setFlagged(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = exam.total_questions - answeredCount;

  // Final Submit Handler
  const handleFinalSubmit = () => {
    setIsFinished(true);
    setShowSubmitModal(false);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900">
        <div className="school-card max-w-lg w-full p-8 text-center space-y-5 bg-white border-2 border-slate-300 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              Ujian Berhasil Dikumpulkan
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Terima Kasih, Ahmad Fauzan!
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
              Jawaban Anda untuk <strong>{exam.title}</strong> telah tersimpan utuh di server sekolah.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Total Butir Dikerjakan:</span>
              <span className="font-extrabold text-slate-900">{answeredCount} dari {exam.total_questions} Soal</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Waktu Selesai:</span>
              <span className="font-extrabold text-slate-900">{new Date().toLocaleTimeString('id-ID')} WIB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Ruang Workstation:</span>
              <span className="font-extrabold text-slate-900">{exam.room_name}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Nilai butir pilihan ganda otomatis dan uraian guru akan dipublikasikan pada menu Capaian Nilai setelah seluruh sesi selesai.
          </p>

          <Link
            href="/siswa/dashboard"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-black tracking-wider uppercase transition-colors shadow-xs"
          >
            Kembali ke Beranda Siswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* ─── DISTRACTION-FREE CBT HEADER ─── */}
      <header className="h-16 bg-blue-900 text-white px-6 flex items-center justify-between border-b-2 border-blue-950 sticky top-0 z-40 shadow-xs">
        {/* Left Exam Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white text-blue-900 font-black flex items-center justify-center shrink-0 shadow-xs">
            <MonitorPlay className="w-5 h-5 text-blue-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-200 border border-blue-800">
                CBT Mode
              </span>
              <span className="text-xs font-bold text-white truncate max-w-xs md:max-w-md">
                {exam.title}
              </span>
            </div>
            <p className="text-[11px] text-blue-100 font-medium truncate">
              Peserta: <strong>Ahmad Fauzan Maulana (NIS: 240901)</strong> • {exam.room_name}
            </p>
          </div>
        </div>

        {/* Right Timer & Autosave Status */}
        <div className="flex items-center gap-4">
          {/* Status Autosave */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-100 font-medium">
            {isSaving ? (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Tersimpan ({lastSavedTime})
              </span>
            )}
          </div>

          {/* Countdown Timer Server */}
          <div className={`px-4 py-1.5 rounded-lg font-mono font-black text-sm md:text-base flex items-center gap-2 shadow-xs ${
            timeLeft <= 600 ? 'bg-rose-700 text-white animate-pulse' : 'bg-blue-950 text-white border border-blue-800'
          }`}>
            <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Sisa Waktu: {formatTime(timeLeft)}</span>
          </div>

          {/* Selesaikan Ujian Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">Kumpulkan Ujian</span>
          </button>
        </div>
      </header>

      {/* ─── WORKSPACE CONTENT BODY ─── */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-full">
        {/* Left Area: Soal Aktif (Fluid Width) */}
        <div className="flex-1 school-card p-6 md:p-8 flex flex-col justify-between space-y-6 bg-white min-w-0">
          <div className="space-y-5">
            {/* Question Meta Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  {currentQ.number}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dari {exam.total_questions} Butir Soal
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-300">
                  Bobot: {currentQ.points} Poin ({currentQ.category})
                </span>
              </div>

              {/* Tombol Ragu-Ragu */}
              <button
                onClick={toggleFlag}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  flagged[currentQ.id]
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentQ.id] ? 'Ditandai Ragu-Ragu' : 'Tandai Ragu'}</span>
              </button>
            </div>

            {/* Prompt Soal Rich Text */}
            <div className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed space-y-3">
              <p>{currentQ.prompt}</p>

              {/* KaTeX Math Formula Rendering Example */}
              {currentQ.formula && (
                <div className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-sm border-2 border-slate-800 shadow-xs">
                  {currentQ.formula}
                </div>
              )}
            </div>

            {/* ─── 6 MODEL SOAL RENDERING ─── */}
            {/* 1. Model Pilihan Ganda (Single Choice) */}
            {currentQ.type === 'pg' && currentQ.options && (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswerChange(opt.key)}
                      className={`w-full p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        isSelected ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Model Pilihan Ganda Kompleks (Multi Select) */}
            {currentQ.type === 'pg_kompleks' && currentQ.options && (
              <div className="space-y-2.5 pt-2">
                <p className="text-xs text-blue-900 font-bold italic">
                  *Anda dapat memilih lebih dari satu jawaban yang benar.
                </p>
                {currentQ.options.map((opt) => {
                  const currentSelected: string[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                  const isChecked = currentSelected.includes(opt.key);

                  const toggleMulti = () => {
                    if (isChecked) {
                      handleAnswerChange(currentSelected.filter(k => k !== opt.key));
                    } else {
                      handleAnswerChange([...currentSelected, opt.key]);
                    }
                  };

                  return (
                    <button
                      key={opt.key}
                      onClick={toggleMulti}
                      className={`w-full p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer shadow-xs ${
                        isChecked
                          ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-5 h-5 text-blue-900 rounded border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-sm leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Model Benar / Salah Grid */}
            {currentQ.type === 'benar_salah' && currentQ.statements && (
              <div className="space-y-3 pt-2">
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-200 text-slate-800 font-extrabold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Pernyataan Soal</th>
                        <th className="py-2.5 px-3 text-center w-24">Benar</th>
                        <th className="py-2.5 px-3 text-center w-24">Salah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentQ.statements.map((stmt, sIdx) => {
                        const currentVal = answers[currentQ.id]?.[sIdx];
                        return (
                          <tr key={sIdx} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-800 font-semibold">{stmt.text}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...(answers[currentQ.id] || {}), [sIdx]: true };
                                  handleAnswerChange(updated);
                                }}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs cursor-pointer shadow-xs ${
                                  currentVal === true
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                [ Benar ]
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...(answers[currentQ.id] || {}), [sIdx]: false };
                                  handleAnswerChange(updated);
                                }}
                                className={`px-3 py-1.5 rounded-md font-bold text-xs cursor-pointer shadow-xs ${
                                  currentVal === false
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                [ Salah ]
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Model Menjodohkan (Matching Pair) */}
            {currentQ.type === 'menjodohkan' && currentQ.matching_pairs && (
              <div className="space-y-3 pt-2">
                {currentQ.matching_pairs.map((pair, pIdx) => (
                  <div key={pIdx} className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <span className="font-extrabold text-sm text-slate-900 md:w-1/3">
                      {pair.premise}
                    </span>
                    <select
                      value={answers[currentQ.id]?.[pair.premise] || ''}
                      onChange={(e) => {
                        const updated = { ...(answers[currentQ.id] || {}), [pair.premise]: e.target.value };
                        handleAnswerChange(updated);
                      }}
                      className="flex-1 p-2 rounded-lg border-2 border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-900 cursor-pointer"
                    >
                      <option value="">-- Pilih Pasangan Jawaban --</option>
                      {pair.options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Model Isian Singkat */}
            {currentQ.type === 'isian' && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Ketikkan Jawaban Singkat Anda:
                </label>
                <input
                  type="text"
                  placeholder="Ketik jawaban di sini..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full md:w-1/2 p-3 rounded-lg border-2 border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-900 shadow-xs"
                />
              </div>
            )}

            {/* 6. Model Uraian / Esai */}
            {currentQ.type === 'uraian' && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Tuliskan Penjelasan Esai Anda Secara Lengkap:
                </label>
                <textarea
                  rows={6}
                  placeholder="Ketik jawaban esai di sini..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-slate-300 font-medium text-sm text-slate-900 focus:outline-none focus:border-blue-900 shadow-xs leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 text-right">
                  Jumlah Karakter: {(answers[currentQ.id] || '').length} karakter
                </p>
              </div>
            )}
          </div>

          {/* Navigasi Sebelumnya / Selanjutnya */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              disabled={currentIdx === exam.total_questions - 1}
              onClick={() => setCurrentIdx(prev => Math.min(exam.total_questions - 1, prev + 1))}
              className="px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 disabled:opacity-40 disabled:hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Right Area: Grid Navigasi Butir Soal (Width 320px) */}
        <aside className="w-full lg:w-80 school-card p-5 space-y-4 bg-white self-start shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Daftar Nomor Soal ({exam.total_questions})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Workstation 14
            </span>
          </div>

          {/* Indikator Status Warna Legend Solid */}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-100 border border-slate-300">
              <span className="w-3 h-3 rounded bg-slate-300 shrink-0"></span>
              <span className="truncate">Belum ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900">
              <span className="w-3 h-3 rounded bg-emerald-700 shrink-0"></span>
              <span className="truncate">Selesai ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
              <span className="w-3 h-3 rounded bg-amber-600 shrink-0"></span>
              <span className="truncate">Ragu ({flaggedCount})</span>
            </div>
          </div>

          {/* Grid Button Nomor Soal */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {allQuestionIds.map((qId, idx) => {
              const isAnswered = !!answers[qId];
              const isFlag = !!flagged[qId];
              const isCurrent = currentIdx === idx;

              let btnClass = 'bg-slate-200 text-slate-800 hover:bg-slate-300';
              if (isFlag) {
                btnClass = 'bg-amber-600 text-white';
              } else if (isAnswered) {
                btnClass = 'bg-emerald-700 text-white';
              }

              return (
                <button
                  key={qId}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs ${btnClass} ${
                    isCurrent ? 'ring-3 ring-blue-900 scale-105 font-black' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Selesaikan Ujian</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ─── MODAL PERINGATAN PELANGGARAN ANTI-CHEAT (SOLID ROSE) ─── */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-4 border-rose-700 max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-700 text-white flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-rose-700 text-white shadow-xs">
                Peringatan Pelanggaran Anti-Cheat ({violationCount}/3)
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Aktivitas Mencurigakan Terdeteksi!
              </h3>
              <p className="text-xs text-rose-700 font-bold mt-1">
                Alasan: {violationReason}
              </p>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Anda terdeteksi meninggalkan jendela ujian. Aktivitas ini secara otomatis dicatat ke workstation pengawas lab. Jika pelanggaran mencapai 3 kali, sesi ujian Anda akan <strong>terkunci secara permanen</strong>.
            </p>

            {isExamLocked ? (
              <div className="p-3 bg-rose-900 text-white rounded-lg text-xs font-bold">
                🔒 Sesi Ujian Anda Terkunci. Silakan panggil Pengawas Lab Komputer untuk membuka kunci.
              </div>
            ) : (
              <button
                onClick={() => setShowViolationModal(false)}
                className="w-full py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-black tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
              >
                Saya Mengerti, Kembali Mengerjakan
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL KONFIRMASI SUBMIT BERTINGKAT ─── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border-2 border-slate-300 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Konfirmasi Pengumpulan Ujian</h3>
                <p className="text-xs text-slate-500 font-medium">{exam.title}</p>
              </div>
            </div>

            {/* Statistik Jawaban Ringkasan */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Terjawab:</span>
                <span className="text-xl font-black text-emerald-700">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Ragu-Ragu:</span>
                <span className="text-xl font-black text-amber-600">{flaggedCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Belum Dijawab:</span>
                <span className="text-xl font-black text-rose-700">{unansweredCount}</span>
              </div>
            </div>

            {(unansweredCount > 0 || flaggedCount > 0) && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Perhatian Sebelum Kumpul:
                </p>
                <p>
                  Masih terdapat <strong>{unansweredCount} butir belum dijawab</strong> dan <strong>{flaggedCount} butir ditandai ragu-ragu</strong>. Waktu masih tersisa <strong>{formatTime(timeLeft)}</strong>. Anda disarankan memeriksa kembali butir soal tersebut.
                </p>
              </div>
            )}

            <div className="pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-emerald-700 rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800 leading-snug">
                  Saya yakin dan sadar ingin mengumpulkan seluruh lembar jawaban ujian ini. Setelah dikumpulkan, jawaban tidak dapat diubah kembali.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Kembali Periksa Soal
              </button>
              <button
                type="button"
                disabled={!confirmCheckbox}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
              >
                Ya, Kumpulkan Sekarang ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
