import { apiClient } from '@/lib/api/api-client';
import {
  PortalChildSummary,
  ChildAttendanceSummary,
  ChildReportCardSummary,
  ChildCharacterNoteSummary,
  ChildProgressReportItem,
  StudentDashboardSummary,
  StudentScheduleItem,
  StudentExamItem,
} from './types';
import {
  MOCK_CHILDREN,
  MOCK_CHILD_ATTENDANCE,
  MOCK_CHILD_REPORT_CARD,
  MOCK_CHILD_CHARACTER,
  MOCK_CHILD_PROGRESS,
  MOCK_STUDENT_DASHBOARD,
  MOCK_STUDENT_SCHEDULES,
  MOCK_STUDENT_EXAMS,
} from './portal-mock-data';

export class PortalSecurityError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'PortalSecurityError';
    this.statusCode = statusCode;
  }
}

/**
 * Validasi apakah anak tertentu sah berada di bawah perwalian user yang sedang aktif.
 */
export function verifyGuardianChildAccess(
  childId: string,
  userChildrenList?: Array<{ id: string }>
): boolean {
  if (!childId || !userChildrenList || userChildrenList.length === 0) {
    return false;
  }
  return userChildrenList.some((c) => c.id === childId);
}

export const portalApi = {
  // === ORANG TUA / WALI MURID ===

  /**
   * Mengambil daftar anak yang berada di bawah perwalian wali yang login
   */
  async getChildren(userChildrenProfile?: PortalChildSummary[]): Promise<PortalChildSummary[]> {
    try {
      const res = await apiClient.get<PortalChildSummary[]>('/me/children');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Backend /me/children sedang dalam pengerjaan (lihat docs/portal-api-requirements.md)
    }

    if (userChildrenProfile && userChildrenProfile.length > 0) {
      return userChildrenProfile;
    }
    return MOCK_CHILDREN;
  },

  /**
   * Mengambil detail profil anak dengan validasi otorisasi
   */
  async getChildDetail(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<PortalChildSummary> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.');
    }

    try {
      const res = await apiClient.get<PortalChildSummary>(`/me/children/${childId}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const found = MOCK_CHILDREN.find((c) => c.id === childId);
    if (!found) {
      throw new PortalSecurityError('Data anak tidak ditemukan atau telah dihapus.', 404);
    }
    return found;
  },

  /**
   * Mengambil riwayat dan rekap presensi anak
   */
  async getChildAttendance(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildAttendanceSummary> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.');
    }

    try {
      const res = await apiClient.get<ChildAttendanceSummary>(`/me/children/${childId}/attendance`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    return (
      MOCK_CHILD_ATTENDANCE[childId] || {
        presentDays: 0,
        sickDays: 0,
        leaveDays: 0,
        unexcusedDays: 0,
        totalDays: 0,
        percentage: 100,
        history: [],
      }
    );
  },

  /**
   * Mengambil rapor dan capaian nilai anak
   */
  async getChildReportCard(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildReportCardSummary> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.');
    }

    try {
      const res = await apiClient.get<ChildReportCardSummary>(`/me/children/${childId}/report-cards`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const report = MOCK_CHILD_REPORT_CARD[childId];
    if (!report) {
      return {
        periodId: 'none',
        periodName: 'Semester Berjalan',
        academicYear: '2024/2025',
        semester: 'Ganjil',
        totalScore: 0,
        averageScore: 0,
        grades: [],
      };
    }
    return report;
  },

  /**
   * Mengambil catatan karakter profil pelajar Pancasila anak
   */
  async getChildCharacterNote(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildCharacterNoteSummary | null> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.');
    }

    try {
      const res = await apiClient.get<ChildCharacterNoteSummary>(`/me/children/${childId}/character-notes`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    return MOCK_CHILD_CHARACTER[childId] || null;
  },

  /**
   * Mengambil laporan perkembangan anak
   */
  async getChildProgressReports(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildProgressReportItem[]> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.');
    }

    try {
      const res = await apiClient.get<ChildProgressReportItem[]>(`/me/children/${childId}/progress-reports`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    return MOCK_CHILD_PROGRESS[childId] || [];
  },

  // === SISWA ===

  /**
   * Mengambil ringkasan beranda siswa
   */
  async getStudentDashboard(): Promise<StudentDashboardSummary> {
    try {
      const res = await apiClient.get<StudentDashboardSummary>('/me/student-dashboard');
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    return MOCK_STUDENT_DASHBOARD;
  },

  /**
   * Mengambil jadwal pelajaran siswa
   */
  async getStudentSchedule(): Promise<StudentScheduleItem[]> {
    try {
      const res = await apiClient.get<StudentScheduleItem[]>('/me/schedule');
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    return MOCK_STUDENT_SCHEDULES;
  },

  /**
   * Mengambil daftar ujian CBT yang ditugaskan kepada siswa
   */
  async getStudentExams(): Promise<StudentExamItem[]> {
    try {
      const res = await apiClient.get<StudentExamItem[]>('/me/exams');
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    return MOCK_STUDENT_EXAMS;
  },
};
