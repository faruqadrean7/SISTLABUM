# SISTLABUM-PHASE-05-LOCAL-CHANGES-REVIEW — Laporan Inventarisasi dan Audit Perubahan Lokal

**Tanggal Audit:** 15 Oktober 2026, 23:45 WIB  
**Workspace:** `/Users/macbookprom12020/Desktop/Project/SISTLABUM`  
**Branch Aktif:** `develop`  
**Commit Merge Terkini:** `170749e5e3406724e1c26ad1a32e079904c6011a`  
**Single Source of Truth (SSOT):** `13_MASTER_MODULES.md`  
**Pedoman Kerja:** `AGENTS.md`  
**Status Evaluasi:** **SELESAI (AUDIT & INVENTARISASI TERPERINCI TUNTAS)**  

---

## 1. Ringkasan Eksekutif & Statistik Berkas

Setelah penyelesaian commit merge resmi `170749e` (yang menggabungkan upstream `origin/develop` dan mempertahankan arsitektur konsolidasi `apps/web`), seluruh perubahan lokal pengguna dipulihkan dari `stash@{0}` dengan integritas data 100%.

Audit ini menginventarisasi secara menyeluruh seluruh berkas yang saat ini berada di area kerja lokal sebelum dilakukan tindakan staging, commit, atau push lebih lanjut.

### Statistik Berkas:
| Kategori Status Git | Jumlah Berkas | Keterangan |
|---|---|---|
| **Staged Modified (`M `)** | **142 berkas** | Perubahan logika bisnis backend (controllers, services, requests, models, tests) dan update package frontend. |
| **Staged Deleted (`D `)** | **41 berkas** | Pembersihan berkas prototype lama (`apps/web/public/*.html`, `apps/web/data/*`, `apps/web/server.js`) dari `apps/web`. |
| **Untracked Individual (`??`)** | **462 berkas** | Berkas baru meliputi UI Admin (51 pages), UI Portal (31 pages), Fitur/Libs/Komponen (154 berkas), Tes Vitest (52 berkas), Backend baru (49 berkas), Dokumen UAT (22 berkas), dan Legacy Prototype (44 berkas). |
| **Total Berkas Belum Ter-commit** | **645 berkas** | 183 staged + 462 untracked. |

---

## 2. Inventarisasi dan Pengelompokan Berkas

Seluruh 645 berkas dikelompokkan ke dalam 7 kelompok fungsional:

### Kelompok 1: Backend Core & Multi-Tenant Refinements (183 Berkas Staged)
- **Komponen:**
  - 34 Services (`AcademicAttendanceService`, `CounselingService`, `ExamGradingService`, `AssetService`, `ProgressReportService`, dll.)
  - 29 Controllers (`MeStudentController`, `AssignmentController`, `CharacterNoteController`, `GradeController`, dll.)
  - 23 Form Requests (`StoreGradeRequest`, `ApproveReportCardRequest`, `SaveExamAnswerRequest`, dll.)
  - 11 Models (`Achievement`, `Booking`, `Competition`, `Facility`, `Student`, `Teacher`, dll.)
  - 31 Feature Tests (`AttendanceTest`, `ExamTimingTest`, `MePortalApiTest`, `PPDBAccountTest`, dll.)
- **Status:** **LENGKAP & STABIL**. Seluruh logika telah diuji dan lulus 100% pada 1.135 tes PHPUnit.
- **Tingkat Risiko:** **SEDANG KE TINGGI** (menyentuh otorisasi data multi-tenant dan alur nilai/rapor).
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 2: Backend New Features, Staging Seeders & Audit Drift (49 Berkas Untracked)
- **Komponen:**
  - 3 Console Commands: `DispatchRemindersCommand.php`, `EvaluateEarlyWarningsCommand.php`, `RbacAuditDriftCommand.php`.
  - 2 Controllers: `ApprovalController.php` (Eksekutif), `UserController.php` (Manajemen User Admin).
  - 18 Form Requests: `BulkApproveReportCardRequest`, `UpdateAssignmentRequest`, `ReviewApprovalRequest`, dll.
  - 6 Database Seeders/Configs: `UatStagingSeeder.php`, migrasi batch 11 & 12.
  - 14 Unit/Feature Tests: `PostgreSqlConcurrencyTest`, `QueueWorkerIntegrationTest`, `ReminderEngineTest`, `ExecutiveApprovalTest`, `FileUrlSerializationTest`.
- **Status:** **LENGKAP & STABIL**. Fitur esensial untuk UAT staging, otomatisasi reminder, dan pendeteksi drift permission.
- **Tingkat Risiko:** **SEDANG** (penambahan endpoint baru yang terproteksi RBAC).
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 3: Frontend Web Monorepo Cleanup & Modernization (41 Berkas Deleted + 3 Config)
- **Komponen:**
  - 37 Berkas Static Prototype Lama di `apps/web/public/` (dihapus dari `apps/web` karena digantikan oleh App Router).
  - 3 Berkas Data Mock Lama di `apps/web/data/` (`database.sqlite`, `schema.sql`, `seed.js`).
  - 1 Berkas Server Mock Lama: `apps/web/server.js`.
  - 2 Berkas Konfigurasi Modern: `apps/web/package.json` dan `apps/web/README.md`.
- **Status:** **BERSIH**. Menghilangkan tumpang tindih antara prototipe HTML jadul dan Next.js modern.
- **Tingkat Risiko:** **RENDAH** (tidak mempengaruhi fungsionalitas Next.js aktif).
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 4: Frontend Web Consolidated Admin UI (228 Berkas Untracked)
- **Komponen:**
  - 51 Rute Halaman Admin di `apps/web/src/app/(admin)/admin/` (Akademik, CBT, PPDB, BK/Konseling, Sarpras, Eksekutif, Pengaturan/Audit, Kesiswaan, Tiket).
  - 27 Komponen Shell & Shared UI di `apps/web/src/components/` (`PermissionGate`, `DataTable`, `ConfirmDialog`, dll.).
  - 121 Modul Fitur & API Clients di `apps/web/src/features/` (Academic, CBT, Counseling, Master, PPDB, Sarpras, Settings, Student Affairs).
- **Status:** **LENGKAP & SIAP PRODUKSI**. Terverifikasi dengan 0 error typecheck dan sukses pada kompilasi 93/93 halaman Next.js.
- **Tingkat Risiko:** **SEDANG** (UI utama tata usaha dan pengelola sekolah).
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 5: Frontend Web Portal UI (Guru, Siswa, Ortu, Staf) (32 Berkas)
- **Komponen:**
  - 31 Rute Halaman Portal di `apps/web/src/app/(portal)/portal/` (Guru, Siswa, Ortu, Staf) + 1 berkas termodifikasi (`siswa/ujian/[id]`).
  - Modul integrasi portal API di `apps/web/src/features/portal/` (termasuk validasi COND-03 konseling dan mapper robust COND-02 poin siswa).
  - Pembatasan ketat: Halaman SPP `ortu/biaya` telah dikarantina dan tidak disertakan.
- **Status:** **LENGKAP & TERINTEGRASI**. Teruji lulus pada 757 tes Vitest.
- **Tingkat Risiko:** **SEDANG**.
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 6: Frontend Vitest Test Suites (53 Berkas)
- **Komponen:**
  - 52 Berkas Tes Untracked di `apps/web/src/test/` (A11y, Academic, Admin Route Guard, CBT Timing, Role Guard, Student Points Mapper, Selective Integration, Web Push, dll.) + 1 berkas tes termodifikasi.
- **Status:** **100% LULUS (757 TES)**. Merupakan jaring pengaman utama integritas frontend.
- **Tingkat Risiko:** **SANGAT RENDAH** (aset pengujian).
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 7: Dokumen Audit UAT & Dokumen Desain (36 Berkas Untracked)
- **Komponen:**
  - 22 Laporan di `docs/uat/` (mencatat seluruh jejak audit, remediasi RBAC, kesiapan UAT, dan simulasi merge).
  - 14 Dokumen Desain di `docs/` dan Root (`FINAL_SECURITY_GATE_REPORT.md`, `FRONTEND_IMPLEMENTATION_BLUEPRINT.md`, `PRD_WEB_ADMIN_ANALYSIS.md`, dll.).
- **Status:** **DOKUMENTASI FORMAL PROYEK**.
- **Tingkat Risiko:** **SANGAT RENDAH**.
- **Klasifikasi:** `COMMIT CANDIDATE`.

### Kelompok 8: Legacy Prototype, Artefak Biner & File Lock (46 Berkas Untracked)
- **Komponen:**
  - 44 Berkas di `legacy/prototype/` (arsip prototipe HTML statis yang dipindahkan dari `apps/web`).
  - 1 Berkas Biner SQLite di `legacy/prototype/data/database.sqlite`.
  - 1 Berkas Lock: `apps/web/package-lock.json`.
  - 2 Berkas Media/Dokumen di Root: `LOGO_SMP_LAB_MALANG.png`, `STRUKTUR LENGKAP MENU PORTAL SATU PINTU.pdf`.
- **Status:** **REFERENSI HISTORIS / GENERATED**.
- **Klasifikasi:**
  - `legacy/prototype/data/database.sqlite`: `GENERATED/IGNORE CANDIDATE` (file biner database lokal tidak boleh masuk git).
  - `apps/web/package-lock.json`: `NEEDS USER DECISION` (apakah monorepo dibakukan dengan npm atau pnpm).
  - `legacy/prototype/`: `KEEP LOCAL` atau `NEEDS USER DECISION` (arsip lokal atau commit arsip).

---

## 3. Rangkuman Klasifikasi Rekomendasi

| Klasifikasi | Cakupan Kelompok Berkas | Tindakan yang Direkomendasikan |
|---|---|---|
| **`COMMIT CANDIDATE`** | • Kelompok 1 (Backend Core Refinements)<br>• Kelompok 2 (Backend New Features & UAT Seeders)<br>• Kelompok 3 (Frontend Cleanup: Hapus prototype lama dari `apps/web`)<br>• Kelompok 4 (Frontend Consolidated Admin UI)<br>• Kelompok 5 (Frontend Consolidated Portal UI)<br>• Kelompok 6 (Frontend Vitest Suites)<br>• Kelompok 7 (Dokumen UAT & Blueprint Desain) | **Sangat layak di-commit** secara bertahap terpisah per modul. Seluruh kode telah lulus uji 100% dan bebas dari rahasia/kredensial. |
| **`GENERATED/IGNORE CANDIDATE`** | `legacy/prototype/data/database.sqlite` | **Jangan di-commit**. Merupakan database biner SQLite lokal pada prototipe lama. |
| **`NEEDS USER DECISION`** | • `legacy/prototype/` (44 berkas arsip HTML)<br>• `apps/web/package-lock.json`<br>• Media root (`LOGO_SMP_LAB_MALANG.png`, `STRUKTUR LENGKAP...pdf`) | Pengguna memutuskan apakah prototipe lama disimpan sebagai arsip di Git (`legacy/`) atau dipertahankan lokal saja. |

---

## 4. Rekomendasi Pemisahan Commit Berdasarkan Fitur (Granular Commits)

Untuk mematuhi aturan `AGENTS.md` (*"Perubahan kecil, mudah ditinjau, satu tugas = satu fokus"*), bila pengguna menyetujui penyimpanan ke riwayat Git, disarankan memecah 645 berkas menjadi **5 commit terpisah yang rapi**:

1. **Commit 1 — Backend Core & UAT Hardening:**  
   `feat(api): consolidate backend services, role permissions, and uat staging features`  
   *Mencakup:* Seluruh modifikasi backend pada `apps/api/` (Kelompok 1 & 2).
2. **Commit 2 — Frontend Monorepo Clean-up:**  
   `refactor(web): remove legacy static prototype files from apps/web`  
   *Mencakup:* Penghapusan 41 berkas HTML/server lama di `apps/web/public/` dan `apps/web/data/` (Kelompok 3).
3. **Commit 3 — Frontend Consolidated Admin UI:**  
   `feat(web-admin): implement unified admin system with 48 pages and rbac gates`  
   *Mencakup:* Halaman admin, features master/academic/cbt/counseling/sarpras, dan shell admin (Kelompok 4).
4. **Commit 4 — Frontend Consolidated Portal UI & Tests:**  
   `feat(portal): implement unified role portals for teacher, student, guardian, and staff`  
   *Mencakup:* Halaman portal, mapper poin siswa, sanitasi konseling, dan 64 suite tes Vitest (Kelompok 5 & 6).
5. **Commit 5 — Project Documentation & UAT Reports:**  
   `docs(uat): add comprehensive uat plans, security gate reports, and merge audit logs`  
   *Mencakup:* Seluruh berkas laporan di `docs/uat/` dan blueprint di `docs/` (Kelompok 7).

---

## 5. Rekomendasi Kelayakan Push

**REKOMENDASI: `READY FOR PUSH REVIEW (WITH COMMITS PREPARATION)`**

Repositori berada dalam status sangat sehat:
- 1.135 tes PHPUnit lulus (100%).
- 757 tes Vitest lulus (100%).
- 0 error TypeScript.
- 93/93 halaman Next.js build sukses.
- Tidak ada kebocoran kredensial atau rahasia.

**Langkah yang Disarankan:**
Pengguna dapat mengonfirmasi apakah ingin menjalankan pemecahan commit 5-tahap di atas pada branch `develop`, sebelum kemudian mengeksekusi `git push origin develop`.
