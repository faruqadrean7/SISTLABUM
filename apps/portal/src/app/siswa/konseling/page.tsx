'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { MOCK_STUDENT_COUNSELING, StudentCounselingItem } from '@/lib/mock-student-data';

export default function StudentKonselingPage() {
  const [counselingList, setCounselingList] = useState<StudentCounselingItem[]>(MOCK_STUDENT_COUNSELING);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'Akademik' | 'Sosial & Teman' | 'Pengembangan Diri' | 'Keluarga'>('Pengembangan Diri');
  const [counselor, setCounselor] = useState('Ibu Ratna Dewi, S.Pd., Kons.');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('13:30 WIB (Sepulang Sekolah)');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    const newRequest: StudentCounselingItem = {
      id: `csl-${Date.now()}`,
      topic,
      category,
      request_date: 'Hari Ini',
      preferred_schedule: `${preferredDate || 'Tanggal fleksibel'} - ${preferredTime}`,
      counselor_name: counselor,
      status: 'menunggu',
      notes: notes || 'Permohonan janji temu baru diajukan siswa.',
    };

    setCounselingList([newRequest, ...counselingList]);
    setIsSuccess(true);
    setTopic('');
    setNotes('');
    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── HEADER TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              Bimbingan & Konseling (BK)
            </span>
            <span className="text-xs text-slate-500 font-semibold">Ruang Aman Sahabat Siswa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Konseling Privat & Layanan Bantuan
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Konsultasikan perkembangan studi, perencanaan minat bakat, atau kendala pribadi dengan Guru BK secara rahasia dan aman.
          </p>
        </div>
      </div>

      {/* ─── PRIVACY & DATA CONFIDENTIALITY NOTICE (SOLID NAVY) ─── */}
      <div className="p-4 rounded-xl bg-blue-900 text-white border-2 border-blue-950 flex items-start gap-3.5 shadow-xs">
        <Lock className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-extrabold text-sm text-white">Jaminan Kerahasiaan & Keamanan Konseling (UU PDP):</p>
          <p className="text-blue-100 font-medium">
            Setiap catatan dan permohonan konseling dienkripsi secara khusus. Informasi yang Anda sampaikan <strong>hanya dapat dibaca oleh Anda dan Guru BK</strong>. Rekan sekelas maupun guru mata pelajaran lain tidak dapat melihat isi permohonan ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Permohonan Janji Temu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="school-card p-6 md:p-8 bg-white border border-slate-300 space-y-5 shadow-xs">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">Form Pengajuan Janji Temu Konseling</h3>
              <p className="text-xs text-slate-600 font-medium">Guru BK akan mengonfirmasi kesediaan waktu dan mengalokasikan ruang pertemuan privat</p>
            </div>

            {isSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-950 text-xs font-bold flex items-center gap-2.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Permohonan janji temu berhasil diajukan! Guru BK akan segera menetapkan jadwal temu Anda.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Kategori Pembahasan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Akademik', 'Sosial & Teman', 'Pengembangan Diri', 'Keluarga'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        category === cat
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Topik / Hal yang Ingin Didiskusikan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskusi minat bakat lanjutan ke SMA/SMK atau kendala belajar..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-900 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                    Pilihan Guru Konselor BK:
                  </label>
                  <select
                    value={counselor}
                    onChange={(e) => setCounselor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-900 shadow-xs cursor-pointer"
                  >
                    <option value="Ibu Ratna Dewi, S.Pd., Kons.">Ibu Ratna Dewi, S.Pd., Kons. (Koordinator BK)</option>
                    <option value="Bapak Dedi Kurniawan, M.Pd.">Bapak Dedi Kurniawan, M.Pd. (Konselor Putra)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                    Preferensi Waktu Konseling:
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-900 shadow-xs cursor-pointer"
                  >
                    <option value="13:30 WIB (Sepulang Sekolah)">Sepulang Sekolah (13:30 - 14:30 WIB)</option>
                    <option value="Jam Istirahat Pertama (09:45 WIB)">Jam Istirahat 1 (09:45 - 10:15 WIB)</option>
                    <option value="Jam Istirahat Siang (12:30 WIB)">Jam Istirahat Siang (12:30 - 13:00 WIB)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Pesan / Catatan Pengantar Tambahan (Opsional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan gambaran singkat hal yang ingin Anda bicarakan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-900 shadow-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Kirim Permohonan Konseling ➔</span>
                </button>
              </div>
            </form>
          </div>

          {/* Riwayat Permohonan Konseling */}
          <div className="school-card p-6 bg-white space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">Riwayat Sesi & Permohonan Konseling Saya</h3>
              <p className="text-xs text-slate-600 font-medium">Pelacakan status jadwal pertemuan bersama Guru BK</p>
            </div>

            <div className="space-y-3">
              {counselingList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:border-slate-400 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'terjadwal' 
                          ? 'bg-emerald-700 text-white' 
                          : item.status === 'menunggu' 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-700 text-white'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-600">{item.category}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">{item.topic}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Konselor: <strong className="text-slate-800">{item.counselor_name}</strong>
                    </p>

                    {item.location && (
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.location}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 self-start md:self-auto shrink-0">
                    {item.preferred_schedule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Saluran Pengaduan Whistleblowing / Anti-Bullying */}
        <div className="space-y-6">
          <div className="school-card p-6 bg-rose-900 text-white border-2 border-rose-950 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-rose-900 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white leading-tight">Posko Pengaduan Aman & Anti-Perundungan</h4>
                <p className="text-[11px] text-rose-200 font-medium">Kanal Perlindungan Murid Labschool</p>
              </div>
            </div>

            <p className="text-xs text-rose-100 leading-relaxed font-medium">
              Apakah Anda atau rekan Anda mengalami tindakan perundungan (*bullying*), pelecehan verbal/fisik, atau situasi tidak aman di lingkungan sekolah?
            </p>

            <div className="p-3 bg-rose-950 rounded-lg border border-rose-800 text-[11px] text-rose-200 leading-relaxed space-y-1">
              <p className="font-bold text-white">✔ Pilihan Anonim:</p>
              <p>Laporan dapat dikirimkan secara anonim tanpa mencantumkan nama atau NIS Anda. Alamat IP tidak disimpan ke database.</p>
            </div>

            <a
              href="http://localhost:3000/aspirasi.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white hover:bg-rose-50 text-rose-900 text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Buka Formulir Pengaduan Aman ➔</span>
            </a>
          </div>

          <div className="school-card p-5 space-y-3 bg-white">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Kontak Cepat Konselor</h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">Ibu Ratna Dewi, S.Pd., Kons.</p>
                <p className="text-slate-500 text-[11px]">Koordinator Bimbingan Konseling</p>
                <p className="text-blue-900 font-mono font-bold mt-1">Ruang BK Lt. 2 Gedung A</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900">Bapak Dedi Kurniawan, M.Pd.</p>
                <p className="text-slate-500 text-[11px]">Konselor Putra & Pembinaan Karakter</p>
                <p className="text-blue-900 font-mono font-bold mt-1">Ruang BK Lt. 2 Gedung A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
