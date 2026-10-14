'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Printer, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  School
} from 'lucide-react';
import { CURRENT_TEACHER } from '@/lib/mock-lms-data';

interface ScheduleSlot {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  period: number;
  timeRange: string;
  className: string;
  subjectName: string;
  roomName: string;
  jpCount: number;
  colorBg: string;
  colorBorder: string;
}

export default function JadwalMengajarPage() {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  const scheduleSlots: ScheduleSlot[] = [
    // Senin
    { id: 'sch-1', day: 'Senin', period: 1, timeRange: '07:30 - 09:00', className: 'Kelas IX-A', subjectName: 'Informatika', roomName: 'Lab Komputer 1', jpCount: 2, colorBg: 'bg-blue-900', colorBorder: 'border-blue-950' },
    { id: 'sch-2', day: 'Senin', period: 4, timeRange: '10:00 - 11:30', className: 'Kelas IX-B', subjectName: 'Pemrograman Web', roomName: 'Lab Multimedia', jpCount: 2, colorBg: 'bg-teal-800', colorBorder: 'border-teal-900' },
    // Selasa
    { id: 'sch-3', day: 'Selasa', period: 2, timeRange: '08:15 - 09:45', className: 'Kelas VIII-C', subjectName: 'Informatika Dasar', roomName: 'Lab Komputer 2', jpCount: 2, colorBg: 'bg-blue-900', colorBorder: 'border-blue-950' },
    { id: 'sch-4', day: 'Selasa', period: 6, timeRange: '12:45 - 14:15', className: 'Kelas IX-A', subjectName: 'Praktikum Web', roomName: 'Lab Komputer 1', jpCount: 2, colorBg: 'bg-teal-800', colorBorder: 'border-teal-900' },
    // Rabu (Hari Ini)
    { id: 'sch-5', day: 'Rabu', period: 1, timeRange: '07:30 - 09:00', className: 'Kelas IX-A', subjectName: 'Informatika & Pemrograman', roomName: 'Lab Komputer 1', jpCount: 2, colorBg: 'bg-blue-900', colorBorder: 'border-blue-950' },
    { id: 'sch-6', day: 'Rabu', period: 4, timeRange: '10:00 - 11:30', className: 'Kelas IX-B', subjectName: 'Pemrograman Web & Logika', roomName: 'Lab Multimedia', jpCount: 2, colorBg: 'bg-teal-800', colorBorder: 'border-teal-900' },
    // Kamis
    { id: 'sch-7', day: 'Kamis', period: 2, timeRange: '08:15 - 09:45', className: 'Kelas VIII-C', subjectName: 'Informatika Dasar', roomName: 'Lab Komputer 2', jpCount: 2, colorBg: 'bg-blue-900', colorBorder: 'border-blue-950' },
    { id: 'sch-8', day: 'Kamis', period: 5, timeRange: '10:30 - 12:00', className: 'Kelas IX-B', subjectName: 'Informatika', roomName: 'Lab Komputer 1', jpCount: 2, colorBg: 'bg-blue-900', colorBorder: 'border-blue-950' },
    // Jumat
    { id: 'sch-9', day: 'Jumat', period: 1, timeRange: '07:30 - 09:00', className: 'Kelas IX-A', subjectName: 'Proyek P5 Rekayasa Teknologi', roomName: 'Lab Komputer 1', jpCount: 2, colorBg: 'bg-purple-900', colorBorder: 'border-purple-950' },
  ];

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;

  const totalJP = scheduleSlots.reduce((acc, curr) => acc + curr.jpCount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900 text-white">
              Akademik & KBM
            </span>
            <span className="text-xs text-slate-500 font-semibold">• BE-ACD-01 & ADM-ACD-01 (P0)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Jadwal Mengajar Mingguan Guru
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Struktur jadwal tatap muka di laboratorium dan ruang kelas Semester Ganjil T.A. 2026/2027. Terintegrasi langsung dengan deteksi bentrok ruang dan Jurnal Mengajar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Jadwal</span>
          </button>
          <a
            href="/guru/jurnal"
            className="px-4 py-2 rounded-lg text-xs font-black bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buka Jurnal KBM ➔</span>
          </a>
        </div>
      </div>

      {/* ─── SUMMARY KPI CARDS (SOLID HIGH-CONTRAST) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Beban Tatap Muka</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalJP} <span className="text-xs font-bold text-slate-500">JP / Minggu</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-bold mt-1">✓ Memenuhi syarat sertifikasi (min 24 JP)</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rombel Diampu</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            3 <span className="text-xs font-bold text-slate-500">Rombel</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Kelas IX-A, IX-B, VIII-C</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ruang Praktikum</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            2 <span className="text-xs font-bold text-slate-500">Laboratorium</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Lab Komputer 1 & Lab Multimedia</p>
        </div>

        <div className="bg-emerald-800 text-white border border-emerald-900 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Jadwal Hari Ini</span>
          <div className="text-2xl font-black text-white mt-1">
            Rabu <span className="text-xs font-bold text-emerald-200">(2 Sesi KBM)</span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-1 font-medium">07:30 - 09:00 & 10:00 - 11:30</p>
        </div>
      </div>

      {/* ─── TIMETABLE GRID (SENIN - JUMAT) ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Matriks Timetable KBM Mingguan
          </h2>

          {/* Filter Day */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setSelectedDayFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedDayFilter === 'ALL' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua Hari
            </button>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayFilter(day)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  selectedDayFilter === day ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Column Grid for Days */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {daysOfWeek.map((day) => {
            const isSelected = selectedDayFilter === 'ALL' || selectedDayFilter === day;
            if (!isSelected) return null;

            const daySlots = scheduleSlots.filter(s => s.day === day);
            const isToday = day === 'Rabu';

            return (
              <div 
                key={day} 
                className={`rounded-xl border flex flex-col ${
                  isToday 
                    ? 'border-blue-900 bg-blue-50/30 ring-2 ring-blue-900/10' 
                    : 'border-slate-300 bg-white'
                }`}
              >
                {/* Day Header */}
                <div className={`p-3 border-b text-center rounded-t-xl font-black text-xs uppercase tracking-wider flex items-center justify-between ${
                  isToday ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  <span>{day}</span>
                  {isToday && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-black">
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* Slots List */}
                <div className="p-3 space-y-3 flex-1 min-h-64">
                  {daySlots.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                      <Clock className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-xs font-semibold">Tidak ada jadwal KBM</span>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg text-white shadow-xs space-y-2 border ${slot.colorBg} ${slot.colorBorder}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/30">
                            {slot.timeRange}
                          </span>
                          <span className="text-[10px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded">
                            {slot.jpCount} JP
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-xs text-white leading-tight">
                            {slot.className}
                          </h3>
                          <p className="text-[11px] text-white/90 font-medium">
                            {slot.subjectName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-semibold pt-1 border-t border-white/20">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{slot.roomName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
