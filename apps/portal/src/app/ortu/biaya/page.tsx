'use client';

import React from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Phone, 
  FileCheck, 
  Building2,
  Info,
  Calendar
} from 'lucide-react';
import { useGuardian } from '@/lib/guardian-context';

export default function GuardianBiayaPage() {
  const { activeChild, activeFees } = useGuardian();

  return (
    <div className="space-y-6">
      {/* ─── HEADER BANNER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 rounded-xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-800 text-white text-xs font-bold mb-2">
            <Receipt className="w-3.5 h-3.5 text-white" />
            <span>Transparansi Administrasi & Biaya Pendidikan</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Status Administrasi Sekolah ({activeChild.name})
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Informasi pencatatan resmi SPP bulanan, biaya operasional, dan bebas tanggungan dari Bagian Tata Usaha.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-lg bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Bebas Tanggungan: LUNAS</span>
          </span>
        </div>
      </div>

      {/* ─── POLICY COMPLIANCE NOTICE (KEPUTUSAN_BISNIS_DAN_BATASAN_SISTEM) ─── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 leading-relaxed">
          <p className="font-bold">Informasi Kebijakan Sistem Administrasi Sekolah (v1):</p>
          <p className="mt-0.5 text-blue-900">
            Sesuai keputusan resmi sekolah, halaman ini berfungsi sebagai <strong>catatan buku kas transparansi non-finansial</strong>. Pembayaran SPP dan kegiatan tetap dilakukan melalui loket resmi Tata Usaha atau transfer ke rekening giro resmi BNI/BRI sekolah. Seluruh transaksi diverifikasi langsung oleh petugas Tata Usaha.
          </p>
        </div>
      </div>

      {/* ─── 3 KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">SPP Bulan Berjalan (Oktober 2026)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-800">Lunas</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white">Terverifikasi</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Kwitansi No: KW-TU/2026/10/0189</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Biaya Praktikum & CBT Gasal</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">Bebas Biaya</span>
            <span className="text-xs font-bold text-emerald-700">Tercakup</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Laboratorium komputer & modul ajar</p>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Status Hak Ujian Siswa</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-blue-900">Diizinkan</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-900 text-white">Siap Ujian</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Berhak mengikuti seluruh asesmen CBT</p>
        </div>
      </div>

      {/* ─── TABEL CATATAN ADMINISTRASI DARI TATA USAHA ─── */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Riwayat Pembayaran & Bebas Tanggungan ({activeChild.name.split(' ')[0]})
            </h2>
            <p className="text-xs text-slate-500">
              Daftar pencatatan penerimaan kas Tata Usaha Labschool UM
            </p>
          </div>

          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700">
            Tahun Ajaran 2026/2027
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                <th className="py-3 px-3">Uraian Pembayaran</th>
                <th className="py-3 px-3">Periode</th>
                <th className="py-3 px-3 text-right">Nominal</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">No. Kwitansi TU</th>
                <th className="py-3 px-3">Petugas Verifikator</th>
                <th className="py-3 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50 transition-colors font-medium">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    {fee.item_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {fee.period_label}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {fee.nominal_text}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-800 text-white">
                      {fee.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    {fee.receipt_number}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {fee.cashier_name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {fee.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── BANTUAN TATA USAHA & REKENING RESMI SEKOLAH ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-emerald-800 shrink-0" />
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Loket Layanan Tata Usaha (Gedung A)</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Senin - Jumat, 07:30 - 15:00 WIB</p>
              <p className="text-[11px] text-slate-500">Telp: (0341) 551312 ext. 104</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-300">
            Loket Buka
          </span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-blue-900 shrink-0" />
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Layanan Konfirmasi Pembayaran TU</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">WhatsApp Keuangan: 0812-3456-7899</p>
              <p className="text-[11px] text-slate-500">Pengiriman bukti setor / rekening koran</p>
            </div>
          </div>
          <a
            href="https://wa.me/6281234567899"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors"
          >
            Hubungi TU
          </a>
        </div>
      </div>
    </div>
  );
}
