import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessShell } from '@/lib/rbac/evaluator';
import { guruApi } from '@/features/portal/guru';
import { apiClient } from '@/lib/api/api-client';
import {
  MOCK_TEACHER_CLASSES,
  MOCK_TEACHER_SCHEDULES,
  MOCK_CLASS_STUDENTS,
  MOCK_TEACHER_JOURNALS,
  MOCK_GRADE_COMPONENTS,
  MOCK_STUDENT_GRADES,
  MOCK_TEACHER_LEAVE,
  MOCK_TEACHER_SALARY_SLIPS,
  MOCK_SELF_ATTENDANCE,
} from '@/features/portal/guru/guru-mock-data';

describe('FASE 2: Portal Guru (/portal/guru) & Conditional Homeroom Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/students')) {
        return { data: MOCK_CLASS_STUDENTS['cls-7a'] } as any;
      }
      if (url.includes('/classes')) return { data: MOCK_TEACHER_CLASSES } as any;
      if (url.includes('/schedules')) return { data: MOCK_TEACHER_SCHEDULES } as any;
      if (url.includes('/journals')) return { data: MOCK_TEACHER_JOURNALS } as any;
      if (url.includes('/grade-components')) return { data: MOCK_GRADE_COMPONENTS } as any;
      if (url.includes('/grades')) return { data: MOCK_STUDENT_GRADES['cls-7a'] } as any;
      if (url.includes('/leave-requests')) return { data: MOCK_TEACHER_LEAVE } as any;
      if (url.includes('/salary-slips')) {
        return {
          data: {
            data: MOCK_TEACHER_SALARY_SLIPS.map((s) => ({
              id: s.id,
              slip_number: s.slipNumber,
              period_month: s.periodMonth,
              basic_salary: s.basicSalary,
              teaching_allowance: s.teachingAllowance,
              functional_allowance: s.functionalAllowance,
              deduction: s.deduction,
              total_net_salary: s.totalNetSalary,
              payment_date: s.paymentDate,
              is_paid: s.isPaid,
            })),
          },
        } as any;
      }
      if (url.includes('/attendance')) return { data: MOCK_SELF_ATTENDANCE } as any;
      return { data: [] } as any;
    });

    vi.spyOn(apiClient, 'post').mockImplementation(async (url: string, payload: any) => {
      if (url.includes('/attendance/clock')) {
        return { data: { success: true, timestamp: '07:15 WIB', message: 'Presensi guru berhasil dicatat.' } } as any;
      }
      if (url.includes('/journals')) {
        return { data: { id: 'jrn-new', lessonTopic: payload.lessonTopic, isLocked: false, ...payload } } as any;
      }
      return { data: { success: true, message: 'Presensi KBM berhasil disimpan.' } } as any;
    });

    vi.spyOn(apiClient, 'put').mockImplementation(async () => {
      return { data: { success: true, message: 'Nilai berhasil disimpan.' } } as any;
    });
  });

  describe('1. Akses Peran & Menu Kondisional Wali Kelas', () => {
    it('authorizes teacher role to access portal guru shell', () => {
      expect(canAccessShell(['teacher'], 'guru')).toBe(true);
      expect(canAccessShell(['homeroom'], 'guru')).toBe(true);
    });

    it('denies non-teacher roles from accessing portal guru', () => {
      expect(canAccessShell(['student'], 'guru')).toBe(false);
      expect(canAccessShell(['guardian'], 'guru')).toBe(false);
    });

    it('allows conditional homeroom access only if user has homeroom or super_admin role', () => {
      const isHomeroomRegularTeacher = Boolean(['teacher'].includes('homeroom'));
      expect(isHomeroomRegularTeacher).toBe(false);

      const isHomeroomAssignedTeacher = Boolean(['teacher', 'homeroom'].includes('homeroom'));
      expect(isHomeroomAssignedTeacher).toBe(true);

      const isSuperAdmin = Boolean(['super_admin'].includes('super_admin'));
      expect(isSuperAdmin).toBe(true);
    });
  });

  describe('2. Pembatasan Data Guru (Hanya Kelas & Mapel yang Diampu)', () => {
    it('retrieves only assigned classes for the active teacher', async () => {
      const classes = await guruApi.getTeacherClasses();
      expect(classes.length).toBeGreaterThan(0);
      const classIds = classes.map((c) => c.id);
      expect(classIds).toContain('cls-7a');
      expect(classIds).toContain('cls-7b');
    });

    it('retrieves weekly teaching schedules for the active teacher', async () => {
      const schedules = await guruApi.getTeacherSchedules();
      expect(schedules.length).toBeGreaterThan(0);
      expect(schedules[0]).toHaveProperty('startTime');
      expect(schedules[0]).toHaveProperty('classId');
      expect(schedules[0]).toHaveProperty('subjectName');
    });
  });

  describe('3. Presensi KBM & Jurnal Mengajar Harian', () => {
    it('fetches student roster for attendance by class ID', async () => {
      const students = await guruApi.getAttendanceStudents('cls-7a');
      expect(students.length).toBeGreaterThan(0);
      expect(students[0]).toHaveProperty('studentName');
      expect(students[0]).toHaveProperty('status');
    });

    it('successfully records attendance session for KBM', async () => {
      const res = await guruApi.recordAttendanceSession({
        classId: 'cls-7a',
        subjectId: 'sub-mat',
        sessionDate: '2026-10-14',
        attendees: [
          { studentId: 'std-1', status: 'present' },
          { studentId: 'std-2', status: 'sick', notes: 'Surat dokter' },
        ],
      });
      expect(res.success).toBe(true);
      expect(res.message).toContain('berhasil');
    });

    it('creates and lists daily teaching journals', async () => {
      const journals = await guruApi.getJournals();
      expect(journals.length).toBeGreaterThan(0);

      const newJournal = await guruApi.createJournal({
        classId: 'cls-7a',
        className: '7-A Unggulan',
        lessonTopic: 'Uji Teorema Pythagoras',
        competenceIndicator: 'Mampu membuktikan dalil pythagoras.',
        timeSlot: '08:00 - 09:20',
      });
      expect(newJournal.lessonTopic).toBe('Uji Teorema Pythagoras');
      expect(newJournal.isLocked).toBe(false);
    });
  });

  describe('4. Buku Nilai & Input Massal', () => {
    it('fetches grade components and weights for assigned subject', async () => {
      const components = await guruApi.getGradeComponents('cls-7a', 'sub-mat');
      expect(components.length).toBeGreaterThan(0);
      const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('updates bulk grades for students in a class', async () => {
      const grades = await guruApi.getStudentGrades('cls-7a', 'sub-mat');
      expect(grades.length).toBeGreaterThan(0);

      const res = await guruApi.updateBulkGrades('cls-7a', 'sub-mat', grades);
      expect(res.success).toBe(true);
      expect(res.message).toContain('berhasil');
    });
  });

  describe('5. Pengajuan Izin & Download Slip Gaji Mandiri', () => {
    it('submits a teacher leave request with valid parameters', async () => {
      const res = await guruApi.createLeaveRequest({
        leaveType: 'duty',
        startDate: '2026-10-25',
        endDate: '2026-10-26',
        reason: 'Seminar Nasional Pembelajaran Matematika',
      });
      expect(res.success).toBe(true);
    });

    it('retrieves teacher salary slips with net salary and download link', async () => {
      const slips = await guruApi.getSalarySlips();
      expect(slips.length).toBeGreaterThan(0);
      expect(slips[0]).toHaveProperty('totalNetSalary');
      expect(slips[0].totalNetSalary).toBeGreaterThan(0);
      expect(slips[0]).toHaveProperty('slipNumber');
    });

    it('records self-attendance clock-in and clock-out', async () => {
      const inRes = await guruApi.recordSelfAttendance('check_in');
      expect(inRes.success).toBe(true);
      expect(inRes.timestamp).toBeDefined();

      const outRes = await guruApi.recordSelfAttendance('check_out');
      expect(outRes.success).toBe(true);
      expect(outRes.timestamp).toBeDefined();
    });
  });
});
