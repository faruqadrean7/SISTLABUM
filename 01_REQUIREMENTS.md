# 01. Requirements

## 1. Latar Belakang
Sekolah membutuhkan portal terpadu ("satu pintu") yang menggabungkan: website profil, PPDB, administrasi akademik, ujian digital (CBT), kesiswaan, sarpras, humas, dan aplikasi mobile untuk ortu/guru/siswa. Saat ini proses tersebar dan manual.

## 2. Tujuan Produk
1. Satu data induk siswa/guru/kelas yang dipakai semua modul.
2. Proses PPDB, presensi, nilai, rapor, dan ujian berjalan digital dari awal sampai akhir.
3. Orang tua dapat memantau anak lewat HP secara real-time.
4. Kepala sekolah memantau kondisi sekolah lewat dashboard eksekutif.
5. Arsitektur API terpisah agar web, admin, dan mobile berbagi satu backend.

### Indikator Keberhasilan
| Indikator | Target |
|---|---|
| Pendaftar PPDB mendaftar online | ≥ 90% |
| Presensi guru dicatat digital | ≥ 95% kelas/hari |
| Nilai bulanan terinput tepat waktu | ≥ 90% guru |
| Ortu aktif di mobile app | ≥ 70% dalam 3 bulan |
| Ujian CBT selesai tanpa gangguan sistem | ≥ 99% sesi |

## 3. Ruang Lingkup
### Dalam scope (v1)
Website publik, PPDB, sistem admin, API backend, mobile (ortu/guru/siswa), CBT, akademik, kesiswaan, BK, sarpras, perpustakaan dasar, humas, alumni, notifikasi, laporan, dashboard eksekutif.

### Di luar scope v1 (perlu keputusan sekolah)
| Item | Status |
|---|---|
| Keuangan/SPP & pembayaran online | Belum ada di dokumen sekolah, hanya "status administrasi" |
| Chat real-time ortu-guru | v1 cukup tombol hubungi (WhatsApp/tiket) |
| Integrasi Dapodik / e-Rapor Kemdikbud | Belum ditetapkan |
| Absensi guru biometrik | Tidak termasuk |
| E-learning video conference | Tidak termasuk |

## 4. Pengguna (Role)
| Kode role | Nama | Platform utama |
|---|---|---|
| `super_admin` | Super Admin | Admin |
| `admin_tu` | Admin Tata Usaha | Admin |
| `principal` | Kepala Sekolah | Admin, Mobile |
| `teacher` | Guru | Admin, Mobile |
| `homeroom` | Wali Kelas (guru + penugasan kelas) | Admin, Mobile |
| `counselor` | Guru BK | Admin, Mobile |
| `facility_staff` | Staf Sarpras | Admin |
| `ppdb_committee` | Panitia PPDB | Admin |
| `librarian` | Pustakawan | Admin |
| `student` | Siswa | Mobile, Web CBT |
| `guardian` | Orang Tua/Wali | Mobile |
| `guest` | Tamu/publik/calon siswa | Web |

Satu user bisa punya lebih dari satu role (contoh: guru sekaligus wali kelas).

## 5. Kebutuhan Fungsional (ringkas)
Rincian ada di PRD per platform. Ringkasan per modul:

| Modul | Kebutuhan inti |
|---|---|
| AUTH | Login, refresh, reset password, RBAC, multi-role, audit |
| MST | Tahun ajaran, siswa, guru, ortu, kelas, mapel, ruang, import Excel |
| CMS | Profil, berita, galeri, agenda publik, unduhan, mading digital |
| PPDB | Gelombang/jalur/kuota, pendaftaran, berkas, verifikasi, seleksi, daftar ulang, konversi ke siswa |
| GUEST | Buku tamu digital + notifikasi ke tujuan, aspirasi/whistleblowing (opsi anonim) |
| ACD | Jadwal, jurnal mengajar, presensi, buku nilai bulanan, catatan karakter, e-progress report (PDF+QR), e-rapor, bank modul ajar |
| CBT | Bank soal (6 tipe, CP, LOTS/MOTS/HOTS), ujian harian/STS/SAS, token, anti-cheat, monitor live, koreksi, analisis butir, remedial |
| STD | Poin pelanggaran/prestasi, ekskul/OSIS, lomba, study trip |
| BK | Konseling privat, riwayat pembinaan, deteksi dini |
| SAR | Booking fasilitas, aset QR, tiket perbaikan, pustaka, alat lab |
| HUM | Validasi PPDB, MoU, pertukaran pelajar, tracer alumni |
| NTF | Push, WhatsApp, email, template, log |
| RPT | Rekap, ekspor, dashboard eksekutif |

## 6. Kebutuhan Non-Fungsional
| ID | Kebutuhan | Target / Ukuran |
|---|---|---|
| NFR-PERF-01 | Waktu respons API (non-CBT) | p95 < 500 ms |
| NFR-PERF-02 | Beban CBT serentak | ≥ 500 siswa aktif, autosave p95 < 300 ms |
| NFR-PERF-03 | Website publik | Lighthouse Performance ≥ 90, LCP < 2,5 s |
| NFR-PERF-04 | Generate rapor massal | 500 PDF < 10 menit (via queue) |
| NFR-AVAIL-01 | Ketersediaan | 99,5% bulanan; masa ujian dijaga ketat |
| NFR-SEC-01 | Keamanan | Lihat dokumen 09 |
| NFR-PRIV-01 | Privasi data anak | Patuh UU PDP, akses minimum |
| NFR-BKP-01 | Backup | DB harian, retensi 30 hari, uji restore tiap kuartal |
| NFR-OBS-01 | Observability | Log terstruktur, health check, alert error |
| NFR-UX-01 | Aksesibilitas | Kontras WCAG AA, target sentuh ≥ 44 px |
| NFR-I18N-01 | Bahasa | Bahasa Indonesia utama, struktur siap multi-bahasa |
| NFR-COMP-01 | Kompatibilitas | Browser 2 versi terakhir; Android 8+ ; iOS 14+ |
| NFR-MNT-01 | Pemeliharaan | Test coverage backend ≥ 70% di logika bisnis |

## 7. Asumsi
- Satu sekolah (single-tenant) pada v1, tetapi skema siap multi-sekolah (kolom `school_id` pada tabel utama).
- Jenjang dan jumlah siswa akan dikonfirmasi (asumsi 300-1500 siswa).
- Internet sekolah cukup untuk CBT; mode server lokal bersifat opsional (P2).
- Sekolah menyediakan template rapor, kop surat, logo, dan data awal (Excel).

## 8. Ketergantungan Eksternal
| Layanan | Fungsi | Alternatif |
|---|---|---|
| Firebase Cloud Messaging | Push notification | OneSignal |
| WhatsApp gateway | Notifikasi/OTP | Fonnte, Wablas, WA Business API |
| SMTP/Email provider | Email | SES, Mailgun |
| Object storage | File | S3, MinIO, R2 |
| Peta | Lokasi sekolah | Google Maps / OpenStreetMap |

## 9. Pertanyaan Terbuka (harus dijawab sebelum fase terkait)
1. Keuangan/SPP masuk proyek atau tidak? (blokir fase keuangan)
2. Jenjang sekolah dan jumlah siswa? (sizing server, struktur rapor)
3. Perlu integrasi Dapodik? (modul master data)
4. Hosting cloud atau server sekolah? (arsitektur deploy)
5. Format resmi rapor semester, progress report, dan kop surat?
6. Skema seleksi PPDB: jalur apa saja, rumus ranking tiap jalur?
7. Sistem poin pelanggaran: tabel poin dan sanksi bertingkat dari sekolah?
8. Kebijakan retensi data alumni dan siswa lulus?

## 10. Glosarium
| Istilah | Arti |
|---|---|
| PPDB | Penerimaan Peserta Didik Baru |
| CBT | Computer Based Test |
| STS / SAS (ASAT) | Sumatif Tengah Semester / Sumatif Akhir Semester |
| CP | Capaian Pembelajaran |
| ATP | Alur Tujuan Pembelajaran |
| KKTP | Kriteria Ketercapaian Tujuan Pembelajaran |
| P5 | Projek Penguatan Profil Pelajar Pancasila |
| LOTS/MOTS/HOTS | Tingkat kognitif soal: rendah/menengah/tinggi |
| Walas | Wali Kelas |
| BK | Bimbingan dan Konseling |
| Sarpras | Sarana dan Prasarana |
| E-Progress Report | Ringkasan nilai bulanan 1 halaman dengan tanda tangan QR |
| RBAC | Role-Based Access Control |

## Changelog
- 1.0: Draf awal.
