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
                const targetDate = parsedUrl.searchParams.get('date') || '2026-10-12';
                const rows = db.prepare(`
                    SELECT a.*, s.name as student_name, s.nis, c.name as class_name
                    FROM attendance_logs a
                    JOIN students s ON a.student_id = s.id
                    JOIN classes c ON s.class_id = c.id
                    WHERE a.date = ?
                    ORDER BY a.gate_in_time DESC
                `).all(targetDate);
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

            // 15.2 Simpan Lembar Nilai Spreadsheet Guru ke SQLite
            if (pathname === '/api/grades/save' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { subject_id, grades } = body;
                if (!subject_id || !Array.isArray(grades)) {
                    return sendJson(res, 400, { error: 'Subject ID dan daftar nilai wajib diisi' });
                }

                for (const g of grades) {
                    const existing = db.prepare('SELECT id FROM grades WHERE student_id = ? AND subject_id = ?').get(g.student_id, subject_id);
                    if (existing) {
                        db.prepare(`
                            UPDATE grades SET
                                score_tasks = ?,
                                score_uh = ?,
                                score_pts = ?,
                                score_pas = ?,
                                final_score = ?,
                                predicate = ?,
                                character_notes = ?
                            WHERE id = ?
                        `).run(
                            Number(g.score_tasks) || 0,
                            Number(g.score_uh) || 0,
                            Number(g.score_pts) || 0,
                            Number(g.score_pas) || 0,
                            Number(g.final_score) || 0,
                            g.predicate || 'B',
                            g.character_notes || 'Capaian kompetensi tuntas.',
                            existing.id
                        );
                    } else {
                        db.prepare(`
                            INSERT INTO grades (student_id, subject_id, semester, score_tasks, score_uh, score_pts, score_pas, final_score, predicate, character_notes)
                            VALUES (?, ?, 'Ganjil', ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                            g.student_id,
                            subject_id,
                            Number(g.score_tasks) || 0,
                            Number(g.score_uh) || 0,
                            Number(g.score_pts) || 0,
                            Number(g.score_pas) || 0,
                            Number(g.final_score) || 0,
                            g.predicate || 'B',
                            g.character_notes || 'Capaian kompetensi tuntas.'
                        );
                    }

                    // Recalculate average_score in report_card_summaries
                    const avg = db.prepare('SELECT ROUND(AVG(final_score), 2) as avg_score FROM grades WHERE student_id = ?').get(g.student_id);
                    if (avg && avg.avg_score) {
                        db.prepare('UPDATE report_card_summaries SET average_score = ? WHERE student_id = ?').run(avg.avg_score, g.student_id);
                    }
                }

                return sendJson(res, 200, {
                    success: true,
                    message: `Berhasil menyimpan nilai ${grades.length} siswa ke basis data sekolah.`
                });
            }

            // 16. Tugas LMS
            if (pathname === '/api/assignments' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const studentId = parsedUrl.searchParams.get('student_id') || 1;
                const rows = db.prepare(`
                    SELECT a.*, s.name as subject_name,
                           subm.submitted_at, subm.file_name as submitted_file, subm.score as submission_score,
                           subm.feedback as submission_feedback, subm.status as submission_status,
                           (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
                           (SELECT COUNT(*) FROM students WHERE class_id = a.class_id) as total_students
                    FROM assignments a
                    JOIN subjects s ON a.subject_id = s.id
                    LEFT JOIN assignment_submissions subm ON a.id = subm.assignment_id AND subm.student_id = ?
                    WHERE a.class_id = ?
                    ORDER BY a.due_date ASC
                `).all(studentId, classId);
                return sendJson(res, 200, rows);
            }

            // 16.2 Siswa: Kirimkan Berkas Tugas
            if (pathname === '/api/assignments/submit' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { assignment_id, student_id = 1, file_name = 'jawaban_tugas.pdf' } = body;
                if (!assignment_id) {
                    return sendJson(res, 400, { error: 'Assignment ID wajib diisi' });
                }

                const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const existing = db.prepare('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?').get(assignment_id, student_id);
                if (existing) {
                    db.prepare('UPDATE assignment_submissions SET file_name = ?, submitted_at = ?, status = ? WHERE id = ?')
                        .run(file_name, now, 'Telah Dikumpulkan', existing.id);
                } else {
                    db.prepare('INSERT INTO assignment_submissions (assignment_id, student_id, file_name, submitted_at, status) VALUES (?, ?, ?, ?, ?)')
                        .run(assignment_id, student_id, file_name, now, 'Telah Dikumpulkan');
                }

                return sendJson(res, 200, { success: true, message: 'Tugas berhasil dikumpulkan dan tersimpan di server!' });
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
                    tasks_description: d.task_notes,
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

            // 25.2 Jadwal Pelajaran Kelas untuk Siswa
            if (pathname === '/api/class-schedule' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const dayName = parsedUrl.searchParams.get('day');
                let query = `
                    SELECT ts.*, c.name as class_name, c.room_number,
                           sub.name as subject_name, sub.code as subject_code,
                           t.name as teacher_name, t.title as teacher_title
                    FROM teaching_schedules ts
                    JOIN classes c ON ts.class_id = c.id
                    JOIN subjects sub ON ts.subject_id = sub.id
                    JOIN teachers t ON ts.teacher_id = t.id
                    WHERE ts.class_id = ?
                `;
                const params = [classId];
                if (dayName) {
                    query += ` AND ts.day_name = ?`;
                    params.push(dayName);
                }
                query += ` ORDER BY ts.start_time ASC`;
                const schedules = db.prepare(query).all(...params);
                return sendJson(res, 200, schedules);
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

            // 27. Guru: Tambah Modul Pembelajaran PDF Baru
            if (pathname === '/api/learning-modules' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const {
                    class_id = 4,
                    subject_id = 2,
                    teacher_id = 1,
                    title,
                    chapter = 'Bab 1',
                    description = 'Modul ajar resmi untuk siswa.',
                    file_name = 'modul_ajar.pdf',
                    file_size = '3.5 MB'
                } = body;

                if (!title) return sendJson(res, 400, { error: 'Judul modul wajib diisi' });

                const now = new Date().toISOString().split('T')[0];
                const ins = db.prepare(`
                    INSERT INTO learning_modules (class_id, subject_id, teacher_id, title, chapter, description, file_name, file_size, upload_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(class_id, subject_id, teacher_id, title, chapter || 'Bab 1', description, file_name, file_size, now);

                return sendJson(res, 201, {
                    success: true,
                    id: Number(ins.lastInsertRowid),
                    message: `Modul "${title}" berhasil diunggah dan dirilis ke kelas.`
                });
            }

            // 28. Guru: Hapus Modul Pembelajaran
            if (pathname.startsWith('/api/learning-modules/') && req.method === 'DELETE') {
                const moduleId = pathname.split('/')[3];
                db.prepare('DELETE FROM learning_modules WHERE id = ?').run(moduleId);
                return sendJson(res, 200, { success: true, message: 'Modul berhasil dihapus.' });
            }

            // 29. Guru: Buat Jadwal Ujian Baru
            if (pathname === '/api/exams/create' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const {
                    title,
                    subject_id = 2,
                    class_id = 4,
                    duration_minutes = 60,
                    exam_type = 'UH',
                    token = 'TOKEN' + Math.floor(100 + Math.random() * 900),
                    teacher_name = 'Budi Santoso, S.Kom.',
                    scheduled_date = new Date().toISOString().split('T')[0],
                    scheduled_time = '08:00 - 09:30',
                    question_count = 25,
                    code = 'EXAM-' + Date.now(),
                    status = 'Terjadwal'
                } = body;

                if (!title) return sendJson(res, 400, { error: 'Judul ujian wajib diisi' });

                const ins = db.prepare(`
                    INSERT INTO exams (code, title, subject_id, class_id, duration_minutes, question_count, status, token, exam_type, teacher_name, scheduled_date, scheduled_time, score_achieved)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
                `).run(code, title, subject_id, class_id, duration_minutes, question_count, status, token, exam_type, teacher_name, scheduled_date, scheduled_time);

                return sendJson(res, 201, {
                    success: true,
                    id: Number(ins.lastInsertRowid),
                    message: `Ujian "${title}" berhasil dijadwalkan dengan Token: ${token}`
                });
            }

            // 30. Guru: Update Status Ujian (Aktifkan / Selesaikan / Ganti Token)
            if (pathname === '/api/exams/update-status' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { id, status, token } = body;
                if (!id || !status) return sendJson(res, 400, { error: 'ID dan status ujian wajib diisi' });

                if (token) {
                    db.prepare('UPDATE exams SET status = ?, token = ? WHERE id = ?').run(status, token, id);
                } else {
                    db.prepare('UPDATE exams SET status = ? WHERE id = ?').run(status, id);
                }

                return sendJson(res, 200, {
                    success: true,
                    message: `Status ujian ID ${id} diperbarui menjadi: ${status}`
                });
            }

            // 31. Wali Kelas: Update Struktur Organisasi Kelas
            if (pathname === '/api/class-organization/update' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { id, student_name, student_nis } = body;
                if (!id || !student_name) return sendJson(res, 400, { error: 'ID dan nama siswa wajib diisi' });

                db.prepare('UPDATE class_organization SET student_name = ?, student_nis = ? WHERE id = ?').run(student_name, student_nis || '', id);
                return sendJson(res, 200, { success: true, message: 'Jabatan kepengurusan berhasil diperbarui.' });
            }

            // 32. Wali Kelas: Update Jadwal Piket Harian
            if (pathname === '/api/class-duty/update' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { id, members, task_notes, tasks_description } = body;
                if (!id || !members) return sendJson(res, 400, { error: 'ID dan daftar anggota piket wajib diisi' });

                const membersJson = JSON.stringify(members);
                const notes = task_notes || tasks_description || 'Piket kebersihan rutin ruang kelas';
                db.prepare('UPDATE class_duty_schedules SET member_names_json = ?, task_notes = ? WHERE id = ?')
                    .run(membersJson, notes, id);

                return sendJson(res, 200, { success: true, message: 'Jadwal piket berhasil diperbarui.' });
            }

            // 33. Wali Kelas / Guru BK: Update Poin Reward & Pelanggaran Siswa
            if (pathname === '/api/students/points' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { student_id, reward_delta = 0, violation_delta = 0, note = '' } = body;
                if (!student_id) return sendJson(res, 400, { error: 'ID siswa wajib diisi' });

                const current = db.prepare('SELECT points_reward, points_violation, name FROM students WHERE id = ?').get(student_id);
                if (!current) return sendJson(res, 404, { error: 'Siswa tidak ditemukan' });

                const newReward = Math.max(0, current.points_reward + Number(reward_delta));
                const newViolation = Math.max(0, current.points_violation + Number(violation_delta));

                db.prepare('UPDATE students SET points_reward = ?, points_violation = ? WHERE id = ?')
                    .run(newReward, newViolation, student_id);

                return sendJson(res, 200, {
                    success: true,
                    student_id,
                    student_name: current.name,
                    points_reward: newReward,
                    points_violation: newViolation,
                    message: `Poin untuk ${current.name} berhasil diperbarui (Reward: ${newReward}, Pelanggaran: ${newViolation}).`
                });
            }

            // 34. Guru: Buat Tugas LMS Baru
            if (pathname === '/api/assignments' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { class_id = 4, subject_id = 2, title, description, due_date } = body;
                if (!title || !due_date) return sendJson(res, 400, { error: 'Judul dan tenggat waktu wajib diisi' });

                const ins = db.prepare(`
                    INSERT INTO assignments (class_id, subject_id, title, description, due_date)
                    VALUES (?, ?, ?, ?, ?)
                `).run(class_id, subject_id, title, description || '', due_date);

                return sendJson(res, 201, {
                    success: true,
                    id: Number(ins.lastInsertRowid),
                    message: `Tugas "${title}" berhasil diterbitkan ke kelas.`
                });
            }

            // 35. Guru: Daftar Kelas yang Diajar & Progres Nilai Rapor
            if (pathname === '/api/teacher/classes' && req.method === 'GET') {
                const teacherId = parsedUrl.searchParams.get('teacher_id') || 2;
                const rows = db.prepare(`
                    SELECT ts.class_id, ts.subject_id,
                           c.name as class_name, c.level, c.room_number, c.homeroom_teacher, c.student_count,
                           sub.name as subject_name, sub.code as subject_code, sub.kkm,
                           SUM(ts.jp_count) as total_jp
                    FROM teaching_schedules ts
                    JOIN classes c ON ts.class_id = c.id
                    JOIN subjects sub ON ts.subject_id = sub.id
                    WHERE ts.teacher_id = ?
                    GROUP BY ts.class_id, ts.subject_id
                    ORDER BY c.level DESC, c.name ASC
                `).all(teacherId);

                const classesWithProgress = rows.map(r => {
                    const graded = db.prepare(`
                        SELECT COUNT(*) as cnt,
                               ROUND(AVG(final_score), 1) as avg_class_score,
                               SUM(CASE WHEN final_score >= ? THEN 1 ELSE 0 END) as passed_count
                        FROM grades g
                        JOIN students s ON g.student_id = s.id
                        WHERE s.class_id = ? AND g.subject_id = ?
                    `).get(r.kkm || 75, r.class_id, r.subject_id);

                    const totalStudents = r.student_count || 32;
                    const evaluatedCount = graded ? graded.cnt : 0;
                    const completionPct = Math.round((evaluatedCount / totalStudents) * 100);

                    return {
                        ...r,
                        evaluated_count: evaluatedCount,
                        passed_count: graded ? graded.passed_count || 0 : 0,
                        avg_class_score: graded && graded.avg_class_score ? graded.avg_class_score : 0,
                        completion_percentage: Math.min(100, completionPct),
                        status_rapor: completionPct >= 100 ? 'Siap Cetak Rapor' : 'Penginputan Berlangsung'
                    };
                });

                return sendJson(res, 200, classesWithProgress);
            }

            // 36. Guru: Jadwal Mengajar Mingguan
            if (pathname === '/api/teacher/schedule' && req.method === 'GET') {
                const teacherId = parsedUrl.searchParams.get('teacher_id') || 2;
                const schedules = db.prepare(`
                    SELECT ts.*, c.name as class_name, c.room_number, sub.name as subject_name, sub.code as subject_code
                    FROM teaching_schedules ts
                    JOIN classes c ON ts.class_id = c.id
                    JOIN subjects sub ON ts.subject_id = sub.id
                    WHERE ts.teacher_id = ?
                    ORDER BY 
                        CASE ts.day_name 
                            WHEN 'Senin' THEN 1 
                            WHEN 'Selasa' THEN 2 
                            WHEN 'Rabu' THEN 3 
                            WHEN 'Kamis' THEN 4 
                            WHEN 'Jumat' THEN 5 
                            WHEN 'Sabtu' THEN 6 
                            ELSE 7 
                        END, ts.start_time ASC
                `).all(teacherId);
                return sendJson(res, 200, schedules);
            }

            // 37. Guru: Riwayat & Dokumen Slip Gaji (Payroll P2LP UM)
            if (pathname === '/api/teacher/payroll' && req.method === 'GET') {
                const teacherId = parsedUrl.searchParams.get('teacher_id') || 2;
                const payrolls = db.prepare(`
                    SELECT p.*, t.name as teacher_name, t.nip, t.title as teacher_title, t.subject
                    FROM teacher_payrolls p
                    JOIN teachers t ON p.teacher_id = t.id
                    WHERE p.teacher_id = ?
                    ORDER BY p.id DESC
                `).all(teacherId);
                return sendJson(res, 200, payrolls);
            }

            if (pathname.startsWith('/api/teacher/payroll/') && req.method === 'GET') {
                const payrollId = pathname.split('/')[4];
                const slip = db.prepare(`
                    SELECT p.*, t.name as teacher_name, t.nip, t.title as teacher_title, t.subject, t.email, t.phone
                    FROM teacher_payrolls p
                    JOIN teachers t ON p.teacher_id = t.id
                    WHERE p.id = ?
                `).get(payrollId);
                if (!slip) return sendJson(res, 404, { error: 'Slip gaji tidak ditemukan' });
                return sendJson(res, 200, slip);
            }

            // 38. Guru: Rekap Absensi Mengajar & Kehadiran Guru
            if (pathname === '/api/teacher/attendance' && req.method === 'GET') {
                const teacherId = parsedUrl.searchParams.get('teacher_id') || 2;
                const logs = db.prepare(`
                    SELECT * FROM teacher_attendance_logs
                    WHERE teacher_id = ?
                    ORDER BY date DESC
                    LIMIT 30
                `).all(teacherId);

                // Rekap statistik kehadiran guru
                const totalDays = logs.length || 22;
                const onTimeCount = logs.filter(l => l.status.includes('Tepat Waktu')).length;

                return sendJson(res, 200, {
                    logs,
                    summary: {
                        total_working_days: totalDays,
                        present_days: logs.length,
                        on_time_percentage: logs.length > 0 ? Math.round((onTimeCount / logs.length) * 100) : 100,
                        leave_days: 0,
                        status: 'Disiplin Sangat Baik'
                    }
                });
            }

            // 38.2 Guru: Simpan Rekap Presensi KBM Siswa ke SQLite & Sinkronkan ke Rapor
            if (pathname === '/api/teacher/attendance/save-students' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const { class_id = 4, date = new Date().toISOString().split('T')[0], attendances = [] } = body;

                if (!Array.isArray(attendances) || attendances.length === 0) {
                    return sendJson(res, 400, { error: 'Daftar presensi siswa wajib diisi' });
                }

                for (const att of attendances) {
                    const studentId = att.student_id;
                    const status = att.status || 'Hadir';
                    const notes = att.notes || (status === 'Hadir' ? 'Mengikuti KBM tertib' : `Keterangan: ${status}`);

                    const existing = db.prepare('SELECT id FROM attendance_logs WHERE student_id = ? AND date = ?').get(studentId, date);
                    if (existing) {
                        db.prepare(`
                            UPDATE attendance_logs 
                            SET classroom_status = ?, notes = ?
                            WHERE id = ?
                        `).run(status, notes, existing.id);
                    } else {
                        const inTime = status === 'Hadir' ? '06:45:00' : null;
                        db.prepare(`
                            INSERT INTO attendance_logs (student_id, date, gate_in_time, classroom_status, notes)
                            VALUES (?, ?, ?, ?, ?)
                        `).run(studentId, date, inTime, status, notes);
                    }

                    // Sinkronkan ke report_card_summaries
                    const counts = db.prepare(`
                        SELECT 
                            SUM(CASE WHEN classroom_status = 'Sakit' THEN 1 ELSE 0 END) as sakit_count,
                            SUM(CASE WHEN classroom_status = 'Izin' THEN 1 ELSE 0 END) as izin_count,
                            SUM(CASE WHEN classroom_status = 'Alpa' THEN 1 ELSE 0 END) as alpa_count
                        FROM attendance_logs
                        WHERE student_id = ?
                    `).get(studentId);

                    if (counts) {
                        db.prepare(`
                            UPDATE report_card_summaries
                            SET attendance_sakit = ?, attendance_izin = ?, attendance_alpa = ?
                            WHERE student_id = ?
                        `).run(counts.sakit_count || 0, counts.izin_count || 0, counts.alpa_count || 0, studentId);
                    }
                }

                return sendJson(res, 200, {
                    success: true,
                    count: attendances.length,
                    message: `Berhasil menyimpan presensi ${attendances.length} siswa untuk tanggal ${date}. Data telah disinkronkan ke E-Rapor.`
                });
            }

            // 39. Guru: Detail Manajemen Nilai Tiap Siswa (Per-Siswa Mode)
            if (pathname === '/api/teacher/student-grades' && req.method === 'GET') {
                const classId = parsedUrl.searchParams.get('class_id') || 4;
                const subjectId = parsedUrl.searchParams.get('subject_id') || 2;

                const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(subjectId);
                const kkm = subject ? subject.kkm : 75;

                const students = db.prepare(`
                    SELECT s.id as student_id, s.name as student_name, s.nis, s.nisn, s.gender, s.avatar_color,
                           g.id as grade_id,
                           g.score_tasks, g.score_uh, g.score_pts, g.score_pas, g.final_score,
                           g.predicate, g.character_notes
                    FROM students s
                    LEFT JOIN grades g ON s.id = g.student_id AND g.subject_id = ?
                    WHERE s.class_id = ?
                    ORDER BY s.nis ASC
                `).all(subjectId, classId);

                const formatted = students.map(st => {
                    const hasFinal = st.final_score !== null && st.final_score !== undefined;
                    const finalVal = hasFinal ? Number(st.final_score) : 80;
                    const isComplete = hasFinal && Boolean(st.character_notes);
                    const isPassed = finalVal >= kkm;

                    let statusRapor = 'Belum Lengkap';
                    if (isComplete && isPassed) {
                        statusRapor = 'Siap Cetak Rapor';
                    } else if (hasFinal && !isPassed) {
                        statusRapor = 'Perlu Bimbingan / Remedial';
                    } else if (hasFinal && !st.character_notes) {
                        statusRapor = 'Catatan Rapor Belum Diisi';
                    }

                    return {
                        student_id: st.student_id,
                        student_name: st.student_name,
                        nis: st.nis,
                        nisn: st.nisn,
                        gender: st.gender,
                        avatar_color: st.avatar_color || '#1E3A8A',
                        grade_id: st.grade_id,
                        score_tasks: st.score_tasks !== null ? Number(st.score_tasks) : 80,
                        score_uh: st.score_uh !== null ? Number(st.score_uh) : 80,
                        score_pts: st.score_pts !== null ? Number(st.score_pts) : 80,
                        score_pas: st.score_pas !== null ? Number(st.score_pas) : 80,
                        final_score: finalVal,
                        predicate: st.predicate || (finalVal >= 90 ? 'A' : (finalVal >= 80 ? 'B' : 'C')),
                        character_notes: st.character_notes || 'Menunjukkan penguasaan capaian kompetensi dengan baik dan aktif berpartisipasi.',
                        kkm: kkm,
                        is_passed: isPassed,
                        status_rapor: statusRapor
                    };
                });

                return sendJson(res, 200, {
                    subject,
                    kkm,
                    students: formatted
                });
            }

            // 40. Guru: Simpan Nilai & Catatan Rapor Satu Siswa (Single Student)
            if (pathname === '/api/teacher/student-grades/save-single' && req.method === 'POST') {
                const body = await parseJsonBody(req);
                const {
                    student_id,
                    subject_id = 2,
                    score_tasks = 80,
                    score_uh = 80,
                    score_pts = 80,
                    score_pas = 80,
                    final_score,
                    predicate,
                    character_notes = 'Capaian kompetensi tuntas.'
                } = body;

                if (!student_id) return sendJson(res, 400, { error: 'Student ID wajib diisi' });

                // Hitung otomatis final_score jika tidak dikirim: 30% tugas + 20% uh + 25% pts + 25% pas
                const calcFinal = final_score !== undefined
                    ? Number(final_score)
                    : Math.round(Number(score_tasks) * 0.3 + Number(score_uh) * 0.2 + Number(score_pts) * 0.25 + Number(score_pas) * 0.25);

                const calcPred = predicate || (calcFinal >= 90 ? 'A' : (calcFinal >= 80 ? 'B' : (calcFinal >= 75 ? 'C' : 'D')));

                const existing = db.prepare('SELECT id FROM grades WHERE student_id = ? AND subject_id = ?').get(student_id, subject_id);
                if (existing) {
                    db.prepare(`
                        UPDATE grades SET
                            score_tasks = ?,
                            score_uh = ?,
                            score_pts = ?,
                            score_pas = ?,
                            final_score = ?,
                            predicate = ?,
                            character_notes = ?
                        WHERE id = ?
                    `).run(
                        Number(score_tasks),
                        Number(score_uh),
                        Number(score_pts),
                        Number(score_pas),
                        calcFinal,
                        calcPred,
                        character_notes,
                        existing.id
                    );
                } else {
                    db.prepare(`
                        INSERT INTO grades (student_id, subject_id, semester, score_tasks, score_uh, score_pts, score_pas, final_score, predicate, character_notes)
                        VALUES (?, ?, 'Ganjil', ?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        student_id,
                        subject_id,
                        Number(score_tasks),
                        Number(score_uh),
                        Number(score_pts),
                        Number(score_pas),
                        calcFinal,
                        calcPred,
                        character_notes
                    );
                }

                // Recalculate average_score & total_score in report_card_summaries
                const avg = db.prepare('SELECT ROUND(AVG(final_score), 2) as avg_score, ROUND(SUM(final_score), 2) as sum_score FROM grades WHERE student_id = ?').get(student_id);
                if (avg && avg.avg_score) {
                    db.prepare('UPDATE report_card_summaries SET average_score = ?, total_score = ? WHERE student_id = ?').run(avg.avg_score, avg.sum_score || 0, student_id);
                }

                const student = db.prepare('SELECT name, nis FROM students WHERE id = ?').get(student_id);

                return sendJson(res, 200, {
                    success: true,
                    message: `Nilai rapor untuk ${student ? student.name : 'Siswa'} berhasil disimpan dan disinkronkan ke E-Rapor.`,
                    data: {
                        student_id,
                        final_score: calcFinal,
                        predicate: calcPred,
                        character_notes,
                        new_gpa: avg ? avg.avg_score : calcFinal
                    }
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
