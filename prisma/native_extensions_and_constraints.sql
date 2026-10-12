-- ==============================================================================
-- SISTLABUM: Native PostgreSQL Extensions, Custom Constraints & Specialized Indexes
-- File: prisma/native_extensions_and_constraints.sql
-- Digunakan setelah migrasi dasar Prisma untuk aturan bisnis tingkat database (PostgreSQL 16)
-- Sesuai dengan: 08_DATABASE_SCHEMA.md & 12_ERD.md
-- ==============================================================================

-- 1. Ekstensi Wajib
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Wajib untuk GiST exclusion constraint booking
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Wajib untuk pencarian teks cepat (fuzzy/trigram)

-- 2. Anti Tumpang Tindih Reservasi Fasilitas (Exclusion Constraint GiST)
-- Menjamin secara fisik di level engine database bahwa tidak ada 2 booking yang disetujui
-- pada fasilitas yang sama dalam rentang waktu yang saling beririsan.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_approved_bookings'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT no_overlapping_approved_bookings
    EXCLUDE USING gist (
      facility_id WITH =,
      tstzrange(start_at, end_at) WITH &&
    )
    WHERE (status = 'disetujui');
  END IF;
END $$;

-- 3. Partial Unique Indexes untuk Integritas Status Aktif Tunggal

-- 3.1 Hanya 1 Tahun Ajaran yang boleh aktif per sekolah
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_academic_year
ON academic_years (school_id)
WHERE is_active = true AND deleted_at IS NULL;

-- 3.2 Hanya 1 Semester yang boleh aktif per tahun ajaran
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_semester
ON semesters (academic_year_id)
WHERE is_active = true AND deleted_at IS NULL;

-- 3.3 Hanya 1 Gelombang PPDB aktif pada saat bersamaan
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_ppdb_wave
ON ppdb_waves (school_id)
WHERE status = 'aktif';

-- 3.4 Hanya 1 Sesi CBT Aktif per Siswa (Mencegah Login/Pengerjaan Ganda Serentak)
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_active_cbt_session
ON exam_sessions (exam_id, student_id)
WHERE status IN ('belum', 'mengerjakan');

-- 3.5 Hanya 1 Presensi Gerbang Harian per Siswa per Tanggal
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_gate_attendance_per_day
ON attendances (student_id, att_date)
WHERE source = 'gerbang';

-- 4. Indeks Trigram untuk Pencarian Cepat (ILIKE / Trigram Search)
CREATE INDEX IF NOT EXISTS idx_trgm_students_name ON students USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_teachers_name ON teachers USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_posts_title ON posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_books_title ON library_books USING gin (title gin_trgm_ops);
