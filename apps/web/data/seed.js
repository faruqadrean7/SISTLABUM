// Seed Script: Mengisi data dummy realistis SISTLABUM ke database.sqlite
// SMP Laboratorium (P2LP Universitas Negeri Malang)

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new DatabaseSync(dbPath);
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('Skema database berhasil dibuat.');

// 1. Profil Sekolah
db.prepare(`
    INSERT INTO school_profile (name, npsn, accreditation, address, phone, email, principal_name, active_semester)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
    'SMP Laboratorium (P2LP Universitas Negeri Malang)',
    '20533812',
    'A (Unggul)',
    'Jl. Simpang Bogor No. T-7, Sumbersari, Kec. Lowokwaru, Kota Malang, Jawa Timur',
    '(0341) 588550',
    'info@smplab-um.sch.id',
    'Bapak Tamyis Suliantoro, M.Pd.',
    '2026/2027 Ganjil'
);

// 2. Tahun Ajaran
const insertYear = db.prepare(`INSERT INTO academic_years (code, name, semester, is_active) VALUES (?, ?, ?, ?)`);
insertYear.run('20261', 'Tahun Ajaran 2026/2027', 'Ganjil', 1);
insertYear.run('20252', 'Tahun Ajaran 2025/2026', 'Genap', 0);

// 3. Kelas
const insertClass = db.prepare(`INSERT INTO classes (code, name, level, homeroom_teacher, room_number, student_count) VALUES (?, ?, ?, ?, ?, ?)`);
insertClass.run('VII-A', 'Kelas VII-A (Reguler)', 7, 'Dra. Sri Wahyuni, M.Pd.', 'R.201', 32);
insertClass.run('VII-B', 'Kelas VII-B (ICP)', 7, 'Sarah Johnson, B.Ed.', 'R.202', 30);
insertClass.run('VIII-A', 'Kelas VIII-A (Tahfidz)', 8, 'Ust. M. Ridwan, M.Pd.I.', 'R.203', 32);
insertClass.run('IX-A', 'Kelas IX-A (Unggulan Akademik)', 9, 'Ahmad Hidayat, M.Sc.', 'R.301', 32);
insertClass.run('IX-B', 'Kelas IX-B (Reguler)', 9, 'Endang Susilowati, S.Pd.', 'R.302', 32);

// 4. Mata Pelajaran
const insertSubject = db.prepare(`INSERT INTO subjects (code, name, category, kkm) VALUES (?, ?, ?, ?)`);
insertSubject.run('MAT', 'Matematika', 'Umum', 75);
insertSubject.run('INF', 'Informatika & Pemrograman', 'Peminatan', 78);
insertSubject.run('BIN', 'Bahasa Indonesia', 'Umum', 75);
insertSubject.run('BIG', 'Bahasa Inggris (Cambridge)', 'Umum', 75);
insertSubject.run('IPA', 'Ilmu Pengetahuan Alam', 'Umum', 75);
insertSubject.run('PPKN', 'Pendidikan Pancasila', 'Umum', 76);
insertSubject.run('PAI', 'Pendidikan Agama & Budi Pekerti (TaBaQu)', 'Agama', 80);

// 5. Guru & Direktori Pendidik
const insertTeacher = db.prepare(`
    INSERT INTO teachers (nip, name, title, subject, email, phone, photo_url, schedule_info)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertTeacher.run('198109202006041003', 'Ahmad Hidayat, M.Sc.', 'Wali Kelas IX-A & Ketua MGMP Matematika', 'Matematika', 'ahmad.hidayat@smplab-um.sch.id', '0812-3456-7892', '👨‍🏫', 'Senin (07.00 - 08.40) & Rabu (09.00 - 10.20)');
insertTeacher.run('198503152009041001', 'Budi Santoso, S.Kom., M.T.', 'Kepala Lab Komputer & Guru Informatika', 'Informatika & Pemrograman', 'budi.santoso@smplab-um.sch.id', '0812-3456-7891', '👨‍💻', 'Selasa (08.40 - 10.20) & Kamis (10.40 - 12.00)');
insertTeacher.run('197805122003121002', 'Dra. Sri Wahyuni, M.Pd.', 'Guru Penggerak & Dosen Pembina P2LP UM', 'Bahasa Indonesia', 'sri.wahyuni@smplab-um.sch.id', '0812-3456-7890', '👩‍🏫', 'Senin (10.40 - 12.00) & Kamis (07.00 - 08.40)');
insertTeacher.run('198902142014022003', 'Sarah Johnson, B.Ed.', 'Koordinator Native Speaker & English Club', 'Bahasa Inggris (Cambridge)', 'sarah.johnson@smplab-um.sch.id', '0813-9876-5430', '👩‍🏫', 'Selasa (10.40 - 12.00) & Jumat (07.00 - 08.20)');
insertTeacher.run('198307222008012004', 'Endang Susilowati, S.Pd.', 'Pembina KIR MIPA SMP Laboratorium', 'Ilmu Pengetahuan Alam', 'endang.s@smplab-um.sch.id', '0852-3344-5560', '👩‍🔬', 'Rabu (07.00 - 08.40) & Jumat (08.40 - 10.00)');
insertTeacher.run('197608112002121001', 'Ust. M. Ridwan, M.Pd.I.', 'Koordinator TaBaQu & Bimbingan Ummi', 'PABP & Tahfidz', 'm.ridwan@smplab-um.sch.id', '0811-2233-4455', '👳‍♂️', 'Senin (08.40 - 10.00) & Rabu (10.40 - 12.00)');
insertTeacher.run('198811042011012005', 'Dr. Nurul Hidayati, M.Pd.', 'Koordinator BK & Layanan Konseling Ramah Anak', 'Bimbingan Konseling', 'nurul.h@smplab-um.sch.id', '0812-3456-7893', '👩‍⚕️', 'Setiap Hari Kerja (Ruang Konseling Lantai 2)');

// 6. Orang Tua / Wali
const insertGuardian = db.prepare(`INSERT INTO guardians (nik, name, phone, email, occupation, address) VALUES (?, ?, ?, ?, ?, ?)`);
insertGuardian.run('3573011204750001', 'H. Suparman, S.E., M.M.', '081333444555', 'suparman.invest@gmail.com', 'Wiraswasta / Direktur Perusahaan', 'Jl. Sigura-gura No. 24, Lowokwaru, Malang');
insertGuardian.run('3573022508800002', 'Dra. Hj. Nur Laili, M.Kes.', '081222333444', 'nurlaili.dinkes@malangkota.go.id', 'PNS Dinas Kesehatan', 'Jl. Danau Toba G-4, Sawojajar, Malang');
insertGuardian.run('3573031001780003', 'Ir. Bambang Trihartanto', '081777888999', 'bambang.tri@gmail.com', 'Konsultan Konstruksi Sipil', 'Jl. Terusan Dieng No. 12, Sukun, Malang');

// 7. Siswa Kelas IX-A (Lengkap Biodata & Teman Sekelas 32 Siswa)
const insertStudent = db.prepare(`
    INSERT INTO students (nis, nisn, nik, name, gender, birth_place, birth_date, religion, address, phone, email, blood_type, class_id, status, points_reward, points_violation, avatar_color, academic_year, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Siswa Utama: Ahmad Fauzan Maulana
insertStudent.run(
    '240901', '0091234567', '3573011404110001', 'Ahmad Fauzan Maulana', 'L', 'Malang', '2011-04-14',
    'Islam', 'Jl. Sigura-gura No. 24, Lowokwaru, Kota Malang, Jawa Timur',
    '081234567890', 'fauzan@smplab-um.sch.id', 'O', 4, 'Aktif', 45, 0, '#0A3D62', '2026/2027', 'Ganjil'
);

// Roster Siswa Kelas IX-A (Total 32 Siswa Lengkap)
const class9aNames = [
    ['240902', '0091234568', 'Aditya Pratama Nugraha', 'L', 'Malang', '2011-02-10', 'B'],
    ['240903', '0091234569', 'Alya Zahra Kamila', 'P', 'Batu', '2011-05-18', 'A'],
    ['240904', '0091234570', 'Annisa Dwi Lestari', 'P', 'Malang', '2011-03-24', 'O'],
    ['240905', '0091234571', 'Bagas Satria Yudha', 'L', 'Surabaya', '2011-07-12', 'B'],
    ['240906', '0091234572', 'Bintang Ramadhan', 'L', 'Malang', '2011-08-30', 'AB'],
    ['240907', '0091234573', 'Clarissa Putri Amanda', 'P', 'Kediri', '2011-01-15', 'A'],
    ['240908', '0091234574', 'Daffa Ihsan Al-Fathir', 'L', 'Malang', '2011-09-09', 'O'],
    ['240909', '0091234575', 'Dhea Ayu Wulandari', 'P', 'Blitar', '2011-06-21', 'B'],
    ['240910', '0091234576', 'Dimas Arya Sena', 'L', 'Malang', '2011-11-03', 'O'],
    ['240911', '0091234577', 'Fadhil Muhammad Hafiz', 'L', 'Pasuruan', '2011-04-05', 'A'],
    ['240912', '0091234578', 'Farhan Nur Wahid', 'L', 'Malang', '2011-10-14', 'B'],
    ['240913', '0091234579', 'Hana Syakira Putri', 'P', 'Malang', '2011-12-01', 'O'],
    ['240914', '0091234580', 'Irfan Maulana Hakim', 'L', 'Sidoarjo', '2011-03-11', 'A'],
    ['240915', '0091234581', 'Jasmine Kayla Az-Zahra', 'P', 'Malang', '2011-08-19', 'B'],
    ['240916', '0091234582', 'Kevin Raditya Pangestu', 'L', 'Malang', '2011-05-27', 'O'],
    ['240917', '0091234583', 'Larasati Sekar Kinanti', 'P', 'Madiun', '2011-02-14', 'A'],
    ['240918', '0091234584', 'Mochamad Rizky Pratama', 'L', 'Surabaya', '2011-06-10', 'O'],
    ['240919', '0091234585', 'Muhammad Farhan Al-Ghifari', 'L', 'Malang', '2011-07-22', 'B'],
    ['240920', '0091234586', 'Nabila Safitri', 'P', 'Malang', '2011-09-18', 'O'],
    ['240921', '0091234587', 'Nadira Azzahra', 'P', 'Batu', '2011-04-29', 'A'],
    ['240922', '0091234588', 'Naufal Raihan Akbar', 'L', 'Malang', '2011-11-25', 'B'],
    ['240923', '0091234589', 'Nurul Aulia Rahma', 'P', 'Jember', '2011-01-08', 'O'],
    ['240924', '0091234590', 'Rafi Ahmad Fauzi', 'L', 'Malang', '2011-10-02', 'A'],
    ['240925', '0091234591', 'Rania Khansa Salsabila', 'P', 'Malang', '2011-03-17', 'B'],
    ['240926', '0091234592', 'Revan Danendra Saputra', 'L', 'Kediri', '2011-06-04', 'O'],
    ['240927', '0091234593', 'Salma Nabila Putri', 'P', 'Malang', '2011-08-11', 'A'],
    ['240928', '0091234594', 'Satria Bagus Pambudi', 'L', 'Malang', '2011-12-16', 'B'],
    ['240929', '0091234595', 'Siti Nur Khadijah', 'P', 'Batu', '2011-09-05', 'O'],
    ['240930', '0091234596', 'Tegar Wira Wicaksana', 'L', 'Malang', '2011-05-09', 'A'],
    ['240931', '0091234597', 'Tiara Maharani', 'P', 'Blitar', '2011-07-07', 'O'],
    ['240932', '0091234598', 'Zahra Nur Azizah', 'P', 'Malang', '2011-02-28', 'B']
];

class9aNames.forEach(([nis, nisn, name, gender, place, birth, blood], idx) => {
    insertStudent.run(
        nis, nisn, `357301${nis}0001`, name, gender, place, birth,
        'Islam', `Jl. Pendidikan Laboratorium No. ${idx + 2}, Malang`,
        `081234567${idx + 10}`, `${nis}@smplab-um.sch.id`, blood,
        4, 'Aktif', 20 + (idx % 25), (idx % 7 === 0 ? 5 : 0),
        gender === 'L' ? '#0A3D62' : '#C98A1F', '2026/2027', 'Ganjil'
    );
});

// Siswa Adik: Nabila Putri Cantika (Kelas VII-B)
insertStudent.run(
    '260702', '0119876543', '3573012208130002', 'Nabila Putri Cantika', 'P', 'Malang', '2013-08-22',
    'Islam', 'Jl. Sigura-gura No. 24, Lowokwaru, Malang', '081333444555', 'nabila@smplab-um.sch.id', 'A',
    2, 'Aktif', 60, 0, '#1E7A46', '2026/2027', 'Ganjil'
);

// 8. Relasi Wali
const insertSG = db.prepare(`INSERT INTO student_guardians (guardian_id, student_id, relationship) VALUES (?, ?, ?)`);
insertSG.run(1, 1, 'Ayah Kandung'); // Suparman -> Fauzan
insertSG.run(1, 33, 'Ayah Kandung'); // Suparman -> Nabila
insertSG.run(2, 18, 'Ibu Kandung');

// 9. Presensi Harian
const insertAttendance = db.prepare(`
    INSERT INTO attendance_logs (student_id, date, gate_in_time, gate_out_time, classroom_status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
`);
insertAttendance.run(1, '2026-10-12', '06:42:15', null, 'Hadir', 'Tap Gerbang RFID Utama');
insertAttendance.run(1, '2026-10-11', '06:44:00', '15:30:10', 'Hadir', 'Tap Lengkap');
insertAttendance.run(1, '2026-10-10', '06:40:00', '15:35:00', 'Hadir', 'Tap Lengkap');
insertAttendance.run(1, '2026-10-09', '06:38:12', '14:30:00', 'Hadir', 'Tap Lengkap (Jumat)');

// 10. Pengajuan Izin
const insertLeave = db.prepare(`
    INSERT INTO leave_requests (student_id, guardian_id, type, start_date, end_date, reason, attachment_name, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertLeave.run(1, 1, 'Sakit', '2026-10-05', '2026-10-06', 'Demam dan radang tenggorokan.', 'surat_dokter_fauzan.pdf', 'Disetujui', '2026-10-05 07:15:00');

// 11. Tugas LMS
const insertAssignment = db.prepare(`
    INSERT INTO assignments (class_id, subject_id, title, description, due_date, file_attachment)
    VALUES (?, ?, ?, ?, ?, ?)
`);
insertAssignment.run(4, 2, 'Proyek Algoritma Searching Python', 'Selesaikan pencarian data biner dengan studi kasus di lab.', '2026-10-16 23:59:00', 'modul_python_lab.pdf');
insertAssignment.run(4, 1, 'Latihan SPLDV Bab 4.2', 'Kerjakan halaman 78-82 di buku modul mandiri.', '2026-10-14 17:00:00', 'lks_spldv.pdf');

// 12. Ujian & Asesmen (Dikelompokkan: UH, UB, UTS, UAS)
const insertExam = db.prepare(`
    INSERT INTO exams (code, title, exam_type, subject_id, class_id, teacher_name, duration_minutes, token, question_count, scheduled_date, scheduled_time, passing_grade, status, score_achieved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Kategori UH (Ulangan Harian)
insertExam.run('UH-INF-01', 'Ulangan Harian 1: Berpikir Komputasional & Algoritma', 'UH', 2, 4, 'Budi Santoso, S.Kom., M.T.', 45, 'UH26INF', 10, '2026-09-15', '08.40 - 09.25 WIB', 78, 'Selesai', 92.5);
insertExam.run('UH-MAT-02', 'Ulangan Harian 2: Sistem Persamaan Linear Dua Variabel', 'UH', 1, 4, 'Ahmad Hidayat, M.Sc.', 60, 'UH26MAT', 12, '2026-09-22', '07.00 - 08.00 WIB', 75, 'Selesai', 88.0);
insertExam.run('UH-BIG-03', 'Ulangan Harian 3: Narrative Text & Cambridge Vocab', 'UH', 4, 4, 'Sarah Johnson, B.Ed.', 45, 'UH26ENG', 10, '2026-10-12', '10.40 - 11.25 WIB', 75, 'Aktif', null);

// Kategori UB (Ulangan Bulanan / Formatif)
insertExam.run('UB-IPA-01', 'Asesmen Formatif Bulanan 1: Sistem Gerak & Pesawat Sederhana', 'UB', 5, 4, 'Endang Susilowati, S.Pd.', 60, 'UB26IPA', 15, '2026-09-29', '07.00 - 08.00 WIB', 75, 'Selesai', 90.0);
insertExam.run('UB-PPKN-02', 'Asesmen Formatif Bulanan 2: Nilai Pancasila dalam Kehidupan Berbangsa', 'UB', 6, 4, 'Dra. Sri Wahyuni, M.Pd.', 45, 'UB26PKN', 10, '2026-10-22', '08.40 - 09.25 WIB', 76, 'Terjadwal', null);

// Kategori UTS (Asesmen Sumatif Tengah Semester - ASTS)
insertExam.run('ASTS-2026-INF', 'ASTS Ganjil: Informatika & Literasi Digital Terapan', 'UTS', 2, 4, 'Budi Santoso, S.Kom., M.T.', 90, 'LABUM26', 10, '2026-10-12', '08.00 - 09.30 WIB', 78, 'Aktif', null);
insertExam.run('ASTS-2026-MAT', 'ASTS Ganjil: Matematika & Analisis Logika Geometri', 'UTS', 1, 4, 'Ahmad Hidayat, M.Sc.', 90, 'ASTSMAT', 15, '2026-10-15', '07.00 - 08.30 WIB', 75, 'Terjadwal', null);
insertExam.run('ASTS-2026-BIG', 'ASTS Ganjil: Cambridge Lower Secondary English Examination', 'UTS', 4, 4, 'Sarah Johnson, B.Ed.', 90, 'ASTSENG', 15, '2026-10-16', '07.00 - 08.30 WIB', 75, 'Terjadwal', null);

// Kategori UAS (Asesmen Sumatif Akhir Semester - ASAS)
insertExam.run('ASAS-2026-SIM', 'Simulasi Ujian Digital ASAS Ganjil Bersama P2LP UM', 'UAS', 2, 4, 'Panitia CBT Lab', 120, 'ASAS26LAB', 20, '2026-12-01', '07.30 - 09.30 WIB', 75, 'Terjadwal', null);

// 13. Butir Soal CBT (Menampilkan 6 Format Soal)
const insertQuestion = db.prepare(`
    INSERT INTO exam_questions (exam_id, question_number, type, question_text, options_json, correct_answer, points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);
// Soal untuk ASTS-2026-INF (exam_id = 6)
insertQuestion.run(6, 1, 'single_choice', 'Manakah algoritma pencarian yang membutuhkan data dalam keadaan terurut terlebih dahulu?', JSON.stringify(['Linear Search', 'Binary Search', 'Bubble Sort', 'Insertion Sort']), 'Binary Search', 10);
insertQuestion.run(6, 2, 'multi_choice', 'Manakah karakteristik utama dari jaringan komputer bertopologi Bintang (Star)? (Pilih 2 jawaban yang benar)', JSON.stringify(['Menggunakan perangkat konsentrator Switch/Hub', 'Satu kabel putus merusak seluruh jaringan', 'Mudah menambah perangkat baru tanpa memutus koneksi', 'Membutuhkan terminator di kedua ujung']), JSON.stringify(['Menggunakan perangkat konsentrator Switch/Hub', 'Mudah menambah perangkat baru tanpa memutus koneksi']), 10);
insertQuestion.run(6, 3, 'true_false', 'Benar atau Salah: Tipe data Boolean dalam pemrograman Python hanya memiliki dua nilai yaitu True dan False.', JSON.stringify(['Benar', 'Salah']), 'Benar', 10);
insertQuestion.run(6, 4, 'matching', 'Jodohkan istilah komputasi berikut dengan fungsinya:', JSON.stringify({ prompts: ['CPU', 'RAM', 'SSD'], targets: ['Unit Pemroses Sentral', 'Memori Sementara Cepat', 'Penyimpanan Permanen Cepat'] }), JSON.stringify({ CPU: 'Unit Pemroses Sentral', RAM: 'Memori Sementara Cepat', SSD: 'Penyimpanan Permanen Cepat' }), 10);
insertQuestion.run(6, 5, 'short_answer', 'Sebutkan protokol jaringan standar yang digunakan untuk mentransfer halaman web aman terenkripsi! (Ketik singkatan)', '[]', 'HTTPS', 10);
insertQuestion.run(6, 6, 'essay', 'Jelaskan mengapa pendekatan berpikir komputasional (Computational Thinking) penting dalam memecahkan masalah kompleks dalam kehidupan sehari-hari!', '[]', 'Dekomposisi, Pengenalan Pola, Abstraksi, Algoritma.', 15);

// 14. E-Rapor Komprehensif (Nilai Mapel)
const insertGrade = db.prepare(`
    INSERT INTO grades (student_id, subject_id, semester, score_tasks, score_uh, score_pts, score_pas, final_score, predicate, character_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertGrade.run(1, 1, '2026/2027 Ganjil', 90, 88, 92, 90, 90, 'A', 'Sangat mahir dalam pemecahan masalah numerik dan logika Aljabar.');
insertGrade.run(1, 2, '2026/2027 Ganjil', 95, 93, 96, 94, 95, 'A', 'Istimewa dalam logika berpikir komputasional dan implementasi algoritma pemrograman.');
insertGrade.run(1, 3, '2026/2027 Ganjil', 86, 85, 88, 87, 87, 'A', 'Mampu menyusun teks argumentasi kritis dengan diksi bahasa yang kaya dan tepat.');
insertGrade.run(1, 4, '2026/2027 Ganjil', 92, 90, 94, 92, 92, 'A', 'Fasih dalam komunikasi bilingual Cambridge dan analisis teks bacaan analitik.');
insertGrade.run(1, 5, '2026/2027 Ganjil', 88, 86, 90, 89, 88, 'A', 'Memiliki keterampilan observasi saintifik yang tajam pada fenomena ekosistem alam.');
insertGrade.run(1, 6, '2026/2027 Ganjil', 88, 87, 89, 88, 88, 'A', 'Menunjukkan penghayatan nilai-nilai Pancasila dan kedisiplinan berorganisasi.');
insertGrade.run(1, 7, '2026/2027 Ganjil', 92, 90, 94, 91, 92, 'A', 'Memiliki adab islami yang luhur dan hafalan Al-Qur’an metode Ummi yang tartil.');

// 15. Rekap Komprehensif E-Rapor
db.prepare(`
    INSERT INTO report_card_summaries (student_id, semester, academic_year, total_score, average_score, class_rank, total_students, attendance_sakit, attendance_izin, attendance_alpa, homeroom_notes, extracurricular_json, character_predicate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
    1, 'Ganjil', '2026/2027', 632.0, 90.3, 2, 32, 1, 0, 0,
    'Ananda Fauzan menunjukkan dedikasi akademik yang luar biasa, berkarakter santun, berjiwa kepemimpinan tinggi sebagai Wakil Ketua Kelas IX-A, serta aktif mengharumkan nama sekolah dalam bidang Robotika & Sains.',
    JSON.stringify([
        { name: 'Pramuka ARSIMBO', predicate: 'A (Sangat Baik)', note: 'Aktif sebagai Pratama regu, mandiri, dan berjiwa sosial tinggi.' },
        { name: 'Klub Robotika & AI Labschool', predicate: 'A (Sangat Baik)', note: 'Juara 1 Lomba Robotika Nasional 2026, memimpin proyek inovasi sekolah.' },
        { name: 'Program TaBaQu & Tahfidz Ummi', predicate: 'A (Sangat Baik)', note: 'Tartil melafalkan tajwid Juz 29-30 dengan mutqin.' }
    ]),
    'A (Sangat Terpuji)'
);

// 16. Perpustakaan Digital & e-Library SMP Lab UM
const insertBook = db.prepare(`
    INSERT INTO library_books (isbn, title, author, publisher, year, category, cover_emoji, file_pdf_url, file_size, total_pages, available_copies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertBook.run('978-602-244-789-1', 'Informatika untuk SMP/MTs Kelas IX (Kurikulum Merdeka)', 'Irya Wisnubhadra, Maresha Caroline', 'Pusat Kurikulum & Perbukuan Kemendikbudristek', 2024, 'Buku Teks Utama', '💻', '/downloads/buku_informatika_ix.pdf', '14.5 MB', 248, 25);
insertBook.run('978-110-874-658-0', 'Cambridge Lower Secondary English Learner’s Book 9', 'Graham Elsdon, Esther Menon', 'Cambridge University Press', 2023, 'Cambridge Curriculum', '🇬🇧', '/downloads/cambridge_english_9.pdf', '18.2 MB', 196, 20);
insertBook.run('978-602-588-120-4', 'Ensiklopedia Sains & Teknologi Populer Laboratorium UM', 'Tim Dosen FMIPA Universitas Negeri Malang', 'P2LP UM Press', 2025, 'Referensi Ilmiah', '🔬', '/downloads/ensiklopedia_sains_lab.pdf', '24.0 MB', 312, 15);
insertBook.run('978-602-244-672-6', 'Matematika: Menalar Kritis & Penyelesaian Masalah Kelas IX', 'Subchan, Winarni, Muhammad Syifa', 'Puskurbuk Kemendikbudristek', 2024, 'Buku Teks Utama', '📐', '/downloads/matematika_kelas_ix.pdf', '12.8 MB', 280, 30);
insertBook.run('978-602-987-001-9', 'Panduan Tartil & Tahfidz Metode Ummi: Juz 29 & 30', 'Lembaga Pengembangan Pendidikan Ummi', 'Ummi Media Pratama', 2024, 'Agama & Tahfidz', '📖', '/downloads/metode_ummi_juz30.pdf', '8.4 MB', 110, 50);
insertBook.run('978-602-145-889-2', 'Buku Saku Panduan Satuan Pramuka Penggalang ARSIMBO', 'Kwartir Cabang Kota Malang & Tim Pembina SMP Lab', 'Laboratorium Press', 2025, 'Karakter & Ekskul', '🏕️', '/downloads/panduan_pramuka_arsimbo.pdf', '6.1 MB', 142, 40);

// Riwayat Peminjaman Buku Fauzan
const insertLoan = db.prepare(`
    INSERT INTO library_loans (book_id, student_id, borrow_date, due_date, return_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
`);
insertLoan.run(1, 1, '2026-10-05', '2026-10-19', null, 'Dipinjam');
insertLoan.run(3, 1, '2026-10-08', '2026-10-22', null, 'Dipinjam');
insertLoan.run(4, 1, '2026-09-15', '2026-09-29', '2026-09-28', 'Selesai');
insertLoan.run(2, 1, '2026-09-01', '2026-09-15', '2026-09-14', 'Selesai');

// 17. Modul Pelajaran Mandiri dari Guru (Unduh PDF)
const insertModule = db.prepare(`
    INSERT INTO learning_modules (subject_id, teacher_id, class_id, title, chapter, description, file_name, file_size, upload_date, download_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertModule.run(2, 2, 4, 'Modul Ajar 01: Berpikir Komputasional & Algoritma Searching', 'Bab 1 - Algoritma', 'Membahas konsep Binary Search, Linear Search, dan kompleksitas waktu pemrograman Python.', 'Modul_01_Informatika_Algoritma_Searching.pdf', '4.2 MB', '2026-10-02', 48);
insertModule.run(2, 2, 4, 'Bahan Ajar 02: Arsitektur Jaringan Komputer & Cyber Security', 'Bab 2 - Jaringan', 'Panduan pemahaman protokol TCP/IP, DNS, serta etika berinternet sehat di sekolah.', 'Bahan_02_Jaringan_Internet_Sehat.pdf', '3.8 MB', '2026-10-06', 42);
insertModule.run(1, 1, 4, 'Modul Pengayaan: Sistem Persamaan Linear Dua Variabel (SPLDV)', 'Bab 4 - Aljabar', 'Metode eliminasi, substitusi, grafik, dan latihan studi kasus kontekstual pasar tradisional.', 'Modul_SPLDV_Matematika_Pak_Ahmad.pdf', '5.1 MB', '2026-09-28', 56);
insertModule.run(4, 4, 4, 'Cambridge Workbook: Analytical & Argumentative Essay Writing', 'Unit 3 - Writing', 'Rubrik penulisan esai kritis standar Cambridge IGCSE Lower Secondary.', 'Cambridge_Unit3_Analytical_Writing.pdf', '6.5 MB', '2026-10-04', 39);
insertModule.run(5, 5, 4, 'Petunjuk Praktikum: Ekosistem Hutan Kota & Analisis Kualitas Air', 'Bab 3 - Ekologi', 'Panduan kerja lapangan investigasi keanekaragaman hayati sekitar kampus Universitas Negeri Malang.', 'Praktikum_IPA_Ekologi_Bu_Endang.pdf', '7.0 MB', '2026-10-08', 51);
insertModule.run(7, 6, 4, 'Panduan Karakter TaBaQu: Adab Murid Terhadap Guru & Orang Tua', 'Modul Karakter', 'Bimbingan akhlakul karimah, doa harian, dan tadabbur ayat-ayat Al-Qur’an terpilih.', 'Panduan_TaBaQu_Adab_Penuntut_Ilmu.pdf', '2.9 MB', '2026-09-20', 65);

// 18. Struktur Organisasi Kelas IX-A
const insertOrg = db.prepare(`
    INSERT INTO class_organization (class_id, role_name, role_category, student_name, student_nis, contact, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);
insertOrg.run(4, 'Wali Kelas', 'Pembina', 'Bapak Ahmad Hidayat, M.Sc.', '198109202006041003', '0812-3456-7892', '#0A3D62');
insertOrg.run(4, 'Ketua Kelas', 'Inti', 'Mochamad Rizky Pratama', '240918', '0812-3344-5501', '#155B8A');
insertOrg.run(4, 'Wakil Ketua Kelas', 'Inti', 'Ahmad Fauzan Maulana', '240901', '0812-3456-7890', '#C98A1F');
insertOrg.run(4, 'Sekretaris 1', 'Inti', 'Annisa Dwi Lestari', '240904', '0813-4455-6602', '#1E7A46');
insertOrg.run(4, 'Sekretaris 2', 'Inti', 'Clarissa Putri Amanda', '240907', '0813-5566-7703', '#1E7A46');
insertOrg.run(4, 'Bendahara 1', 'Inti', 'Zahra Nur Azizah', '240932', '0812-6677-8804', '#D97706');
insertOrg.run(4, 'Bendahara 2', 'Inti', 'Nabila Safitri', '240920', '0812-7788-9905', '#D97706');
insertOrg.run(4, 'Seksi Keagamaan & TaBaQu', 'Seksi', 'Muhammad Farhan Al-Ghifari', '240919', '0852-1122-3306', '#059669');
insertOrg.run(4, 'Seksi Kebersihan & Lingkungan', 'Seksi', 'Kevin Raditya Pangestu', '240916', '0852-2233-4407', '#10B981');
insertOrg.run(4, 'Seksi Keamanan & Ketertiban', 'Seksi', 'Dimas Arya Sena', '240910', '0853-3344-5508', '#DC2626');
insertOrg.run(4, 'Seksi Olahraga & Kesenian', 'Seksi', 'Bagas Satria Yudha', '240905', '0853-4455-6609', '#7C3AED');
insertOrg.run(4, 'Seksi Perlengkapan & IT', 'Seksi', 'Farhan Nur Wahid', '240912', '0854-5566-7710', '#0284C7');

// 19. Jadwal Piket Kebersihan Kelas IX-A
const insertDuty = db.prepare(`
    INSERT INTO class_duty_schedules (class_id, day_name, member_names_json, task_notes)
    VALUES (?, ?, ?, ?)
`);
insertDuty.run(4, 'Senin', JSON.stringify(['Ahmad Fauzan Maulana (Koord)', 'Aditya Pratama', 'Alya Zahra', 'Annisa Dwi', 'Bagas Satria', 'Bintang Ramadhan']), 'Membersihkan papan tulis, menyapu lantai, dan merapikan meja guru sebelum apel pagi.');
insertDuty.run(4, 'Selasa', JSON.stringify(['Clarissa Putri (Koord)', 'Daffa Ihsan', 'Dhea Ayu', 'Dimas Arya Sena', 'Fadhil Muhammad', 'Farhan Nur Wahid']), 'Mengosongkan tempat sampah, menyapu teras kelas, dan mengecek spidol whiteboard.');
insertDuty.run(4, 'Rabu', JSON.stringify(['Hana Syakira (Koord)', 'Irfan Maulana', 'Jasmine Kayla', 'Kevin Raditya', 'Larasati Sekar', 'Mochamad Rizky']), 'Menyiram tanaman pot teras kelas, merapikan loker buku, dan mengepel lantai.');
insertDuty.run(4, 'Kamis', JSON.stringify(['Muhammad Farhan (Koord)', 'Nabila Safitri', 'Nadira Azzahra', 'Naufal Raihan', 'Nurul Aulia', 'Rafi Ahmad']), 'Membersihkan kaca jendela, merapikan proyektor LCD lab, dan menyapu ruangan.');
insertDuty.run(4, 'Jumat', JSON.stringify(['Rania Khansa (Koord)', 'Revan Danendra', 'Salma Nabila', 'Satria Bagus', 'Siti Nur Khadijah', 'Tegar Wira']), 'Operasi Semut Jumat Bersih, sanitasi gagang pintu, dan penataan sudut baca kelas.');
insertDuty.run(4, 'Sabtu', JSON.stringify(['Tiara Maharani (Koord)', 'Zahra Nur Azizah', 'Ahmad Fauzan Maulana', 'Kevin Raditya', 'Dimas Arya Sena']), 'Pengecekan akhir stopkontak, kipas angin, jendela terkunci sebelum libur akhir pekan.');

// 20. Pengumuman Resmi
const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, category, date, summary, content, author, tag, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertAnnouncement.run(
    'Pelaksanaan Asesmen Sumatif Tengah Semester (ASTS) Ganjil 2026/2027 Menggunakan CBT Lab',
    'Akademik',
    '11 Oktober 2026',
    'ASTS dilaksanakan secara luring di Lab Komputer Kampus SMP Laboratorium UM.',
    'Seluruh siswa diharapkan mempersiapkan diri, membawa kartu peserta ujian resmi, serta mengecek jadwal dan token sesi masing-masing.',
    'Kurikulum Sekolah',
    'Ujian CBT',
    1
);

// 21. PPDB Calon Siswa Baru
const insertApplicant = db.prepare(`
    INSERT INTO ppdb_applicants (registration_number, nisn, nama, gender, tempat_lahir, tanggal_lahir, asal_sekolah, program, nama_ayah, nama_ibu, wa, alamat, nilai_rapor, prestasi, catatan, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertApplicant.run('SPMB-2026-0041', '0089123456', 'Ahmad Fauzan Maulana', 'L', 'Malang', '2011-04-12', 'SD Laboratorium UM', 'Program Reguler (Kurikulum Merdeka)', 'H. Suparman, S.E.', 'Hj. Siti Aminah', '081234567890', 'Jl. Sigura-gura No. 24, Lowokwaru, Malang', 92.4, 'Juara 1 Lomba OSN IPA Kota Malang', 'Pilihan Utama Jalur Prestasi Gelombang 1', 'DITERIMA (LOLOS SELEKSI)');
insertApplicant.run('SPMB-2026-1024', '0098234567', 'Muhammad Bintang Pratama', 'L', 'Malang', '2012-01-15', 'SD Negeri Percobaan 1 Malang', 'ICP (International Class Program)', 'Ir. Hendra Gunawan', 'Dewi Sartika, M.Pd.', '081398765432', 'Jl. Ijen No. 45, Klojen, Malang', 94.2, 'Cambridge Primary Checkpoint Score Perfect', 'Memenuhi syarat Native Speaker Session', 'DITERIMA (LOLOS SELEKSI)');

console.log('Semua data dummy komprehensif berhasil di-seed ke database.sqlite!');
db.close();
