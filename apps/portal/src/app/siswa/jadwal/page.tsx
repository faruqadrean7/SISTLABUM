'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Printer, 
  Download, 
  GraduationCap, 
  BookOpen, 
  School,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_STUDENT_SCHEDULES } from '@/lib/mock-student-data';

export default function StudentJadwalPage() {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'kalender'>('jadwal');
  const [selectedDay, setSelectedDay] = useState<string>('Semua');

  const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const filteredSchedules = selectedDay === 'Semua' 
    ? MOCK_STUDENT_SCHEDULES 
    : MOCK_STUDENT_SCHEDULES.filter(s => s.day === selectedDay);

  const academicEvents = [
    { date: '14 - 23 Oktober 2026', title: 'Sumatif Tengah Semester (STS) Gasal', category: 'ujian', color: 'bg-rose-700 text-white', note: 'Pelaksanaan CBT di Lab Komputer 1 & 2' },
    { date: '02 - 04 November 2026', title: 'Gladi Bersih & Simulasi Asesmen Nasional (ANBK)', category: 'kegiatan', color: 'bg-blue-900 text-white', note: 'Khusus siswa sampling Kelas VIII & pendampingan tim IT' },
    { date: '25 November 2026', title: 'Hari Guru Nasional & Gelar Karya P5 "Rekayasa Teknologi"', category: 'p5', color: 'bg-teal-800 text-white', note: 'Pameran prototipe aplikasi web siswa di Aula Utama' },
    { date: '07 - 18 Desember 2026', title: 'Sumatif Akhir Semester (SAS) Gasal', category: 'ujian', color: 'bg-rose-700 text-white', note: 'Ujian digital CBT seluruh mata pelajaran' },
    { date: '23 Desember 2026', title: 'Penyerahan E-Rapor Semester Gasal & Pertemuan Wali Murid', category: 'rapor', color: 'bg-emerald-700 text-white', note: 'Pengesahan digital kepala sekolah ber-QR' },
    { date: '24 Des 2026 - 08 Jan 2027', title: 'Libur Akhir Semester Gasal T.A. 2026/2027', category: 'libur', color: 'bg-amber-600 text-white', note: 'KBM Semester Genap dimulai 11 Januari 2027' },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* ─── HEADER TITLE ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-900 text-white shadow-xs">
              Akademik Kelas IX-A
            </span>
            <span className="text-xs text-slate-500 font-semibold">T.A. 2026/2027 Ganjil • Kurikulum Merdeka</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Jadwal Pelajaran & Kalender Akademik
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Jadwal pembelajaran tatap muka kelas, alokasi ruang lab komputer/multimedia, dan agenda asesmen semester.
          </p>
        </div>

        {/* Tab & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 shadow-xs">
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'jadwal'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Jadwal Mingguan
            </button>
            <button
              onClick={() => setActiveTab('kalender')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'kalender'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Kalender Sekolah
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Jadwal</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: JADWAL PELAJARAN MINGGUAN ─── */}
      {activeTab === 'jadwal' && (
        <div className="space-y-5">
          {/* Day Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                  selectedDay === day
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
                {day === 'Senin' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-emerald-700 text-white font-black">
                    Hari Ini
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((sch) => (
              <div
                key={sch.id}
                className={`school-card p-5 border-l-4 transition-all shadow-xs ${
                  sch.day === 'Senin'
                    ? 'border-l-blue-900 bg-white ring-2 ring-blue-900/10'
                    : 'border-l-slate-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                    {sch.day} • {sch.period}
                  </span>
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {sch.time_range.slice(0, 13)}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400">
                      {sch.subject_code}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {sch.subject_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Guru Pengampu: <strong className="text-slate-800">{sch.teacher_name}</strong>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    {sch.room_name}
                  </span>
                  {sch.room_name.includes('Lab') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-800 text-white">
                      Praktikum Lab
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: KALENDER AKADEMIK SEMESTER GASAL ─── */}
      {activeTab === 'kalender' && (
        <div className="space-y-4">
          <div className="school-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Agenda Kalender Pendidikan Semester Gasal 2026/2027</h3>
                <p className="text-xs text-slate-600 font-medium">SMP Labschool Universitas Negeri Malang</p>
              </div>
              <span className="px-3 py-1 rounded text-xs font-bold bg-teal-800 text-white shadow-xs">
                Resmi Sekolah
              </span>
            </div>

            <div className="space-y-3">
              {academicEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${evt.color}`}>
                          {evt.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{evt.date}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">{evt.title}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{evt.note}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-100 rounded border border-slate-200 self-start sm:self-auto">
                    {evt.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
