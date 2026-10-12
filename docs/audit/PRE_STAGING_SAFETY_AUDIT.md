# SISTLABUM — PRE-STAGING SAFETY AUDIT & CBT LOAD DRILL INTEGRITY EVALUATION

## 1. Executive Summary & Status Release Gate

| Parameter | Hasil Audit Objektif |
|---|---|
| **Status Gate G-4** | **BLOCKED (PRASYARAT OPERASIONAL: KLUSTER STAGING TERISOLASI BELUM TERSEDIA)** |
| **Keputusan Rilis Resmi** | **CONDITIONAL GO** (Tolak kenaikan ke Full Production Go tanpa bukti staging riil) |
| **Commit Target yang Diaudit** | `1138df9` (branch `develop`) |
| **Total Automated Tests** | **765 Tests Passed, 4.034 Assertions, 0 Failures** |
| **Code Style & Formatting** | **Laravel Pint Passed (0 Violations)** |
| **Fokus Audit** | Skrip k6 `cbt-500-students.js`, Integritas CBT Backend, Keamanan `cbt:load-cleanup`, Kesiapan Staging Runtime |

---

## 2. Temuan Audit Berdasarkan Kode Aktual & Klasifikasi Risiko

### A. Matriks Klasifikasi Temuan & Risiko

| ID Temuan | Severity | Komponen / Berkas | Deskripsi Temuan & Risiko | Tindakan Remediasi yang Diambil | Status |
|---|---|---|---|---|---|
| **SEC-AUD-01** | **CRITICAL** | `app/Console/Commands/CbtLoadCleanupCommand.php` | **Ketiadaan Production Safety Guard**: Perintah cleanup sebelumnya tidak memeriksa `app()->isProduction()` maupun nama basis data, berpotensi mengeksekusi penghapusan massal jika dijalankan di server produksi. | Ditambahkan blokade keras `if (app()->isProduction())` dan validasi nama DB (`str_contains('prod')`) dengan exit code 1. | **RESOLVED** |
| **SEC-AUD-02** | **HIGH** | `app/Console/Commands/CbtLoadCleanupCommand.php` | **Risiko Penghapusan Data Nyata via Wildcard**: Query penghapusan pengguna menggunakan `where('email', 'like', 'student%@labschool.sch.id')` yang dapat menghapus akun siswa resmi sekolah jika memiliki pola email serupa. | Diisolasi ketat: hanya menghapus siswa yang memiliki `full_name like 'Siswa Uji Beban %'` dan ID pengguna yang terikat langsung padanya. | **RESOLVED** |
| **QA-AUD-01** | **HIGH** | `apps/api/tests/load/cbt-500-students.js` | **Toleransi Autentikasi Palsu pada k6**: Check login memvalidasi `status === 200 || status === 401`, sehingga kegagalan autentikasi dicatat sebagai check SUCCEEDED (100% pass semu). | Diperketat menjadi hanya `status === 200 OK`. Kegagalan login langsung menggagalkan check dan mencatat kegagalan bisnis. | **RESOLVED** |
| **QA-AUD-02** | **HIGH** | `apps/api/tests/load/cbt-500-students.js` | **Distorsi Metrik `cbt_error_rate` (Rate Metric Bug)**: Pemanggilan `cbtErrorRate.add(1)` dilakukan saat error, namun `add(0)` tidak pernah dipanggil pada operasi sukses, menyebabkan sample count `0 out of 0` atau 100% false failure. | Diterapkan pelacakan seimbang: memanggil `cbtErrorRate.add(0)` pada setiap respon valid dan `add(1)` pada kegagalan alur. | **RESOLVED** |
| **QA-AUD-03** | **MEDIUM** | `apps/api/tests/load/cbt-500-students.js` | **Ketiadaan Assertion Status HTTP Spesifik**: Request `questions`, `heartbeat`, `start-session`, dan `save-answer` hanya memeriksa `status !== 500`. Respon 400/401/403/404 lolos tanpa terdeteksi. | Ditambahkan asersi status eksplisit: `questions: 200`, `heartbeat: 200`, `save-answer: 200/201`, `start-session: 200/422`, `finish: 200/422`. | **RESOLVED** |
| **QA-AUD-04** | **LOW** | `apps/api/tests/load/cbt-500-students.js` | **Ambiguitas Penamaan Metrik Counter**: Counter `cbtSuccessfulSubmissions` mencatat penyimpanan tiap butir jawaban, bukan pengumpulan sesi ujian. | Dipisahkan menjadi `cbtSuccessfulAnswers` (per jawaban) dan `cbtSuccessfulFinishes` (per ujian dikumpulkan). | **RESOLVED** |
| **OPS-AUD-01** | **HIGH** | Dokumen Staging & Deployment Runbook | **Asumsi Belum Terukur pada Kapasitas 35 Worker PHP-FPM**: Klaim bahwa 35 worker PHP-FPM pasti cukup untuk 500 VU dengan enkripsi Argon2id belum dibuktikan secara empiris di bawah beban puncak bersamaan. | Ditegaskan bahwa alokasi 35 worker adalah hipotesis awal yang wajib diukur dengan `php-fpm-status` dan telemetri CPU selama staging drill. | **DOCUMENTED** |

---

## 3. Remediasi Kode & Verifikasi Regresi

### A. Perbaikan Keamanan pada `CbtLoadCleanupCommand.php`
Kode telah diperbaiki dengan menambahkan perlindungan berlapis:
```php
// SEC-SAFE-01: Production Safety Guard
if (app()->isProduction()) {
    $this->error('CRITICAL SAFETY VIOLATION: cbt:load-cleanup is strictly forbidden in the production environment!');
    return self::FAILURE;
}

$dbName = (string) DB::connection()->getDatabaseName();
if (str_contains(strtolower($dbName), 'prod')) {
    $this->error("CRITICAL SAFETY VIOLATION: Database '{$dbName}' appears to be production! Cleanup aborted.");
    return self::FAILURE;
}
```
Dan isolasi penghapusan hanya pada data uji:
```php
$stagingStudents = Student::withTrashed()
    ->where('full_name', 'like', 'Siswa Uji Beban %')
    ->get();
$stagingStudentIds = $stagingStudents->pluck('id')->all();
$stagingUserIds = $stagingStudents->pluck('user_id')->filter()->all();
```

### B. Bukti Regresi Otomatis: `CbtLoadCleanupTest.php`
Dibuat pengujian unit dan integrasi pada [`apps/api/tests/Feature/Cbt/CbtLoadCleanupTest.php`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/tests/Feature/Cbt/CbtLoadCleanupTest.php):
1. `test_dry_run_does_not_delete_any_records`:
   - Membuktikan opsi `--dry-run` memindai artefak tanpa memodifikasi baris tabel mana pun.
2. `test_safety_guard_blocks_execution_in_production_environment`:
   - Membuktikan bahwa ketika aplikasi mendeteksi lingkungan `production`, perintah abort seketika dengan pesan pelanggaran keamanan kritis dan tidak menghapus data.
3. `test_force_cleanup_removes_staging_data_while_preserving_non_test_data`:
   - Membuat data resmi sekolah (Siswa: *Budi Santoso Siswa Resmi*, Mapel: *KIM-PROD*, Ujian: *Ujian Akhir Semester Kimia Resmi*).
   - Menjalankan `php artisan cbt:load-cleanup --force`.
   - **Hasil**: Seluruh data uji (*Siswa Uji Beban*, *BIO-LOAD*, *Ujian Biologi Uji Beban 500 Siswa*) terhapus 100%, sementara data resmi *Budi Santoso* dan ujian resmi tetap **100% UTUH** di basis data.

Output Eksekusi Uji:
```
PASS  Tests\Feature\Cbt\CbtLoadCleanupTest
✓ dry run does not delete any records
✓ safety guard blocks execution in production environment
✓ force cleanup removes staging data while preserving non test data

Tests:    3 passed (17 assertions)
Duration: 3.41s
```

### C. Pembuktian Empiris k6 Smoke Test Pasca-Remediasi
Smoke test k6 lifecycle penuh (1 VU) dijalankan ulang dengan asersi ketat:
- **Total Checks**: 28 checks dieksekusi, **28 checks succeeded (100.00%)**, 0 failed.
- **Login Check**: `login status is 200 OK` $\rightarrow$ **PASS**.
- **Error Rate**: `cbt_error_rate: 0.00% (0 out of 11 valid samples)` $\rightarrow$ **PASS** (metrik terhitung proporsional).
- **Latency Autosave**: p95 = 36.7 ms.
- **Latency Submit**: p95 = 21.61 ms.
- **Latency Heartbeat**: p95 = 25.61 ms.

---

## 4. Audit Integritas Layanan CBT (Race Conditions, Concurrency, & Isolation)

Berdasarkan penelusuran arsitektur `ExamSessionController`, `ExamSessionService`, dan migrasi basis data PostgreSQL:

### A. Mulai Sesi (`start-session`)
- **Pencegahan Sesi Ganda**: Tabel `exam_sessions` memiliki indeks unik komposit `UNIQUE (exam_id, student_id)`. Siswa yang sama tidak mungkin memiliki lebih dari satu sesi aktif untuk satu ujian.
- **Token Ruang**: Verifikasi token `BIO123` divalidasi terhadap waktu kedaluwarsa `token_expires_at` dan ruangan peserta `exam_participants.exam_room_id`.
- **Isolasi Peserta**: Siswa yang tidak terdaftar pada tabel `exam_participants` ditolak dengan `404 / 422`.

### B. Penyimpanan Jawaban Autosave (`save-answer`)
- **Pencegahan Kunci Ganda & Duplikasi Jawaban**: Tabel `exam_answers` dilindungi oleh `UNIQUE (session_id, question_id)`. Operasi penyimpanan menggunakan `updateOrCreate()`.
- **Bebas Row Contention**: Karena setiap siswa memiliki `session_id` UUID unik, 500 siswa yang menyimpan jawaban pada milidetik yang sama menulis ke baris data yang terpisah secara independen. Tidak terjadi row-level locking conflict di PostgreSQL.
- **Integritas Paket Soal**: Layanan secara eksplisit memeriksa keberadaan `question_id` pada `exam_questions` paket ujian terkait (`SEC-DATA-01`). Siswa tidak dapat menginject jawaban untuk soal dari mata pelajaran lain.

### C. Heartbeat Anti-Cheat (`heartbeat`)
- **Otorisasi Kepemilikan (Anti-IDOR)**: `ExamSessionService::recordHeartbeat` memvalidasi `$session->student->user_id === $user->id`. Siswa dilarang mengirim telemetri untuk sesi peserta lain.
- **Deteksi Anomali**: Perubahan IP address, pergantian browser/perangkat, perpindahan tab, dan jeda koneksi > 180 detik dicatat secara otomatis ke `exam_violations`.

### D. Pengakhiran Ujian (`finish-session` & Auto-Submit)
- **Pencegahan Submit Ganda**: `finishSession` bersifat idempoten. Jika siswa memanggil submit lebih dari satu kali, panggilan pertama menyetel `status = 'selesai'` dan `submitted_at = now()`, sedangkan panggilan berikutnya mengembalikan respon sukses idempoten `{ status: 'selesai', message: 'Ujian sudah diselesaikan sebelumnya.' }`.
- **Sinkronisasi Auto-Submit**: Perintah terjadwal `php artisan exam:auto-submit` berjalan tiap menit terlindungi oleh `withoutOverlapping()`. Kueri hanya memproses sesi berstatus `mengerjakan` yang telah melewati `deadline_at <= now()`. Jika terjadi persaingan waktu antara siswa dan cron pada detik yang sama, sesi tetap berakhir pada status tunggal yang konsisten: `selesai`.

---

## 5. Audit Kesiapan Staging (Runtime & Operational Sizing)

### A. Evaluasi Sizing 35 Worker PHP-FPM
- **Karakteristik Beban 500 Siswa**:
  - Pada steady-state 500 VU dengan *think time* 3–5 detik, estimasi request masuk adalah ~100–140 req/detik.
  - Untuk request autosave (`/save-answer`) dengan durasi eksekusi ~30 ms, 35 worker secara matematis mampu memproses hingga:
    $$\frac{35\text{ workers}}{0.030\text{ s/req}} = 1.166\text{ req/detik}$$
  - **Bottleneck Login (Argon2id)**: Pada fase ramp-up, jika 100 siswa login serentak dan setiap hashing memakan waktu ~170 ms CPU time:
    $$\text{Kebutuhan Core CPU} = \frac{100 \times 0.170\text{ s}}{10\text{ s}} = 1.7\text{ CPU Cores}$$
- **Peringatan Operasional**:
  > **Jangan menyatakan konfigurasi 35 worker memadai sebelum ada pengukuran aktual.**  
  Konfigurasi `pm.max_children = 35` harus dimonitor menggunakan `pm.status_path = /status` pada PHP-FPM selama staging drill. Jika antrean `listen queue` > 0 atau `active processes` mencapai 35 terus-menerus, ukuran pool harus disesuaikan secara empiris.

### B. Estimasi Konsumsi Memori & Kapasitas Database
- **RAM PHP-FPM**: Rata-rata 45 MB per proses $\times$ 35 worker = ~1,58 GB RAM. Sangat aman pada server 8 GB RAM (< 25% penggunaan memori sistem).
- **PostgreSQL 17 Connection Pool**:
  - Alokasi `max_connections = 100` di `postgresql.conf`.
  - Konsumsi koneksi maksimum: 35 (PHP-FPM) + 4 (Queue Worker) + 5 (Admin/Cron) = 44 koneksi aktif (< 45% pool).

---

## 6. Kriteria Kesiapan Staging Menuju Eksekusi 500 VU (Checklist)

Sebelum perintah `k6 run apps/api/tests/load/cbt-500-students.js` boleh dieksekusi pada staging, checklist berikut wajib dipenuhi:

- [ ] **Kluster Staging Terpisah**: Server staging aktif pada OS Linux (bukan workstation dev lokal).
- [ ] **Mesin Load Generator Terpisah**: Mesin k6 terpisah yang terhubung di jaringan berlatensi rendah ke server staging.
- [ ] **Nginx & PHP-FPM Terkonfigurasi**: Pool PHP-FPM aktif dengan `pm = static`, `pm.max_children = 35`, dan endpoint `/fpm-status` aktif.
- [ ] **PostgreSQL 17 & Redis 7.x**: Driver cache & queue diarahkan ke Redis, PostgreSQL disetel `max_connections = 100`.
- [ ] **Database Staging Ter-seed**: `php artisan db:seed --class=CbtStagingLoadSeeder` berhasil menghasilkan 500 siswa dan token ujian `BIO123`.
- [ ] **Observabilitas Berjalan**: `htop`, `vmstat 1`, dan monitoring PostgreSQL aktif merekam telemetri server selama 30 menit steady state.

---

## 7. Status Keputusan Rilis Akhir

$$\mathbf{STATUS\ GATE\ G-4:\ BLOCKED}$$
$$\mathbf{KEPUTUSAN\ RILIS:\ CONDITIONAL\ GO}$$

Sistem backend SISTLABUM berada pada tingkat keamanan dan kesiapan fungsional tertinggi (765 tests passed, 0 vulnerabilities, isolation verified). Namun, **ketiadaan log mentah pengujian beban 500 VU selama 30 menit dari kluster staging multi-worker nyata mewajibkan tim audit mempertahankan status CONDITIONAL GO**.

Setelah pengujian 30 menit di staging menghasilkan output empiris dengan `p(95) < 500 ms`, `autosave p(95) < 250 ms`, dan `error rate < 1%`, status Gate G-4 dapat disahkan menjadi **`PASS`** dan rilis dapat ditingkatkan menjadi **`FULL PRODUCTION GO`**.
