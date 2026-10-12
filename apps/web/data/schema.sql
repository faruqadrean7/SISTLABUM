-- Schema SQLite untuk Prototype Portal SISTLABUM
-- SMP Laboratorium (P2LP Universitas Negeri Malang)

DROP TABLE IF EXISTS report_card_summaries;
DROP TABLE IF EXISTS class_duty_schedules;
DROP TABLE IF EXISTS class_organization;
DROP TABLE IF EXISTS learning_modules;
DROP TABLE IF EXISTS library_loans;
DROP TABLE IF EXISTS library_books;
DROP TABLE IF EXISTS ppdb_applicants;
DROP TABLE IF EXISTS exam_sessions;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS student_guardians;
DROP TABLE IF EXISTS guardians;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS school_profile;

CREATE TABLE school_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    npsn TEXT NOT NULL,
    accreditation TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    principal_name TEXT NOT NULL,
    active_semester TEXT NOT NULL
);

CREATE TABLE academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    semester TEXT NOT NULL,
    is_active INTEGER DEFAULT 0
);

CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    homeroom_teacher TEXT NOT NULL,
    room_number TEXT NOT NULL,
    student_count INTEGER DEFAULT 0
);

CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    kkm INTEGER DEFAULT 75
);

CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    schedule_info TEXT DEFAULT 'Senin & Rabu 07.30 - 09.00 WIB'
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nis TEXT NOT NULL UNIQUE,
    nisn TEXT NOT NULL UNIQUE,
    nik TEXT DEFAULT '3573012304110001',
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birth_place TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    religion TEXT DEFAULT 'Islam',
    address TEXT DEFAULT 'Jl. Sigura-gura No. 24, Lowokwaru, Malang',
    phone TEXT DEFAULT '081234567890',
    email TEXT DEFAULT 'fauzan@smplab-um.sch.id',
    blood_type TEXT DEFAULT 'O',
    class_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktif',
    points_reward INTEGER DEFAULT 35,
    points_violation INTEGER DEFAULT 0,
    avatar_color TEXT NOT NULL,
    academic_year TEXT DEFAULT '2026/2027',
    semester TEXT DEFAULT 'Ganjil',
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

CREATE TABLE guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nik TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    address TEXT NOT NULL
);

CREATE TABLE student_guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guardian_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    relationship TEXT NOT NULL,
    FOREIGN KEY(guardian_id) REFERENCES guardians(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    gate_in_time TEXT,
    gate_out_time TEXT,
    classroom_status TEXT NOT NULL DEFAULT 'Hadir',
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'Sakit' atau 'Izin'
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    attachment_name TEXT,
    status TEXT NOT NULL DEFAULT 'Menunggu Verifikasi', -- 'Menunggu Verifikasi', 'Disetujui', 'Ditolak'
    created_at TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(guardian_id) REFERENCES guardians(id)
);

CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT NOT NULL,
    file_attachment TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    submitted_at TEXT NOT NULL,
    file_name TEXT NOT NULL,
    score INTEGER,
    feedback TEXT,
    status TEXT NOT NULL DEFAULT 'Telah Dikumpulkan',
    FOREIGN KEY(assignment_id) REFERENCES assignments(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'UH', -- 'UH' (Ulangan Harian), 'UB' (Ulangan Bulanan), 'UTS' (Tengah Semester / ASTS), 'UAS' (Akhir Semester / ASAS)
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    teacher_name TEXT NOT NULL DEFAULT 'Guru Pengampu',
    duration_minutes INTEGER NOT NULL,
    token TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    scheduled_date TEXT,
    scheduled_time TEXT,
    passing_grade INTEGER DEFAULT 75,
    status TEXT NOT NULL DEFAULT 'Aktif', -- 'Terjadwal', 'Aktif', 'Selesai'
    score_achieved REAL DEFAULT NULL,
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

CREATE TABLE exam_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'single_choice', 'multi_choice', 'true_false', 'matching', 'short_answer', 'essay'
    question_text TEXT NOT NULL,
    options_json TEXT NOT NULL, -- JSON format options / matrix
    correct_answer TEXT,
    points INTEGER DEFAULT 10,
    FOREIGN KEY(exam_id) REFERENCES exams(id)
);

CREATE TABLE exam_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    finish_time TEXT,
    answers_json TEXT NOT NULL DEFAULT '{}',
    doubt_json TEXT NOT NULL DEFAULT '[]',
    violation_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'In Progress', -- 'In Progress', 'Submitted'
    score REAL DEFAULT 0,
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    semester TEXT NOT NULL,
    score_tasks INTEGER NOT NULL,
    score_uh INTEGER NOT NULL,
    score_pts INTEGER NOT NULL,
    score_pas INTEGER NOT NULL,
    final_score INTEGER NOT NULL,
    predicate TEXT NOT NULL,
    character_notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    tag TEXT NOT NULL,
    is_public INTEGER DEFAULT 1
);

CREATE TABLE ppdb_applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT NOT NULL UNIQUE,
    nisn TEXT NOT NULL,
    nama TEXT NOT NULL,
    gender TEXT NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir TEXT NOT NULL,
    asal_sekolah TEXT NOT NULL,
    program TEXT NOT NULL,
    nama_ayah TEXT,
    nama_ibu TEXT,
    wa TEXT NOT NULL,
    alamat TEXT NOT NULL,
    nilai_rapor REAL DEFAULT 0,
    prestasi TEXT,
    catatan TEXT,
    status TEXT NOT NULL DEFAULT 'TERVERIFIKASI (LOLOS SELEKSI BERKAS)',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 1. Perpustakaan Digital & e-Book
CREATE TABLE library_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL,
    cover_emoji TEXT DEFAULT '📖',
    file_pdf_url TEXT,
    file_size TEXT,
    total_pages INTEGER DEFAULT 120,
    available_copies INTEGER DEFAULT 10
);

CREATE TABLE library_loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    borrow_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'Dipinjam', -- 'Dipinjam', 'Selesai', 'Terlambat'
    FOREIGN KEY(book_id) REFERENCES library_books(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
);

-- 2. Modul Pelajaran Mandiri (Unduh Buku / Bahan Ajar PDF dari Guru)
CREATE TABLE learning_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    chapter TEXT NOT NULL,
    description TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(teacher_id) REFERENCES teachers(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

-- 3. Struktur Organisasi Kelas
CREATE TABLE class_organization (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    role_name TEXT NOT NULL,
    role_category TEXT NOT NULL, -- 'Inti', 'Seksi'
    student_name TEXT NOT NULL,
    student_nis TEXT,
    contact TEXT,
    avatar_color TEXT DEFAULT '#0A3D62',
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

-- 4. Jadwal Piket Kelas
CREATE TABLE class_duty_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    day_name TEXT NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    member_names_json TEXT NOT NULL, -- JSON array nama siswa piket
    task_notes TEXT NOT NULL,
    FOREIGN KEY(class_id) REFERENCES classes(id)
);

-- 5. Rekap Komprehensif E-Rapor
CREATE TABLE report_card_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    total_score REAL NOT NULL,
    average_score REAL NOT NULL,
    class_rank INTEGER NOT NULL,
    total_students INTEGER NOT NULL,
    attendance_sakit INTEGER DEFAULT 1,
    attendance_izin INTEGER DEFAULT 0,
    attendance_alpa INTEGER DEFAULT 0,
    homeroom_notes TEXT NOT NULL,
    extracurricular_json TEXT NOT NULL,
    character_predicate TEXT DEFAULT 'A (Sangat Baik)',
    FOREIGN KEY(student_id) REFERENCES students(id)
);
