import axios from 'axios';
import { Assignment, AssignmentSubmission, LearningMaterial } from '@/types/lms';
import { MOCK_ASSIGNMENTS, MOCK_MATERIALS, MOCK_SUBMISSIONS } from './mock-lms-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sistlabum_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Flag to enable mock mode when backend is offline
let useMockFallback = true;

export const setMockFallback = (enabled: boolean) => {
  useMockFallback = enabled;
};

export const lmsApi = {
  // Materials (Modul Ajar)
  async getMaterials(classId?: string, subjectId?: string): Promise<LearningMaterial[]> {
    try {
      const response = await apiClient.get('/materials', {
        params: { class_id: classId, subject_id: subjectId }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        let results = [...MOCK_MATERIALS];
        if (classId) results = results.filter(m => m.class_id === classId);
        if (subjectId) results = results.filter(m => m.subject_id === subjectId);
        return results;
      }
      throw err;
    }
  },

  async createMaterial(formData: FormData): Promise<LearningMaterial> {
    try {
      const response = await apiClient.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const classId = formData.get('class_id') as string;
        const subjectId = formData.get('subject_id') as string;
        const file = formData.get('file') as globalThis.File | null;

        const category = (formData.get('category') as any) || 'modul_ajar';
        const version = (formData.get('version') as string) || 'v1.0';

        const newMat: LearningMaterial = {
          id: `mat-${Date.now()}`,
          class_id: classId || 'cls-9a',
          subject_id: subjectId || 'sbj-inf',
          teacher_id: 'tch-001',
          title: title || 'Modul Ajar Baru',
          description: description || '',
          category,
          version,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file: file ? {
            id: `fil-${Date.now()}`,
            object_key: `materials/${file.name}`,
            filename: file.name,
            mime_type: file.type || 'application/pdf',
            size_bytes: file.size,
          } : undefined
        };
        MOCK_MATERIALS.unshift(newMat);
        return newMat;
      }
      throw err;
    }
  },

  // Assignments (Tugas Siswa)
  async getAssignments(classId?: string, subjectId?: string): Promise<Assignment[]> {
    try {
      const response = await apiClient.get('/assignments', {
        params: { class_id: classId, subject_id: subjectId }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        let results = [...MOCK_ASSIGNMENTS];
        if (classId) results = results.filter(a => a.class_id === classId);
        if (subjectId) results = results.filter(a => a.subject_id === subjectId);
        return results;
      }
      throw err;
    }
  },

  async getAssignmentDetail(id: string): Promise<Assignment> {
    try {
      const response = await apiClient.get(`/assignments/${id}`);
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const found = MOCK_ASSIGNMENTS.find(a => a.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  async createAssignment(payload: {
    class_id: string;
    subject_id: string;
    title: string;
    description: string;
    due_at: string;
    max_score: number;
    file?: globalThis.File;
  }): Promise<Assignment> {
    try {
      const formData = new FormData();
      formData.append('class_id', payload.class_id);
      formData.append('subject_id', payload.subject_id);
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('due_at', payload.due_at);
      formData.append('max_score', String(payload.max_score));
      if (payload.file) {
        formData.append('file', payload.file);
      }

      const response = await apiClient.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const newAsg: Assignment = {
          id: `asg-${Date.now()}`,
          class_id: payload.class_id,
          subject_id: payload.subject_id,
          teacher_id: 'tch-001',
          title: payload.title,
          description: payload.description,
          due_at: payload.due_at,
          max_score: payload.max_score || 100,
          is_locked: false,
          allow_late: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          submissions_count: 0,
          total_students: 32,
          reviewed_count: 0,
          file: payload.file ? {
            id: `fil-${Date.now()}`,
            object_key: `assignments/${payload.file.name}`,
            filename: payload.file.name,
            mime_type: payload.file.type,
            size_bytes: payload.file.size
          } : undefined
        };
        MOCK_ASSIGNMENTS.unshift(newAsg);
        return newAsg;
      }
      throw err;
    }
  },

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        return MOCK_SUBMISSIONS[assignmentId] || [];
      }
      throw err;
    }
  },

  async gradeSubmission(assignmentId: string, submissionId: string, payload: {
    score: number;
    feedback?: string;
  }): Promise<AssignmentSubmission> {
    try {
      const response = await apiClient.patch(
        `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        payload
      );
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const subs = MOCK_SUBMISSIONS[assignmentId] || [];
        const item = subs.find(s => s.id === submissionId);
        if (item) {
          item.score = payload.score;
          item.feedback = payload.feedback || '';
          item.graded_at = new Date().toISOString();

          // update reviewed count on assignment
          const asg = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
          if (asg) {
            asg.reviewed_count = subs.filter(s => s.score !== null).length;
          }
          return { ...item };
        }
      }
      throw err;
    }
  },

  // ─── BE-ACD-02 & BE-ACD-03: Jurnal Mengajar & Presensi Sesi KBM ───
  async getJournals(classId?: string, subjectId?: string): Promise<import('@/types/lms').TeachingJournal[]> {
    try {
      const response = await apiClient.get('/journals', {
        params: { class_id: classId, subject_id: subjectId }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_JOURNALS } = await import('./mock-lms-data');
        let results = [...MOCK_JOURNALS];
        if (classId) results = results.filter(j => j.class_id === classId);
        if (subjectId) results = results.filter(j => j.subject_id === subjectId);
        return results;
      }
      throw err;
    }
  },

  async getSchedules(): Promise<import('@/types/lms').TeachingSchedule[]> {
    try {
      const response = await apiClient.get('/schedules');
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_SCHEDULES } = await import('./mock-lms-data');
        return MOCK_SCHEDULES;
      }
      throw err;
    }
  },

  async getStudentRoster(classId?: string): Promise<import('@/types/lms').StudentRosterItem[]> {
    try {
      const response = await apiClient.get('/students', { params: { class_id: classId } });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_STUDENTS_ROSTER } = await import('./mock-lms-data');
        return MOCK_STUDENTS_ROSTER;
      }
      throw err;
    }
  },

  async createJournalWithAttendance(payload: {
    schedule_id: string;
    session_date: string;
    topic: string;
    method: string;
    notes?: string;
    attendances: { student_id: string; status: import('@/types/lms').AttendanceStatus; note?: string }[];
  }): Promise<import('@/types/lms').TeachingJournal> {
    try {
      // 1. Create Journal
      const journalRes = await apiClient.post('/journals', {
        schedule_id: payload.schedule_id,
        session_date: payload.session_date,
        topic: payload.topic,
        method: payload.method,
        notes: payload.notes
      });
      const createdJournal = journalRes.data.data;

      // 2. Batch Session Attendance
      await apiClient.post('/attendances', {
        journal_id: createdJournal.id,
        attendances: payload.attendances
      });

      return createdJournal;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_JOURNALS, MOCK_CLASSES, MOCK_SUBJECTS } = await import('./mock-lms-data');
        const hadirCount = payload.attendances.filter(a => a.status === 'hadir').length;
        const sakitCount = payload.attendances.filter(a => a.status === 'sakit').length;
        const izinCount = payload.attendances.filter(a => a.status === 'izin').length;
        const alpaCount = payload.attendances.filter(a => a.status === 'alpa').length;
        const terlambatCount = payload.attendances.filter(a => a.status === 'terlambat').length;
        const total = payload.attendances.length;

        const newJournal: import('@/types/lms').TeachingJournal = {
          id: `jrn-${Date.now()}`,
          schedule_id: payload.schedule_id,
          teacher_id: 'tch-001',
          class_id: 'cls-9a',
          subject_id: 'sbj-inf',
          meeting_number: MOCK_JOURNALS.length + 1,
          session_date: payload.session_date,
          time_range: '07:30 - 09:00 WIB',
          room_name: 'Lab Komputer 1',
          topic: payload.topic,
          method: payload.method,
          notes: payload.notes,
          attendance_summary: {
            total,
            hadir: hadirCount,
            sakit: sakitCount,
            izin: izinCount,
            alpa: alpaCount,
            terlambat: terlambatCount,
            attendance_rate: Math.round(((hadirCount + terlambatCount) / (total || 1)) * 100)
          },
          class: MOCK_CLASSES[0],
          subject: MOCK_SUBJECTS[0],
          created_at: new Date().toISOString()
        };

        MOCK_JOURNALS.unshift(newJournal);
        return newJournal;
      }
      throw err;
    }
  },

  // ─── BE-GRD-01: Buku Nilai & Komponen Nilai ───
  async getGradeComponents(classId?: string, subjectId?: string): Promise<import('@/types/lms').GradeComponent[]> {
    try {
      const response = await apiClient.get('/grade-components', {
        params: { class_id: classId, subject_id: subjectId }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_GRADE_COMPONENTS_DETAILED } = await import('./mock-lms-data');
        return MOCK_GRADE_COMPONENTS_DETAILED;
      }
      throw err;
    }
  },

  async getGradebook(classId: string, subjectId: string): Promise<{
    period: import('@/types/lms').GradebookPeriod;
    components: import('@/types/lms').GradeComponent[];
    grades: import('@/types/lms').StudentGradeRow[];
  }> {
    try {
      const response = await apiClient.get('/grades', {
        params: { class_id: classId, subject_id: subjectId }
      });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_GRADE_COMPONENTS_DETAILED, MOCK_GRADEBOOK_PERIOD, MOCK_STUDENT_GRADES } = await import('./mock-lms-data');
        return {
          period: MOCK_GRADEBOOK_PERIOD,
          components: MOCK_GRADE_COMPONENTS_DETAILED,
          grades: MOCK_STUDENT_GRADES,
        };
      }
      throw err;
    }
  },

  async saveBulkGrades(payload: {
    class_id: string;
    subject_id: string;
    grades: { student_id: string; scores: Record<string, number | null> }[];
  }): Promise<{ success: boolean; updated_count: number }> {
    try {
      const response = await apiClient.post('/grades/bulk', payload);
      return response.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_STUDENT_GRADES } = await import('./mock-lms-data');
        payload.grades.forEach(g => {
          const row = MOCK_STUDENT_GRADES.find(s => s.student_id === g.student_id);
          if (row) {
            row.scores = { ...row.scores, ...g.scores };
            const scoreValues = Object.values(row.scores).filter((v): v is number => v !== null);
            if (scoreValues.length > 0) {
              const sum = scoreValues.reduce((a, b) => a + b, 0);
              row.final_score = Math.round((sum / scoreValues.length) * 10) / 10;
              row.is_tuntas = row.final_score >= 75;
            }
          }
        });
        return { success: true, updated_count: payload.grades.length };
      }
      throw err;
    }
  },

  async lockGradePeriod(periodId: string, lock: boolean): Promise<import('@/types/lms').GradebookPeriod> {
    try {
      const response = await apiClient.patch(`/grade-periods/${periodId}/lock`, { is_locked: lock });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_GRADEBOOK_PERIOD } = await import('./mock-lms-data');
        MOCK_GRADEBOOK_PERIOD.is_locked = lock;
        MOCK_GRADEBOOK_PERIOD.locked_at = lock ? new Date().toISOString() : null;
        MOCK_GRADEBOOK_PERIOD.locked_by = lock ? 'Budi Santoso, S.Kom., M.T.' : null;
        return { ...MOCK_GRADEBOOK_PERIOD };
      }
      throw err;
    }
  },

  // ─── BE-CBT-01 & BE-CBT-02: Bank Soal & Ujian CBT ───
  async getCBTQuestions(subjectId?: string): Promise<import('@/types/lms').CBTQuestion[]> {
    try {
      const response = await apiClient.get('/questions', { params: { subject_id: subjectId } });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_CBT_QUESTIONS } = await import('./mock-lms-data');
        return MOCK_CBT_QUESTIONS;
      }
      throw err;
    }
  },

  async getCBTExams(classId?: string, subjectId?: string): Promise<import('@/types/lms').CBTExam[]> {
    try {
      const response = await apiClient.get('/exams', { params: { class_id: classId, subject_id: subjectId } });
      return response.data.data;
    } catch (err) {
      if (useMockFallback) {
        const { MOCK_CBT_EXAMS } = await import('./mock-lms-data');
        return MOCK_CBT_EXAMS;
      }
      throw err;
    }
  }
};

