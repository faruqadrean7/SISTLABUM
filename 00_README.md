# Portal Sekolah Satu Pintu: Paket Dokumen Proyek

Paket ini adalah sumber kebenaran (source of truth) untuk membangun portal sekolah. Dibuat agar mudah dipahami manusia dan dikerjakan AI agent.

## Daftar Dokumen
| File | Isi | Dibaca oleh |
|---|---|---|
| `00_README.md` | Indeks, konvensi ID, cara memakai paket | Semua |
| `01_REQUIREMENTS.md` | Latar belakang, tujuan, role, kebutuhan fungsional & non-fungsional, glosarium | PM, semua dev |
| `02_TECH_STACK.md` | Keputusan teknologi, versi, alasan, struktur repo | Dev, AI agent |
| `03_ARCHITECTURE.md` | Arsitektur sistem, komponen, alur data, deployment | Dev, DevOps |
| `04_PRD_BACKEND.md` | PRD API backend per modul | Backend dev, AI agent |
| `05_PRD_WEB_PPDB.md` | PRD website publik + portal PPDB | Frontend dev |
| `06_PRD_SYSTEM_ADMIN.md` | PRD sistem admin (web dashboard) | Frontend dev |
| `07_PRD_MOBILE.md` | PRD aplikasi mobile ortu/guru/siswa | Mobile dev |
| `08_DATABASE_SCHEMA.md` | Entitas, relasi, aturan data | Backend dev |
| `09_SECURITY_PRIVACY.md` | Keamanan, hak akses, perlindungan data anak | Semua |
| `10_TESTING_QA.md` | Strategi uji, acceptance, definition of done | QA, dev |
| `11_AI_AGENT_RULES.md` | Aturan kerja AI agent (wajib dibaca pertama kali) | AI agent |

## Urutan Baca
- Manusia baru: README → Requirements → Architecture → PRD sesuai peran.
- AI agent: **11_AI_AGENT_RULES → README → dokumen modul yang ditugaskan → 08 → 09**.

## Konvensi ID
Setiap modul dan fitur punya ID unik agar mudah dilacak, dipecah menjadi fase, dan dirujuk di commit/PR.

```
{PLATFORM}-{MODUL}-{NOMOR}
BE-PPDB-03    = Backend, modul PPDB, fitur ke-3
WEB-PPDB-02   = Website, PPDB, fitur ke-2
ADM-CBT-05    = Sistem admin, CBT, fitur ke-5
MOB-ORT-04    = Mobile, Ortu, fitur ke-4
NFR-PERF-01   = Non-functional requirement
```

Prefiks platform: `BE` backend, `WEB` website, `ADM` admin, `MOB` mobile, `NFR` non-fungsional.

## Label Prioritas
| Label | Arti |
|---|---|
| **P0** | Wajib, tanpa ini sistem tidak bisa dipakai (MVP) |
| **P1** | Penting, dikerjakan setelah MVP |
| **P2** | Nilai tambah, boleh ditunda |

## Template Spesifikasi Fitur
Semua fitur ditulis dengan pola ini:

```
### {ID}: Nama Fitur  [P0/P1/P2]
Tujuan: ...
Aktor: ...
Dependensi: ID lain
Aturan bisnis: ...
Kriteria penerimaan (AC):
- AC1 ...
Endpoint / Layar / Tabel terkait: ...
```

## Indeks Modul (bahan untuk memecah fase)
| Kode modul | Nama | Backend | Web | Admin | Mobile |
|---|---|:-:|:-:|:-:|:-:|
| AUTH | Autentikasi & hak akses | ✅ | ✅ | ✅ | ✅ |
| MST | Master data | ✅ | | ✅ | |
| CMS | Konten & profil sekolah | ✅ | ✅ | ✅ | |
| PPDB | Penerimaan murid baru | ✅ | ✅ | ✅ | |
| GUEST | Buku tamu & aspirasi | ✅ | ✅ | ✅ | |
| ACD | Akademik (jadwal, jurnal, presensi, nilai, rapor) | ✅ | | ✅ | ✅ |
| CBT | Ujian digital | ✅ | | ✅ | ✅ |
| STD | Kesiswaan (poin, ekskul, lomba, study trip) | ✅ | | ✅ | ✅ |
| BK | Bimbingan konseling | ✅ | | ✅ | ✅ |
| SAR | Sarpras, aset, helpdesk, perpustakaan | ✅ | | ✅ | ✅ |
| HUM | Humas, MoU, alumni | ✅ | | ✅ | |
| NTF | Notifikasi | ✅ | | ✅ | ✅ |
| RPT | Laporan & dashboard eksekutif | ✅ | | ✅ | ✅ |

> Memecah fase nanti: pilih modul dari tabel ini, lalu ambil semua ID fitur modul tersebut di 04–07. Setiap fitur sudah menyebut dependensinya.

## Status Dokumen
Versi 1.0 (draft untuk review sekolah). Perubahan harus dicatat di bagian *Changelog* tiap dokumen.
