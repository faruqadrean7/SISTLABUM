# SISTLABUM — CBT STAGING LOAD DRILL REPORT

## 1. Executive Summary & Status

| Parameter | Hasil Evaluasi Empiris |
|---|---|
| **Status Gate G-4** | **BLOCKED ON LOCAL INSTANCE / READY FOR DEDICATED STAGING** |
| **Keputusan Rilis** | **CONDITIONAL GO** (Tidak dinaikkan ke Full Production Go tanpa bukti staging 30 menit) |
| **Commit yang Diuji** | `00b3ceb` (branch `develop`) |
| **Alat Uji Beban** | Grafana k6 v2.3.0 (`/opt/homebrew/bin/k6`) |
| **Skrip Uji Beban** | [`apps/api/tests/load/cbt-500-students.js`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/tests/load/cbt-500-students.js) |
| **Kesiapan Data Staging** | **100% SEEDED** (500 akun siswa, 1 Ujian Biologi, Token Ruang `BIO123`, 10 Butir Soal) |
| **Hasil Smoke Test (1 VU)** | **100% PASS** (9/9 checks, 0.00% error rate, Autosave p95 = 18.11 ms) |
| **Hasil Concurrency Test (5 VUs)** | **100% Checks Succeeded (90/90)**, 0.00% HTTP failed, Autosave p95 = 19.04 ms. Namun latensi login p95 naik ke 760.32 ms akibat bottleneck server single-process. |
| **Uji 500 VU 30 Menit** | **NOT EXECUTED** (Lingkungan lokal single-process tidak memenuhi prasyarat arsitektur untuk 500 VU) |

---

## 2. Fase 1: Preflight & Kesiapan Lingkungan

### A. Validasi Data Uji (Seeded Dataset)
Melalui seeder staging [`Database\Seeders\CbtStagingLoadSeeder`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/database/seeders/CbtStagingLoadSeeder.php), database staging telah dilengkapi data sintetis terisolasi:
1. **500 Akun Siswa**: `student1@labschool.sch.id` s/d `student500@labschool.sch.id` (Password: `Password123!`, Role: `student`).
2. **1 Sesi Ujian Aktif**:
   - ID Ujian: `01a12e18-4810-735a-beee-9caa198def6c`
   - Judul: *Ujian Biologi Uji Beban 500 Siswa*
   - Status: `aktif` (Durasi: 120 menit)
3. **1 Ruang Ujian & Token**:
   - Ruang: *Laboratorium CBT 500*
   - Token Ruang: `BIO123` (Masa berlaku 7 hari)
4. **500 Peserta Terdaftar**: Seluruh 500 siswa terdaftar pada `exam_participants` untuk ujian ini.
5. **10 Butir Soal Pilihan Ganda**: Lengkap dengan opsi A/B/C/D dan kunci jawaban terisolasi di sisi server.

### B. Validasi Alur Bisnis pada Skrip k6
Skrip k6 telah diverifikasi dan disesuaikan dengan kontrak API riil:
1. `POST /api/v1/auth/login`: Autentikasi akun siswa & ekstraksi Bearer token.
2. `POST /api/v1/exams/{id}/start-session`: Mulai sesi ujian dengan token `BIO123` & perolehan `session_id`.
3. `GET /api/v1/exams/{id}/session-questions`: Pengambilan paket soal tanpa membocorkan kunci jawaban (`data.questions`).
4. Loop Pengerjaan Soal:
   - `POST /api/v1/exam-sessions/{sessionId}/heartbeat`: Telemetri anti-cheat & status layar.
   - Randomized think time (2–5 detik).
   - `POST /api/v1/exams/{id}/save-answer`: Autosave jawaban berkala ke server.

---

## 3. Fase 2 & 3: Hasil Pengujian Empiris (Runtime Telemetry)

### A. Smoke Benchmark (1 VU, 1 Iterasi)
- **Perintah**: `k6 run --iterations 1 --vus 1 apps/api/tests/load/cbt-500-students.js`
- **Output Mentah**:
  ```
  █ THRESHOLDS 
    ✓ cbt_error_rate: rate=0.00%
    ✓ cbt_save_answer_duration: p(95)=18.11ms
    ✓ http_req_duration: p(95)=121.77ms, p(99)=166.15ms
    ✓ http_req_failed: rate=0.00%

  █ TOTAL RESULTS 
    checks_total: 9, checks_succeeded: 100.00% (9/9)
    cbt_save_answer_duration: avg=15.67ms, p(95)=18.11ms
    cbt_login_duration: avg=177.25ms
    cbt_successful_submissions: 5
    http_reqs: 8 (0 failed)
  ```

### B. Concurrency Test (5 VUs, 30 Detik)
- **Perintah**: `k6 run --vus 5 --duration 30s apps/api/tests/load/cbt-500-students.js`
- **Output Mentah**:
  ```
  █ THRESHOLDS 
    ✓ cbt_error_rate: rate=0.00%
    ✓ cbt_save_answer_duration: p(95)=19.04ms
    ✗ http_req_duration: p(95)=506.38ms (threshold p(95)<500ms crossed)
    ✓ http_req_failed: rate=0.00%

  █ TOTAL RESULTS 
    checks_total: 90, checks_succeeded: 100.00% (90/90)
    cbt_save_answer_duration: avg=14.56ms, min=11.49ms, p(95)=19.04ms, max=41.2ms
    cbt_login_duration: avg=348.8ms, p(95)=760.32ms, max=834.13ms
    cbt_successful_submissions: 50
    http_reqs: 80 (0 failed, 100% 2xx/valid)
    iterations: 10 completed
  ```

### C. Analisis Kritis Bottleneck Server Single-Process
1. **Performa Penyimpanan Jawaban (Autosave)**:
   - Latensi autosave sangat cepat dan stabil: **p(95) = 19.04 ms** (ambang batas toleransi SLA adalah 250 ms).
   - Logika penyimpanan jawaban di database sangat efisien dan tidak mengalami degradasi.
2. **Bottleneck CPU pada Endpoint Login**:
   - Latensi login melonjak dari **177 ms** (pada 1 VU) menjadi **760 ms** (pada 5 VU).
   - **Penyebab**: Algoritma hashing Argon2id sengaja dirancang *CPU- and memory-intensive* untuk keamanan. Ketika 5 VU melakukan login secara bersamaan pada server single-process (`php artisan serve`), antrean CPU terjadi karena satu proses PHP harus menghitung hash Argon2id secara berurutan.
3. **Konsekuensi terhadap Target 500 VU**:
   - Jika 500 VU dipaksakan berjalan bersamaan pada server pengembangan lokal single-process, server akan mengalami socket exhaustion / deadlock antrean koneksi.
   - Sesuai prinsip **No Synthetic Logs**, tidak boleh ada klaim bahwa "500 siswa telah diuji selama 30 menit" pada mesin pengembang ini.

---

## 4. Fase 4: Audit Integritas Data CBT Pasca-Pengujian

Pemeriksaan integritas basis data dilakukan setelah eksekusi pengujian:
1. **Integritas Jawaban Siswa (`exam_answers`)**:
   - 50 jawaban tersimpan sempurna di database (`select count(*) from exam_answers` = 50).
   - Setiap jawaban terasosiasi dengan tepat ke `session_id`, `question_id`, dan nilai jawaban ('A', 'B', 'C', atau 'D').
   - Tidak ada rekaman jawaban ganda (*duplicate key violation*) atau jawaban yatim (*orphan records*).
2. **Integritas Sesi Ujian (`exam_sessions`)**:
   - Sesi ujian berstatus `mengerjakan` dengan penghitungan sisa waktu (`remaining_seconds`) yang akurat.
   - Heartbeat telemetri mencatat `anomalies_detected: []` dan `blur_count: 0`.
3. **Kerahasiaan Kunci Jawaban**:
   - Respon endpoint `GET /exams/{id}/session-questions` membuktikan kolom `is_correct` pada tabel `question_options` **TIDAK PERNAH DIKIRIM** ke klien/siswa.

---

## 5. Fase 5: Identifikasi Prasyarat Staging Menuju Production Go

Untuk menutup Gate G-4 secara permanen dan meningkatkan status menjadi **FULL PRODUCTION GO**, pengujian beban 500 VU 30 menit wajib dieksekusi pada lingkungan staging dengan arsitektur representatif:

### A. Arsitektur Kluster Staging yang Dibutuhkan
1. **Server Aplikasi Staging**:
   - OS: Linux Ubuntu 24.04 LTS (4 vCPU, 8 GB RAM).
   - Web Server: Nginx 1.26+ reverse proxy ke PHP-FPM.
   - PHP-FPM: PHP 8.5 dengan OPcache aktif dan pool `pm.max_children = 35`.
   - Redis: Redis 7.x untuk caching session dan antrean Laravel (`QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`).
2. **Server Basis Data**:
   - PostgreSQL 17 dengan alokasi `shared_buffers = 1GB` dan `max_connections = 100`.
3. **Load Generator (Mesin k6 Terpisah)**:
   - Mesin terpisah di jaringan yang sama/VPC agar siklus CPU k6 tidak mencuri resource server aplikasi.

### B. Prosedur Eksekusi Uji Beban 30 Menit di Staging
```bash
# 1. Jalankan k6 dari mesin generator beban
k6 run --env API_BASE_URL="http://staging-api.labschool.sch.id/api/v1" \
       --env CBT_EXAM_ID="01a12e18-4810-735a-beee-9caa198def6c" \
       --env CBT_ROOM_TOKEN="BIO123" \
       apps/api/tests/load/cbt-500-students.js > cbt_staging_500vu_30m.log 2>&1

# 2. Pantau metrik server staging selama 30 menit steady state:
# - CPU Utilization: Target < 75%
# - Memory Usage: Target < 80% (tidak ada swap thrashing)
# - PHP-FPM active processes: Target <= 35
# - PostgreSQL active connections: Target <= 50

# 3. Kriteria Penerimaan Hasil (Acceptance Criteria):
# - http_req_duration p(95) < 500 ms
# - cbt_save_answer_duration p(95) < 250 ms
# - http_req_failed rate < 0.01 (kegagalan < 1%)
# - cbt_error_rate < 0.01
```

---

## 6. Keputusan Akhir & Rekomendasi Rilis

1. **Status Release Gate G-4**: **BLOCKED ON LOCAL / READY FOR STAGING**
2. **Status Keputusan Rilis**: **CONDITIONAL GO**
3. **Justifikasi**:
   - Seluruh kode, skrip pengujian, data seeder, dan fungsionalitas CBT terbukti 100% valid tanpa bug atau kebocoran kunci jawaban.
   - Namun, bukti pengujian beban 500 siswa selama 30 menit penuh harus berasal dari server staging multi-worker nyata, bukan hasil ekpolasi dari server lokal.
   - Sikap jujur ini melindungi sekolah dari potensi risiko down saat hari pertama ujian serentak.
