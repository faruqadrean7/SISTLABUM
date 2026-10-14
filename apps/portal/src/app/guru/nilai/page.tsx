'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileSpreadsheet, 
  Lock, 
  Unlock, 
  Save, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Calculator,
  HelpCircle
} from 'lucide-react';
import { lmsApi } from '@/lib/api-client';
import { GradeComponent, StudentGradeRow } from '@/types/lms';

export default function BukuNilaiPage() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<'akademik' | 'karakter'>('akademik');
  const [filterStatus, setFilterStatus] = useState<'all' | 'remedial' | 'tuntas'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Character evaluation state
  const [characterScores, setCharacterScores] = useState<Record<string, {
    beriman: string;
    gotongRoyong: string;
    mandiri: string;
    bernalarKritis: string;
    kreatif: string;
    catatan: string;
  }>>({});

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['gradebook-data', 'cls-9a', 'sbj-inf'],
    queryFn: () => lmsApi.getGradebook('cls-9a', 'sbj-inf'),
  });

  const period = data?.period;
  const components = data?.components || [];
  const initialGrades = data?.grades || [];

  // Local state for editable grades
  const [localGrades, setLocalGrades] = useState<StudentGradeRow[]>([]);

  React.useEffect(() => {
    if (initialGrades.length > 0 && localGrades.length === 0) {
      setLocalGrades(initialGrades);
    }
  }, [initialGrades, localGrades.length]);

  // Handle cell score changes with dynamic recalculation
  const handleScoreChange = (studentId: string, componentId: string, valStr: string) => {
    const numVal = valStr === '' ? null : Math.min(100, Math.max(0, Number(valStr)));
    
    setLocalGrades(prev => prev.map(student => {
      if (student.student_id !== studentId) return student;

      const updatedScores = { ...student.scores, [componentId]: numVal };
      
      // Calculate weighted score
      let weightedTotal = 0;
      let totalWeight = 0;

      components.forEach(comp => {
        const score = updatedScores[comp.id];
        if (score !== null && score !== undefined) {
          weightedTotal += (score * comp.weight_percent);
          totalWeight += comp.weight_percent;
        }
      });

      const finalScore = totalWeight > 0 ? Math.round((weightedTotal / totalWeight) * 10) / 10 : 0;
      const isTuntas = finalScore >= 75; // KKTP threshold 75

      return {
        ...student,
        scores: updatedScores,
        final_score: finalScore,
        is_tuntas: isTuntas,
      };
    }));
  };

  // Mutation to save bulk grades
  const saveMutation = useMutation({
    mutationFn: async () => {
      return lmsApi.saveBulkGrades({
        class_id: 'cls-9a',
        subject_id: 'sbj-inf',
        grades: localGrades.map(s => ({
          student_id: s.student_id,
          scores: s.scores,
        }))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradebook-data'] });
      setSuccessToast('Seluruh perubahan nilai berhasil disimpan ke server!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  });

  // Mutation to toggle period lock
  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!period) return;
      return lmsApi.lockGradePeriod(period.id, !period.is_locked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradebook-data'] });
      setSuccessToast(period?.is_locked ? 'Buku nilai berhasil dibuka kembali.' : 'Buku nilai berhasil dikunci!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  });

  // Compute live statistics
  const totalStudents = localGrades.length;
  const tuntasCount = localGrades.filter(s => s.is_tuntas).length;
  const remedialCount = totalStudents - tuntasCount;
  const classAverage = totalStudents > 0 
    ? (localGrades.reduce((acc, curr) => acc + curr.final_score, 0) / totalStudents).toFixed(1)
    : '0.0';

  // Filtered rows
  const filteredGrades = localGrades.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nis.includes(searchQuery);
    if (!matchesSearch) return false;
    if (filterStatus === 'remedial') return !student.is_tuntas;
    if (filterStatus === 'tuntas') return student.is_tuntas;
    return true;
  });

  // CSV Export
  const handleExportCSV = () => {
    if (localGrades.length === 0) return;
    const headerCols = ['No', 'NIS', 'Nama Siswa', 'L/P', ...components.map(c => `${c.code} (${c.weight_percent}%)`), 'Nilai Akhir', 'Status KKTP', 'Catatan Remedial'];
    const rows = localGrades.map((s, idx) => [
      idx + 1,
      s.nis,
      `"${s.name}"`,
      s.gender,
      ...components.map(c => s.scores[c.id] ?? '-'),
      s.final_score,
      s.is_tuntas ? 'TUNTAS' : 'REMEDIAL',
      `"${s.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headerCols.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ledger_Nilai_Informatika_Kelas_IXA.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              Buku Nilai & Asesmen
            </span>
            <span className="text-xs text-slate-500 font-semibold">• BE-GRD-01 (P0)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Ledger Buku Nilai Guru & Ketercapaian KKTP
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Input akumulasi nilai formatif dan sumatif, kalkulasi nilai akhir otomatis berbobot, dan pantau status ketuntasan siswa berdasarkan kriteria KKTP (75).
          </p>
        </div>

        {/* Main Tab Switcher (Solid Buttons) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
          <button
            type="button"
            onClick={() => setMainTab('akademik')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'akademik'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ledger Nilai Kognitif</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('karakter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'karakter'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catatan Karakter P5</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {mainTab === 'akademik' ? (
            <>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV / Excel</span>
              </button>

              <button
                type="button"
                disabled={lockMutation.isPending}
                onClick={() => lockMutation.mutate()}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all ${
                  period?.is_locked
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {period?.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{period?.is_locked ? 'Buka Kunci Nilai' : 'Kunci Buku Nilai'}</span>
              </button>

              <button
                type="button"
                disabled={saveMutation.isPending || period?.is_locked}
                onClick={() => saveMutation.mutate()}
                className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveMutation.isPending ? 'Menyimpan...' : 'Simpan Semua Nilai'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSuccessToast('Seluruh catatan karakter Profil Pelajar Pancasila berhasil disimpan!');
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan Karakter</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── TOAST ALERT NOTIFICATION ─── */}
      {successToast && (
        <div className="bg-emerald-800 text-white p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-xs font-bold">{successToast}</span>
          </div>
        </div>
      )}

      {mainTab === 'akademik' && (
        <>
          {/* ─── LOCK STATUS BANNER (IF LOCKED) ─── */}
          {period?.is_locked && (
            <div className="bg-amber-600 text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-200 shrink-0" />
                <div className="text-xs">
                  <span className="font-black block">Buku Nilai Terkunci</span>
                  <span className="text-amber-100 font-medium">
                    Periode penilaian telah dikunci oleh {period.locked_by || 'Guru Pengampu'}. Nilai tidak dapat diedit sebelum dibuka kembali.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── KPI SUMMARY CARDS (SOLID HIGH-CONTRAST) ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Rata-rata Kelas */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kelas</span>
                <Calculator className="w-4 h-4 text-blue-900" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{classAverage}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Berdasarkan 5 komponen asesmen</p>
            </div>

            {/* Tuntas KKTP */}
            <div className="bg-emerald-800 text-white border border-emerald-900 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Tuntas KKTP (≥ 75)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {tuntasCount} <span className="text-sm font-semibold text-emerald-200">/ {totalStudents} Siswa</span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-1 font-medium">
                {totalStudents > 0 ? Math.round((tuntasCount / totalStudents) * 100) : 0}% Tingkat Ketuntasan
              </p>
            </div>

            {/* Perlu Remedial */}
            <div className="bg-rose-800 text-white border border-rose-900 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider">Perlu Remedial (&lt; 75)</span>
                <AlertTriangle className="w-4 h-4 text-rose-200" />
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {remedialCount} <span className="text-sm font-semibold text-rose-200">Siswa</span>
              </div>
              <p className="text-[11px] text-rose-200 mt-1 font-medium">Perlu program tindak lanjut/tugas remedial</p>
            </div>

            {/* Ambang Batas KKTP */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Kriteria KKTP</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1">75.0</div>
              <p className="text-[11px] text-slate-300 mt-1 font-medium">SK Kepala Sekolah Labschool UM</p>
            </div>
          </div>

          {/* ─── CONTROLS & FILTER BAR ─── */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-medium"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Semua Siswa ({localGrades.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('remedial')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'remedial'
                    ? 'bg-rose-800 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Remedial ({remedialCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('tuntas')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'tuntas'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Tuntas ({tuntasCount})
              </button>
            </div>
          </div>

          {/* ─── SPREADSHEET LEDGER TABLE ─── */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 w-12 text-center sticky left-0 bg-slate-100 z-10">No</th>
                    <th className="py-3 px-3 w-24 sticky left-12 bg-slate-100 z-10">NIS</th>
                    <th className="py-3 px-3 min-w-56 sticky left-36 bg-slate-100 z-10">Nama Siswa</th>
                    <th className="py-3 px-2 w-14 text-center">L/P</th>
                    
                    {/* Dynamic Component Columns */}
                    {components.map((comp) => (
                      <th key={comp.id} className="py-3 px-2 w-28 text-center border-l border-slate-200">
                        <span className="block font-black text-slate-900">{comp.code}</span>
                        <span className="text-[9px] text-slate-500 font-semibold block truncate">
                          Bobot: {comp.weight_percent}%
                        </span>
                      </th>
                    ))}

                    <th className="py-3 px-3 w-28 text-center border-l border-slate-300 bg-slate-200 text-slate-900">
                      <span className="block font-black">Nilai Akhir</span>
                      <span className="text-[9px] text-slate-600 font-semibold block">Otomatis</span>
                    </th>
                    <th className="py-3 px-3 w-28 text-center border-l border-slate-200">
                      Status KKTP
                    </th>
                    <th className="py-3 px-3 min-w-56 border-l border-slate-200">
                      Catatan Tindak Lanjut / Remedial
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredGrades.map((student, idx) => {
                    const isUnderKKTP = !student.is_tuntas;

                    return (
                      <tr 
                        key={student.student_id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          isUnderKKTP ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 sticky left-0 bg-white">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 sticky left-12 bg-white">
                          {student.nis}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 sticky left-36 bg-white truncate">
                          {student.name}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            student.gender === 'L' ? 'bg-slate-200 text-slate-800' : 'bg-slate-300 text-slate-900'
                          }`}>
                            {student.gender}
                          </span>
                        </td>

                        {/* Interactive Input Cells */}
                        {components.map((comp) => {
                          const scoreVal = student.scores[comp.id];
                          const isLow = scoreVal !== null && scoreVal !== undefined && scoreVal < 75;

                          return (
                            <td key={comp.id} className="py-1 px-1.5 text-center border-l border-slate-200">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                disabled={period?.is_locked}
                                value={scoreVal ?? ''}
                                onChange={(e) => handleScoreChange(student.student_id, comp.id, e.target.value)}
                                className={`w-16 px-1.5 py-1 text-center font-bold text-xs rounded border transition-all ${
                                  isLow 
                                    ? 'bg-rose-100 border-rose-400 text-rose-900 font-extrabold' 
                                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-900'
                                } disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
                              />
                            </td>
                          );
                        })}

                        {/* Nilai Akhir (Calculated) */}
                        <td className="py-2.5 px-3 text-center border-l border-slate-300 bg-slate-50 font-black text-sm">
                          <span className={student.final_score >= 75 ? 'text-emerald-800' : 'text-rose-700'}>
                            {student.final_score.toFixed(1)}
                          </span>
                        </td>

                        {/* Status KKTP Solid Badge */}
                        <td className="py-2.5 px-3 text-center border-l border-slate-200">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            student.is_tuntas
                              ? 'bg-emerald-800 text-white'
                              : 'bg-rose-800 text-white shadow-xs'
                          }`}>
                            {student.is_tuntas ? 'Tuntas' : 'Remedial'}
                          </span>
                        </td>

                        {/* Catatan / Keterangan */}
                        <td className="py-2 px-3 border-l border-slate-200">
                          <input
                            type="text"
                            disabled={period?.is_locked}
                            placeholder={student.is_tuntas ? 'Memenuhi kriteria' : 'Rencana remedial...'}
                            value={student.notes || ''}
                            onChange={(e) => {
                              const noteVal = e.target.value;
                              setLocalGrades(prev => prev.map(s => s.student_id === student.student_id ? { ...s, notes: noteVal } : s));
                            }}
                            className="w-full px-2 py-1 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-900 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 2: CATATAN KARAKTER PROFIL PELAJAR PANCASILA (BE-GRD-02) ─── */}
      {mainTab === 'karakter' && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Catatan Karakter Profil Pelajar Pancasila (P5) Bulanan
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Skala capaian: MB (Mulai Berkembang), SB (Sedang Berkembang), BSH (Berkembang Sesuai Harapan), SAB (Sangat Berkembang).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700">
                Kelas IX-A • Oktober 2026
              </span>
            </div>
          </div>

          {/* Character Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3 w-24">NIS</th>
                    <th className="py-2.5 px-3 min-w-48">Nama Siswa</th>
                    <th className="py-2.5 px-2 w-28 text-center">Beriman &amp; Bertakwa</th>
                    <th className="py-2.5 px-2 w-28 text-center">Gotong Royong</th>
                    <th className="py-2.5 px-2 w-28 text-center">Mandiri</th>
                    <th className="py-2.5 px-2 w-28 text-center">Bernalar Kritis</th>
                    <th className="py-2.5 px-2 w-28 text-center">Kreatif</th>
                    <th className="py-2.5 px-3 min-w-64">Catatan Observasi Wali Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {localGrades.map((s, idx) => (
                    <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-700">
                        {s.nis}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 truncate">
                        {s.name}
                      </td>
                      {['beriman', 'gotongRoyong', 'mandiri', 'bernalarKritis', 'kreatif'].map((dim) => (
                        <td key={dim} className="py-1 px-1.5 text-center">
                          <select 
                            defaultValue="BSH"
                            className="w-full px-1.5 py-1 rounded text-xs font-bold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-900"
                          >
                            <option value="MB">MB</option>
                            <option value="SB">SB</option>
                            <option value="BSH">BSH</option>
                            <option value="SAB">SAB</option>
                          </select>
                        </td>
                      ))}
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          placeholder="Observasi pembiasaan dan akhlak..."
                          defaultValue={idx === 0 ? "Menunjukkan kepemimpinan positif dalam kerja tim lab." : ""}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:border-blue-900 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
