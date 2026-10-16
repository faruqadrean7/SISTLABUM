# SISTLABUM-PRE-MERGE-REVIEW-01 — Laporan Audit Kesiapan Penggabungan Integrasi Selektif ke Develop

**Tanggal Audit:** 15 Oktober 2026, 19:00 WIB  
**Workspace:** `/Users/macbookprom12020/Desktop/Project/SISTLABUM`  
**Audited Branch:** `integrate/selective-remote-sync` (HEAD: `d236d9f`)  
**Base Target Branch:** `develop` (HEAD: `d236d9f`)  
**Remote Upstream:** `origin/develop` (HEAD: `f863276`)  
**Merge Base:** `a3d2174b889a80a65cf5026484cf096e511f4d46`  
**Single Source of Truth (SSOT):** `13_MASTER_MODULES.md`  
**Status Audit:** **SELESAI (AUDIT SINKRONISASI PRA-PENGGABUNGAN)**  

---

## 1. Executive Summary & Rekomendasi Keputusan

### Keputusan Akhir: **READY WITH CONDITIONS (SIAP DIGABUNGKAN DENGAN KETENTUAN)**

Hasil audit pre-merge membuktikan bahwa integrasi selektif fitur remote ke repository lokal pada branch `integrate/selective-remote-sync` telah berhasil diimplementasikan secara aman, berkualitas tinggi, dan tidak merusak integritas arsitektur monorepo maupun lapisan keamanan yang telah dibangun.

### Ringkasan Pencapaian Utama:
1. **Keamanan Lokal Terjaga 100%:** Seluruh perbaikan krusial lokal—termasuk Anti-IDOR (`GuardianChildPolicy`), CBT Auto-Close Server Duration, Server Audit Trail (`AuditLog`), sinkronisasi preferensi notifikasi, remediasi RBAC 7 jabatan internal, dan Admin Route Guard—tetap utuh dan aktif.
2. **Karantina Modul Terbukti Efektif:** Modul transaksi biaya/SPP online dari remote (`apps/portal/src/app/ortu/biaya/page.tsx`) berhasil dikarantina dan tidak diaktifkan, sesuai mandat SSOT bahwa modul keuangan Bendahara ditunda ke Fase 4.
3. **Eliminasi Aplikasi Duplikat:** Remote yang membawa dua proyek Next.js terpisah (`apps/admin/` dan `apps/portal/`) tidak dimasukkan ke dalam rantai build aktif, melainkan 4 fitur bermanfaatnya diadopsi secara bersih ke dalam monorepo terpadu `apps/web`.
4. **Verifikasi Pengujian Penuh (Zero Failure):**
   - **Backend PHPUnit:** **429 passed** (100% lulus, 2.336 assertions, 0 errors).
   - **Frontend Vitest:** **92 passed** (100% lulus lintas 7 suite file).
   - **TypeScript Typecheck:** **PASS** (0 errors).
   - **Next.js Production Build:** **PASS** (93/93 rute halaman terkompilasi dan teroptimasi).

---

## 2. Verifikasi Topologi Git & Integritas Cadangan (Tahap A)

### A. Pemeriksaan Titik Cabang (Branch Commits)
- **Local `develop` & `integrate/selective-remote-sync`:** `d236d9f6acb7b468eb3be3746b461c50edf23633` (Ahead 10 commit dari merge base).
- **Remote `origin/develop`:** `f8632763d1727cb52eed758d8163e83135789b74` (Ahead 4 commit dari merge base).
- **Merge Base:** `a3d2174b889a80a65cf5026484cf096e511f4d46`.

### B. Integritas Cadangan (Dual Pre-Pull Backup)
Sebelum dilakukan integrasi, repository lokal telah dicadangkan secara terverifikasi pada direktori eksternal:
- **Lokasi Cadangan:** `/Users/macbookprom12020/Desktop/Project/backup-sistlabum-local-pre-pull/`
- **Isi Snapshot Terverifikasi:**
  - `tracked_changes_current.patch` (1,57 MB — mencakup seluruh modifikasi lokal)
  - `untracked_files_current.tar.gz` (2,03 MB — mencakup 445 berkas untracked)
  - `git_status_current.txt` & `untracked_files_list_current.txt`
- **Jaminan Keselamatan:** Tidak ada operasi destruktif (`git reset --hard`, `git clean -fd`, rebase destruktif) yang dijalankan. Seluruh riwayat dan berkas kerja tersimpan aman.

---

## 3. Audit Perbedaan Branch & Penolakan Artefak Redundan (Tahap B)

### A. Fitur Lokal yang Dipertahankan (Ahead dari Remote):
1. `d236d9f`: Implementasi sinkronisasi preferensi notifikasi push dengan server role scoping (`GAP-11`).
2. `acb279d`: Otoritas server-side audit trail untuk aksi sensitif perbankan/akademik (`GAP-06`).
3. `3b8acf9`: Server-side violation tracking atomik dan penegakan anti-cheat CBT (`GAP-07`).
4. `2e682cd`: Penegakan durasi ujian terhitung server dan auto-close ujian (`GAP-02`).
5. `8c1231a`: Endpoint portal mandiri terlindungi kebijakan anti-IDOR (`GAP-08`).
6. `510b6b7`: Mock mode tersentralisasi di bawah kendali strict environment (`GAP-03`).
7. `566450c`: Penghapusan mock fallback pada verifikasi perwalian orang tua (`GAP-09`).
8. `be9f64d`: Penegakan `RoleGuard` di seluruh layout sub-portal (`GAP-05`).
9. `5ac279b`: Sinkronisasi `activeRole` pada interaksi role switcher dan deep link (`GAP-10`).
10. `b8f7f20`: Penguatan keamanan CBT dan validasi dashboard kepala sekolah.

### B. Evaluasi Commit Remote (`origin/develop`):
| Hash Commit | Deskripsi Remote | Status Evaluasi | Justifikasi Teknis |
|---|---|---|---|
| `edbd244` | `feat(web-admin): front end admin menggunakan next.js` | **DITOLAK** | Menambahkan `apps/admin/` terpisah dengan `node_modules` ganda dan Next.js 16. Admin System lokal pada `apps/web/src/app/(admin)` sudah jauh lebih lengkap (7 jabatan internal, audit log, CBT monitoring). |
| `20d14eb` | `Merge branch 'develop'` | **NETRAL** | Merge commit sinkronisasi upstream. |
| `c8793ae` | `feat(portal-guru): front end lms guru` | **DIADOPSI SELEKTIF** | Mengadopsi konsep SpeedGrader tugas guru ke `apps/web/src/app/(portal)/portal/guru/tugas/[id]/penilaian/page.tsx` terhubung ke API riil Laravel. |
| `f863276` | `feat: frontend portal guru, siswa dan ortu` | **DIADOPSI SELEKTIF** | Mengadopsi 3 halaman portal siswa (Tugas LMS, Konseling BK, Buku Poin & Ekskul) ke `apps/web`. Menolak halaman SPP `ortu/biaya` (Fase 4). |

---

## 4. Audit Rinci 4 Fitur Baru yang Diadopsi (Tahap C)

Empat fitur baru telah diverifikasi langsung pada kode sumber:

### 1. Portal Siswa: Tugas KBM Mandiri (`/portal/siswa/tugas`)
- **File:** [`apps/web/src/app/(portal)/portal/siswa/tugas/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/%28portal%29/portal/siswa/tugas/page.tsx)
- **Karakteristik:**
  - Tab "Tugas Mandiri" dan "Modul & E-Book".
  - Filter interaktif: "Semua", "Belum Dikumpulkan", "Terkirim", "Sudah Dinilai".
  - Modal pengumpulan tugas dengan input nama file dokumen, link Google Drive, dan catatan pengantar siswa.
  - Modal tinjauan umpan balik (feedback guru dan nilai perolehan).
  - Penanganan state lengkap: `isLoading` (spinner), `isError` (alert card), `emptyState` saat daftar tugas kosong.
  - Komunikasi API: `portalApi.getStudentTasks` dan `portalApi.submitStudentTask`.

### 2. Portal Siswa: Layanan Konseling BK (`/portal/siswa/konseling`)
- **File:** [`apps/web/src/app/(portal)/portal/siswa/konseling/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/%28portal%29/portal/siswa/konseling/page.tsx)
- **Karakteristik:**
  - Jaminan Kerahasiaan Konseling (Privacy Guarantee Banner) berbasis kode etik BK.
  - Form permohonan janji temu: Topik, Kategori (Akademik, Sosial, Karir, Pribadi), Preferensi Tanggal & Jam, serta Penjelasan Masalah.
  - Riwayat permohonan konseling dengan badge status transparan ("Menunggu Konfirmasi", "Dijadwalkan", "Selesai", "Ditolak").
  - Komunikasi API: `portalApi.getStudentCounseling` dan `portalApi.submitStudentCounseling`.

### 3. Portal Siswa: Poin Disiplin & Ekskul (`/portal/siswa/poin`)
- **File:** [`apps/web/src/app/(portal)/portal/siswa/poin/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/%28portal%29/portal/siswa/poin/page.tsx)
- **Karakteristik:**
  - Tiga kartu saldo indikator: Saldo Poin Bersih, Total Poin Prestasi (+), Poin Pelanggaran (-).
  - Filter log catatan: "Semua", "Prestasi", "Pelanggaran".
  - Tab Ekstrakurikuler: menampilkan jadwal, pembina, ruangan, dan persentase kehadiran ekskul siswa.
  - Komunikasi API: `portalApi.getStudentPoints`.

### 4. Portal Guru: SpeedGrader Penilaian Tugas (`/portal/guru/tugas/[id]/penilaian`)
- **File:** [`apps/web/src/app/(portal)/portal/guru/tugas/[id]/penilaian/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/%28portal%29/portal/guru/tugas/%5Bid%5D/penilaian/page.tsx)
- **Karakteristik:**
  - Carousel navigasi cepat antarsiswa ("Sebelumnya" / "Berikutnya") dilengkapi indikator progres penilaian (contoh: 2 dari 32 siswa).
  - Kolom kiri: Pratinjau berkas submisi, catatan siswa, dan tautan lampiran cloud/Drive.
  - Kolom kanan: Form input skor angka (0-100 dengan validasi numerik) dan textarea catatan feedback konstruktif dewan guru.
  - Komunikasi API: `guruApi.getAssignmentSubmissions` dan `guruApi.gradeSubmission`.

---

## 5. Audit Kontrak API & Keamanan Backend (Tahap D)

Pemeriksaan terhadap route backend Laravel (`apps/api/routes/api.php`) dan controller terkait menunjukkan hasil berikut:

| Endpoint | Method | Controller & Action | Guard / Policy | Status Keamanan |
|---|---|---|---|---|
| `/api/v1/assignments` | `GET` | `AssignmentController@index` | `auth:sanctum`, tenant filter by class | **AMAN** (Terpaginasi) |
| `/api/v1/assignments/{id}/submissions` | `POST` | `AssignmentController@submit` | `SubmitAssignmentRequest`, validasi status aktif | **AMAN** (Anti-tamper) |
| `/api/v1/me/teacher/assignments/{id}/submissions` | `GET` | `MeTeacherController@submissions` | Verifikasi `teacher_id === auth()->id` | **AMAN** (Scoping ketat) |
| `/api/v1/me/teacher/submissions/{id}/grade` | `POST` | `MeTeacherController@gradeSubmission` | Validasi rentang nilai 0-100 & kepemilikan kelas | **AMAN** (Anti-IDOR) |
| `/api/v1/me/counseling-requests` | `POST` | `MeStudentController@storeCounselingRequest` | Otomatis mengikat ke profil siswa dari auth token | **AMAN** (Anti-spoofing) |
| `/api/v1/counseling/requests` | `GET` | `CounselingRequestController@index` | `CounselingRequestService` scoping per role | **AMAN** (Siswa hanya permohonan miliknya) |
| `/api/v1/student-points` | `GET` | `StudentPointController@index` | Scoping role: student = own, parent = children | **AMAN** (Anti-IDOR terintegrasi) |

---

## 6. Hasil Verifikasi Pengujian Menyeluruh (Tahap E)

### A. Pengujian Backend PHPUnit (Feature Suites)
```bash
php artisan test tests/Feature/Academic/LmsTest.php tests/Feature/Bk tests/Feature/Std tests/Feature/Auth tests/Feature/Guest tests/Feature/Cbt
```
- **Total Tests:** **429 passed** (0 failed, 0 errors)
- **Total Assertions:** **2.336 assertions**
- **Waktu Eksekusi:** 18,60 detik
- **Cakupan Pengujian:**
  - `LmsTest`: Validasi pembuatan tugas, pengumpulan tugas siswa, dan penilaian guru.
  - `Bk`: Validasi alur konseling, kerahasiaan kasus BK, dan rujukan konseling.
  - `Std`: Validasi poin kedisiplinan siswa, ambang sanksi, dan ekstrakurikuler.
  - `Auth`: Validasi multi-peran, token Sanctum, dan regenerasi sesi.
  - `Guest`: Verifikasi penutupan celah SEC-RBAC-01 (Buku Tamu 403 authorization).
  - `Cbt`: Validasi auto-close durasi ujian server dan anti-cheat.

### B. Pengujian Frontend Vitest Suites
```bash
npm test -- src/test/selective-integration.test.tsx src/test/admin-route-guard.test.tsx src/test/portal-admin-rbac.test.ts src/test/evaluator.test.ts src/test/portal-guru.test.ts src/test/portal-staf.test.ts src/test/portal-foundation.test.ts
```
- **Test Files:** 7 passed (7 files)
- **Total Tests:** **92 passed** (0 failed)
- **Waktu Eksekusi:** 1,57 detik
- **Rincian `selective-integration.test.tsx`:**
  - LMS Siswa (render daftar, filter status, buka modal submit, feedback guru): **3/3 PASS**
  - Konseling Siswa (banner privasi, form submit janji temu): **2/2 PASS**
  - Poin & Ekskul Siswa (kartu saldo, tab ekskul): **2/2 PASS**
  - SpeedGrader Guru (navigasi antarsiswa, penyimpanan nilai & feedback): **2/2 PASS**

### C. TypeScript Typecheck
```bash
npm run typecheck
```
- **Hasil:** **Clean (0 errors)**.

### D. Next.js Production Build
```bash
npm run build
```
- **Hasil:** **Compiled successfully**.
- **Generasi Halaman Statis:** **93/93 pages generated**.
- **Ukuran Bundle:** First Load JS shared ~87,4 kB (sangat optimal).

---

## 7. Matriks Temuan & Risiko Residual

| ID Temuan | Severity | Deskripsi Temuan | Dampak | Rekomendasi / Kondisi Sebelum Rilis |
|---|---|---|---|---|
| **COND-01** | **P2** | Remote memiliki folder duplikat `apps/admin/` dan `apps/portal/` di branch `origin/develop`. | Jika di-merge secara langsung tanpa filter, akan mengotori direktori root dengan dependensi duplikat. | Saat melakukan sinkronisasi Git dengan `origin/develop`, gunakan pola `git merge -s ours` untuk folder remote tersebut atau pertahankan `.gitignore` monorepo lokal. |
| **COND-02** | **P3** | Penyesuaian mapping respons `portalApi.getStudentPoints`. | Endpoint `/api/v1/student-points` mengembalikan data terpaginasi `{ data: [...], meta: {...} }`. Frontend telah memiliki fallback aman `pointsData?.logs || []`, namun penghitungan saldo kartu dinamis akan lebih akurat bila mapper memetakan array catatan secara eksplisit atau memanggil `/api/v1/students/{id}/points/summary`. | Tambahkan mapper respons sederhana di `portal-api.ts` untuk memetakan `res.data` paginasi ke struktur `{ logs, totalPrestasi, totalPelanggaran, balancePoints }`. |
| **COND-03** | **P3** | Aturan validasi `topic` pada `MeStudentController@storeCounselingRequest`. | Request validator belum mendaftarkan `'topic' => 'nullable|string|max:200'`, sehingga fallback menggunakan `reason`. | Tambahkan `'topic' => 'nullable|string|max:200'` pada rules validator di controller backend. |

---

## 8. Verifikasi Karantina & Kepatuhan SSOT (Tahap F)

1. **Karantina Modul SPP/Biaya:**
   - Pencarian pada seluruh basis kode `apps/web/src` memastikan **TIDAK ADA** integrasi endpoint keuangan, formulir tagihan SPP, maupun gateway pembayaran online.
   - Modul ini tetap tertahan sesuai arahan penundaan Fase 4.
2. **Karantina Mobile Flutter/Kotlin:**
   - Direktori `apps/mobile/` tetap berada di luar cakupan pekerjaan web portal dan tidak tersentuh.
3. **Penyimpanan Token:**
   - Seluruh autentikasi portal menggunakan session cookie HTTP-only / Sanctum yang dikelola backend. Pola rentan remote yang menggunakan `localStorage.getItem('sistlabum_token')` berhasil dicegah.

---

## 9. Ketentuan Penggabungan ke `develop` (Pre-Merge Conditions)

Berdasarkan audit di atas, penggabungan branch `integrate/selective-remote-sync` ke branch utama `develop` dinyatakan **LAYAK DAN AMAN**, dengan memenuhi 3 ketentuan berikut:

1. **Pertahankan Monorepo Terpadu `apps/web`:** Jangan pernah menyertakan atau mengaktifkan `apps/admin/` dan `apps/portal/` dari remote ke dalam pipeline build lokal.
2. **Terapkan Penyesuaian Mapper P3 (COND-02 & COND-03):** Lakukan penyempurnaan kecil pada mapping response poin dan validasi field topik konseling sebagai commit terpisah atau penyesuaian pra-rilis.
3. **Persetujuan Manusia (Human Sign-off):** Penggabungan Git ke branch `develop` harus dilakukan setelah instruksi eksplisit dari peninjau/pengguna, tanpa operasi `force push` atau rebase destruktif.

---
*Laporan ini disusun secara independen melalui audit statis dan dinamis pada repository lokal SISTLABUM.*
