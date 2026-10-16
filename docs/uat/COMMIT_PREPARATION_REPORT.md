# SISTLABUM-PHASE-06-COMMIT-PREPARATION — Laporan Rencana Komit Bertahap (5 Granular Commits)

**Tanggal Penyusunan:** 15 Oktober 2026, 23:50 WIB  
**Workspace:** `/Users/macbookprom12020/Desktop/Project/SISTLABUM`  
**Branch Target:** `develop`  
**Merge Commit Dasar:** `170749e5e3406724e1c26ad1a32e079904c6011a`  
**Single Source of Truth (SSOT):** `13_MASTER_MODULES.md`  
**Pedoman Kerja:** `AGENTS.md`  
**Status Evaluasi:** **`READY WITH CONDITIONS` (RENCANA 5 KOMIT SIAP UNTUK PERSETUJUAN)**  

---

## 1. Kondisi Git Aktual & Perbandingannya

Pemeriksaan aktual terhadap status Git membuktikan:
- **Branch Aktif:** `develop`
- **Commit HEAD:** `170749e5e3406724e1c26ad1a32e079904c6011a` (Commit merge resmi dengan 2 parent: lokal `d236d9f` dan upstream `f863276`).
- **Hubungan dengan Upstream:** Ahead 11 commit dari `origin/develop`, Behind 0 commit.
- **Status Working Tree:**
  - **Staged:** 183 berkas (142 Modified `M `, 41 Deleted `D `).
  - **Unstaged:** 0 berkas.
  - **Untracked Individual:** 463 berkas (termasuk modul UI admin, portal, tes, dan dokumen UAT).
  - **Total Berkas Belum Ter-commit:** 646 berkas.

> **Catatan Keselamatan:** Seluruh 183 berkas staged dan 463 berkas untracked saat ini berada dalam kondisi aman dan terlindungi penuh pada arsip Snapshot ke-3 di `/Users/macbookprom12020/Desktop/Project/backup-sistlabum-local-pre-pull/snapshot-03/`.

---

## 2. Audit Isi, Keamanan, dan Kepatuhan SSOT

### A. Pemindaian Kredensial & Rahasia (Pass)
- Tidak ditemukan berkas `.env`, private key (`.pem`, `.key`, `id_rsa`), sertifikat SSL, token otentikasi, maupun data pribadi (NIK, password) nyata pada berkas staged maupun untracked.
- Berkas `apps/web/.env.example` dan `apps/api/.env.example` hanya berisi placeholder konfigurasi tanpa nilai rahasia.

### B. Audit Database Biner & File Sementara (Pass)
- **Database Biner Dihapus dari Web:** Berkas `apps/web/data/database.sqlite` berada pada status staged deletion (`D `), membersihkan database dummy lama dari basis kode Next.js.
- **Database Biner Prototype Dikecualikan:** Berkas `legacy/prototype/data/database.sqlite` (berkas SQLite prototipe lokal) **dikecualikan secara mutlak** dari seluruh kandidat commit.
- **Cache & Build Outputs:** Tidak ada folder `.next/`, `build/`, `dist/`, atau `.turbo/` yang masuk ke dalam pelacakan Git (telah diabaikan oleh `.gitignore`).

### C. Kepatuhan SSOT & Least Privilege (Pass)
- **Karantina Modul SPP (Fase 4 - Ditunda):** Halaman `ortu/biaya` tetap dikeluarkan dari basis kode aktif `apps/web`.
- **Aplikasi Duplikat Tetap Bersih:** `apps/admin` dan `apps/portal` (Next 16 / React 19) tetap dihapus dan tidak dimasukkan kembali ke repositori.
- **Isolasi Mock Mode:** `apps/web/src/lib/api/mock-mode.ts` menjamin mock data tidak pernah aktif di production (`NODE_ENV === 'production'`) dan error 401/403/5xx tidak pernah disembunyikan.

---

## 3. Pemetaan Berkas ke Lima Kelompok Commit Granular

Untuk mematuhi aturan `AGENTS.md` (*"Perubahan kecil, mudah ditinjau, satu tugas = satu fokus"*), seluruh perubahan lokal dipetakan secara terpisah:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  RENCANA 5 COMMIT GRANULAR SISTLABUM                         │
├───────┬───────────────────────────────┬──────────────┬───────────────────────┤
│ Urutan│ Pesan Commit Standar          │ Cakupan Area │ Jumlah Berkas         │
├───────┼───────────────────────────────┼──────────────┼───────────────────────┤
│ 1     │ feat(api): consolidate...     │ apps/api/    │ 183 berkas            │
│ 2     │ refactor(web): remove legacy..│ apps/web/    │ 43 berkas             │
│ 3     │ feat(web-admin): implement... │ apps/web/    │ 190 berkas            │
│ 4     │ feat(portal): implement...    │ apps/web/    │ 124 berkas            │
│ 5     │ docs(uat): add comprehensive..│ docs/        │ 42 berkas             │
└───────┴───────────────────────────────┴──────────────┴───────────────────────┘
```

### Commit 1 — Backend Core, Multi-Tenant & UAT Staging
- **Pesan Commit:** `feat(api): consolidate backend services, role permissions, and uat staging features`
- **Cakupan Berkas (183 Berkas):**
  - 34 Services (`AcademicAttendanceService`, `CounselingService`, `ExamGradingService`, `AssetService`, `ProgressReportService`, `StudentPointService`, dll.)
  - 31 Controllers (`MeStudentController`, `AssignmentController`, `GradeController`, `UserController`, `ApprovalController`, dll.)
  - 41 Form Requests (`StoreGradeRequest`, `ApproveReportCardRequest`, `SaveExamAnswerRequest`, dll.)
  - 13 Models (`Achievement`, `Booking`, `Competition`, `Facility`, `Student`, `Teacher`, dll.)
  - 5 Console Commands (`DailyAttendanceSummaryCommand`, `DispatchRemindersCommand`, `EvaluateEarlyWarningsCommand`, `RbacAuditDriftCommand`, dll.)
  - 45 Feature Tests (`AttendanceTest`, `ExamTimingTest`, `MePortalApiTest`, `PostgreSqlConcurrencyTest`, `ReminderEngineTest`, dll.)
  - 14 Seeders & Routes (`DatabaseSeeder.php`, `UatStagingSeeder.php`, `routes/api.php`, `routes/console.php`).
- **Dependensi:** Tidak memiliki dependensi ke frontend; merupakan sumber kebenaran API.
- **Bukti Tes:** **1.135 tes PHPUnit lulus 100%** (6.288 assertion, durasi 34,83 detik).
- **Status:** `READY`.

### Commit 2 — Pembersihan Prototipe Lama & Modernisasi Web
- **Pesan Commit:** `refactor(web): remove legacy static prototype files from apps/web`
- **Cakupan Berkas (43 Berkas):**
  - 37 Berkas Static HTML/JS lama di `apps/web/public/` (dihapus).
  - 3 Berkas Data Mock Lama di `apps/web/data/` (`database.sqlite`, `schema.sql`, `seed.js` — dihapus).
  - 1 Berkas Server Mock Lama: `apps/web/server.js` (dihapus).
  - 2 Berkas Konfigurasi: `apps/web/package.json` dan `apps/web/README.md`.
- **Dependensi:** Menyiapkan `apps/web` untuk arsitektur Next.js 14 murni.
- **Status:** `READY`.

### Commit 3 — Frontend Consolidated Admin UI & Shell
- **Pesan Commit:** `feat(web-admin): implement unified admin system with 48 pages and rbac gates`
- **Cakupan Berkas (190 Berkas):**
  - 51 Rute Halaman Admin di `apps/web/src/app/(admin)/admin/` (Akademik, CBT, PPDB, BK, Sarpras, Eksekutif, Pengaturan, Kesiswaan, Tiket).
  - 27 Komponen Shell & Shared UI di `apps/web/src/components/` (`PermissionGate`, `DataTable`, `ConfirmDialog`, dll.).
  - 121 Modul Fitur & API Clients di `apps/web/src/features/` (Academic, CBT, Counseling, Master, PPDB, Sarpras, Settings, Student Affairs).
- **Dependensi:** Bergantung pada endpoint Backend di Commit 1.
- **Bukti Tes:** 0 error typecheck dan lulus kompilasi rute admin.
- **Status:** `READY`.

### Commit 4 — Frontend Consolidated Portal UI & Vitest Suites
- **Pesan Commit:** `feat(portal): implement unified role portals for teacher, student, guardian, and staff`
- **Cakupan Berkas (124 Berkas):**
  - 31 Rute Halaman Portal di `apps/web/src/app/(portal)/portal/` (Guru, Siswa, Ortu, Staf).
  - 17 Rute Halaman Publik & Auth di `apps/web/src/app/(public)/` dan `(auth)/`.
  - Modul integrasi portal API di `apps/web/src/features/portal/` (termasuk validasi topik konseling COND-03 dan mapper data poin siswa COND-02).
  - 53 Berkas Tes Vitest di `apps/web/src/test/` (A11y, Role Guard, CBT timing, Student Points Mapper, Web Push, dll.).
- **Dependensi:** Bergantung pada shell web dan backend API.
- **Bukti Tes:** **757 tes Vitest lulus 100%** (durasi 10,69 detik) dan 93/93 halaman build lulus.
- **Status:** `READY`.

### Commit 5 — Dokumentasi Resmi Proyek & Laporan UAT
- **Pesan Commit:** `docs(uat): add comprehensive uat plans, security gate reports, and merge audit logs`
- **Cakupan Berkas (42 Berkas):**
  - 23 Laporan Audit & Remediasi di `docs/uat/` (mencatat jejak verifikasi RBAC, readiness, dry-run, dan merge).
  - 14 Dokumen Desain & Blueprint di `docs/` (`FINAL_SECURITY_GATE_REPORT.md`, `FRONTEND_IMPLEMENTATION_BLUEPRINT.md`, `PRD_WEB_ADMIN_ANALYSIS.md`, dll.).
  - 5 Dokumen root dan PRD yang diperbarui.
- **Dependensi:** Tidak ada dependensi kode.
- **Status:** `READY`.

---

## 4. Daftar Pengecualian dan Keputusan Pengguna (Exclusions)

Sebanyak **64 berkas** dikecualikan dari 5 commit di atas untuk menunggu keputusan pengguna:

| Berkas / Direktori | Klasifikasi | Alasan Pengecualian & Rekomendasi |
|---|---|---|
| `legacy/prototype/data/database.sqlite` | `GENERATED / DILARANG MASUK GIT` | File biner database SQLite lokal pada prototipe lama. **Wajib diabaikan**. |
| `legacy/prototype/` (43 berkas lainnya) | `NEEDS USER DECISION` | Berkas prototipe HTML/JS lama yang dipindahkan ke arsip `legacy/`. Disarankan dipertahankan lokal atau di-commit sebagai commit terpisah ke branch arsip. |
| `apps/web/package-lock.json` | `NEEDS USER DECISION` | File lock npm lokal. Jika tim menggunakan pnpm sebagai monorepo manager, file lock npm tidak perlu dimasukkan. |
| `LOGO_SMP_LAB_MALANG.png` & `STRUKTUR LENGKAP...pdf` | `NEEDS USER DECISION` | Berkas biner media/dokumen di root. Disarankan dipindahkan ke folder aset dokumentasi atau dipertahankan lokal. |

---

## 5. Rencana Prosedur Staging dan Eksekusi (Untuk Dijalankan Pasca-Persetujuan)

Saat persetujuan eksplisit diberikan, urutan eksekusi yang direkomendasikan adalah:

```bash
# ─── LANGKAH 0: UNSTAGE SEMUA PERUBAHAN KE WORKING TREE ───
git reset HEAD

# ─── LANGKAH 1: STAGE & COMMIT KELOMPOK 1 (BACKEND) ───
git add apps/api/
git commit -m "feat(api): consolidate backend services, role permissions, and uat staging features"

# ─── LANGKAH 2: STAGE & COMMIT KELOMPOK 2 (CLEANUP PROTOTYPE) ───
git add apps/web/public/ apps/web/data/ apps/web/server.js apps/web/package.json apps/web/README.md
git commit -m "refactor(web): remove legacy static prototype files from apps/web"

# ─── LANGKAH 3: STAGE & COMMIT KELOMPOK 3 (ADMIN UI) ───
git add apps/web/src/app/\(admin\)/ apps/web/src/components/shell/admin/ apps/web/src/features/master/ apps/web/src/features/academic/ apps/web/src/features/cbt/ apps/web/src/features/counseling/ apps/web/src/features/sarpras/ apps/web/src/features/settings/ apps/web/src/features/student-affairs/ apps/web/src/features/reports/ apps/web/src/features/executive/ apps/web/src/features/cms/ apps/web/src/features/storage/ apps/web/src/features/public-relations/ apps/web/src/components/ apps/web/src/lib/ apps/web/src/providers/ apps/web/src/types/ apps/web/src/app/globals.css apps/web/src/app/layout.tsx apps/web/public/sw.js apps/web/next* apps/web/post* apps/web/tail* apps/web/ts* apps/web/vitest* apps/web/.env.example apps/web/.eslintrc.json
git commit -m "feat(web-admin): implement unified admin system with 48 pages and rbac gates"

# ─── LANGKAH 4: STAGE & COMMIT KELOMPOK 4 (PORTAL UI & TESTS) ───
git add apps/web/src/app/\(portal\)/ apps/web/src/features/portal/ apps/web/src/components/shell/portal/ apps/web/src/app/\(public\)/ apps/web/src/app/\(auth\)/ apps/web/src/components/shell/public/ apps/web/src/test/
git commit -m "feat(portal): implement unified role portals for teacher, student, guardian, and staff"

# ─── LANGKAH 5: STAGE & COMMIT KELOMPOK 5 (DOKUMENTASI & UAT) ───
git add docs/ *.md
git commit -m "docs(uat): add comprehensive uat plans, security gate reports, and merge audit logs"

# ─── LANGKAH 6: VERIFIKASI AKHIR ───
git log -6 --oneline --graph
```

---

## 6. Status Akhir

**STATUS: `READY FOR USER APPROVAL`**

Rencana pemecahan 5 commit granular telah tersusun lengkap, terpetakan secara rinci, dan terverifikasi aman. Sesuai aturan wajib: **tidak ada perintah commit, push, deploy, reset, clean, atau stash yang dijalankan**. Menunggu persetujuan eksplisit Anda.
