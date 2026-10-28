'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  FileUp, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar as CalendarIcon, 
  X, 
  Check, 
  Send,
  UserCheck,
  CalendarDays,
  TrendingUp,
  HeartPulse,
  LayoutGrid,
  ListFilter,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian } from '@/lib/guardian-context';
import { AttendanceCalendarDay } from '@/lib/mock-guardian-data';
import { useLeaveRequests, useCreateLeaveRequest } from '@/lib/use-guardian-data';

export default function GuardianPresensiPage() {
  const { activeChild, activeAttendance } = useGuardian();
  const { data: rawLeaveRequests = [], isLoading: isLeaveLoading } = useLeaveRequests();
  const createLeaveMutation = useCreateLeaveRequest();
  
  // View toggle: 'calendar' (zero-scroll 7x5 month matrix) vs 'table' (detailed log)
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  
  // Table status filter
  const [tableFilter, setTableFilter] = useState<'all' | 'hadir' | 'sakit-izin' | 'terlambat' | 'libur'>('all');

  // Selected calendar day for detail viewing
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(14); // Default to today (14 Okt)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'sakit' | 'izin'>('sakit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter leave requests for active child
  const childLeaveRequests = useMemo(() => {
    return rawLeaveRequests
      .filter(lr => lr.student_id === activeChild.id)
      .map((req, idx) => {
        const startStr = req.start_date ? new Date(req.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        const endStr = req.end_date ? new Date(req.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        const createdStr = req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja';
        return {
          id: req.id,
          student_id: req.student_id,
          leave_type: req.leave_type,
          start_date: startStr,
          end_date: endStr,
          reason: req.reason,
          attachment_name: req.attachment_file_id ? 'Lampiran_Dokter.pdf' : (req.leave_type === 'sakit' ? 'Surat_Keterangan_Dokter.pdf' : undefined),
          status: req.status,
          submitted_at: createdStr,
          approval_note: req.decision_notes || (req.status === 'disetujui' ? 'Disetujui oleh wali kelas.' : 'Menunggu peninjauan oleh wali kelas.'),
          approved_by: req.decided_by ? 'Wali Kelas' : undefined,
        };
      });
  }, [rawLeaveRequests, activeChild.id]);

  // Generate full 31 days of October 2026 for the calendar matrix
  // Oct 1, 2026 is Kamis (Thursday). Days of week: Sen(1), Sel(2), Rab(3), Kam(4), Jum(5), Sab(6), Min(7)
  const fullOctoberDays: AttendanceCalendarDay[] = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const existing = activeAttendance.find(d => d.day_number === dayNum);
    if (existing) return existing;

    // Projected future days in October 2026
    const dayOfWeek = (dayNum + 2) % 7; // Oct 1 = Thursday (index 4 in 1-based, or dayOfWeek logic)
    // Oct 1: Kamis, 2: Jum, 3: Sab, 4: Min, 5: Sen, etc.
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dateObj = new Date(2026, 9, dayNum);
    const dayName = dayNames[dateObj.getDay()];
    const isWeekend = dayName === 'Sabtu' || dayName === 'Minggu';

    return {
      date: `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`,
      day_number: dayNum,
      day_name: dayName,
      status: isWeekend ? 'libur' : 'hadir',
      tap_in: isWeekend ? undefined : 'Jadwal KBM',
      tap_out: isWeekend ? undefined : '15:15 WIB',
      note: isWeekend ? 'Libur Akhir Pekan' : 'Jadwal Reguler Semester Gasal',
    };
  });

  // Filtered attendance for table view
  const filteredAttendance = activeAttendance.filter((day) => {
    if (tableFilter === 'all') return true;
    if (tableFilter === 'hadir') return day.status === 'hadir';
    if (tableFilter === 'sakit-izin') return day.status === 'sakit' || day.status === 'izin';
    if (tableFilter === 'terlambat') return day.status === 'terlambat';
    if (tableFilter === 'libur') return day.status === 'libur';
    return true;
  });

  const selectedDayData = fullOctoberDays.find(d => d.day_number === selectedDayNumber) || fullOctoberDays[13];

  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Mohon lengkapi tanggal dan alasan permohonan izin');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeaveMutation.mutateAsync({
        student_id: activeChild.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setUploadedFileName('');

      toast.success('Surat permohonan izin berhasil dikirim ke Wali Kelas!');
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err?.response?.data?.message || 'Gagal mengirim permohonan izin. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex flex-col gap-3.5 max-w-full min-h-full pb-6">
      {/* ─── 1. HEADER BAR (DESKTOP MAXIMIZED & WELL-PROPORTIONED) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
              Presensi & Log Gerbang RFID ({activeChild.name.split(' ')[0]})
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-800 text-white text-[10px] sm:text-xs font-bold shadow-2xs">
              Kelas {activeChild.class_name.replace('Kelas ', '')}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-[10px] sm:text-xs font-mono font-semibold">
              NIS: {activeChild.nis}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal">
            Monitoring tap mesin gerbang sekolah, kalender absensi harian kelas, dan pengelolaan surat izin wali murid.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 self-start sm:self-auto hover:shadow"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Ajukan Surat Izin / Sakit</span>
        </button>
      </div>

      {/* ─── 2. REKAPITULASI SEMESTER (PROPORTIONED DESKTOP CARDS - NO EMPTY VOID) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 shrink-0">
        {/* Panel 1: Akumulasi Kehadiran (Hero Card - 4 Cols) */}
        <div className="xl:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Akumulasi Kehadiran</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-normal">Semester Gasal 2026/2027</p>
              </div>
            </div>
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-800 text-white shadow-2xs">
              Target: 95%
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 sm:gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {activeChild.attendance_recap.rate}%
              </span>
              <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-2xs ${
                activeChild.attendance_recap.rate >= 90 ? 'bg-emerald-800 text-white' : 'bg-rose-700 text-white'
              }`}>
                {activeChild.attendance_recap.rate >= 90 ? 'Memenuhi Standar' : 'Di Bawah Target'}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">
              {activeChild.attendance_recap.hadir}/{activeChild.attendance_recap.hadir + activeChild.attendance_recap.sakit + activeChild.attendance_recap.izin + activeChild.attendance_recap.terlambat + activeChild.attendance_recap.alpa} Hari KBM
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 mb-2">
            <div 
              style={{ width: `${Math.min(100, activeChild.attendance_recap.rate)}%` }} 
              className={`h-full rounded-full ${activeChild.attendance_recap.rate >= 90 ? 'bg-emerald-700' : 'bg-amber-600'}`}
            />
          </div>

          {/* Hari Ini Realtime Gate Banner */}
          <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] sm:text-xs ${
            activeChild.gate_attendance_today.status === 'hadir' ? 'bg-emerald-50/70 border-emerald-200 text-slate-900' :
            activeChild.gate_attendance_today.status === 'sakit' ? 'bg-amber-50/70 border-amber-200 text-slate-900' :
            activeChild.gate_attendance_today.status === 'izin' ? 'bg-blue-50/70 border-blue-200 text-slate-900' :
            'bg-rose-50/70 border-rose-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-700" />
              <p className="font-semibold text-slate-900 truncate">
                Hari Ini: {activeChild.gate_attendance_today.status_label}
                {activeChild.gate_attendance_today.tap_time !== '-' && ` (${activeChild.gate_attendance_today.tap_time})`}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold shrink-0 uppercase tracking-wide ${
              activeChild.gate_attendance_today.status === 'hadir' ? 'bg-emerald-800 text-white' :
              activeChild.gate_attendance_today.status === 'sakit' ? 'bg-amber-600 text-white' :
              activeChild.gate_attendance_today.status === 'izin' ? 'bg-blue-800 text-white' :
              'bg-rose-700 text-white'
            }`}>
              {activeChild.gate_attendance_today.status}
            </span>
          </div>
        </div>

        {/* Panel 2: 5 Metrik Presensi dalam 1 Baris Seimbang (8 Cols, Rich Font & Spacing) */}
        <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {/* 1. Hadir Fisik */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Hadir Fisik</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-1 sm:my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activeChild.attendance_recap.hadir}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Hari</span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">95.8% Tingkat Hadir</p>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500">RFID</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-emerald-800 text-white">Tepat Waktu</span>
            </div>
          </div>

          {/* 2. Izin Sakit */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Izin Sakit</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-1 sm:my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activeChild.attendance_recap.sakit}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Hari</span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Surat Dokter RS</p>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500">Dokter</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
                activeChild.attendance_recap.sakit > 0 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-white'
              }`}>
                {activeChild.attendance_recap.sakit > 0 ? 'Ada Surat' : 'Nihil'}
              </span>
            </div>
          </div>

          {/* 3. Izin Resmi */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Izin Resmi</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-1 sm:my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activeChild.attendance_recap.izin}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Hari</span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Dispensasi Walas</p>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500">Surat Ortu</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
                activeChild.attendance_recap.izin > 0 ? 'bg-blue-800 text-white' : 'bg-slate-800 text-white'
              }`}>
                {activeChild.attendance_recap.izin > 0 ? 'Disetujui' : 'Nihil'}
              </span>
            </div>
          </div>

          {/* 4. Terlambat Masuk */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Terlambat</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-1 sm:my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activeChild.attendance_recap.terlambat}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Hari</span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">+12 mnt gerbang</p>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500">Gerbang</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
                activeChild.attendance_recap.terlambat > 0 ? 'bg-rose-700 text-white' : 'bg-slate-800 text-white'
              }`}>
                {activeChild.attendance_recap.terlambat > 0 ? 'Catatan' : 'Nihil'}
              </span>
            </div>
          </div>

          {/* 5. Tanpa Keterangan */}
          <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Tanpa Ket.</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="my-1 sm:my-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{activeChild.attendance_recap.alpa}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1.5">Hari</span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Disiplin Tertib</p>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-medium text-slate-500">Alpa</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${
                activeChild.attendance_recap.alpa > 0 ? 'bg-rose-700 text-white' : 'bg-slate-800 text-white'
              }`}>
                {activeChild.attendance_recap.alpa > 0 ? 'Perlu SP' : 'Nihil Alpa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. DUA KOLOM: KALENDER PRESENSI & RIWAYAT SURAT IZIN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* KOLOM KIRI: KALENDER PRESENSI BULANAN (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          {/* Header Bar dengan View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-slate-100 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  Log Kehadiran <span className="hidden sm:inline">Bulan Oktober 2026</span> ({activeChild.name.split(' ')[0]})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] sm:text-xs font-bold whitespace-nowrap shrink-0">
                  Okt 2026
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 truncate">
                {viewMode === 'calendar' 
                  ? 'Matriks kalender bulanan 31 hari — klik tanggal untuk rincian.'
                  : 'Daftar riwayat harian tap gerbang & absensi ruang kelas.'}
              </p>
            </div>

            {/* View Mode Segmented Switcher */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Matriks Kalender</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tabel Log</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: KALENDER MATRIKS 7 KOLOM */}
          {viewMode === 'calendar' ? (
            <div className="flex flex-col justify-between mt-2.5">
              {/* Day of Week Headers (Senin s.d. Minggu) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pb-1 text-center shrink-0">
                {[
                  { short: 'Sen', full: 'Senin' },
                  { short: 'Sel', full: 'Selasa' },
                  { short: 'Rab', full: 'Rabu' },
                  { short: 'Kam', full: 'Kamis' },
                  { short: 'Jum', full: 'Jumat' },
                  { short: 'Sab', full: 'Sabtu' },
                  { short: 'Min', full: 'Minggu' },
                ].map((d, idx) => (
                  <div key={d.full} className={`py-1 text-[11px] sm:text-xs font-bold rounded-lg ${
                    idx >= 5 ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-slate-100'
                  }`}>
                    <span className="sm:hidden">{d.short}</span>
                    <span className="hidden sm:inline">{d.full}</span>
                  </div>
                ))}
              </div>

              {/* 31 Days Grid (5 Rows x 7 Columns) */}
              {/* Oct 1, 2026 is Thursday (Kamis), so 3 empty cells at start: Mon, Tue, Wed */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1 min-h-0">
                {/* 3 Empty Cells for Sept 28, 29, 30 */}
                {[28, 29, 30].map((num) => (
                  <div key={num} className="rounded-xl border border-dashed border-slate-200/60 bg-slate-50/40 p-1 sm:p-1.5 opacity-40 flex flex-col justify-between text-slate-400 min-h-[58px] sm:min-h-[72px]">
                    <span className="text-[11px] sm:text-xs font-semibold font-mono">{num}</span>
                    <span className="text-[9px] sm:text-[10px] truncate">Sept</span>
                  </div>
                ))}

                {/* 31 Days of October */}
                {fullOctoberDays.map((day) => {
                  const isSelected = day.day_number === selectedDayNumber;
                  const isToday = day.day_number === 14;

                  let badgeBg = 'bg-emerald-800 text-white';
                  let statusTextDesktop = 'Hadir';
                  let statusTextMobile = 'Hadir';

                  if (day.status === 'sakit') {
                    badgeBg = 'bg-amber-600 text-white';
                    statusTextDesktop = 'Sakit';
                    statusTextMobile = 'Sakit';
                  } else if (day.status === 'izin') {
                    badgeBg = 'bg-blue-800 text-white';
                    statusTextDesktop = 'Izin';
                    statusTextMobile = 'Izin';
                  } else if (day.status === 'terlambat') {
                    badgeBg = 'bg-rose-700 text-white';
                    statusTextDesktop = 'Terlambat';
                    statusTextMobile = 'Telat';
                  } else if (day.status === 'libur') {
                    badgeBg = 'bg-slate-400 text-white';
                    statusTextDesktop = 'Libur';
                    statusTextMobile = 'Libur';
                  }

                  const timeDisplay = day.tap_in && day.tap_in.includes(':') 
                    ? day.tap_in.replace(' WIB', '') 
                    : '-';

                  return (
                    <button
                      key={day.day_number}
                      type="button"
                      onClick={() => setSelectedDayNumber(day.day_number)}
                      className={`rounded-xl p-1 sm:p-1.5 text-left border transition-all flex flex-col justify-between relative group min-h-[58px] sm:min-h-[72px] ${
                        isSelected 
                          ? 'border-emerald-800 ring-2 ring-emerald-800/20 bg-emerald-50/40 shadow-xs' 
                          : isToday
                          ? 'border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50'
                          : day.status === 'libur'
                          ? 'border-slate-200/60 bg-slate-50/60 hover:bg-slate-100/60'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[11px] sm:text-xs font-bold leading-none ${
                          isToday ? 'text-emerald-900 font-extrabold' : 'text-slate-800'
                        }`}>
                          {day.day_number}
                        </span>
                        {isToday && (
                          <>
                            <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                            <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-800 text-white uppercase tracking-wider">
                              Hari Ini
                            </span>
                          </>
                        )}
                      </div>

                      <div className="w-full my-0.5">
                        <span className={`block text-center rounded px-0.5 sm:px-1 py-0.5 text-[9px] sm:text-[10px] font-bold truncate leading-tight ${badgeBg}`}>
                          <span className="sm:hidden">{statusTextMobile}</span>
                          <span className="hidden sm:inline">{statusTextDesktop}</span>
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-center sm:justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono leading-none">
                        <span className="truncate">{timeDisplay}</span>
                      </div>
                    </button>
                  );
                })}

                {/* 1 Empty cell at end for Nov 1 to complete the 35-cell grid (5 rows x 7 cols) */}
                <div className="rounded-xl border border-dashed border-slate-200/60 bg-slate-50/40 p-1 sm:p-1.5 opacity-40 flex flex-col justify-between text-slate-400 min-h-[58px] sm:min-h-[72px]">
                  <span className="text-[11px] sm:text-xs font-semibold font-mono">1</span>
                  <span className="text-[9px] sm:text-[10px] truncate">Nov</span>
                </div>
              </div>

              {/* Selected Date Detail Banner */}
              <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 shrink-0 text-sm shadow-2xs font-mono">
                    {selectedDayData.day_number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedDayData.day_name}, {selectedDayData.day_number} Oktober 2026
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase shadow-2xs ${
                        selectedDayData.status === 'hadir' ? 'bg-emerald-800 text-white' :
                        selectedDayData.status === 'sakit' ? 'bg-amber-600 text-white' :
                        selectedDayData.status === 'izin' ? 'bg-blue-800 text-white' :
                        selectedDayData.status === 'terlambat' ? 'bg-rose-700 text-white' : 'bg-slate-600 text-white'
                      }`}>
                        {selectedDayData.status}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-normal leading-tight">
                      {selectedDayData.note || 'Aktivitas belajar mengajar berjalan tertib di ruang kelas.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs font-mono text-slate-700 bg-white p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 shrink-0">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Tap Masuk</span>
                    <span className="font-bold text-slate-800">{selectedDayData.tap_in || '-'}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-2 sm:pl-3">
                    <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Tap Pulang</span>
                    <span className="font-bold text-slate-800">{selectedDayData.tap_out || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: TABEL LOG HARIAN DENGAN FILTER CEPAT & RESPONSIVE VIEW */
            <div className="flex-1 min-h-0 flex flex-col justify-between mt-2.5">
              {/* Filter Tabs without native scrollbar bar */}
              <div className="flex items-center gap-1.5 pb-1 shrink-0 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { id: 'all', label: 'Semua Status' },
                  { id: 'hadir', label: 'Hadir Tepat Waktu' },
                  { id: 'sakit-izin', label: 'Sakit & Izin' },
                  { id: 'terlambat', label: 'Terlambat' },
                  { id: 'libur', label: 'Akhir Pekan' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTableFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      tableFilter === tab.id
                        ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mobile Card List View (sm:hidden) */}
              <div className="sm:hidden space-y-2 mt-2 max-h-[420px] overflow-y-auto pr-0.5">
                {filteredAttendance.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold">Tidak ada data kehadiran untuk filter ini.</p>
                  </div>
                ) : (
                  filteredAttendance.map((day, idx) => {
                    let badge = 'bg-emerald-800 text-white';
                    let label = 'Hadir';
                    let borderAccent = 'border-l-emerald-800';

                    if (day.status === 'sakit') {
                      badge = 'bg-amber-600 text-white';
                      label = 'Izin Sakit';
                      borderAccent = 'border-l-amber-500';
                    } else if (day.status === 'izin') {
                      badge = 'bg-blue-800 text-white';
                      label = 'Izin Resmi';
                      borderAccent = 'border-l-blue-600';
                    } else if (day.status === 'terlambat') {
                      badge = 'bg-rose-700 text-white';
                      label = 'Terlambat';
                      borderAccent = 'border-l-rose-600';
                    } else if (day.status === 'libur') {
                      badge = 'bg-slate-500 text-white';
                      label = 'Libur';
                      borderAccent = 'border-l-slate-400';
                    }

                    return (
                      <div 
                        key={`${day.date}-${day.day_number}-${idx}`}
                        className={`p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs border-l-4 ${borderAccent} space-y-2`}
                      >
                        {/* Header: Date + Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900 font-mono">
                              {day.day_number} Okt 2026
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              • {day.day_name}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs ${badge}`}>
                            {label}
                          </span>
                        </div>

                        {/* Tap Times Grid */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-xs font-mono">
                          <div>
                            <span className="text-[10px] font-sans font-semibold text-slate-400 block uppercase">
                              Tap Masuk
                            </span>
                            <span className="font-bold text-slate-800">{day.tap_in || '-'}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-2">
                            <span className="text-[10px] font-sans font-semibold text-slate-400 block uppercase">
                              Tap Pulang
                            </span>
                            <span className="font-bold text-slate-800">{day.tap_out || '-'}</span>
                          </div>
                        </div>

                        {/* Note */}
                        <p className="text-[11px] text-slate-600 font-normal">
                          Catatan: <span className="font-medium text-slate-800">{day.note || 'KBM Berjalan Normal'}</span>
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table Container (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto pr-1 border border-slate-200 rounded-xl mt-2">
                <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 shadow-2xs">
                    <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3.5">Tanggal & Hari</th>
                      <th className="py-2.5 px-3.5">Status Presensi</th>
                      <th className="py-2.5 px-3.5">Tap Masuk</th>
                      <th className="py-2.5 px-3.5">Tap Pulang</th>
                      <th className="py-2.5 px-3.5">Catatan Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredAttendance.map((day, idx) => {
                      let badge = 'bg-emerald-800 text-white';
                      let label = 'Hadir';

                      if (day.status === 'sakit') {
                        badge = 'bg-amber-600 text-white';
                        label = 'Sakit';
                      } else if (day.status === 'izin') {
                        badge = 'bg-blue-800 text-white';
                        label = 'Izin';
                      } else if (day.status === 'terlambat') {
                        badge = 'bg-rose-700 text-white';
                        label = 'Terlambat';
                      } else if (day.status === 'libur') {
                        badge = 'bg-slate-600 text-white';
                        label = 'Libur';
                      }

                      return (
                        <tr key={`${day.date}-${day.day_number}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <span className="font-bold text-slate-900">{day.day_number} Okt 2026</span>
                            <span className="text-slate-500 ml-1.5 font-medium">({day.day_name})</span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${badge}`}>
                              {label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800">
                            {day.tap_in || '-'}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800">
                            {day.tap_out || '-'}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600">
                            {day.note || 'KBM Berjalan Normal'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: RIWAYAT PERIZINAN & LAYANAN WALI MURID (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Riwayat Surat Izin Ananda
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Verifikasi resmi oleh Wali Kelas ({activeChild.homeroom_teacher.split(',')[0]})
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-white text-xs font-bold shadow-2xs">
              {childLeaveRequests.length} Surat
            </span>
          </div>

          {/* List of Leave Requests (Compact & Distinct Cards with Accent Border & Numbering) */}
          <div className="max-h-[380px] overflow-y-auto pr-1 my-1.5 space-y-2.5">
            {childLeaveRequests.length === 0 ? (
              <div className="p-5 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                <FileText className="w-7 h-7 mx-auto text-slate-400 mb-1.5" />
                <p className="text-xs font-bold text-slate-800">Belum ada pengajuan surat izin</p>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh kehadiran tercatat tertib melalui mesin gerbang.</p>
              </div>
            ) : (
              childLeaveRequests.map((req, idx) => {
                const isSakit = req.leave_type === 'sakit';
                const typeLabel = isSakit ? 'Izin Sakit' : 'Izin Keperluan / Resmi';

                return (
                  <div 
                    key={req.id}
                    className={`bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all border-l-4 ${
                      isSakit ? 'border-l-amber-500' : 'border-l-blue-600'
                    }`}
                  >
                    {/* Header Row: Type Badge, Index #, and Submission Timestamp */}
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isSakit ? 'bg-amber-600 text-white' : 'bg-blue-800 text-white'
                        }`}>
                          {typeLabel}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          Surat #{idx + 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Diajukan: {req.submitted_at}
                      </span>
                    </div>

                    {/* Date and Reason Content */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <p className="text-xs font-bold text-slate-900">
                          {req.start_date} {req.start_date !== req.end_date ? `s.d. ${req.end_date}` : ''}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed pl-5">
                        {req.reason}
                      </p>
                    </div>

                    {/* Attachment Chip */}
                    {req.attachment_name && (
                      <div className="mt-1.5 ml-5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                        <span className="truncate">{req.attachment_name}</span>
                      </div>
                    )}

                    {/* Footer Row: Status & Approver */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.status === 'disetujui' ? 'bg-emerald-800 text-white' :
                        req.status === 'ditolak' ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {req.status === 'disetujui' ? 'Disetujui Walas' :
                         req.status === 'ditolak' ? 'Ditolak' : 'Menunggu Konfirmasi'}
                      </span>

                      {req.approved_by && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Oleh: <strong className="text-slate-800 font-semibold">{req.approved_by.split('(')[0]}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Solid Information Card & Fast Communication (Eliminates empty white space) */}
          <div className="pt-2 border-t border-slate-100 shrink-0 space-y-2">
            {/* Kebijakan Perizinan */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs text-slate-700 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" />
                <span>Ketentuan Perizinan Siswa Labschool UM:</span>
              </div>
              <p className="text-slate-600 leading-normal text-[11px] font-normal">
                • Izin sakit &gt; 1 hari wajib menyertakan surat dokter resmi.<br />
                • Izin keperluan keluarga diajukan paling lambat H-1 KBM.
              </p>
            </div>

            {/* Kontak Walas & Piket Gerbang */}
            <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block leading-tight text-xs">Piket Gerbang & Walas</span>
                  <span className="text-slate-600 text-[11px]">Verifikasi RFID: 06.15 - 15.30 WIB</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs"
              >
                + Ajukan Izin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: PENGAJUAN SURAT IZIN / SAKIT BARU ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileUp className="w-5 h-5 text-emerald-200 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pengajuan Surat Izin / Sakit Online
                  </h3>
                  <p className="text-xs text-emerald-100 font-normal">
                    Siswa: {activeChild.name} ({activeChild.class_name})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitLeaveRequest} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Jenis Permohonan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Ketidakhadiran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeaveType('sakit')}
                    className={`p-3 rounded-xl border text-left font-semibold text-xs transition-colors ${
                      leaveType === 'sakit'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">Sakit</span>
                    <span className="text-xs font-normal text-slate-500">
                      Disertai surat dokter / klinik
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('izin')}
                    className={`p-3 rounded-xl border text-left font-semibold text-xs transition-colors ${
                      leaveType === 'izin'
                        ? 'border-blue-900 bg-blue-50 text-blue-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">Izin Kepentingan</span>
                    <span className="text-xs font-normal text-slate-500">
                      Keperluan keluarga / lomba
                    </span>
                  </button>
                </div>
              </div>

              {/* Rentang Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Alasan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan Alasan Izin *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan ketidakhadiran ananda secara terperinci..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Lampiran Berkas Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unggah Surat Dokter / Surat Izin Ortu (PDF/JPG/PNG)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <FileUp className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs text-slate-700 font-semibold">
                    {uploadedFileName || 'Klik atau geser file surat ke sini'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    Maksimal ukuran file 2 MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="mt-2 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Permohonan Izin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
