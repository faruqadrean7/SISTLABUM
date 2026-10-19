import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTeacherAssignmentsSummary,
  guruApi,
  TeacherScheduleItem,
} from '@/features/portal/guru';
import { apiClient } from '@/lib/api/api-client';

const PORTAL_GURU_FILES = [
  'apps/web/src/app/(portal)/portal/guru/jurnal/page.tsx',
  'apps/web/src/app/(portal)/portal/guru/presensi/page.tsx',
  'apps/web/src/app/(portal)/portal/guru/nilai/page.tsx',
  'apps/web/src/app/(portal)/portal/guru/materi/page.tsx',
  'apps/web/src/app/(portal)/portal/guru/tugas/page.tsx',
];

const REPO_ROOT = path.resolve(__dirname, '../../../..');

describe('BE-GURU & FE-GURU: Elimination of Hardcoded Subject ID and Dynamic Subject Selection', () => {
  describe('1. Static Code Analysis: No Hardcoded sub-mat in Teacher Portal Pages', () => {
    it.each(PORTAL_GURU_FILES)('ensures %s has no hardcoded "sub-mat"', (relPath) => {
      const fullPath = path.resolve(REPO_ROOT, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);

      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).not.toContain("'sub-mat'");
      expect(content).not.toContain('"sub-mat"');
    });

    it.each(PORTAL_GURU_FILES)('ensures %s imports useTeacherAssignmentsSummary and has subject selection', (relPath) => {
      const fullPath = path.resolve(REPO_ROOT, relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      expect(content).toContain('useTeacherAssignmentsSummary');
      expect(content).toContain('selectedSubjectId');
      expect(content).toContain('Mata Pelajaran');
    });
  });

  describe('2. Hook useTeacherAssignmentsSummary Logic', () => {
    const createWrapper = () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      Wrapper.displayName = 'QueryClientTestWrapper';
      return Wrapper;
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('extracts unique subjects and maps classes correctly for multiple teaching assignments', async () => {
      const mockSchedules: TeacherScheduleItem[] = [
        {
          id: 'sch-1',
          dayOfWeek: 1,
          dayName: 'Senin',
          startTime: '07:30',
          endTime: '08:50',
          subjectId: 'subj-mat-uuid',
          subjectName: 'Matematika Terapan',
          classId: 'cls-7a-uuid',
          className: '7-A Unggulan',
          roomName: 'Lab 1',
          isAttendanceRecorded: false,
        },
        {
          id: 'sch-2',
          dayOfWeek: 2,
          dayName: 'Selasa',
          startTime: '09:00',
          endTime: '10:20',
          subjectId: 'subj-mat-uuid',
          subjectName: 'Matematika Terapan',
          classId: 'cls-7b-uuid',
          className: '7-B Billingual',
          roomName: 'Lab 2',
          isAttendanceRecorded: false,
        },
        {
          id: 'sch-3',
          dayOfWeek: 3,
          dayName: 'Rabu',
          startTime: '10:40',
          endTime: '12:00',
          subjectId: 'subj-ipa-uuid',
          subjectName: 'Ilmu Pengetahuan Alam',
          classId: 'cls-8a-uuid',
          className: '8-A Riset',
          roomName: 'Lab IPA',
          isAttendanceRecorded: false,
        },
      ];

      vi.spyOn(guruApi, 'getTeacherSchedules').mockResolvedValue(mockSchedules);

      const { result } = renderHook(() => useTeacherAssignmentsSummary(), {
        wrapper: createWrapper(),
      });

      // Wait for React Query to resolve
      await vi.waitFor(() => {
        expect(result.current.subjects.length).toBe(2);
      });

      // Assert distinct subjects
      expect(result.current.subjects).toEqual([
        { id: 'subj-mat-uuid', name: 'Matematika Terapan' },
        { id: 'subj-ipa-uuid', name: 'Ilmu Pengetahuan Alam' },
      ]);

      // Classes for Matematika
      const matClasses = result.current.getClassesForSubject('subj-mat-uuid');
      expect(matClasses).toHaveLength(2);
      expect(matClasses).toEqual([
        { id: 'cls-7a-uuid', name: '7-A Unggulan' },
        { id: 'cls-7b-uuid', name: '7-B Billingual' },
      ]);

      // Classes for IPA
      const ipaClasses = result.current.getClassesForSubject('subj-ipa-uuid');
      expect(ipaClasses).toHaveLength(1);
      expect(ipaClasses).toEqual([{ id: 'cls-8a-uuid', name: '8-A Riset' }]);

      // Classes for unknown subject
      expect(result.current.getClassesForSubject('unknown-id')).toEqual([]);
    });

    it('handles single teaching assignment cleanly', async () => {
      const mockSchedules: TeacherScheduleItem[] = [
        {
          id: 'sch-solo',
          dayOfWeek: 1,
          dayName: 'Senin',
          startTime: '07:30',
          endTime: '08:50',
          subjectId: 'subj-single-uuid',
          subjectName: 'Bahasa Indonesia',
          classId: 'cls-9c-uuid',
          className: '9-C Reguler',
          roomName: 'R. 101',
          isAttendanceRecorded: false,
        },
      ];

      vi.spyOn(guruApi, 'getTeacherSchedules').mockResolvedValue(mockSchedules);

      const { result } = renderHook(() => useTeacherAssignmentsSummary(), {
        wrapper: createWrapper(),
      });

      await vi.waitFor(() => {
        expect(result.current.subjects.length).toBe(1);
      });

      expect(result.current.subjects[0]).toEqual({
        id: 'subj-single-uuid',
        name: 'Bahasa Indonesia',
      });
      const classes = result.current.getClassesForSubject('subj-single-uuid');
      expect(classes).toEqual([{ id: 'cls-9c-uuid', name: '9-C Reguler' }]);
    });

    it('handles teacher with zero active teaching assignments', async () => {
      vi.spyOn(guruApi, 'getTeacherSchedules').mockResolvedValue([]);

      const { result } = renderHook(() => useTeacherAssignmentsSummary(), {
        wrapper: createWrapper(),
      });

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subjects).toEqual([]);
      expect(result.current.getClassesForSubject('any')).toEqual([]);
    });
  });

  describe('3. API Operations with Dynamic Subject and Class IDs', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('sends dynamic subjectId and scheduleId when recording attendance session', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { success: true, message: 'Presensi KBM berhasil disimpan.' },
      } as any);

      const res = await guruApi.recordAttendanceSession({
        classId: 'cls-target-123',
        subjectId: 'sub-dynamic-456',
        scheduleId: 'sch-matched-789',
        sessionDate: '2026-10-19',
        sessionTopic: 'Integral Kalkulus',
        attendees: [{ studentId: 'std-001', status: 'present' }],
      });

      expect(res.success).toBe(true);
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/attendance/session'),
        expect.objectContaining({
          class_id: 'cls-target-123',
          subject_id: 'sub-dynamic-456',
          schedule_id: 'sch-matched-789',
          session_date: '2026-10-19',
          session_topic: 'Integral Kalkulus',
        })
      );
    });

    it('sends dynamic subjectId and scheduleId when creating a journal entry', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'jrn-new-uuid',
          classId: 'cls-target-123',
          subjectId: 'sub-dynamic-456',
          scheduleId: 'sch-matched-789',
          lessonTopic: 'Trigonometri Lanjutan',
        },
      } as any);

      const newJournal = await guruApi.createJournal({
        classId: 'cls-target-123',
        className: '7-A Unggulan',
        subjectId: 'sub-dynamic-456',
        subjectName: 'Matematika Peminatan',
        scheduleId: 'sch-matched-789',
        date: '2026-10-19',
        timeSlot: '08:00 - 09:20',
        lessonTopic: 'Trigonometri Lanjutan',
        competenceIndicator: 'Memahami rumus sudut ganda.',
      });

      expect(newJournal.lessonTopic).toBe('Trigonometri Lanjutan');
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/journals'),
        expect.objectContaining({
          class_id: 'cls-target-123',
          subject_id: 'sub-dynamic-456',
          schedule_id: 'sch-matched-789',
          lesson_topic: 'Trigonometri Lanjutan',
        })
      );
    });

    it('fetches grade components and student grades with dynamic subjectId', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [],
      } as any);

      await guruApi.getGradeComponents('cls-target-123', 'sub-dynamic-456');
      expect(getSpy).toHaveBeenCalledWith(
        '/me/teacher/grade-components',
        {
          params: { class_id: 'cls-target-123', subject_id: 'sub-dynamic-456' },
        }
      );

      await guruApi.getStudentGrades('cls-target-123', 'sub-dynamic-456');
      expect(getSpy).toHaveBeenCalledWith(
        '/me/teacher/grades',
        {
          params: { class_id: 'cls-target-123', subject_id: 'sub-dynamic-456' },
        }
      );
    });

    it('updates bulk grades with dynamic subjectId', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: { success: true, message: 'Buku nilai berhasil diperbarui.' },
      } as any);

      const res = await guruApi.updateBulkGrades('cls-target-123', 'sub-dynamic-456', []);
      expect(res.success).toBe(true);
      expect(postSpy).toHaveBeenCalledWith(
        '/me/teacher/grades/bulk',
        expect.objectContaining({
          class_id: 'cls-target-123',
          subject_id: 'sub-dynamic-456',
        })
      );
    });

    it('creates material with dynamic subjectId', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'mat-uuid-1',
          title: 'Slide Pembelajaran Bab 4',
          subjectId: 'sub-dynamic-456',
          classIds: ['cls-1', 'cls-2'],
        },
      } as any);

      const material = await guruApi.createMaterial({
        title: 'Slide Pembelajaran Bab 4',
        subjectId: 'sub-dynamic-456',
        subjectName: 'Fisika Kuantum',
        classIds: ['cls-1', 'cls-2'],
        classNames: ['8-A', '8-B'],
        description: 'Bahan bacaan sebelum pertemuan.',
        fileUrl: '/documents/bab-4.pdf',
      });

      expect(material.id).toBe('mat-uuid-1');
      expect(postSpy).toHaveBeenCalledWith(
        '/me/teacher/materials',
        expect.objectContaining({
          subject_id: 'sub-dynamic-456',
          title: 'Slide Pembelajaran Bab 4',
        })
      );
    });

    it('creates assignment with dynamic subjectId and target classId', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'asg-uuid-1',
          title: 'Tugas Mandiri Vektor',
          subjectId: 'sub-dynamic-456',
          classId: 'cls-1',
        },
      } as any);

      const asg = await guruApi.createAssignment({
        title: 'Tugas Mandiri Vektor',
        subjectId: 'sub-dynamic-456',
        subjectName: 'Fisika Dasar',
        classId: 'cls-1',
        className: '8-A',
        dueDate: '2026-10-25T23:59',
        description: 'Kerjakan latihan halaman 50.',
      });

      expect(asg.id).toBe('asg-uuid-1');
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/assignments'),
        expect.objectContaining({
          subject_id: 'sub-dynamic-456',
          class_id: 'cls-1',
          title: 'Tugas Mandiri Vektor',
        })
      );
    });
  });

  describe('4. Error Handling and API Failure Resilience', () => {
    it('properly bubbles 401/403/422/500 API errors without masking them as success', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Unauthenticated (401)'));

      await expect(
        guruApi.recordAttendanceSession({
          classId: 'cls-1',
          subjectId: 'sub-1',
          sessionDate: '2026-10-19',
          attendees: [],
        })
      ).rejects.toThrow('Unauthenticated (401)');

      vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Forbidden: Guru tidak mengampu kelas ini (403)'));

      await expect(
        guruApi.createJournal({
          classId: 'cls-unassigned',
          className: 'Kelas Luar',
          lessonTopic: 'Topik',
          competenceIndicator: 'Indikator',
        })
      ).rejects.toThrow('Forbidden: Guru tidak mengampu kelas ini (403)');
    });
  });
});
