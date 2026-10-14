'use client';

import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  FileUp, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar as CalendarIcon, 
  Info, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian } from '@/lib/guardian-context';
import { MOCK_LEAVE_REQUESTS, LeaveRequestItem } from '@/lib/mock-guardian-data';

export default function GuardianPresensiPage() {
  const { activeChild, activeAttendance } = useGuardian();
  
  // Local state for leave requests so user can submit new ones
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>(MOCK_LEAVE_REQUESTS);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'sakit' | 'izin'>('sakit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter leave requests for active child
  const childLeaveRequests = leaveRequests.filter(lr => lr.student_id === activeChild.id);

  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Mohon lengkapi tanggal dan alasan permohonan izin');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRequest: LeaveRequestItem = {
        id: `lr-${Date.now()}`,
        student_id: activeChild.id,
        student_name: activeChild.name,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        attachment_name: uploadedFileName || (leaveType === 'sakit' ? 'Surat_Keterangan_Dokter_Klinik.pdf' : 'Surat_Izin_Orang_Tua.pdf'),
        status: 'menunggu',
        submitted_at: 'Baru saja',
        approval_note: 'Menunggu peninjauan dan persetujuan oleh wali kelas.',
      };

      setLeaveRequests([newRequest, ...leaveRequests]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setUploadedFileName('');

      toast.success('Surat permohonan izin berhasil dikirim ke Wali Kelas!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER & FAST ACTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-800 text-white text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-white" />
            <span>Presensi & Perizinan Terpadu Siswa</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Presensi & Log Gerbang ({activeChild.name})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Rekapitulasi tap mesin RFID gerbang sekolah, kalender kehadiran kelas, dan pengajuan surat izin online.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Ajukan Surat Izin / Sakit Baru</span>
        </button>
      </div>

      {/* ─── STATISTIK REKAPITULASI SEMESTER ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tingkat Hadir</p>
          <p className="text-xl font-black text-emerald-800 mt-1">{activeChild.attendance_recap.rate}%</p>
          <span className="text-[10px] text-slate-600 font-medium">Semester Gasal</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Hadir</p>
          <p className="text-xl font-black text-slate-900 mt-1">{activeChild.attendance_recap.hadir} Hari</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-700 text-white text-[10px] font-bold">Tepat Waktu</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Sakit</p>
          <p className="text-xl font-black text-amber-700 mt-1">{activeChild.attendance_recap.sakit} Hari</p>
          <span className="text-[10px] text-slate-500 font-medium">Surat dokter terverifikasi</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Izin</p>
          <p className="text-xl font-black text-blue-900 mt-1">{activeChild.attendance_recap.izin} Hari</p>
          <span className="text-[10px] text-slate-500 font-medium">Izin keperluan keluarga</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Terlambat</p>
          <p className="text-xl font-black text-purple-800 mt-1">{activeChild.attendance_recap.terlambat} Hari</p>
          <span className="text-[10px] text-slate-500 font-medium">Toleransi hujan/macet</span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tanpa Keterangan</p>
          <p className="text-xl font-black text-slate-400 mt-1">{activeChild.attendance_recap.alpa} Hari</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-800 text-white text-[10px] font-bold">Nihil Alpa</span>
        </div>
      </div>

      {/* ─── DUA KOLOM: KALENDER PRESENSI & RIWAYAT SURAT IZIN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Attendance Log Table & Grid */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Log Kehadiran Bulan Oktober 2026 ({activeChild.name.split(' ')[0]})
              </h2>
              <p className="text-xs text-slate-500">
                Pencatatan otomatis mesin RFID gerbang utama dan absensi kelas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-800 text-white text-xs font-bold">
                Oktober 2026
              </span>
            </div>
          </div>

          {/* Table of Daily Logs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Tanggal & Hari</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tap Datang</th>
                  <th className="py-2.5 px-3">Tap Pulang</th>
                  <th className="py-2.5 px-3">Catatan Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {activeAttendance.map((day) => {
                  let badge = 'bg-emerald-800 text-white';
                  let label = 'Hadir';

                  if (day.status === 'sakit') {
                    badge = 'bg-amber-600 text-white';
                    label = 'Sakit';
                  } else if (day.status === 'izin') {
                    badge = 'bg-blue-900 text-white';
                    label = 'Izin';
                  } else if (day.status === 'terlambat') {
                    badge = 'bg-purple-800 text-white';
                    label = 'Terlambat';
                  } else if (day.status === 'libur') {
                    badge = 'bg-slate-400 text-white';
                    label = 'Libur';
                  }

                  return (
                    <tr key={day.date} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-extrabold text-slate-900">{day.day_number} Okt 2026</span>
                        <span className="text-slate-500 ml-1.5 font-normal">({day.day_name})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge}`}>
                          {label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {day.tap_in || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {day.tap_out || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {day.note || 'KBM Berjalan Normal'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Leave Requests Tracking History */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Riwayat Surat Izin
              </h2>
              <p className="text-xs text-slate-500">
                Status verifikasi oleh Wali Kelas
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-[11px] font-bold">
              {childLeaveRequests.length} Surat
            </span>
          </div>

          <div className="space-y-3">
            {childLeaveRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg">
                <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold">Belum ada pengajuan surat izin</p>
              </div>
            ) : (
              childLeaveRequests.map((req) => (
                <div 
                  key={req.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      req.leave_type === 'sakit' ? 'bg-amber-600 text-white' : 'bg-blue-900 text-white'
                    }`}>
                      {req.leave_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Diajukan: {req.submitted_at}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {req.start_date} {req.start_date !== req.end_date ? `s.d. ${req.end_date}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {req.reason}
                    </p>
                  </div>

                  {req.attachment_name && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate">{req.attachment_name}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      req.status === 'disetujui' ? 'bg-emerald-800 text-white' :
                      req.status === 'ditolak' ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {req.status === 'disetujui' ? 'Disetujui Walas' :
                       req.status === 'ditolak' ? 'Ditolak' : 'Menunggu Konfirmasi'}
                    </span>

                    {req.approved_by && (
                      <span className="text-[10px] text-slate-500 italic">
                        Oleh: {req.approved_by.split('(')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL: PENGAJUAN SURAT IZIN / SAKIT BARU ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileUp className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Pengajuan Surat Izin / Sakit Online
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Siswa: {activeChild.name} ({activeChild.class_name})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitLeaveRequest} className="p-6 space-y-4">
              {/* Jenis Permohonan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Ketidakhadiran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeaveType('sakit')}
                    className={`p-3 rounded-lg border-2 text-left font-bold text-xs transition-colors ${
                      leaveType === 'sakit'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black">Sakit</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      Disertai surat dokter / resep klinik
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('izin')}
                    className={`p-3 rounded-lg border-2 text-left font-bold text-xs transition-colors ${
                      leaveType === 'izin'
                        ? 'border-blue-900 bg-blue-50 text-blue-950'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black">Izin Kepentingan</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      Keperluan keluarga / perlombaan
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Lampiran Berkas Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unggah Surat Dokter / Surat Izin Ortu (PDF/JPG/PNG)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                  <FileUp className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs text-slate-700 font-bold">
                    {uploadedFileName || 'Klik atau geser file surat ke sini'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
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
                    className="mt-2 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
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
