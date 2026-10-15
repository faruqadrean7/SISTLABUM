# LAPORAN IMPLEMENTASI & PERBAIKAN AUDIT: LANGKAH 1 (PUBLIC-STEP-1 & 1.1)
## FONDASI DESAIN, DESIGN SYSTEM, & PUBLIC SHELL SMP LABORATORIUM UM

**Tanggal Pembaruan:** 15 Oktober 2026  
**Status:** Selesai & Terverifikasi (Siap untuk Ditinjau Sebelum Melangkah ke Langkah 2)  
**Lingkup Kerja:** Langkah 1 (Fondasi Tokens, Typography, Header, Drawer Modal, Footer, Landmark, Layout Publik, dan Unit Tests) + Langkah 1.1 (Perbaikan Temuan Audit)  
**Baseline Git Branch:** `develop`

---

## 1. Ringkasan Eksekutif

Langkah 1 dan 1.1 berfokus pada pembangunan fondasi desain dan kerangka antarmuka website publik resmi SMP Laboratorium UM di dalam monorepo SISTLABUM (`apps/web`). Shell publik ini dirancang agar menyatu secara konsisten dengan identitas visual sekolah (Navy Deep, UM Gold, Fresh Green) dan menjadi kerangka bersama untuk seluruh halaman publik mendatang (Profil, Akademik, Berita, Galeri, Kontak) serta halaman PPDB.

Setelah audit independen, seluruh temuan teknis pada siklus **PUBLIC-STEP-1.1** telah diselesaikan secara tuntas:
- **Mobile Drawer Modal Accessibility**: Drawer kini menggunakan conditional rendering (`isMobileMenuOpen && ...`). Saat tertutup, elemen dialog dan seluruh tautan di dalamnya tidak ada di DOM, menjamin 0% risiko kebocoran fokus keyboard atau pembaca layar. Saat terbuka, modal menyajikan semantik lengkap (`role="dialog"`, `aria-modal="true"`), fokus awal ke tombol tutup, trap `Tab`/`Shift+Tab`, penutupan via `Escape`/backdrop, pengembalian fokus ke tombol hamburger, dan penguncian/pemulihan scroll body.
- **Pembersihan `PublicAuthNav`**: Menghapus blok `try/catch` dan komentar penonaktifan linter `react-hooks/rules-of-hooks`. Pemanggilan `useAuth()` kini berjalan murni dan standar tanpa menyembunyikan galat otentikasi.
- **Penyelesaian Duplikasi Landmark Header & Footer**:
  - Halaman `/` (`app/(public)/page.tsx`): Menghapus tag `<header>` dan `<footer>` bawaan lama sehingga menyatu bersih dengan `PublicHeader` dan `PublicFooter`.
  - Halaman `/ppdb` (`app/(public)/ppdb/page.tsx`): Mengonversi header internal lama menjadi `<nav aria-label="Navigasi Halaman PPDB">` dan menghapus footer duplikat bawaan. Seluruh tautan seksi dan alur pendaftaran SPMB tetap 100% utuh.
  - Halaman `/ppdb/dashboard` (`app/(public)/ppdb/dashboard/page.tsx`): Mengonversi header internal menjadi `<nav aria-label="Bilah Aksi Dashboard Pendaftar">`, mempertahankan tombol aksi dan alur verifikasi berkas tanpa memicu duplikasi landmark banner.
- **Pembersihan Linter**: Warning `@next/next/no-img-element` pada berkas uji `public-shell.test.tsx` diselesaikan dengan komentar baris uji yang tepat. Seluruh kode shell publik dan modul terkait kini 100% bebas dari warning baru.
- **Verifikasi Pengujian & Build**: Seluruh test suite (642 tests di 53 test files) lulus 100%, typecheck clean (0 error), dan Next.js production build berhasil menghasilkan seluruh 85 rute statis/dinamis.

---

## 2. Baseline & Delta (Sebelum vs Sesudah Perbaikan 1.1)

| Parameter | Baseline Awal | Sesudah Langkah 1 | Sesudah Perbaikan 1.1 | Catatan |
|---|---|---|---|---|
| **Rute Shell Publik** | Terpisah / legacy | Terpadu di `PublicLayout` | Terpadu & Terharmonisasi | Tanpa tumpang tindih navigasi |
| **Drawer Mobile Saat Tertutup** | N/A | Masih ada di DOM (`translate-x-full`) | **Tidak ada di DOM** (Conditional) | Bebas kebocoran fokus keyboard & screen reader |
| **Landmark `<header>` pada Rute Publik** | Inkonsisten | Duplikat di `/`, `/ppdb`, `/ppdb/dashboard` | **Tepat 1 Banner per Halaman** | Sub-navigasi diubah ke `<nav aria-label="...">` |
| **Landmark `<footer>` pada Rute Publik** | Inkonsisten | Duplikat di `/` dan `/ppdb` | **Tepat 1 Contentinfo per Halaman** | `PublicFooter` menjadi satu-satunya footer |
| **Hook `PublicAuthNav`** | N/A | Menggunakan `try/catch` + linter disable | **Standar Murni** (`useAuth()`) | Sesuai kaidah React Hooks |
| **Vitest Tests** | 52 files, 622 tests | 53 files, 641 tests | **53 files, 642 tests** | +1 test isolasi drawer tertutup |
| **TypeScript Strict (`tsc`)** | 0 errors | 0 errors | **0 errors** | Bersih |
| **Linting Shell Publik** | 0 errors | 1 warning di test file | **0 errors, 0 new warnings** | Warning mock img tuntas |
| **Next.js Production Build** | 85 static pages | 85 static pages | **85 static pages (100% Success)** | Kompilasi bersih |

---

## 3. Komponen & Berkas yang Diperbarui pada Siklus 1.1

1. [`apps/web/src/components/shell/public/PublicHeader.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/components/shell/public/PublicHeader.tsx):
   - Menerapkan conditional rendering `{isMobileMenuOpen && ( ... )}` pada backdrop dan drawer dialog.
   - Menghapus potensi paparan elemen offscreen ke screen reader saat navigasi mobile ditutup.
2. [`apps/web/src/components/shell/public/PublicAuthNav.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/components/shell/public/PublicAuthNav.tsx):
   - Menghapus blok `try/catch` dan `// eslint-disable-next-line react-hooks/rules-of-hooks`.
   - Menggunakan pemanggilan hook langsung `const { user, isAuthenticated, isLoading } = useAuth();`.
3. [`apps/web/src/app/(public)/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/(public)/page.tsx):
   - Menghapus header minimalis lama dan footer lama; halaman kini merender `<main>` langsung.
4. [`apps/web/src/app/(public)/ppdb/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/(public)/ppdb/page.tsx):
   - Mengganti tag `<header>` internal menjadi `<nav aria-label="Navigasi Halaman PPDB">`.
   - Menghapus footer duplikat bawaan di bagian bawah halaman.
5. [`apps/web/src/app/(public)/ppdb/dashboard/page.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/app/(public)/ppdb/dashboard/page.tsx):
   - Mengganti tag `<header>` topbar internal menjadi `<nav aria-label="Bilah Aksi Dashboard Pendaftar">`.
6. [`apps/web/src/test/public-shell.test.tsx`](file:///Users/macbookprom12020/Desktop/Project/SISTLABUM/apps/web/src/test/public-shell.test.tsx):
   - Menambahkan pengabaian aturan linter spesifik mock test `// eslint-disable-next-line @next/next/no-img-element`.
   - Menambahkan unit test baru untuk memvalidasi bahwa dialog drawer benar-benar tidak berada di dokumen saat tertutup.

---

## 4. Hasil Verifikasi Pengujian Aktual

Seluruh pengujian dijalankan dan divalidasi secara langsung:

### A. Vitest Suite (`npm run test`)
```bash
npx vitest run
```
**Hasil:**
- Test Files: **53 passed** (53 total)
- Tests: **642 passed** (642 total)
- Durasi: 7.51 detik
- Pengujian shell publik `src/test/public-shell.test.tsx`: **20/20 passed** (100% green).

### B. Validasi Tipe (`npm run typecheck`)
```bash
tsc --noEmit
```
**Hasil:**
- Exit Code: **0**
- Tanpa kesalahan kompilasi tipe di seluruh berkas.

### C. Linter (`npm run lint`)
```bash
next lint
```
**Hasil:**
- Exit Code: **0**
- Warning baru pada `public-shell.test.tsx` telah **hilang**.
- Warning tersisa hanya 7 warning bawaan lama (baseline) pada modul admin (`admin/cbt/*`, `admin/counseling/*`, `admin/student-affairs/*`) terkait `react-hooks/exhaustive-deps`. Tidak ada warning baru pada area publik.

### D. Production Build (`npm run build`)
```bash
next build
```
**Hasil:**
- Exit Code: **0**
- Berhasil menghasilkan bundle produksi untuk seluruh **85 rute** tanpa galat.

---

## 5. Audit Landmark Final (5 Rute Publik)

| Rute URL | Komponen Header | Landmark `<main>` | Komponen Footer | Status Semantik |
|---|---|:---:|---|:---:|
| **`/`** | 1 (`PublicHeader`) | 1 (`#main-content` > `<main>`) | 1 (`PublicFooter`) | **Lulus Sempurna** |
| **`/ppdb`** | 1 (`PublicHeader`) + 1 Sub-nav | 1 (`#main-content` > `<main>`) | 1 (`PublicFooter`) | **Lulus Sempurna** |
| **`/ppdb/daftar`** | 1 (`PublicHeader`) | 1 (`#main-content` > `<main>`) | 1 (`PublicFooter`) | **Lulus Sempurna** |
| **`/ppdb/masuk`** | 1 (`PublicHeader`) | 1 (`#main-content` > `<main>`) | 1 (`PublicFooter`) | **Lulus Sempurna** |
| **`/ppdb/dashboard`** | 1 (`PublicHeader`) + 1 Topbar-nav | 1 (`#main-content` > `<main>`) | 1 (`PublicFooter`) | **Lulus Sempurna** |

---

## 6. Kesiapan Menuju Langkah 2 (Konversi Beranda)

Semua dependensi fondasi publik kini berada dalam kondisi ideal:
1. Shell bersama (`PublicHeader`, `PublicFooter`, `SkipLink`, `PublicLayout`) terpasang rapi, responsif, dan bebas regresi.
2. Identitas sekolah (Nama Kepala Sekolah: *Bapak Tamyis Suliantoro, M.Pd.*, Motto: *Beradab, Kreatif, Berprestasi*, 4 Program Unggulan, Kontak Resmi Malang) telah diverifikasi sumbernya dari prototype legacy.
3. Rute beranda (`app/(public)/page.tsx`) telah bersih dan siap diisi dengan seksi-seksi beranda modern pada **Langkah 2**:
   - Hero Section dengan Video Profil & Call-to-Action PPDB.
   - Sambutan Kepala Sekolah & Profil Singkat.
   - 4 Program Akademik Unggulan (Reguler, ICP, Tahfidz, Inklusi).
   - Statistik SMP Laboratorium Dalam Angka.
   - Berita & Agenda Terkini.
   - Testimoni / Fasilitas Unggulan.
