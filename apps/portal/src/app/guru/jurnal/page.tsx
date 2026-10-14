'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  History, 
  Search, 
  Download, 
  Save, 
  ChevronRight,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { lmsApi } from '@/lib/api-client';
import { AttendanceStatus, StudentRosterItem, TeachingJournal } from '@/types/lms';

export default function JurnalPresensiPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('sch-001');
  
  // Form input state
  const [meetingNumber, setMeetingNumber] = useState<number>(7);
  const [sessionDate, setSessionDate] = useState<string>('2026-10-21');
  const [topic, setTopic] = useState<string>('Penerapan Flexbox & Grid pada Desain Dashboard Web');
  const [method, setMethod] = useState<string>('Problem-Based Learning (PBL) & Praktikum Mandiri');
  const [notes, setNotes] = useState<string>('Semua komputer Lab 1 berfungsi baik. Evaluasi tugas responsif.');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['teaching-schedules'],
    queryFn: () => lmsApi.getSchedules(),
  });

  const { data: journals = [], isLoading: isLoadingJournals } = useQuery({
    queryKey: ['teaching-journals'],
    queryFn: () => lmsApi.getJournals(),
  });

  const { data: initialRoster = [], isLoading: isLoadingRoster } = useQuery({
    queryKey: ['student-roster'],
    queryFn: () => lmsApi.getStudentRoster('cls-9a'),
  });

  // Local student attendance state
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);

  // Sync roster on initial fetch
  React.useEffect(() => {
    if (initialRoster.length > 0 && roster.length === 0) {
      setRoster(initialRoster);
    }
  }, [initialRoster, roster.length]);

  // Active selected schedule
  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  // Quick batch actions
  const markAllStatus = (status: AttendanceStatus) => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
  };

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const updateStudentNote = (studentId: string, note: string) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, note } : s));
  };

  // Live Attendance Summary Stats
  const totalStudents = roster.length;
  const countHadir = roster.filter(s => s.status === 'hadir').length;
  const countSakit = roster.filter(s => s.status === 'sakit').length;
  const countIzin = roster.filter(s => s.status === 'izin').length;
  const countAlpa = roster.filter(s => s.status === 'alpa').length;
  const countTerlambat = roster.filter(s => s.status === 'terlambat').length;
  const attendanceRate = totalStudents > 0 
    ? Math.round(((countHadir + countTerlambat) / totalStudents) * 100) 
    : 0;

  // Mutation to save journal and attendances
  const saveMutation = useMutation({
    mutationFn: async () => {
      return lmsApi.createJournalWithAttendance({
        schedule_id: selectedScheduleId,
        session_date: sessionDate,
        topic,
        method,
        notes,
        attendances: roster.map(s => ({
          student_id: s.id,
          status: s.status,
          note: s.note,
        }))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teaching-journals'] });
      setSuccessMessage('Jurnal KBM dan Presensi Sesi Berhasil Disimpan ke Sistem Pusat!');
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('riwayat');
      }, 1500);
    }
  });

  const filteredRoster = roster.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.nis.includes(searchStudent)
  );

  return (
    <div className="w-full space-y-6">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              Modul KBM & Presensi
            </span>
            <span className="text-xs text-slate-500 font-semibold">• BE-ACD-02 & BE-ACD-03</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Jurnal Mengajar & Presensi Sesi Kelas
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Catat topik ajar, metode pembelajaran, dan verifikasi kehadiran siswa pada sesi tatap muka langsung di kelas atau laboratorium secara terpadu.
          </p>
        </div>

        {/* Tab Switcher (Solid Buttons) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'input'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Sesi KBM</span>
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'riwayat'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Jurnal ({journals.length})</span>
          </button>
        </div>
      </div>

      {/* ─── SUCCESS ALERT NOTIFICATION ─── */}
      {successMessage && (
        <div className="bg-emerald-800 text-white p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* ─── TAB 1: FORM INPUT JURNAL & PRESENSI KBM ─── */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Section A: Informasi Jadwal & Sesi */}
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-900" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  1. Informasi Jadwal & Sesi Pembelajaran
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                T.A. 2026/2027 Ganjil • Kurikulum Merdeka
              </span>
            </div>

            {/* Schedule Selector Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Jadwal Mengajar Hari Ini:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {schedules.map((sch) => {
                  const isSelected = sch.id === selectedScheduleId;
                  return (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => setSelectedScheduleId(sch.id)}
                      className={`text-left p-3.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50 ring-2 ring-blue-900/20'
                          : 'border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {sch.class_name}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {sch.day_name}
                        </span>
                      </div>
                      <div className="font-bold text-slate-700 mb-2">{sch.subject_name}</div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {sch.start_time} - {sch.end_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {sch.room_name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Input Sesi */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pertemuan Ke-
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={meetingNumber}
                  onChange={(e) => setMeetingNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Tatap Muka
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Metode Pembelajaran
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                >
                  <option value="Problem-Based Learning (PBL) & Praktikum Mandiri">Problem-Based Learning (PBL) & Praktikum Mandiri</option>
                  <option value="Project-Based Learning (PjBL) Kolaboratif">Project-Based Learning (PjBL) Kolaboratif</option>
                  <option value="Demonstrasi Live Coding & Latihan Mandiri">Demonstrasi Live Coding & Latihan Mandiri</option>
                  <option value="Diskusi Kelompok & Paparan Presentasi">Diskusi Kelompok & Paparan Presentasi</option>
                  <option value="Ceramah Interaktif & Asesmen Formatif Singkat">Ceramah Interaktif & Asesmen Formatif Singkat</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materi Pokok / Capaian Pembelajaran (TP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembuatan Layout Responsif 12 Kolom Menggunakan CSS Grid..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Kendala / Progres KBM (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan khusus mengenai pemahaman siswa, kendala perangkat laboratorium, atau tindak lanjut..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                />
              </div>
            </div>
          </div>

          {/* Section B: Presensi Sesi Siswa Terpadu */}
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  2. Lembar Presensi Siswa Sesi KBM ({roster.length} Siswa Terdaftar)
                </h2>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAllStatus('hadir')}
                  className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tandai Semua Hadir</span>
                </button>
              </div>
            </div>

            {/* KPI Kehadiran Realtime (Solid High Contrast Badges) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Roster</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{totalStudents}</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-700 text-white">
                <span className="text-[11px] font-bold text-emerald-100 uppercase block">Hadir</span>
                <span className="text-xl font-black text-white mt-1 block">{countHadir} Siswa</span>
              </div>
              <div className="p-3 rounded-lg border border-amber-300 bg-amber-600 text-white">
                <span className="text-[11px] font-bold text-amber-100 uppercase block">Sakit</span>
                <span className="text-xl font-black text-white mt-1 block">{countSakit} Siswa</span>
              </div>
              <div className="p-3 rounded-lg border border-blue-300 bg-blue-700 text-white">
                <span className="text-[11px] font-bold text-blue-100 uppercase block">Izin</span>
                <span className="text-xl font-black text-white mt-1 block">{countIzin} Siswa</span>
              </div>
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-700 text-white">
                <span className="text-[11px] font-bold text-rose-100 uppercase block">Alpa</span>
                <span className="text-xl font-black text-white mt-1 block">{countAlpa} Siswa</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-400 bg-slate-900 text-white">
                <span className="text-[11px] font-bold text-slate-300 uppercase block">% Kehadiran</span>
                <span className="text-xl font-black text-white mt-1 block">{attendanceRate}%</span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa berdasarkan nama atau NIS..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 font-medium"
                />
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Menampilkan {filteredRoster.length} dari {roster.length} siswa
              </div>
            </div>

            {/* Table Roster Kehadiran */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-24">NIS</th>
                      <th className="py-2.5 px-3 min-w-50">Nama Lengkap Siswa</th>
                      <th className="py-2.5 px-3 w-16 text-center">L/P</th>
                      <th className="py-2.5 px-3 w-80 text-center">Status Kehadiran Sesi</th>
                      <th className="py-2.5 px-3 min-w-56">Keterangan / Catatan Izin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoster.map((student, idx) => {
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                            {student.nis}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {student.name}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              student.gender === 'L' ? 'bg-slate-200 text-slate-800' : 'bg-slate-300 text-slate-900'
                            }`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* Hadir Button */}
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'hadir')}
                                className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                                  student.status === 'hadir'
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                H
                              </button>

                              {/* Sakit Button */}
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'sakit')}
                                className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                                  student.status === 'sakit'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                S
                              </button>

                              {/* Izin Button */}
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'izin')}
                                className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                                  student.status === 'izin'
                                    ? 'bg-blue-700 text-white shadow-xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                I
                              </button>

                              {/* Alpa Button */}
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'alpa')}
                                className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                                  student.status === 'alpa'
                                    ? 'bg-rose-700 text-white shadow-xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                A
                              </button>

                              {/* Terlambat Button */}
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'terlambat')}
                                className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                                  student.status === 'terlambat'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                T
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Keterangan dispensasi/surat..."
                              value={student.note || ''}
                              onChange={(e) => updateStudentNote(student.id, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:border-blue-900 focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Pastikan seluruh absensi telah divalidasi sebelum disimpan. Perubahan jurnal dapat diedit kembali dalam 3x24 jam.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saveMutation.isPending ? 'Menyimpan ke Database...' : 'Simpan Jurnal & Presensi Sesi KBM'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: RIWAYAT JURNAL & REKAP KBM ─── */}
      {activeTab === 'riwayat' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Arsip Pertemuan KBM Selesai
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Riwayat jurnal mengajar dan log kehadiran per pertemuan semester berjalan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Pertemuan,Tanggal,Kelas,Mapel,Topik,Metode,Hadir,Sakit,Izin,Alpa,Terlambat,Persentase\n" +
                      journals.map(j => `"${j.meeting_number}","${j.session_date}","${j.class?.name || 'IX-A'}","${j.subject?.name || 'Informatika'}","${j.topic}","${j.method}",${j.attendance_summary.hadir},${j.attendance_summary.sakit},${j.attendance_summary.izin},${j.attendance_summary.alpa},${j.attendance_summary.terlambat},"${j.attendance_summary.attendance_rate}%"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Jurnal_KBM_Informatika_Kelas_IXA.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* List Riwayat Jurnal */}
            <div className="divide-y divide-slate-200">
              {journals.map((journal) => (
                <div key={journal.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                        #{journal.meeting_number}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {journal.topic}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                          <span className="font-bold text-slate-700">{journal.class?.name || 'Kelas IX-A'}</span>
                          <span>•</span>
                          <span>{journal.session_date}</span>
                          <span>•</span>
                          <span>{journal.time_range}</span>
                          <span>•</span>
                          <span className="text-slate-600">{journal.room_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Pill Group */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white">
                        H: {journal.attendance_summary.hadir}
                      </span>
                      {journal.attendance_summary.sakit > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white">
                          S: {journal.attendance_summary.sakit}
                        </span>
                      )}
                      {journal.attendance_summary.izin > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-700 text-white">
                          I: {journal.attendance_summary.izin}
                        </span>
                      )}
                      {journal.attendance_summary.alpa > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-700 text-white">
                          A: {journal.attendance_summary.alpa}
                        </span>
                      )}
                      {journal.attendance_summary.terlambat > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-600 text-white">
                          T: {journal.attendance_summary.terlambat}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-slate-900 text-white ml-1">
                        {journal.attendance_summary.attendance_rate}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-700">Metode KBM: </span>
                      <span className="text-slate-600">{journal.method}</span>
                    </div>
                    {journal.notes && (
                      <div>
                        <span className="font-bold text-slate-700">Catatan Guru: </span>
                        <span className="text-slate-600">{journal.notes}</span>
                      </div>
                    )}
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
