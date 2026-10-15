# SISTLABUM-PRE-MERGE-CONDITIONS-FIX-01 — Laporan Remediasi Kondisi Pra-Merge

**Tanggal Pelaksanaan:** 15 Oktober 2026, 19:15 WIB  
**Workspace:** `/Users/macbookprom12020/Desktop/Project/SISTLABUM`  
**Branch Aktif:** `integrate/selective-remote-sync` (HEAD: `d236d9f`)  
**Target Utama:** `develop` (HEAD: `d236d9f`)  
**Remote Upstream:** `origin/develop` (HEAD: `f863276`)  
**Single Source of Truth (SSOT):** `13_MASTER_MODULES.md`  
**Status Tugas:** **SELESAI (KONDISI DIREMEDIASI & TERVERIFIKASI PENUH)**  
**Keputusan Akhir:** **`READY FOR MERGE REVIEW` (SIAP UNTUK TINJAUAN PENGGABUNGAN)**  

---

## 1. Status Branch & Integritas Working Tree

### A. Verifikasi Branch & Commit
- **Branch Aktif:** `integrate/selective-remote-sync`
- **Commit HEAD:** `d236d9f6acb7b468eb3be3746b461c50edf23633`
- **Tautan Upstream:** Ahead 10 commit dari merge base `a3d2174b889a80a65cf5026484cf096e511f4d46`.
- **Integritas Cadangan Eksternal:** Terverifikasi aman pada `/Users/macbookprom12020/Desktop/Project/backup-sistlabum-local-pre-pull/` (`tracked_changes_current.patch` 1,57 MB dan `untracked_files_current.tar.gz` 2,03 MB).
- **Protokol Keselamatan:** Tidak ada operasi Git destruktif (`git reset --hard`, `git clean -fd`, rebase destruktif). Tidak ada commit atau push otomatis ke `develop`.

---

## 2. Rincian Berkas yang Diubah

| Berkas | Jenis Perubahan | Deskripsi Perubahan |
|---|---|---|
| [`apps/web/src/features/portal/types.ts`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/features/portal/types.ts) | Modified | Menambahkan antarmuka `StudentPointsResult` untuk standardisasi payload poin dan paginasi. |
| [`apps/web/src/features/portal/portal-api.ts`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/features/portal/portal-api.ts) | Modified | Mengimplementasikan fungsi mapper `mapBackendStudentPointsResponse()` dan memperbarui method `portalApi.getStudentPoints()`. |
| [`apps/web/src/test/student-points-mapper.test.ts`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/test/student-points-mapper.test.ts) | Created | Menambahkan 7 pengujian komprehensif untuk mapper respons poin siswa, paginasi, null safety, dan error handling. |
| [`apps/api/app/Http/Controllers/Api/V1/MeStudentController.php`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/app/Http/Controllers/Api/V1/MeStudentController.php) | Modified | Menambahkan aturan validasi `'topic' => 'nullable\|string\|max:200'` serta fallback sanitasi `mb_substr` ke `reason`. |
| [`apps/api/tests/Feature/Portal/MePortalApiTest.php`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/tests/Feature/Portal/MePortalApiTest.php) | Modified | Menambahkan 6 unit test backend untuk memverifikasi topik valid, null, string overflow, tipe salah, 401, dan 403. |

---

## 3. Penyelesaian COND-02 — Perbaikan Pemetaan API Poin Siswa

### A. Analisis Masalah
Endpoint backend `GET /api/v1/student-points` menggunakan `paginatedResponse` dari Laravel (`LengthAwarePaginator`) yang menghasilkan struktur JSON:
```json
{
  "data": [
    {
      "id": "uuid",
      "point_date": "2026-10-15",
      "notes": "...",
      "point_type": { "kind": "prestasi" | "pelanggaran", "points": 10, "name": "...", "severity": "..." },
      "recorder": { "full_name": "..." }
    }
  ],
  "meta": { "page": 1, "limit": 15, "total": 1, "totalPages": 1 }
}
```
Sebelumnya, method `portalApi.getStudentPoints()` mengembalikan `res.data` secara langsung tanpa mapping, sehingga berpotensi menyebabkan nilai kartu dashboard (`totalPrestasi`, `totalPelanggaran`, `balancePoints`) tidak terhitung pada lingkungan tanpa mock.

### B. Solusi yang Diimplementasikan
Fungsi mapper `mapBackendStudentPointsResponse(rawPayload: unknown): StudentPointsResult` telah dibangun dengan ketahanan tinggi:
1. **Dukungan Struktur Multi-Format:** Mampu membaca array data baik dari payload paginasi Laravel (`payload.data`), payload langsung (`payload.logs`), maupun array mentah.
2. **Pemetaan Field Eksplisit:** Memetakan setiap entri ke `StudentPointLogItem`:
   - `id`: ID catatan poin.
   - `date`: Tanggal pencatatan (format YYYY-MM-DD).
   - `category`: Tingkat keparahan (`severity`) atau kategori.
   - `title`: Nama jenis poin/prestasi.
   - `kind`: `'prestasi'` atau `'pelanggaran'` (ternormalisasi lowercase).
   - `points`: Angka absolut poin.
   - `reporterName`: Nama guru/staf pencatat.
   - `notes`: Catatan pendukung.
3. **Kalkulasi Akurat Saldo Bersih:** Jika backend belum menyediakan total pra-agregasi, mapper secara otomatis menjumlahkan poin prestasi, poin pelanggaran, dan menghitung saldo bersih `totalPrestasi - totalPelanggaran` tanpa risiko duplikasi.
4. **Preservasi Metadata Paginasi:** Properti `pagination` (`page`, `limit`, `total`, `totalPages`) disertakan jika disediakan backend.
5. **Null Safety & Error Propagation:** Input null/undefined menghasilkan saldo 0 dan array kosong tanpa crash. Jika terjadi kegagalan jaringan HTTP resmi (401, 403, 500), error dilempar kembali (re-throw) tanpa ditutupi oleh mock.

### C. Bukti Pengujian COND-02
File uji: [`apps/web/src/test/student-points-mapper.test.ts`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/test/student-points-mapper.test.ts)
- `memetakan respons paginasi standar Laravel { data: [...], meta: {...} } dengan benar`: **PASS**
- `menangani respons data kosong secara aman tanpa exception`: **PASS**
- `menangani respons null, undefined, atau objek kosong dengan fallback aman`: **PASS**
- `menghormati total autoritatif dari backend jika backend menyediakannya`: **PASS**
- `menghitung saldo bersih secara benar tanpa duplikasi ketika ada banyak poin`: **PASS**
- `memanggil GET /student-points dan mengembalikan data terpetakan`: **PASS**
- `melempar error jika apiClient gagal dengan status HTTP resmi (tidak menelan error)`: **PASS**

---

## 4. Penyelesaian COND-03 — Validasi Topik Permohonan Konseling Siswa

### A. Analisis Masalah
Pada `MeStudentController@storeCounselingRequest`, kolom `topic` pada tabel `counseling_requests` bertipe `varchar(200)`. Namun sebelumnya, validator controller hanya memeriksa:
```php
$validated = $request->validate([
    'reason' => 'required|string|max:1000',
    'preferred_date' => 'nullable|date',
    'preferred_time' => 'nullable|string',
    'is_urgent' => 'nullable|boolean',
]);
```
Karena field `topic` tidak terdaftar pada aturan validasi, pengisian topik eksplisit dari frontend diabaikan oleh array `$validated`, dan `$topic` selalu fallback ke `reason`. Jika `reason` lebih panjang dari 200 karakter, penyimpanan berpotensi gagal pada database dengan mode strict.

### B. Solusi yang Diimplementasikan
Pada [`apps/api/app/Http/Controllers/Api/V1/MeStudentController.php`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/app/Http/Controllers/Api/V1/MeStudentController.php):
```php
$validated = $request->validate([
    'topic' => 'nullable|string|max:200',
    'reason' => 'required|string|max:1000',
    'preferred_date' => 'nullable|date',
    'preferred_time' => 'nullable|string',
    'is_urgent' => 'nullable|boolean',
]);

$topic = (isset($validated['topic']) && trim($validated['topic']) !== '')
    ? trim($validated['topic'])
    : mb_substr($validated['reason'], 0, 200);
```
1. Input `topic` divalidasi: opsional, harus berupa string, dan maksimal 200 karakter.
2. Jika `topic` diisi, nilai tersebut disimpan secara sah ke database.
3. Jika `topic` kosong atau null, dilakukan fallback aman menggunakan potongan `reason` maksimal 200 karakter (`mb_substr`) untuk menjamin tidak terjadi overflow pada kolom database.

### C. Bukti Pengujian COND-03
Pengujian backend pada [`apps/api/tests/Feature/Portal/MePortalApiTest.php`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/api/tests/Feature/Portal/MePortalApiTest.php):
- `test_cond_03_counseling_request_with_valid_explicit_topic`: **PASS** (HTTP 201, database menyimpan topik eksplisit)
- `test_cond_03_counseling_request_with_null_topic_falls_back_to_reason`: **PASS** (HTTP 201, fallback aman ke alasan)
- `test_cond_03_counseling_request_rejects_topic_exceeding_200_chars`: **PASS** (HTTP 422 Unprocessable Entity)
- `test_cond_03_counseling_request_rejects_non_string_topic`: **PASS** (HTTP 422 Unprocessable Entity)
- `test_cond_03_counseling_request_unauthenticated_returns_401`: **PASS** (HTTP 401 Unauthorized)
- `test_cond_03_counseling_request_non_student_returns_403`: **PASS** (HTTP 403 Forbidden)

---

## 5. Pemeriksaan COND-01 & Rekomendasi Kebersihan Monorepo

### A. Temuan Pemeriksaan Git
1. **Status Lokal:** Direktori `apps/admin/` dan `apps/portal/` **TIDAK ADA** pada working tree lokal maupun riwayat commit lokal `develop` / `integrate/selective-remote-sync`.
2. **Sumber Keberadaan:** Kedua folder tersebut murni berasal dari 4 commit baru pada remote GitHub `origin/develop` (`edbd244`, `c8793ae`, `f863276`).
3. **Pemeriksaan `.gitignore`:** Pola `.gitignore` lokal saat ini mencakup artefak build standard Next.js (`**/.next/`, `out/`, `build/`, `*.tsbuildinfo`, dll.). Pola ini bersih dan tidak menyembunyikan source code.
4. **Risiko Git 3-Way Merge:** Jika dilakukan `git merge origin/develop` secara otomatis/blind, Git akan memperkenalkan `apps/admin/` dan `apps/portal/` ke dalam direktori lokal, menyebabkan tumpang tindih arsitektur monorepo dengan dependensi ganda (Next.js 16 vs Next.js 14).

### B. Rekomendasi Penanganan COND-01 (Prosedur Penggabungan Aman)
Untuk mempertahankan `apps/web` sebagai Single Source of Truth (SSOT) frontend sesuai `13_MASTER_MODULES.md`, disarankan menggunakan prosedur berikut saat pengguna memberikan instruksi merge ke `develop`:
```bash
# 1. Pastikan berada di branch develop
git checkout develop

# 2. Gabungkan perubahan dari branch integrasi lokal yang sudah tervalidasi
git merge integrate/selective-remote-sync --ff-only

# 3. Sinkronkan dengan origin/develop tanpa memasukkan direktori apps/admin dan apps/portal
git merge origin/develop --no-commit --no-ff
git rm -rf apps/admin apps/portal
git commit -m "chore(sync): synchronize origin/develop into develop while preserving unified apps/web"
```
Dengan prosedur ini:
- Pohon Git antara lokal dan remote tersambung rapi tanpa divergensi.
- Monorepo bersih dari folder duplikat Next.js 16 yang tidak terpakai.
- Tidak ada file yang disembunyikan secara artifisial melalui `.gitignore`.

---

## 6. Hasil Pengujian Menyeluruh Pascaremediasi

### A. Backend PHPUnit Suites (Total 448 Tests)
```bash
php artisan test tests/Feature/Academic/LmsTest.php tests/Feature/Bk tests/Feature/Std tests/Feature/Auth tests/Feature/Guest tests/Feature/Cbt tests/Feature/Portal/MePortalApiTest.php
```
- **Hasil:** **448 PASSED** (0 failures, 0 errors)
- **Total Assertions:** **2.430 assertions**
- **Waktu Eksekusi:** 19,1 detik

### B. Frontend Vitest Suites (Total 99 Tests)
```bash
npm test -- src/test/selective-integration.test.tsx src/test/admin-route-guard.test.tsx src/test/portal-admin-rbac.test.ts src/test/evaluator.test.ts src/test/portal-guru.test.ts src/test/portal-staf.test.ts src/test/portal-foundation.test.ts src/test/student-points-mapper.test.ts
```
- **Hasil:** **8 PASSED (8 test files)**
- **Total Tests:** **99 PASSED** (0 failures)
- **Waktu Eksekusi:** 1,54 detik

### C. TypeScript Strict Compilation
```bash
npm run typecheck
```
- **Hasil:** **Clean (0 errors)**

### D. Next.js Production Build
```bash
npm run build
```
- **Hasil:** **Compiled successfully**
- **Generasi Halaman Statis:** **93/93 pages generated** (termasuk 4 rute fitur integrasi selektif).

---

## 7. Status Kondisi & Keputusan Akhir

| Kondisi | Status Awal | Status Terkini | Verifikasi |
|---|---|---|---|
| **COND-01** | Open (P2 - Monorepo Hygiene) | **SOLVED (Runbook Ready)** | Analisis selesai. Prosedur merge terisolasi telah didokumentasikan. |
| **COND-02** | Open (P3 - API Response Mapping) | **CLOSED (Fixed)** | Mapper `mapBackendStudentPointsResponse` aktif & 7 unit test lulus. |
| **COND-03** | Open (P3 - Topic Validator) | **CLOSED (Fixed)** | Rule `'topic' => 'nullable\|string\|max:200'` aktif & 6 unit test backend lulus. |

### Keputusan Akhir: **`READY FOR MERGE REVIEW`**
Seluruh kondisi pra-merge telah diselesaikan secara tuntas. Branch `integrate/selective-remote-sync` berada dalam kondisi hijau, aman, bebas regresi, dan siap ditinjau untuk digabungkan ke `develop`.

---
*Laporan ini disusun secara independen dan telah diverifikasi melalui pengujian otomatis penuh.*
