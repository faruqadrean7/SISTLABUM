import { apiClient } from '@/lib/api/api-client';
import { executeWithMockFallback } from '@/lib/api/mock-mode';
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
 * Mengembalikan false secara ketat jika userChildrenList kosong/undefined.
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

const loadPortalMock =
  process.env.NODE_ENV !== 'production'
    ? () => import('./portal-mock-data')
    : null;

export const portalApi = {
  // === ORANG TUA / WALI MURID ===

  /**
   * Mengambil daftar anak yang berada di bawah perwalian wali yang login
   */
  async getChildren(userChildrenProfile?: PortalChildSummary[]): Promise<PortalChildSummary[]> {
    if (userChildrenProfile && userChildrenProfile.length > 0) {
      return userChildrenProfile;
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<PortalChildSummary[]>('/me/children');
        return res.data || [];
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_CHILDREN) : undefined
    );
  },

  /**
   * Mengambil detail profil anak dengan validasi otorisasi
   */
  async getChildDetail(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<PortalChildSummary> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.', 403);
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<PortalChildSummary>(`/me/children/${childId}`);
        return res.data;
      },
      loadPortalMock
        ? () =>
            loadPortalMock().then((m) => {
              const found = m.MOCK_CHILDREN.find((c) => c.id === childId);
              if (!found) {
                throw new PortalSecurityError('Data anak tidak ditemukan atau telah dihapus.', 404);
              }
              return found;
            })
        : undefined
    );
  },

  /**
   * Mengambil riwayat dan rekap presensi anak
   */
  async getChildAttendance(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildAttendanceSummary> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.', 403);
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<ChildAttendanceSummary>(`/me/children/${childId}/attendance`);
        return res.data;
      },
      loadPortalMock
        ? () =>
            loadPortalMock().then(
              (m) =>
                m.MOCK_CHILD_ATTENDANCE[childId] || {
                  presentDays: 0,
                  sickDays: 0,
                  leaveDays: 0,
                  unexcusedDays: 0,
                  totalDays: 0,
                  percentage: 100,
                  history: [],
                }
            )
        : undefined
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
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.', 403);
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<ChildReportCardSummary>(`/me/children/${childId}/report-cards`);
        return res.data;
      },
      loadPortalMock
        ? () =>
            loadPortalMock().then((m) => {
              const report = m.MOCK_CHILD_REPORT_CARD[childId];
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
            })
        : undefined
    );
  },

  /**
   * Mengambil catatan karakter profil pelajar Pancasila anak
   */
  async getChildCharacterNote(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildCharacterNoteSummary | null> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.', 403);
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<ChildCharacterNoteSummary>(`/me/children/${childId}/character-notes`);
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_CHILD_CHARACTER[childId] || null) : undefined
    );
  },

  /**
   * Mengambil laporan perkembangan anak
   */
  async getChildProgressReports(
    childId: string,
    userChildrenList?: Array<{ id: string }>
  ): Promise<ChildProgressReportItem[]> {
    if (!verifyGuardianChildAccess(childId, userChildrenList)) {
      throw new PortalSecurityError('Akses ditolak: Anda tidak memiliki hak perwalian sah terhadap anak ini.', 403);
    }

    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<ChildProgressReportItem[]>(`/me/children/${childId}/progress-reports`);
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_CHILD_PROGRESS[childId] || []) : undefined
    );
  },

  // === SISWA ===

  /**
   * Mengambil ringkasan beranda siswa
   */
  async getStudentDashboard(): Promise<StudentDashboardSummary> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StudentDashboardSummary>('/me/student-dashboard');
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_STUDENT_DASHBOARD) : undefined
    );
  },

  /**
   * Mengambil jadwal pelajaran siswa
   */
  async getStudentSchedule(): Promise<StudentScheduleItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StudentScheduleItem[]>('/me/schedule');
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_STUDENT_SCHEDULES) : undefined
    );
  },

  /**
   * Mengambil daftar ujian CBT yang ditugaskan kepada siswa
   */
  async getStudentExams(): Promise<StudentExamItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StudentExamItem[]>('/me/exams');
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => m.MOCK_STUDENT_EXAMS) : undefined
    );
  },
};
