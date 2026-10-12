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
    getAssignments: (classId) => API.get(`/assignments?class_id=${classId}`)
};

window.API = API;
