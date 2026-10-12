# 10. Strategi Pengujian & Definition of Done

## 1. Piramida Uji
| Level | Alat | Cakupan | Target |
|---|---|---|---|
| Unit | Jest (BE), Vitest (Web), flutter_test | Logika bisnis murni: ranking PPDB, hitung nilai, rumus rapor, validasi | ≥ 70% logika bisnis |
| Integrasi | Jest + Supertest + DB uji (Testcontainers) | Endpoint + DB + guard + queue | Semua endpoint: happy path + 1 negatif + 401/403 |
| Kontrak | OpenAPI diff, schema validation | API tidak berubah diam-diam | CI gagal bila breaking tanpa versi |
| E2E web | Playwright | Alur kritis lintas halaman | Lihat bagian 3 |
| Widget/Integrasi mobile | flutter_test, integration_test | Layar & alur utama | Alur kritis lulus |
| Performa | k6 | CBT, endpoint daftar, dashboard | Lihat bagian 4 |
| Keamanan | `npm audit`, gitleaks, OWASP ZAP baseline | Kerentanan umum | Tanpa temuan kritis/tinggi |
| Aksesibilitas | axe, Lighthouse | Web publik & admin | Tanpa pelanggaran serius |
| UAT | Skenario dari sekolah | Alur nyata | Persetujuan tertulis |

## 2. Aturan Menulis Uji
- Setiap fitur `BE-*` membawa uji dengan nama berawalan ID: `describe('BE-PPDB-06 ranking', ...)`.
- Uji tidak bergantung urutan dan membersihkan data sendiri.
- Gunakan factory/fixture; jangan memakai data asli.
- Uji aturan bisnis dengan kasus batas (kuota tepat penuh, nilai sama/tie-break, tepat di tenggat).
- Setiap bug yang ditemukan menghasilkan uji regresi sebelum diperbaiki.
- Mock hanya layanan eksternal (FCM, WA, email), bukan DB.

## 3. Skenario E2E Kritis (wajib otomatis)
| ID | Alur |
|---|---|
| E2E-01 | Calon siswa registrasi → OTP → isi 5 langkah → upload → submit |
| E2E-02 | Panitia menolak berkas → pendaftar merevisi → terverifikasi |
| E2E-03 | Ranking → publikasi → cek hasil → daftar ulang → konversi jadi siswa |
| E2E-04 | Guru isi jurnal & presensi → izin ortu disetujui walas → rekap benar |
| E2E-05 | Guru input nilai → walas isi karakter → generate progress report → ACC → ortu unduh PDF → verifikasi QR |
| E2E-06 | Buat soal → buat ujian → token → 3 siswa mengerjakan → pelanggaran → pengawas reset → submit → koreksi uraian → nilai masuk buku nilai |
| E2E-07 | Lapor kerusakan → disposisi → selesai → pelapor menerima notifikasi |
| E2E-08 | Booking ruang bentrok ditolak; booking valid disetujui |
| E2E-09 | Ortu A tidak dapat mengakses data anak ortu B (IDOR) |
| E2E-10 | Aspirasi anonim → kode tiket → pelacakan status |

## 4. Uji Performa & Beban
| Skenario | Beban | Lulus jika |
|---|---|---|
| CBT start serentak | 500 siswa mulai dalam 2 menit | p95 start < 2 s, 0 kegagalan |
| CBT autosave | 500 siswa × 1 jawaban/20 detik, 90 menit | p95 < 300 ms, error < 0,1% |
| Monitor live | 20 pengawas membuka monitor | Pembaruan < 2 s |
| Dashboard eksekutif | 50 permintaan/detik | p95 < 800 ms (dengan cache) |
| Generate PDF massal | 500 rapor | < 10 menit, tanpa memengaruhi API |
| Web publik | 200 pengguna serentak | p95 < 1 s (ISR cache) |
| PPDB hari buka | 300 pendaftar serentak | Tanpa error, submit idempoten |

Wajib dijalankan sebelum STS, SAS, dan pembukaan PPDB.

## 5. Data Uji
- Seed demo: 1 sekolah, 3 tingkat × 4 kelas, 30 siswa/kelas, 40 guru, relasi ortu-anak, soal contoh 300 butir, 1 gelombang PPDB.
- Data produksi tidak boleh disalin ke lokal/staging tanpa anonimisasi.

## 6. Definition of Done (per fitur)
Fitur dianggap **selesai** bila semua terpenuhi:
- [ ] Kriteria penerimaan (AC) di PRD terpenuhi dan dirujuk di PR dengan ID fitur
- [ ] Kode lolos lint, typecheck, dan seluruh uji CI
- [ ] Uji baru ditulis (unit/integrasi; E2E bila alur kritis)
- [ ] OpenAPI diperbarui; klien digenerate ulang bila ada perubahan kontrak
- [ ] Migrasi DB maju-saja, teruji dari DB kosong
- [ ] Permission baru didaftarkan di seed + uji 401/403
- [ ] Audit log ditulis untuk aksi penting
- [ ] Tidak ada rahasia/data pribadi dalam kode & log
- [ ] State UI lengkap (loading, kosong, error) bila ada UI
- [ ] Teks UI Bahasa Indonesia dan tanpa typo
- [ ] Dokumentasi diperbarui (PRD/ADR/README modul) dan changelog diisi
- [ ] Ditinjau minimal satu reviewer (manusia) dan disetujui

## 7. Definition of Done (per fase/rilis)
- [ ] Semua fitur P0 fase tersebut selesai
- [ ] UAT dengan perwakilan sekolah disetujui
- [ ] Uji beban relevan lulus
- [ ] Uji keamanan (checklist dokumen 09) lulus
- [ ] Backup & rencana rollback diverifikasi
- [ ] Catatan rilis dan panduan pengguna diserahkan
- [ ] Pelatihan pengguna kunci dilakukan

## 8. Triase Bug
| Severity | Definisi | SLA perbaikan |
|---|---|---|
| S1 | Data bocor, ujian/PPDB berhenti, data rusak | Segera (< 4 jam) |
| S2 | Fitur utama gagal tanpa jalan pintas | 1 hari kerja |
| S3 | Fitur sebagian gagal, ada jalan pintas | Sprint berjalan |
| S4 | Kosmetik/minor | Backlog |

## 9. Template UAT
```
ID Skenario : UAT-GRD-01
Fitur       : BE-GRD-03 / ADM-GRD-03 / MOB-ORT-03
Peran       : Wali kelas, Kepala sekolah, Orang tua
Langkah     : 1) ... 2) ... 3) ...
Hasil harap : ...
Hasil aktual: ...
Status      : Lulus / Gagal / Catatan
Penguji     : (nama, tanggal)
```

## Changelog
- 1.0: Draf awal.
- 1.1: Pembaruan referensi ID skenario UAT e-progress report ke modul `GRD` (`BE-GRD-03 / ADM-GRD-03`).
