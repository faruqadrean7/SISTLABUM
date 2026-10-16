import { apiClient } from '@/lib/api/api-client';
import { executeWithMockFallback } from '@/lib/api/mock-mode';
import {
  TeacherClass,
  TeacherSubject,
  TeacherScheduleItem,
  TeacherAttendanceStudent,
  TeacherAttendanceSessionPayload,
  TeacherJournalItem,
  TeacherGradeComponent,
  TeacherStudentGrade,
  TeacherMaterialItem,
  TeacherAssignmentItem,
  TeacherAssignmentSubmission,
  TeacherExamItem,
  TeacherLeaveRequest,
  TeacherSalarySlipItem,
  TeacherSelfAttendance,
  TeacherHomeroomData,
} from './types';

const loadGuruMock =
  process.env.NODE_ENV !== 'production'
    ? () => import('./guru-mock-data')
    : null;

export const guruApi = {
  // === JADWAL & KELAS BINAAN ===
  async getTeacherClasses(): Promise<TeacherClass[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherClass[]>('/me/teacher/classes');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_CLASSES) : undefined
    );
  },

  async getTeacherSchedules(): Promise<TeacherScheduleItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherScheduleItem[]>('/me/teacher/schedules');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_SCHEDULES) : undefined
    );
  },

  // === PRESENSI KBM ===
  async getAttendanceStudents(classId: string): Promise<TeacherAttendanceStudent[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherAttendanceStudent[]>(`/me/teacher/classes/${classId}/students`);
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_CLASS_STUDENTS[classId] || m.MOCK_CLASS_STUDENTS['cls-7a']) : undefined
    );
  },

  async recordAttendanceSession(payload: TeacherAttendanceSessionPayload): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ message: string }>('/me/teacher/attendance/sessions', payload);
    return { success: true, message: res.data?.message || 'Presensi KBM berhasil disimpan.' };
  },

  // === JURNAL MENGAJAR ===
  async getJournals(): Promise<TeacherJournalItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherJournalItem[]>('/me/teacher/journals');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_JOURNALS) : undefined
    );
  },

  async createJournal(payload: Partial<TeacherJournalItem>): Promise<TeacherJournalItem> {
    const res = await apiClient.post<TeacherJournalItem>('/me/teacher/journals', payload);
    return res.data;
  },

  // === BUKU NILAI ===
  async getGradeComponents(classId: string, subjectId: string): Promise<TeacherGradeComponent[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherGradeComponent[]>('/me/teacher/grade-components', {
          params: { class_id: classId, subject_id: subjectId },
        });
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_GRADE_COMPONENTS) : undefined
    );
  },

  async getStudentGrades(classId: string, subjectId: string): Promise<TeacherStudentGrade[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherStudentGrade[]>('/me/teacher/grades', {
          params: { class_id: classId, subject_id: subjectId },
        });
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_STUDENT_GRADES[classId] || m.MOCK_STUDENT_GRADES['cls-7a']) : undefined
    );
  },

  async updateBulkGrades(
    classId: string,
    subjectId: string,
    grades: TeacherStudentGrade[]
  ): Promise<{ success: boolean; message: string }> {
    await apiClient.post('/me/teacher/grades/bulk', {
      class_id: classId,
      subject_id: subjectId,
      grades,
    });
    return { success: true, message: 'Buku nilai berhasil disimpan.' };
  },

  // === MATERI & MODUL AJAR ===
  async getMaterials(): Promise<TeacherMaterialItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherMaterialItem[]>('/me/teacher/materials');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_MATERIALS) : undefined
    );
  },

  async createMaterial(payload: Partial<TeacherMaterialItem>): Promise<TeacherMaterialItem> {
    const res = await apiClient.post<TeacherMaterialItem>('/me/teacher/materials', payload);
    return res.data;
  },

  // === TUGAS KBM ===
  async getAssignments(): Promise<TeacherAssignmentItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherAssignmentItem[]>('/me/teacher/assignments');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_ASSIGNMENTS) : undefined
    );
  },

  async createAssignment(payload: Partial<TeacherAssignmentItem>): Promise<TeacherAssignmentItem> {
    const res = await apiClient.post<TeacherAssignmentItem>('/me/teacher/assignments', payload);
    return res.data;
  },

  async getAssignmentSubmissions(assignmentId: string): Promise<TeacherAssignmentSubmission[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherAssignmentSubmission[]>(`/me/teacher/assignments/${assignmentId}/submissions`);
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_ASSIGNMENT_SUBMISSIONS[assignmentId] || m.MOCK_ASSIGNMENT_SUBMISSIONS['asg-1']) : undefined
    );
  },

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<{ success: boolean; message: string }> {
    await apiClient.post(`/me/teacher/submissions/${submissionId}/grade`, { score, feedback });
    return { success: true, message: 'Nilai dan feedback berhasil diberikan.' };
  },

  // === UJIAN CBT & PENGAWAS ===
  async getTeacherExams(): Promise<TeacherExamItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherExamItem[]>('/me/teacher/exams');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_EXAMS) : undefined
    );
  },

  // === IZIN & CUTI GURU ===
  async getLeaveRequests(): Promise<TeacherLeaveRequest[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherLeaveRequest[]>('/me/teacher/leave-requests');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_LEAVE) : undefined
    );
  },

  async createLeaveRequest(payload: {
    leaveType: 'sick' | 'annual' | 'family' | 'duty';
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message: string }> {
    await apiClient.post('/me/teacher/leave-requests', payload);
    return { success: true, message: 'Permohonan izin berhasil diajukan.' };
  },

  // === SLIP GAJI MANDIRI (TERHUBUNG KE BACKEND RESMI) ===
  async getSalarySlips(): Promise<TeacherSalarySlipItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<{ data: any[] }>('/salary-slips');
        if (res.data?.data && Array.isArray(res.data.data)) {
          return res.data.data.map((item) => ({
            id: item.id,
            slipNumber: item.slip_number || `SLIP-${item.id}`,
            periodMonth: item.period_month || item.period || 'Periode Berjalan',
            basicSalary: Number(item.basic_salary || 0),
            teachingAllowance: Number(item.teaching_allowance || 0),
            functionalAllowance: Number(item.functional_allowance || 0),
            deduction: Number(item.deduction || 0),
            totalNetSalary: Number(item.total_net_salary || item.net_salary || 0),
            paymentDate: item.payment_date || item.created_at,
            isPaid: Boolean(item.is_paid ?? true),
            downloadUrl: `/api/v1/salary-slips/${item.id}/download`,
          }));
        }
        return [];
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_TEACHER_SALARY_SLIPS) : undefined
    );
  },

  // === PRESENSI MANDIRI GURU ===
  async getSelfAttendance(): Promise<TeacherSelfAttendance> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherSelfAttendance>('/me/teacher/self-attendance');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_SELF_ATTENDANCE) : undefined
    );
  },

  async recordSelfAttendance(action: 'check_in' | 'check_out'): Promise<{ success: boolean; message: string; timestamp: string }> {
    const now = new Date().toTimeString().split(' ')[0];
    await apiClient.post('/me/teacher/self-attendance', { action });
    return { success: true, message: `Berhasil melakukan ${action === 'check_in' ? 'Check-in' : 'Check-out'}.`, timestamp: now };
  },

  // === WALI KELAS (KONDISIONAL) ===
  async getHomeroomData(): Promise<TeacherHomeroomData> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<TeacherHomeroomData>('/me/teacher/homeroom');
        return res.data;
      },
      loadGuruMock ? () => loadGuruMock().then((m) => m.MOCK_HOMEROOM_DATA) : undefined
    );
  },
};
