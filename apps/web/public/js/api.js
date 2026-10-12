// SISTLABUM Client API Helper (Connects to Node.js + SQLite Backend)

const API = {
    async get(endpoint) {
        try {
            const res = await fetch(`/api${endpoint}`);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`API GET ${endpoint} Error:`, err);
            throw err;
        }
    },

    async post(endpoint, data) {
        try {
            const res = await fetch(`/api${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`API POST ${endpoint} Error:`, err);
            throw err;
        }
    },

    // 1. Data Sekolah
    getSchool: () => API.get('/school'),
    getAnnouncements: () => API.get('/announcements'),

    // 2. Data Siswa & Wali
    getStudents: (params = '') => API.get(`/students${params ? '?' + params : ''}`),
    getStudentById: (id) => API.get(`/students/${id}`),
    getGuardians: () => API.get('/guardians'),
    getGuardianChildren: (guardianId) => API.get(`/guardians/${guardianId}/children`),

    // 3. Presensi & Izin
    getTodayAttendance: () => API.get('/attendance/today'),
    getStudentAttendance: (studentId) => API.get(`/attendance/student/${studentId}`),
    getLeaveRequests: (studentId = '') => API.get(`/leave-requests${studentId ? '?student_id=' + studentId : ''}`),
    createLeaveRequest: (data) => API.post('/leave-requests', data),

    // 4. CBT Exam
    getCbtExam: (examId, studentId = 1) => API.get(`/cbt/exam/${examId}?student_id=${studentId}`),
    saveCbtAnswer: (data) => API.post('/cbt/save-answer', data),
    toggleCbtDoubt: (data) => API.post('/cbt/toggle-doubt', data),
    logCbtViolation: (data) => API.post('/cbt/log-violation', data),
    finishCbtExam: (data) => API.post('/cbt/finish', data),
    getCbtMonitor: (examId) => API.get(`/cbt/monitor/${examId}`),

    // 5. Nilai & Rapor
    getStudentGrades: (studentId) => API.get(`/grades/student/${studentId}`),
    getClassGrades: (classId, subjectId) => API.get(`/grades/class/${classId}/subject/${subjectId}`),
    getAssignments: (classId = 4) => API.get(`/assignments?class_id=${classId}`),

    // 6. Profil Siswa Lengkap
    getStudentProfile: (studentId = 1) => API.get(`/student/profile?id=${studentId}`),

    // 7. Perpustakaan Digital & Peminjaman
    getLibraryBooks: (category = '', query = '') => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (query) params.append('q', query);
        const qStr = params.toString();
        return API.get(`/library/books${qStr ? '?' + qStr : ''}`);
    },
    getLibraryLoans: (studentId = 1) => API.get(`/library/loans?student_id=${studentId}`),
    borrowBook: (data) => API.post('/library/borrow', data),

    // 8. Ujian Bertingkat (UH, UB, UTS, UAS)
    getExamsList: (type = '', classId = 4) => {
        let url = `/exams/list?class_id=${classId}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        return API.get(url);
    },

    // 9. Modul Pelajaran Mandiri (PDF)
    getLearningModules: (classId = 4, subjectId = '') => {
        let url = `/learning-modules?class_id=${classId}`;
        if (subjectId) url += `&subject_id=${encodeURIComponent(subjectId)}`;
        return API.get(url);
    },

    // 10. Informasi Kelas Lengkap (Struktur, Piket, Teman, Guru)
    getClassInfo: (classId = 4) => API.get(`/class-info?class_id=${classId}`),

    // 11. E-Rapor Komprehensif
    getReportCard: (studentId = 1) => API.get(`/report-card?student_id=${studentId}`),

    // 12. Guru & Wali Kelas Control Methods
    createLearningModule: (data) => API.post('/learning-modules', data),
    deleteLearningModule: (id) => {
        return fetch(`/api/learning-modules/${id}`, { method: 'DELETE' }).then(res => res.json());
    },
    createExam: (data) => API.post('/exams/create', data),
    updateExamStatus: (data) => API.post('/exams/update-status', data),
    updateClassOrganization: (data) => API.post('/class-organization/update', data),
    updateClassDuty: (data) => API.post('/class-duty/update', data),
    updateStudentPoints: (data) => API.post('/students/points', data),
    createAssignment: (data) => API.post('/assignments', data),
    saveClassGrades: (data) => API.post('/grades/save', data),
    submitAssignment: (data) => API.post('/assignments/submit', data),

    // 13. Manajemen Guru Lengkap (Kelas yang Diajar, Jadwal, Slip Gaji, Presensi, Nilai Siswa)
    getTeacherClasses: (teacherId = 2) => API.get(`/teacher/classes?teacher_id=${teacherId}`),
    getTeacherSchedule: (teacherId = 2) => API.get(`/teacher/schedule?teacher_id=${teacherId}`),
    getTeacherPayrolls: (teacherId = 2) => API.get(`/teacher/payroll?teacher_id=${teacherId}`),
    getTeacherPayrollSlip: (id) => API.get(`/teacher/payroll/${id}`),
    getTeacherAttendance: (teacherId = 2) => API.get(`/teacher/attendance?teacher_id=${teacherId}`),
    getTeacherStudentGrades: (classId = 4, subjectId = 2) => API.get(`/teacher/student-grades?class_id=${classId}&subject_id=${subjectId}`),
    saveSingleStudentGrade: (data) => API.post('/teacher/student-grades/save-single', data)
};

window.API = API;
