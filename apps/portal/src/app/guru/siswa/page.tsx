'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MessageSquare, 
  Award, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Filter,
  Eye,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_STUDENTS_ROSTER } from '@/lib/mock-lms-data';

interface StudentDetailedProfile {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  attendanceRate: number;
  totalPoints: number;
  status: 'aktif' | 'mutasi' | 'alumni';
}

interface PointRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'prestasi' | 'pelanggaran';
  category: string;
  points: number;
  description: string;
  date: string;
  recordedBy: string;
}

export default function DirektoriSiswaPage() {
  const [activeTab, setActiveTab] = useState<'direktori' | 'poin'>('direktori');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [isPointModalOpen, setIsPointModalOpen] = useState<boolean>(false);

  // Form input state for adding points
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-240901');
  const [pointType, setPointType] = useState<'prestasi' | 'pelanggaran'>('prestasi');
  const [pointRule, setPointRule] = useState<string>('Juara 1 Lomba OSN Informatika Tingkat Kota (+25)');
  const [pointNotes, setPointNotes] = useState<string>('');

  // 32 Enriched Students
  const students: StudentDetailedProfile[] = MOCK_STUDENTS_ROSTER.map((std, idx) => ({
    id: std.id,
    nis: std.nis,
    nisn: `00891234${idx < 10 ? '0' + idx : idx}`,
    name: std.name,
    gender: std.gender,
    parentName: idx % 2 === 0 ? `Bpk. ${std.name.split(' ')[0]} Senior` : `Ibu ${std.name.split(' ')[0]} W.`,
    parentPhone: `08123456${7000 + idx}`,
    attendanceRate: idx === 2 ? 88.5 : idx === 6 ? 90.0 : 96.5,
    totalPoints: idx === 1 ? 25 : idx === 2 ? -10 : idx === 13 ? 35 : 0,
    status: 'aktif'
  }));

  const [pointRecords, setPointRecords] = useState<PointRecord[]>([
    {
      id: 'pt-1',
      studentId: 'std-240914',
      studentName: 'Karina Safitri',
      type: 'prestasi',
      category: 'Akademik & Sains',
      points: 25,
      description: 'Juara 1 Olimpiade Sains Nasional (OSN) Tingkat Kota Bidang Informatika',
      date: '2026-10-12',
      recordedBy: 'Budi Santoso, S.Kom.'
    },
    {
      id: 'pt-2',
      studentId: 'std-240903',
      studentName: 'Rizky Pratama Wijaya',
      type: 'pelanggaran',
      category: 'Kedisiplinan',
      points: -5,
      description: 'Terlambat masuk sekolah lebih dari 15 menit tanpa surat keterangan',
      date: '2026-10-14',
      recordedBy: 'Tim Tatib & Guru Piket'
    },
    {
      id: 'pt-3',
      studentId: 'std-240902',
      studentName: 'Nabila Putri Andini',
      type: 'prestasi',
      category: 'Pengembangan Diri',
      points: 15,
      description: 'Pemateri presentasi terbaik proyek literasi digital anti-hoaks',
      date: '2026-10-08',
      recordedBy: 'Budi Santoso, S.Kom.'
    }
  ]);

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const isPrestasi = pointType === 'prestasi';
    const pointsAmount = isPrestasi ? 15 : -5;

    const newRecord: PointRecord = {
      id: `pt-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      type: pointType,
      category: isPrestasi ? 'Prestasi KBM & Proyek' : 'Tata Tertib Kelas',
      points: pointsAmount,
      description: pointNotes || pointRule,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: 'Budi Santoso, S.Kom.'
    };

    setPointRecords([newRecord, ...pointRecords]);
    toast.success(`Poin ${isPrestasi ? 'penghargaan' : 'pelanggaran'} berhasil dicatat untuk ${student.name}!`);
    setIsPointModalOpen(false);
    setPointNotes('');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery) || s.nisn.includes(searchQuery);
    const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const handleExportCSV = () => {
    const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Orang Tua / Wali', 'No. WhatsApp', 'Kehadiran %', 'Poin Karakter'];
    const rows = students.map((s, idx) => [
      idx + 1,
      s.nis,
      s.nisn,
      `"${s.name}"`,
      s.gender,
      `"${s.parentName}"`,
      s.parentPhone,
      `"${s.attendanceRate}%"`,
      s.totalPoints
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_Kelas_IXA_LabschoolUM.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data peserta didik berhasil diekspor ke CSV.');
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              Data Siswa & Wali Kelas
            </span>
            <span className="text-xs text-slate-500 font-semibold">• ADM-MST-04 & BE-STD-01 (P0)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Direktori Peserta Didik & Poin Karakter Kelas IX-A
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Kelola data pokok siswa binaan, kontak orang tua/wali untuk koordinasi langsung, dan pencatatan poin pelanggaran serta apresiasi prestasi.
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('direktori')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'direktori' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Siswa ({students.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('poin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'poin' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Poin & Disiplin ({pointRecords.length})</span>
            </button>
          </div>

          {activeTab === 'direktori' ? (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPointModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Poin Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB 1: DIREKTORI SISWA & KONTAK ORTU ─── */}
      {activeTab === 'direktori' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama, NIS, atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
              <button
                type="button"
                onClick={() => setGenderFilter('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  genderFilter === 'ALL' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Semua ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('L')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  genderFilter === 'L' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Laki-Laki ({students.filter(s => s.gender === 'L').length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('P')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  genderFilter === 'P' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Perempuan ({students.filter(s => s.gender === 'P').length})
              </button>
            </div>
          </div>

          {/* Students Roster Table */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th className="py-3 px-3 w-24">NIS</th>
                    <th className="py-3 px-3 w-28">NISN</th>
                    <th className="py-3 px-3 min-w-52">Nama Siswa</th>
                    <th className="py-3 px-2 w-14 text-center">L/P</th>
                    <th className="py-3 px-3 min-w-44">Orang Tua / Wali</th>
                    <th className="py-3 px-3 w-40">Kontak WhatsApp</th>
                    <th className="py-3 px-3 w-28 text-center">Kehadiran</th>
                    <th className="py-3 px-3 w-28 text-center">Poin Disiplin</th>
                    <th className="py-3 px-3 w-28 text-center">Aksi Walas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {std.nis}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {std.nisn}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {std.name}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          std.gender === 'L' ? 'bg-slate-200 text-slate-800' : 'bg-slate-300 text-slate-900'
                        }`}>
                          {std.gender}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {std.parentName}
                      </td>
                      <td className="py-2.5 px-3">
                        <a
                          href={`https://wa.me/62${std.parentPhone.slice(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-800 text-white shadow-xs hover:bg-emerald-900 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{std.parentPhone}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-extrabold text-slate-800">
                          {std.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {std.totalPoints > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-900 text-white shadow-xs">
                            +{std.totalPoints} Poin
                          </span>
                        ) : std.totalPoints < 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-800 text-white shadow-xs">
                            {std.totalPoints} Poin
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toast.info(`Membuka berkas profil komprehensif untuk ${std.name}`)}
                          className="px-2.5 py-1 rounded text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          Profil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: POIN KEDISIPLINAN & PRESTASI SISWA (BE-STD-01) ─── */}
      {activeTab === 'poin' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Log Poin Karakter, Tata Tertib &amp; Prestasi Siswa
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Ambang batas pelanggaran: -25 poin memicu Peringatan Wali Kelas, -50 poin memicu Panggilan Orang Tua ke Sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPointModalOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Poin Siswa</span>
              </button>
            </div>

            {/* List Records */}
            <div className="space-y-3">
              {pointRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                      rec.type === 'prestasi' ? 'bg-blue-900' : 'bg-rose-800'
                    }`}>
                      {rec.type === 'prestasi' ? '🏆' : '⚠️'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{rec.studentName}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          rec.type === 'prestasi' ? 'bg-blue-900 text-white' : 'bg-rose-800 text-white'
                        }`}>
                          {rec.points > 0 ? `+${rec.points} Poin` : `${rec.points} Poin`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-0.5">
                        {rec.description}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Dicatat oleh: {rec.recordedBy} pada {rec.date}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700 shrink-0">
                    {rec.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL CATAT POIN SISWA ─── */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-base text-slate-900">
                Pencatatan Poin Siswa (BE-STD-01)
              </h3>
              <button
                type="button"
                onClick={() => setIsPointModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPoint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:border-blue-900 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nis} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Poin</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPointType('prestasi')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      pointType === 'prestasi' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    🏆 Poin Prestasi (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointType('pelanggaran')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      pointType === 'pelanggaran' ? 'bg-rose-800 text-white border-rose-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    ⚠️ Poin Pelanggaran (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi &amp; Alasan Pencatatan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Keterangan lengkap kejadian / prestasi yang diraih..."
                  value={pointNotes}
                  onChange={(e) => setPointNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-900 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white shadow-xs"
                >
                  Simpan Poin Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
