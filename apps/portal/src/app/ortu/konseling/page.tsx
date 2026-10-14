'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Send, 
  Plus, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useGuardian } from '@/lib/guardian-context';
import { MOCK_GUARDIAN_COUNSELING, GuardianCounselingItem } from '@/lib/mock-guardian-data';

export default function GuardianKonselingPage() {
  const { activeChild } = useGuardian();
  const [appointments, setAppointments] = useState<GuardianCounselingItem[]>(MOCK_GUARDIAN_COUNSELING);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<'Wali Kelas' | 'Guru BK'>('Wali Kelas');
  const [topic, setTopic] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter appointments for active child
  const childAppointments = appointments.filter(a => a.student_id === activeChild.id);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !requestedDate || !notes) {
      toast.error('Mohon lengkapi topik, tanggal, dan catatan permohonan konsultasi');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const targetName = targetRole === 'Wali Kelas' 
        ? `${activeChild.homeroom_teacher} (Wali Kelas ${activeChild.class_name})`
        : 'Ibu Ratna Dewi, S.Pd., Kons. (Koordinator Guru BK)';

      const newAppt: GuardianCounselingItem = {
        id: `g-csl-${Date.now()}`,
        student_id: activeChild.id,
        student_name: activeChild.name,
        topic: topic,
        target_role: targetRole,
        target_name: targetName,
        requested_date: requestedDate,
        status: 'menunggu',
        location: targetRole === 'Wali Kelas' ? 'Ruang Guru Gedung Utama' : 'Ruang BK Lantai 2',
        notes: notes,
      };

      setAppointments([newAppt, ...appointments]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setTopic('');
      setRequestedDate('');
      setNotes('');

      toast.success('Permohonan janji temu berhasil dikirimkan!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER BANNER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-800 text-white text-xs font-bold mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-white" />
            <span>Pendampingan Belajar & Konseling Siswa</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Janji Temu Konseling & Wali Kelas ({activeChild.name})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Ajukan jadwal diskusi tatap muka bersama Wali Kelas atau Guru BK untuk pendampingan studi ananda.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Ajukan Janji Temu Baru</span>
        </button>
      </div>

      {/* ─── CONTACT WALAS & BK DIRECT CARDS (13_MASTER_MODULES §5 COMPLIANCE) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Homeroom Teacher */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-emerald-800 text-white font-extrabold flex items-center justify-center shrink-0">
              WK
            </div>
            <div className="min-w-0">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                Wali Kelas {activeChild.class_name}
              </span>
              <h3 className="text-xs font-black text-slate-900 truncate mt-1">
                {activeChild.homeroom_teacher}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Kontak: {activeChild.homeroom_phone}
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${activeChild.homeroom_phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Card 2: Guidance Counselor */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-teal-800 text-white font-extrabold flex items-center justify-center shrink-0">
              BK
            </div>
            <div className="min-w-0">
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-black uppercase">
                Bimbingan & Konseling
              </span>
              <h3 className="text-xs font-black text-slate-900 truncate mt-1">
                Ibu Ratna Dewi, S.Pd., Kons.
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Koordinator BK Labschool UM
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6281334567895"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp BK</span>
          </a>
        </div>
      </div>

      {/* ─── DAFTAR TIKET JANJI TEMU KONSELING ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Daftar Permohonan Janji Temu ({activeChild.name.split(' ')[0]})
            </h2>
            <p className="text-xs text-slate-500">
              Jadwal konsultasi tatap muka yang telah diajukan wali murid
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700">
            {childAppointments.length} Agenda
          </span>
        </div>

        <div className="space-y-3">
          {childAppointments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500">
              <HeartHandshake className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold">Belum ada jadwal janji temu konseling yang diajukan.</p>
            </div>
          ) : (
            childAppointments.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 hover:bg-white transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.target_role === 'Guru BK' ? 'bg-teal-800 text-white' : 'bg-emerald-800 text-white'
                    }`}>
                      {item.target_role}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-900">
                      {item.topic}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black self-start sm:self-auto ${
                    item.status === 'terjadwal' ? 'bg-blue-900 text-white' :
                    item.status === 'selesai' ? 'bg-emerald-800 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {item.status === 'terjadwal' ? 'Jadwal Disetujui' :
                     item.status === 'selesai' ? 'Selesai Dilaksanakan' : 'Menunggu Konfirmasi'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Narasumber: <strong className="text-slate-900">{item.target_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Waktu: <strong className="text-slate-900">{item.requested_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Lokasi: <strong className="text-slate-900">{item.location}</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                  <p className="font-bold text-slate-800 mb-0.5">Catatan Diskusi / Harapan Orang Tua:</p>
                  <p className="text-[11px] leading-relaxed">{item.notes}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── MODAL PENGAJUAN JANJI TEMU BARU ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-200" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Permohonan Janji Temu Konseling
                  </h3>
                  <p className="text-[11px] text-teal-100">
                    Siswa: {activeChild.name} ({activeChild.class_name})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-teal-100 hover:text-white hover:bg-teal-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              {/* Target Konseling */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tujuan Konsultasi *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetRole('Wali Kelas')}
                    className={`p-3 rounded-lg border-2 text-left font-bold text-xs transition-colors ${
                      targetRole === 'Wali Kelas'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black">Wali Kelas</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {activeChild.homeroom_teacher.split(',')[0]}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetRole('Guru BK')}
                    className={`p-3 rounded-lg border-2 text-left font-bold text-xs transition-colors ${
                      targetRole === 'Guru BK'
                        ? 'border-teal-700 bg-teal-50 text-teal-950'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black">Guru BK</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      Bimbingan & Konseling
                    </span>
                  </button>
                </div>
              </div>

              {/* Topik Diskusi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Topik Konsultasi *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Diskusi Penjurusan SMA / Minat Bakat Olimpiade..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              {/* Usulan Waktu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Usulan Hari & Jam Pertemuan *
                </label>
                <input
                  type="text"
                  required
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  placeholder="Contoh: Jumat, 23 Oktober 2026 - 13:30 WIB"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              {/* Catatan / Harapan Diskusi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Harapan Diskusi / Catatan Tambahan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan hal-hal yang ingin didiskusikan secara mendalam mengenai ananda..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
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
                  className="px-5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Permohonan Janji Temu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
