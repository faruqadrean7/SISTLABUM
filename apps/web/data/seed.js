// Seed Script: Mengisi data dummy realistis SISTLABUM ke database.sqlite
// SMP-SMA Laboratorium Universitas Negeri Malang

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// Hapus database lama jika ada
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new DatabaseSync(dbPath);
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Jalankan skema
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
insertClass.run('VII-A', 'Kelas VII-A', 7, 'Dra. Sri Wahyuni, M.Pd.', 'R.201', 32);
insertClass.run('VII-B', 'Kelas VII-B', 7, 'Budi Santoso, S.Kom., M.T.', 'R.202', 30);
insertClass.run('VIII-A', 'Kelas VIII-A', 8, 'Endang Susilowati, S.Pd.', 'R.203', 32);
insertClass.run('IX-A', 'Kelas IX-A', 9, 'Ahmad Hidayat, M.Sc.', 'R.301', 32);
insertClass.run('X-IPA-1', 'Kelas X IPA 1', 10, 'Dr. Nurul Hidayati, M.Pd.', 'Lab Saintek', 34);

// 4. Mata Pelajaran
const insertSubject = db.prepare(`INSERT INTO subjects (code, name, category, kkm) VALUES (?, ?, ?, ?)`);
insertSubject.run('MAT', 'Matematika', 'Umum', 75);
insertSubject.run('INF', 'Informatika & Berpikir Komputasional', 'Peminatan', 78);
insertSubject.run('BIN', 'Bahasa Indonesia', 'Umum', 75);
insertSubject.run('BIG', 'Bahasa Inggris', 'Umum', 75);
insertSubject.run('PPKN', 'Pendidikan Pancasila', 'Umum', 76);
insertSubject.run('IPA', 'Ilmu Pengetahuan Alam', 'Umum', 75);

// 5. Guru
const insertTeacher = db.prepare(`INSERT INTO teachers (nip, name, title, subject, email, phone, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)`);
insertTeacher.run('197805122003121002', 'Dra. Sri Wahyuni, M.Pd.', 'Guru Penggerak & Walas VII-A', 'Bahasa Indonesia', 'sri.wahyuni@labschoolum.sch.id', '081234567890', '/assets/teacher-1.jpg');
insertTeacher.run('198503152009041001', 'Budi Santoso, S.Kom., M.T.', 'Kepala Lab Komputer & Guru Informatika', 'Informatika', 'budi.santoso@labschoolum.sch.id', '081234567891', '/assets/teacher-2.jpg');
insertTeacher.run('198109202006041003', 'Ahmad Hidayat, M.Sc.', 'Ketua MGMP Matematika', 'Matematika', 'ahmad.hidayat@labschoolum.sch.id', '081234567892', '/assets/teacher-3.jpg');
insertTeacher.run('198811042011012005', 'Dr. Nurul Hidayati, M.Pd.', 'Koordinator BK & Konseling', 'Bimbingan Konseling', 'nurul.hidayati@labschoolum.sch.id', '081234567893', '/assets/teacher-4.jpg');

// 6. Orang Tua
const insertGuardian = db.prepare(`INSERT INTO guardians (nik, name, phone, email, occupation, address) VALUES (?, ?, ?, ?, ?, ?)`);
// Orang tua 1: Memiliki 2 anak di sekolah (Ahmad Fauzan di IX-A & Nabila Putri di VII-B) -> Showcase Multi-Anak!
insertGuardian.run('3573011204750001', 'H. Suparman, S.E., M.M.', '081333444555', 'suparman.invest@gmail.com', 'Wiraswasta / Direktur PT', 'Jl. Ijen No. 45, Klojen, Malang');
insertGuardian.run('3573022508800002', 'Dra. Hj. Nur Laili, M.Kes.', '081222333444', 'nurlaili.dinkes@malangkota.go.id', 'PNS Dinas Kesehatan', 'Jl. Danau Toba G-4, Sawojajar, Malang');
insertGuardian.run('3573031001780003', 'Ir. Bambang Trihartanto', '081777888999', 'bambang.tri@gmail.com', 'Konsultan Konstruksi Sipil', 'Jl. Terusan Dieng No. 12, Sukun, Malang');

// 7. Siswa
const insertStudent = db.prepare(`
    INSERT INTO students (nis, nisn, name, gender, birth_place, birth_date, class_id, status, points_reward, points_violation, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
// Siswa 1: Ahmad Fauzan Maulana (Anak pertama Suparman di Kelas IX-A)
insertStudent.run('240901', '0091234567', 'Ahmad Fauzan Maulana', 'L', 'Malang', '2011-04-14', 4, 'Aktif', 45, 0, '#1E3A8A');
// Siswa 2: Nabila Putri Cantika (Anak kedua Suparman di Kelas VII-B)
insertStudent.run('260702', '0119876543', 'Nabila Putri Cantika', 'P', 'Malang', '2013-08-22', 2, 'Aktif', 60, 0, '#0D9488');
// Siswa 3: Mochamad Rizky Pratama (Kelas IX-A)
insertStudent.run('240903', '0092345678', 'Mochamad Rizky Pratama', 'L', 'Surabaya', '2011-06-10', 4, 'Aktif', 25, 5, '#F59E0B');
// Siswa 4: Siti Nur Khadijah (Kelas IX-A)
insertStudent.run('240904', '0093456789', 'Siti Nur Khadijah', 'P', 'Batu', '2011-09-05', 4, 'Aktif', 50, 0, '#4F46E5');
// Siswa 5: Arya Bima Yudhistira (Kelas VII-A)
insertStudent.run('260705', '0114567890', 'Arya Bima Yudhistira', 'L', 'Malang', '2013-02-18', 1, 'Aktif', 30, 0, '#0284C7');
// Siswa 6: Keisha Aurellia Ramadhani (Kelas VII-A)
insertStudent.run('260706', '0115678901', 'Keisha Aurellia Ramadhani', 'P', 'Kediri', '2013-07-30', 1, 'Aktif', 40, 0, '#D946EF');

// 8. Relasi Wali - Siswa
const insertStudentGuardian = db.prepare(`INSERT INTO student_guardians (guardian_id, student_id, relationship) VALUES (?, ?, ?)`);
insertStudentGuardian.run(1, 1, 'Ayah Kandung'); // Suparman -> Fauzan
insertStudentGuardian.run(1, 2, 'Ayah Kandung'); // Suparman -> Nabila
insertStudentGuardian.run(2, 3, 'Ibu Kandung');  // Nur Laili -> Rizky
insertStudentGuardian.run(3, 5, 'Ayah Kandung'); // Bambang -> Arya

// 9. Presensi Harian (Tanggal Hari Ini & Kemarin)
const insertAttendance = db.prepare(`
    INSERT INTO attendance_logs (student_id, date, gate_in_time, gate_out_time, classroom_status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
`);
// Hari Ini
insertAttendance.run(1, '2026-10-12', '06:42:15', null, 'Hadir', 'Tap Gerbang RFID Utama');
insertAttendance.run(2, '2026-10-12', '06:45:20', null, 'Hadir', 'Tap Gerbang RFID Selatan');
insertAttendance.run(3, '2026-10-12', '06:58:10', null, 'Terlambat', 'Terlambat 8 menit');
insertAttendance.run(4, '2026-10-12', '06:38:00', null, 'Hadir', 'Tap Gerbang Wajah');
insertAttendance.run(5, '2026-10-12', '06:40:12', null, 'Hadir', 'Tap Gerbang RFID Utama');

// Kemarin
insertAttendance.run(1, '2026-10-11', '06:44:00', '15:30:10', 'Hadir', 'Tap Lengkap');
insertAttendance.run(2, '2026-10-11', '06:41:20', '15:30:05', 'Hadir', 'Tap Lengkap');

// 10. Pengajuan Izin/Sakit
const insertLeave = db.prepare(`
    INSERT INTO leave_requests (student_id, guardian_id, type, start_date, end_date, reason, attachment_name, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertLeave.run(
    1, 1, 'Sakit', '2026-10-05', '2026-10-06',
    'Demam tinggi dan radang tenggorokan, istirahat dokter 2 hari.',
    'surat_dokter_fauzan_rs_hermina.pdf',
    'Disetujui',
    '2026-10-05 07:15:00'
);
insertLeave.run(
    2, 1, 'Izin', '2026-10-20', '2026-10-21',
    'Menghadiri penganugerahan lomba sains nasional di Surabaya.',
    'surat_undangan_kemdikbud.pdf',
    'Menunggu Verifikasi',
    '2026-10-11 19:30:00'
);

// 11. Tugas LMS
const insertAssignment = db.prepare(`
    INSERT INTO assignments (class_id, subject_id, title, description, due_date, file_attachment)
    VALUES (?, ?, ?, ?, ?, ?)
`);
insertAssignment.run(
    4, 2, 'Proyek Analisis Data Algoritma Python',
    'Selesaikan studi kasus pengurutan data siswa menggunakan Python di Google Colab. Kumpulkan file .ipynb atau PDF laporan analisa.',
    '2026-10-16 23:59:00',
    'modul_praktikum_python_lab_um.pdf'
);
insertAssignment.run(
    4, 1, 'Latihan Soal SPLDV & Matriks Transformasi',
    'Kerjakan lembar kerja 4.2 halaman 78-82 di buku modul mandiri. Foto hasil pekerjaan dengan jelas.',
    '2026-10-14 17:00:00',
    'lks_matematika_spldv.pdf'
);
insertAssignment.run(
    4, 3, 'Menulis Teks Editorial Isu Lingkungan Kota Malang',
    'Tuliskan tajuk rencana editorial minimal 400 kata terkait pelestarian ruang terbuka hijau di Kota Malang.',
    '2026-10-18 20:00:00',
    'rubrik_penilaian_editorial.pdf'
);

// 12. Ujian CBT Resmi Lab Komputer
const insertExam = db.prepare(`
    INSERT INTO exams (code, title, subject_id, class_id, duration_minutes, token, question_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertExam.run(
    'CBT-2026-INF-01',
    'Asesmen Sumatif Tengah Semester (ASTS) Informatika & Pemrograman',
    2, 4, 90, 'LABUM26', 10, 'Aktif'
);
insertExam.run(
    'CBT-2026-MAT-01',
    'Simulasi Ujian Digital ANBK Matematika & Literasi Numerasi',
    1, 4, 60, 'SIMULASI9', 15, 'Terjadwal'
);

// 13. Butir Soal CBT (Menampilkan 6 Model Soal Lengkap)
const insertQuestion = db.prepare(`
    INSERT INTO exam_questions (exam_id, question_number, type, question_text, options_json, correct_answer, points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// 1. Single Choice (Pilihan Ganda Tunggal)
insertQuestion.run(
    1, 1, 'single_choice',
    'Sebuah algoritma pencarian biner (binary search) membutuhkan data yang sudah terurut. Berapakah kompleksitas waktu terburuk (worst-case time complexity) dari algoritma pencarian biner pada deret sebanyak \\(N\\) elemen?',
    JSON.stringify([
        { id: 'A', text: '\\(O(1)\\)' },
        { id: 'B', text: '\\(O(\\log N)\\)' },
        { id: 'C', text: '\\(O(N)\\)' },
        { id: 'D', text: '\\(O(N \\log N)\\)' },
        { id: 'E', text: '\\(O(N^2)\\)' }
    ]),
    'B', 10
);

// 2. Single Choice dengan KaTeX Math
insertQuestion.run(
    1, 2, 'single_choice',
    'Diberikan fungsi rekursif: \\(f(n) = f(n-1) + 2n\\) dengan nilai basis \\(f(1) = 2\\). Berapakah nilai dari \\(f(4)\\)?',
    JSON.stringify([
        { id: 'A', text: '16' },
        { id: 'B', text: '18' },
        { id: 'C', text: '20' },
        { id: 'D', text: '22' },
        { id: 'E', text: '24' }
    ]),
    'C', 10
);

// 3. Multi Choice (Pilihan Ganda Kompleks - Centang Beberapa)
insertQuestion.run(
    1, 3, 'multi_choice',
    'Manakah dari pernyataan berikut yang merupakan karakteristik dari struktur data Stack (Tumpukan)? (Pilih SEMUA pernyataan yang benar)',
    JSON.stringify([
        { id: 'A', text: 'Menerapkan prinsip LIFO (Last In First Out)' },
        { id: 'B', text: 'Elemen yang pertama kali masuk akan pertama kali diproses (FIFO)' },
        { id: 'C', text: 'Operasi penambahan elemen disebut `push`' },
        { id: 'D', text: 'Operasi penghapusan elemen teratas disebut `pop`' },
        { id: 'E', text: 'Dapat diakses secara acak langsung ke indeks tengah tanpa menghapus elemen atas' }
    ]),
    'A,C,D', 10
);

// 4. True / False (Benar / Salah Matriks)
insertQuestion.run(
    1, 4, 'true_false',
    'Tentukan kebenaran dari setiap pernyataan mengenai protokol jaringan dan keamanan komputer berikut ini:',
    JSON.stringify([
        { id: 'p1', statement: 'Protokol HTTPS mengenkripsi transmisi data menggunakan TLS/SSL.', is_true: 1 },
        { id: 'p2', statement: 'Alamat IPv4 terdiri dari 128 bit alamat numerik.', is_true: 0 },
        { id: 'p3', statement: 'SQL Injection adalah teknik manipulasi query basis data melalui celah input tidak tervalidasi.', is_true: 1 },
        { id: 'p4', statement: 'DNS bertugas menerjemahkan nama domain menjadi IP address yang dipahami komputer.', is_true: 1 }
    ]),
    '{"p1":true,"p2":false,"p3":true,"p4":true}', 10
);

// 5. Matching (Menjodohkan Pasangan)
insertQuestion.run(
    1, 5, 'matching',
    'Jodohkan istilah paradigma pemrograman di sebelah kiri dengan deskripsi konsep yang tepat di sebelah kanan:',
    JSON.stringify({
        left: [
            { id: 'L1', text: 'Enkapsulasi (Encapsulation)' },
            { id: 'L2', text: 'Inheritansi (Pewarisan)' },
            { id: 'L3', text: 'Polimorfisme (Polymorphism)' }
        ],
        right: [
            { id: 'R1', text: 'Mekanisme pewarisan atribut & metode dari kelas induk ke kelas turunan' },
            { id: 'R2', text: 'Penyembunyian detail implementasi internal dan pembatasan akses data langsung' },
            { id: 'R3', text: 'Kemampuan suatu objek untuk memiliki banyak bentuk melalui overriding metode' },
            { id: 'R4', text: 'Penyusunan kode program tanpa melibatkan konsep kelas maupun objek' }
        ]
    }),
    '{"L1":"R2","L2":"R1","L3":"R3"}', 10
);

// 6. Short Answer (Isian Singkat)
insertQuestion.run(
    1, 6, 'short_answer',
    'Sebutkan nama gerbang logika digital yang menghasilkan keluaran bernilai 1 (True) HANYA JIKA kedua masukannya bernilai 1!',
    JSON.stringify({ placeholder: 'Tuliskan nama gerbang logika (huruf kapital)...' }),
    'AND', 10
);

// 7. Essay (Uraian Reflektif)
insertQuestion.run(
    1, 7, 'essay',
    'Jelaskan perbedaan mendasar antara topologi Star dan topologi Mesh dalam jaringan laboratorium komputer sekolah, serta sebutkan kelebihan topologi Star terkait kemudahan pemeliharaan dan biaya instalasi!',
    JSON.stringify({ min_words: 30, hint: 'Tuliskan jawaban Anda secara runtut dan analitis.' }),
    'Kunci rubrik: Star menggunakan switch/hub terpusat, kabel efisien, mudah isolasi gangguan. Mesh butuh banyak kabel redundan n(n-1)/2.', 15
);

// 8. Single Choice Gambar & Logika
insertQuestion.run(
    1, 8, 'single_choice',
    'Dalam perancangan basis data relasional sekolah, relasi antara tabel `students` (siswa) dan `guardians` (orang tua) di mana satu orang tua dapat memiliki lebih dari satu anak dan satu anak dapat memiliki lebih dari satu wali disebut relasi...',
    JSON.stringify([
        { id: 'A', text: 'One-to-One (Satu ke Satu)' },
        { id: 'B', text: 'One-to-Many (Satu ke Banyak)' },
        { id: 'C', text: 'Many-to-Many (Banyak ke Banyak) melalui tabel perantara' },
        { id: 'D', text: 'Zero-to-One (Nol ke Satu)' },
        { id: 'E', text: 'Self-Referencing Unary' }
    ]),
    'C', 10
);

// 9. Single Choice Algoritma
insertQuestion.run(
    1, 9, 'single_choice',
    'Manakah struktur perulangan di Python yang tepat digunakan ketika jumlah iterasi telah diketahui pasti di awal program?',
    JSON.stringify([
        { id: 'A', text: '`while condition:`' },
        { id: 'B', text: '`for i in range(n):`' },
        { id: 'C', text: '`do-while:`' },
        { id: 'D', text: '`repeat-until:`' },
        { id: 'E', text: '`try-except:`' }
    ]),
    'B', 10
);

// 10. Multi Choice
insertQuestion.run(
    1, 10, 'multi_choice',
    'Manakah di antara format file berikut yang umum digunakan untuk pertukaran data terstruktur antara server backend dengan web frontend? (Pilih dua)',
    JSON.stringify([
        { id: 'A', text: 'JSON (JavaScript Object Notation)' },
        { id: 'B', text: 'XML (eXtensible Markup Language)' },
        { id: 'C', text: 'MP4 Video Container' },
        { id: 'D', text: 'WAV Waveform Audio' },
        { id: 'E', text: 'EXE Windows Executable' }
    ]),
    'A,B', 10
);

// 14. Sesi Ujian Siswa (Ahmad Fauzan Maulana)
const insertSession = db.prepare(`
    INSERT INTO exam_sessions (exam_id, student_id, start_time, finish_time, answers_json, doubt_json, violation_count, status, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertSession.run(
    1, 1, '2026-10-12 08:00:00', null,
    JSON.stringify({ 1: 'B', 2: 'C', 3: ['A', 'C', 'D'], 6: 'AND' }),
    JSON.stringify([2]),
    0, 'In Progress', 0
);

// 15. Nilai Rapor Siswa
const insertGrade = db.prepare(`
    INSERT INTO grades (student_id, subject_id, semester, score_tasks, score_uh, score_pts, score_pas, final_score, predicate, character_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertGrade.run(
    1, 1, 'Ganjil 2026/2027', 92, 88, 90, 94, 91, 'A',
    'Sangat mahir dalam pemecahan masalah logika numerasi dan aktif membantu teman sejawat.'
);
insertGrade.run(
    1, 2, 'Ganjil 2026/2027', 95, 96, 94, 98, 96, 'A',
    'Menunjukkan kreativitas luar biasa dalam perancangan algoritma dan implementasi kode Python.'
);
insertGrade.run(
    1, 3, 'Ganjil 2026/2027', 88, 85, 87, 89, 87, 'B+',
    'Mampu menyusun teks argumentasi kritis dengan pilihan kosakata baku yang tepat.'
);
insertGrade.run(
    2, 1, 'Ganjil 2026/2027', 88, 86, 85, 89, 87, 'B+',
    'Menguasai konsep dasar aljabar dan bangun ruang dengan baik.'
);
insertGrade.run(
    2, 2, 'Ganjil 2026/2027', 94, 92, 95, 96, 94, 'A',
    'Sangat antusias dalam pemahaman berpikir komputasional dan literasi digital.'
);

// 16. Berita & Pengumuman
const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, category, date, summary, content, author, tag, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insertAnnouncement.run(
    'Pelaksanaan Asesmen Sumatif Tengah Semester (ASTS) Berbasis Komputer Lab',
    'Akademik',
    '12 Oktober 2026',
    'Ujian berlangsung mulai 12 s.d 17 Oktober 2026 menggunakan sistem CBT Laboratorium UM. Siswa wajib membawa kartu peserta ujian.',
    'Diberitahukan kepada seluruh siswa kelas VII, VIII, dan IX bahwa Asesmen Sumatif Tengah Semester (ASTS) Tahun Ajaran 2026/2027 dilaksanakan secara digital di Laboratorium Komputer Terpadu. Harap hadir tepat waktu 15 menit sebelum sesi dimulai.',
    'Waka Kurikulum',
    'CBT & Ujian',
    1
);
insertAnnouncement.run(
    'Prestasi Membanggakan: Kontingen Robotika Siswa Laboratorium UM Raih Medali Emas',
    'Prestasi',
    '10 Oktober 2026',
    'Tim Robotika SMP-SMA Laboratorium UM berhasil meraih Juara 1 pada Kompetisi Robotika Inovasi Nasional 2026 di Jakarta.',
    'Selamat kepada ananda Ahmad Fauzan Maulana dan tim yang telah mengharumkan nama sekolah dengan karya robot pemilah sampah otomatis berbasis kecerdasan buatan.',
    'Humas Sekolah',
    'Prestasi Siswa',
    1
);
insertAnnouncement.run(
    'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2027/2028 Jalur Prestasi Dibuka',
    'PPDB',
    '08 Oktober 2026',
    'Pendaftaran PPDB Jalur Prestasi Akademik & Non-Akademik resmi dibuka dengan kuota terbatas 120 kursi.',
    'Pendaftaran dilakukan secara daring melalui portal resmi sekolah. Calon pendaftar diharapkan melengkapi dokumen rapor semester 1-5 dan sertifikat kejuaraan terverifikasi.',
    'Panitia PPDB',
    'PPDB Online',
    1
);

// 10. Calon Pendaftar SPMB
const insertApplicant = db.prepare(`
    INSERT INTO ppdb_applicants (registration_number, nisn, nama, gender, tempat_lahir, tanggal_lahir, asal_sekolah, program, nama_ayah, nama_ibu, wa, alamat, nilai_rapor, prestasi, catatan, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
insertApplicant.run(
    'SPMB-2026-0041',
    '0089123456',
    'Ahmad Fauzan Maulana',
    'L',
    'Malang',
    '2011-04-12',
    'SD Laboratorium UM',
    'Program Reguler (Kurikulum Merdeka)',
    'H. Suparman, S.E.',
    'Hj. Siti Aminah',
    '081234567890',
    'Jl. Sigura-gura No. 24, Lowokwaru, Malang',
    92.4,
    'Juara 1 Lomba OSN IPA Kota Malang',
    'Pilihan Utama Jalur Prestasi Gelombang 1',
    'DITERIMA (LOLOS SELEKSI)'
);
insertApplicant.run(
    'SPMB-2026-1024',
    '0098234567',
    'Muhammad Bintang Pratama',
    'L',
    'Malang',
    '2012-01-15',
    'SD Negeri Percobaan 1 Malang',
    'ICP (International Class Program)',
    'Ir. Hendra Gunawan',
    'Dewi Sartika, M.Pd.',
    '081398765432',
    'Jl. Ijen No. 45, Klojen, Malang',
    94.2,
    'Cambridge Primary Checkpoint Score Perfect',
    'Memenuhi syarat Native Speaker Session',
    'DITERIMA (LOLOS SELEKSI)'
);
insertApplicant.run(
    'SPMB-2026-1088',
    '0087112233',
    'Nurul Aini Zahra',
    'P',
    'Batu',
    '2011-08-20',
    'MI Miftahul Huda Malang',
    'Program Tahfidz',
    'Ust. M. Ridwan',
    'Fatimah Azzahra',
    '085233445566',
    'Jl. Bendungan Sutami No. 18, Malang',
    89.0,
    'Hafalan 3 Juz (Metode Ummi)',
    'Lulus Munaqosah Uji Publik',
    'TERVERIFIKASI (LOLOS SELEKSI BERKAS)'
);

console.log('Semua data dummy berhasil di-seed ke database.sqlite!');
db.close();
