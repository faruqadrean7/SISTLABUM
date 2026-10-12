// SISTLABUM Web Server (Native Node.js + SQLite)
// Melayani Web Portal Terpadu: Publik, PPDB, Portal Siswa, Portal Orang Tua, & Admin Guru

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const publicDir = path.join(__dirname, 'public');

// Buka SQLite Database
if (!fs.existsSync(dbPath)) {
    console.error('Database SQLite belum ada. Silakan jalankan node data/seed.js');
    process.exit(1);
}
const db = new DatabaseSync(dbPath);

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // --- REST API ROUTES ---
    if (pathname.startsWith('/api/')) {
        try {
            // 1. Profil Sekolah & Stats
            if (pathname === '/api/school' && req.method === 'GET') {
                const school = db.prepare('SELECT * FROM school_profile LIMIT 1').get();
                const totalStudents = db.prepare("SELECT count(*) as count FROM students WHERE status = 'Aktif'").get();
                const totalTeachers = db.prepare('SELECT count(*) as count FROM teachers').get();
                const totalClasses = db.prepare('SELECT count(*) as count FROM classes').get();
                return sendJson(res, 200, {
                    school,
                    stats: {
                        students: totalStudents.count,
                        teachers: totalTeachers.count,
                        classes: totalClasses.count
                    }
                });
            }

            // 2. Berita & Pengumuman
            if (pathname === '/api/announcements' && req.method === 'GET') {
                const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC').all();
                return sendJson(res, 200, rows);
            }

            // 3. Siswa (List & Search)
            if (pathname === '/api/students' && req.method === 'GET') {
                const q = parsedUrl.searchParams.get('q');
                const classId = parsedUrl.searchParams.get('class_id');
                let query = `
                    SELECT s.*, c.name as class_name, c.room_number 
                    FROM students s 
                    JOIN classes c ON s.class_id = c.id 
                    WHERE 1=1
                `;
                const params = [];
                if (q) {
                    query += ` AND (s.name LIKE ? OR s.nis LIKE ? OR s.nisn LIKE ?)`;
                    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
                }
                if (classId) {
                    query += ` AND s.class_id = ?`;
                    params.push(classId);
                }
                query += ` ORDER BY s.name ASC`;
                const rows = db.prepare(query).all(...params);
                return sendJson(res, 200, rows);
            }

            // 4. Detail Siswa by ID
            if (pathname.startsWith('/api/students/') && req.method === 'GET') {
                const id = pathname.split('/')[3];
                const student = db.prepare(`
                    SELECT s.*, c.name as class_name, c.room_number, c.homeroom_teacher
                    FROM students s
                    JOIN classes c ON s.class_id = c.id
                    WHERE s.id = ?
                `).get(id);
                if (!student) return sendJson(res, 404, { error: 'Siswa tidak ditemukan' });

                // Ambil orang tua tertaut
                const guardians = db.prepare(`
                    SELECT g.*, sg.relationship
                    FROM guardians g
                    JOIN student_guardians sg ON g.id = sg.guardian_id
                    WHERE sg.student_id = ?
                `).all(id);

                return sendJson(res, 200, { student, guardians });
            }

            // 5. Orang Tua & Multi-Anak
            if (pathname === '/api/guardians' && req.method === 'GET') {
                const rows = db.prepare('SELECT * FROM guardians').all();
                return sendJson(res, 200, rows);
            }

            if (pathname.startsWith('/api/guardians/') && pathname.endsWith('/children') && req.method === 'GET') {
                const guardianId = pathname.split('/')[3];
                const children = db.prepare(`
                    SELECT s.*, c.name as class_name, c.homeroom_teacher, sg.relationship
                    FROM students s
                    JOIN classes c ON s.class_id = c.id
                    JOIN student_guardians sg ON s.id = sg.student_id
                    WHERE sg.guardian_id = ?
                    ORDER BY s.id ASC
                `).all(guardianId);
                return sendJson(res, 200, children);
            }

            // 6. Presensi Harian & Riwayat Siswa
            if (pathname === '/api/attendance/today' && req.method === 'GET') {
                const rows = db.prepare(`
                    SELECT a.*, s.name as student_name, s.nis, c.name as class_name
                    FROM attendance_logs a
                    JOIN students s ON a.student_id = s.id
                    JOIN classes c ON s.class_id = c.id
                    WHERE a.date = '2026-10-12'
                    ORDER BY a.gate_in_time DESC
                `).all();
                return sendJson(res, 200, rows);
            }

            if (pathname.startsWith('/api/attendance/student/') && req.method === 'GET') {
                const studentId = pathname.split('/')[4];
                const rows = db.prepare(`
                    SELECT * FROM attendance_logs
                    WHERE student_id = ?
                    ORDER BY date DESC
                `).all(studentId);
                return sendJson(res, 200, rows);
            }

            // 7. Pengajuan Izin/Sakit
            if (pathname === '/api/leave-requests' && req.method === 'GET') {
                const studentId = parsedUrl.searchParams.get('student_id');
                let query = `
                    SELECT lr.*, s.name as student_name, c.name as class_name, g.name as guardian_name
                    FROM leave_requests lr
                    JOIN students s ON lr.student_id = s.id
                    JOIN classes c ON s.class_id = c.id
                    JOIN guardians g ON lr.guardian_id = g.id
                `;
                const params = [];
                if (studentId) {
                    query += ` WHERE lr.student_id = ?`;
                    params.push(studentId);
                }
                query += ` ORDER BY lr.id DESC`;
                const rows = db.prepare(query).all(...params);
                return sendJson(res, 200, rows);
            }

            if (pathname === '/api/leave-requests' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const insert = db.prepare(`
                    INSERT INTO leave_requests (student_id, guardian_id, type, start_date, end_date, reason, attachment_name, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu Verifikasi', ?)
                `);
                const result = insert.run(
                    body.student_id || 1,
                    body.guardian_id || 1,
                    body.type || 'Sakit',
                    body.start_date || '2026-10-13',
                    body.end_date || '2026-10-14',
                    body.reason || 'Keterangan izin sakit',
                    body.attachment_name || 'surat_keterangan.pdf',
                    now
                );
                return sendJson(res, 201, { success: true, id: Number(result.lastInsertRowid) });
            }

            // 8. CBT: Ambil Data Ujian & Soal
            if (pathname.startsWith('/api/cbt/exam/') && req.method === 'GET') {
                const examId = pathname.split('/')[4];
                const exam = db.prepare(`
                    SELECT e.*, s.name as subject_name, c.name as class_name
                    FROM exams e
                    JOIN subjects s ON e.subject_id = s.id
                    JOIN classes c ON e.class_id = c.id
                    WHERE e.id = ?
                `).get(examId);
                if (!exam) return sendJson(res, 404, { error: 'Ujian tidak ditemukan' });

                const questions = db.prepare(`
                    SELECT id, question_number, type, question_text, options_json, points
                    FROM exam_questions
                    WHERE exam_id = ?
                    ORDER BY question_number ASC
                `).all(examId);

                // Ambil atau buat sesi ujian untuk siswa (default siswa id 1)
                const studentId = parsedUrl.searchParams.get('student_id') || 1;
                let session = db.prepare(`
                    SELECT * FROM exam_sessions WHERE exam_id = ? AND student_id = ?
                `).get(examId, studentId);

                if (!session) {
                    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    db.prepare(`
                        INSERT INTO exam_sessions (exam_id, student_id, start_time, answers_json, doubt_json, violation_count, status, score)
                        VALUES (?, ?, ?, '{}', '[]', 0, 'In Progress', 0)
                    `).run(examId, studentId, now);
                    session = db.prepare(`SELECT * FROM exam_sessions WHERE exam_id = ? AND student_id = ?`).get(examId, studentId);
                }

                return sendJson(res, 200, {
                    exam,
                    questions: questions.map(q => ({
                        ...q,
                        options: JSON.parse(q.options_json)
                    })),
                    session: {
                        ...session,
                        answers: JSON.parse(session.answers_json || '{}'),
                        doubt: JSON.parse(session.doubt_json || '[]')
                    }
                });
            }

            // 9. CBT: Simpan Jawaban (Autosave Idempotent)
            if (pathname === '/api/cbt/save-answer' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { exam_id, student_id, question_number, answer } = body;
                const session = db.prepare(`SELECT * FROM exam_sessions WHERE exam_id = ? AND student_id = ?`).get(exam_id, student_id);
                if (!session) return sendJson(res, 404, { error: 'Sesi ujian tidak ditemukan' });

                const answers = JSON.parse(session.answers_json || '{}');
                answers[question_number] = answer;

                db.prepare(`
                    UPDATE exam_sessions SET answers_json = ? WHERE exam_id = ? AND student_id = ?
                `).run(JSON.stringify(answers), exam_id, student_id);

                return sendJson(res, 200, { success: true, saved_at: new Date().toISOString() });
            }

            // 10. CBT: Tandai Ragu-Ragu
            if (pathname === '/api/cbt/toggle-doubt' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { exam_id, student_id, question_number, is_doubt } = body;
                const session = db.prepare(`SELECT * FROM exam_sessions WHERE exam_id = ? AND student_id = ?`).get(exam_id, student_id);
                if (!session) return sendJson(res, 404, { error: 'Sesi tidak ditemukan' });

                let doubts = JSON.parse(session.doubt_json || '[]');
                const qNum = Number(question_number);
                if (is_doubt) {
                    if (!doubts.includes(qNum)) doubts.push(qNum);
                } else {
                    doubts = doubts.filter(n => n !== qNum);
                }

                db.prepare(`UPDATE exam_sessions SET doubt_json = ? WHERE exam_id = ? AND student_id = ?`)
                    .run(JSON.stringify(doubts), exam_id, student_id);

                return sendJson(res, 200, { success: true, doubts });
            }

            // 11. CBT: Log Pelanggaran Anti-Cheat (Tab switch / blur)
            if (pathname === '/api/cbt/log-violation' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { exam_id, student_id } = body;
                db.prepare(`
                    UPDATE exam_sessions 
                    SET violation_count = violation_count + 1 
                    WHERE exam_id = ? AND student_id = ?
                `).run(exam_id, student_id);

                const updated = db.prepare(`SELECT violation_count FROM exam_sessions WHERE exam_id = ? AND student_id = ?`).get(exam_id, student_id);
                return sendJson(res, 200, { success: true, violation_count: updated.violation_count });
            }

            // 12. CBT: Selesaikan Ujian
            if (pathname === '/api/cbt/finish' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { exam_id, student_id } = body;
                const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                db.prepare(`
                    UPDATE exam_sessions 
                    SET status = 'Submitted', finish_time = ?, score = 92.5
                    WHERE exam_id = ? AND student_id = ?
                `).run(now, exam_id, student_id);
                return sendJson(res, 200, { success: true, status: 'Submitted', score: 92.5 });
            }

            // 13. CBT: Live Monitor Ruang Ujian (Admin / Pengawas)
            if (pathname.startsWith('/api/cbt/monitor/') && req.method === 'GET') {
                const examId = pathname.split('/')[4];
                const rows = db.prepare(`
                    SELECT s.id as student_id, s.name as student_name, s.nis,
                           COALESCE(es.status, 'Belum Mulai') as session_status,
                           COALESCE(es.violation_count, 0) as violation_count,
                           COALESCE(es.start_time, '-') as start_time,
                           COALESCE(es.answers_json, '{}') as answers_json
                    FROM students s
                    LEFT JOIN exam_sessions es ON s.id = es.student_id AND es.exam_id = ?
                    WHERE s.class_id = 4
                    ORDER BY s.name ASC
                `).all(examId);

                const formatted = rows.map(r => {
                    const answers = JSON.parse(r.answers_json);
                    return {
                        ...r,
                        answered_count: Object.keys(answers).length
                    };
                });
                return sendJson(res, 200, formatted);
            }

            // 14. Nilai Rapor & Progress Report Siswa
            if (pathname.startsWith('/api/grades/student/') && req.method === 'GET') {
                const studentId = pathname.split('/')[4];
                const student = db.prepare('SELECT s.*, c.name as class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?').get(studentId);
                const grades = db.prepare(`
                    SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.kkm
                    FROM grades g
                    JOIN subjects sub ON g.subject_id = sub.id
                    WHERE g.student_id = ?
                    ORDER BY sub.id ASC
                `).all(studentId);
                return sendJson(res, 200, { student, grades });
            }

            // 15. Rekap Nilai Kelas Guru & Spreadsheet Entry
            if (pathname.startsWith('/api/grades/class/') && req.method === 'GET') {
                const parts = pathname.split('/');
                const classId = parts[4];
                const subjectId = parts[6] || 2;
                const rows = db.prepare(`
                    SELECT s.id as student_id, s.name as student_name, s.nis,
                           COALESCE(g.score_tasks, 80) as score_tasks,
                           COALESCE(g.score_uh, 80) as score_uh,
                           COALESCE(g.score_pts, 80) as score_pts,
                           COALESCE(g.score_pas, 80) as score_pas,
                           COALESCE(g.final_score, 80) as final_score,
                           COALESCE(g.predicate, 'B') as predicate,
                           COALESCE(g.character_notes, 'Capaian kompetensi tuntas.') as character_notes
                    FROM students s
                    LEFT JOIN grades g ON s.id = g.student_id AND g.subject_id = ?
                    WHERE s.class_id = ?
                    ORDER BY s.name ASC
                `).all(subjectId, classId);
                return sendJson(res, 200, rows);
            }

            // 16. Tugas LMS
            if (pathname === '/api/assignments' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const rows = db.prepare(`
                    SELECT a.*, s.name as subject_name
                    FROM assignments a
                    JOIN subjects s ON a.subject_id = s.id
                    WHERE a.class_id = ?
                    ORDER BY a.due_date ASC
                `).all(classId);
                return sendJson(res, 200, rows);
            }

            // 17. Otentikasi Login SSO
            if (pathname === '/api/auth/login' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { username, role } = body;
                let redirectUrl = '/siswa/';
                if (role === 'ortu' || username?.includes('suparman') || username?.includes('wali')) {
                    redirectUrl = '/ortu/';
                } else if (role === 'guru' || username?.startsWith('19')) {
                    redirectUrl = '/admin/nilai.html';
                } else if (role === 'admin') {
                    redirectUrl = '/admin/';
                }
                return sendJson(res, 200, {
                    success: true,
                    token: 'dummy-token-' + Date.now(),
                    user: { username, role: role || 'siswa' },
                    redirect_url: redirectUrl
                });
            }

            // 18. PPDB: Pendaftaran Calon Siswa Baru
            if (pathname === '/api/ppdb/register' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const regNo = 'SPMB-2026-' + Math.floor(1000 + Math.random() * 9000);
                const {
                    program = 'Program Reguler',
                    nisn = '',
                    nama = '',
                    gender = 'L',
                    tempat_lahir = 'Malang',
                    tanggal_lahir = '2012-01-01',
                    asal_sekolah = '',
                    nama_ayah = '',
                    nama_ibu = '',
                    wa = '',
                    alamat = '',
                    nilai_rapor = 85.0,
                    prestasi = '',
                    catatan = ''
                } = body;

                db.prepare(`
                    INSERT INTO ppdb_applicants 
                    (registration_number, nisn, nama, gender, tempat_lahir, tanggal_lahir, asal_sekolah, program, nama_ayah, nama_ibu, wa, alamat, nilai_rapor, prestasi, catatan, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    regNo, nisn, nama, gender, tempat_lahir, tanggal_lahir, asal_sekolah, program,
                    nama_ayah, nama_ibu, wa, alamat, Number(nilai_rapor) || 85.0, prestasi, catatan,
                    'TERVERIFIKASI (LOLOS SELEKSI BERKAS)'
                );

                return sendJson(res, 201, {
                    success: true,
                    registration_number: regNo,
                    message: 'Pendaftaran SPMB berhasil disimpan.',
                    applicant: { registration_number: regNo, nama, program, status: 'TERVERIFIKASI (LOLOS SELEKSI BERKAS)' }
                });
            }

            // 19. PPDB: Cek Status Seleksi
            if (pathname === '/api/ppdb/status' && req.method === 'GET') {
                const q = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('no');
                if (!q) {
                    const all = db.prepare('SELECT * FROM ppdb_applicants ORDER BY id DESC').all();
                    return sendJson(res, 200, all);
                }

                const applicant = db.prepare(`
                    SELECT * FROM ppdb_applicants 
                    WHERE registration_number = ? OR nisn = ? OR nama LIKE ?
                    LIMIT 1
                `).get(q, q, `%${q}%`);

                if (!applicant) {
                    return sendJson(res, 404, { error: 'Data pendaftar tidak ditemukan', query: q });
                }
                return sendJson(res, 200, applicant);
            }

            // 20. Profil Biodata Siswa Lengkap
            if (pathname === '/api/student/profile' && req.method === 'GET') {
                const studentId = parsedUrl.searchParams.get('id') || 1;
                const student = db.prepare(`
                    SELECT s.*, c.name as class_name, c.room_number, c.homeroom_teacher
                    FROM students s
                    JOIN classes c ON s.class_id = c.id
                    WHERE s.id = ?
                `).get(studentId);

                if (!student) return sendJson(res, 404, { error: 'Siswa tidak ditemukan' });

                const guardians = db.prepare(`
                    SELECT g.*, sg.relationship
                    FROM guardians g
                    JOIN student_guardians sg ON g.id = sg.guardian_id
                    WHERE sg.student_id = ?
                `).all(studentId);

                return sendJson(res, 200, { student, guardians });
            }

            // 21. Perpustakaan Digital: Buku & e-Book
            if (pathname === '/api/library/books' && req.method === 'GET') {
                const q = parsedUrl.searchParams.get('q');
                const cat = parsedUrl.searchParams.get('category');
                let query = `SELECT * FROM library_books WHERE 1=1`;
                const params = [];
                if (q) {
                    query += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)`;
                    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
                }
                if (cat) {
                    query += ` AND category = ?`;
                    params.push(cat);
                }
                query += ` ORDER BY title ASC`;
                const books = db.prepare(query).all(...params);
                return sendJson(res, 200, books);
            }

            // 22. Perpustakaan Digital: Riwayat Peminjaman Buku Siswa
            if (pathname === '/api/library/loans' && req.method === 'GET') {
                const studentId = parsedUrl.searchParams.get('student_id') || 1;
                const loans = db.prepare(`
                    SELECT l.*, b.title, b.author, b.isbn, b.cover_emoji, b.category, b.file_size
                    FROM library_loans l
                    JOIN library_books b ON l.book_id = b.id
                    WHERE l.student_id = ?
                    ORDER BY l.borrow_date DESC
                `).all(studentId);
                return sendJson(res, 200, loans);
            }

            if (pathname === '/api/library/borrow' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { book_id, student_id = 1 } = body;
                const book = db.prepare('SELECT * FROM library_books WHERE id = ?').get(book_id);
                if (!book) return sendJson(res, 404, { error: 'Buku tidak ditemukan' });

                const now = new Date();
                const borrowDate = now.toISOString().split('T')[0];
                const dueDateObj = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
                const dueDate = dueDateObj.toISOString().split('T')[0];

                db.prepare(`
                    INSERT INTO library_loans (book_id, student_id, borrow_date, due_date, status)
                    VALUES (?, ?, ?, ?, 'Dipinjam')
                `).run(book_id, student_id, borrowDate, dueDate);

                return sendJson(res, 201, {
                    success: true,
                    message: `Berhasil meminjam buku digital "${book.title}". Berlaku s/d ${dueDate}.`
                });
            }

            // 23. Daftar Ujian Bertingkat (UH, UB, UTS, UAS)
            if (pathname === '/api/exams/list' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const examType = parsedUrl.searchParams.get('type');
                let query = `
                    SELECT e.*, s.name as subject_name, s.code as subject_code
                    FROM exams e
                    JOIN subjects s ON e.subject_id = s.id
                    WHERE e.class_id = ?
                `;
                const params = [classId];
                if (examType) {
                    query += ` AND e.exam_type = ?`;
                    params.push(examType);
                }
                query += ` ORDER BY e.id ASC`;
                const exams = db.prepare(query).all(...params);
                return sendJson(res, 200, exams);
            }

            // 24. Modul Pelajaran Mandiri dari Guru (Unduh PDF)
            if (pathname === '/api/learning-modules' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const subjectId = parsedUrl.searchParams.get('subject_id');
                let query = `
                    SELECT m.*, s.name as subject_name, t.name as teacher_name, t.title as teacher_title
                    FROM learning_modules m
                    JOIN subjects s ON m.subject_id = s.id
                    JOIN teachers t ON m.teacher_id = t.id
                    WHERE m.class_id = ?
                `;
                const params = [classId];
                if (subjectId) {
                    query += ` AND m.subject_id = ?`;
                    params.push(subjectId);
                }
                query += ` ORDER BY m.upload_date DESC`;
                const modules = db.prepare(query).all(...params);
                return sendJson(res, 200, modules);
            }

            // 25. Informasi Kelas Lengkap (Struktur Organisasi, Piket, Teman Sekelas & Guru Mapel)
            if (pathname === '/api/class-info' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
                if (!classData) return sendJson(res, 404, { error: 'Kelas tidak ditemukan' });

                // Struktur Organisasi Kelas
                const organization = db.prepare(`SELECT * FROM class_organization WHERE class_id = ? ORDER BY id ASC`).all(classId);

                // Jadwal Piket Harian
                const dutySchedules = db.prepare(`SELECT * FROM class_duty_schedules WHERE class_id = ? ORDER BY id ASC`).all(classId);
                const dutyParsed = dutySchedules.map(d => ({
                    ...d,
                    members: JSON.parse(d.member_names_json || '[]')
                }));

                // Roster Teman Sekelas
                const classmates = db.prepare(`
                    SELECT id, nis, nisn, name, gender, birth_place, birth_date, blood_type, points_reward, points_violation, avatar_color
                    FROM students
                    WHERE class_id = ?
                    ORDER BY nis ASC
                `).all(classId);

                // Direktori Guru Pengampu
                const teachers = db.prepare(`
                    SELECT t.*, s.name as subject_name, s.code as subject_code
                    FROM teachers t
                    LEFT JOIN subjects s ON t.subject LIKE '%' || s.name || '%' OR s.name LIKE '%' || t.subject || '%'
                    ORDER BY t.name ASC
                `).all();

                return sendJson(res, 200, {
                    class: classData,
                    organization,
                    duty_schedules: dutyParsed,
                    classmates,
                    teachers
                });
            }

            // 26. E-Rapor Komprehensif
            if (pathname === '/api/report-card' && req.method === 'GET') {
                const studentId = parsedUrl.searchParams.get('student_id') || 1;
                const student = db.prepare(`
                    SELECT s.*, c.name as class_name, c.room_number, c.homeroom_teacher
                    FROM students s
                    JOIN classes c ON s.class_id = c.id
                    WHERE s.id = ?
                `).get(studentId);
                if (!student) return sendJson(res, 404, { error: 'Siswa tidak ditemukan' });

                const grades = db.prepare(`
                    SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.kkm
                    FROM grades g
                    JOIN subjects sub ON g.subject_id = sub.id
                    WHERE g.student_id = ?
                    ORDER BY sub.id ASC
                `).all(studentId);

                const summary = db.prepare(`
                    SELECT * FROM report_card_summaries
                    WHERE student_id = ?
                    LIMIT 1
                `).get(studentId);

                return sendJson(res, 200, {
                    student,
                    grades,
                    summary: summary ? {
                        ...summary,
                        extracurriculars: JSON.parse(summary.extracurricular_json || '[]')
                    } : null
                });
            }

            return sendJson(res, 404, { error: 'Endpoint API tidak ditemukan' });
        } catch (err) {
            console.error('API Error:', err);
            return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
        }
    }

    // --- STATIC FILE SERVING ---
    let relativePath = pathname;
    if (relativePath === '/') relativePath = '/index.html';
    if (relativePath === '/portal/login') relativePath = '/masuk.html';
    if (!path.extname(relativePath)) {
        // Coba periksa apakah file .html ada
        const candidateHtml = relativePath + '.html';
        if (fs.existsSync(path.join(publicDir, candidateHtml))) {
            relativePath = candidateHtml;
        } else {
            relativePath = path.join(relativePath, 'index.html');
        }
    }

    const filePath = path.join(publicDir, relativePath);

    // Pastikan tidak path traversal
    if (!filePath.startsWith(publicDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Akses Ditolak');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback ke 404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <title>404 - Halaman Tidak Ditemukan | SISTLABUM</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; color: #0f172a; }
                        h1 { color: #1e3a8a; }
                        a { color: #0d9488; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>404 - Halaman Tidak Ditemukan</h1>
                    <p>Halaman <code>${pathname}</code> belum tersedia di prototipe ini.</p>
                    <p><a href="/">Kembali ke Beranda</a></p>
                </body>
                </html>
            `);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SISTLABUM Web Portal Prototype Berjalan di:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`   - Publik / Beranda: http://localhost:${PORT}/`);
    console.log(`   - Gateway Masuk:    http://localhost:${PORT}/masuk.html`);
    console.log(`   - PPDB Online:      http://localhost:${PORT}/ppdb.html`);
    console.log(`   - Portal Siswa:     http://localhost:${PORT}/siswa/`);
    console.log(`   - Web CBT Exam:     http://localhost:${PORT}/siswa/cbt.html`);
    console.log(`   - Portal Orang Tua: http://localhost:${PORT}/ortu/`);
    console.log(`   - Admin & Guru:     http://localhost:${PORT}/admin/`);
    console.log(`====================================================`);
});
