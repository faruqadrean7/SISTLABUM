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
  StudentTaskItem,
  StudentCounselingItem,
  StudentPointLogItem,
  StudentPointsResult,
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
/**
 * Mapper aman respons GET /api/v1/student-points (COND-02)
 * Menangani:
 * 1. Laravel paginated response: { data: [...], meta: {...} }
 * 2. Raw array response: [...]
 * 3. Pre-aggregated summary: { totalPrestasi, totalPelanggaran, balancePoints, logs: [...] }
 * 4. Empty / malformed response: { totalPrestasi: 0, totalPelanggaran: 0, balancePoints: 0, logs: [] }
 */
export function mapBackendStudentPointsResponse(rawPayload: unknown): StudentPointsResult {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {
      totalPrestasi: 0,
      totalPelanggaran: 0,
      balancePoints: 0,
      logs: [],
    };
  }

  const payloadObj = rawPayload as Record<string, any>;

  // Ambil list item mentah dari array atau pagination
  let rawList: any[] = [];
  if (Array.isArray(payloadObj.data)) {
    rawList = payloadObj.data;
  } else if (Array.isArray(payloadObj.logs)) {
    rawList = payloadObj.logs;
  } else if (Array.isArray(rawPayload)) {
    rawList = rawPayload as any[];
  }

  const logs: StudentPointLogItem[] = rawList
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const pointType = item.point_type || item.pointType || {};
      const rawKind = String(pointType.kind || item.kind || '').toLowerCase();
      const kind: 'prestasi' | 'pelanggaran' = rawKind === 'pelanggaran' ? 'pelanggaran' : 'prestasi';
      const points = Math.abs(Number(pointType.points ?? item.points ?? 0));
      const recorder = item.recorder || {};

      return {
        id: String(item.id || ''),
        date: String(item.point_date || item.date || item.created_at || '').substring(0, 10),
        category: String(pointType.severity || item.category || 'Umum'),
        title: String(pointType.name || item.title || 'Catatan Poin'),
        kind,
        points,
        reporterName: String(recorder.full_name || recorder.name || item.reporterName || 'Guru Pembina'),
        notes: item.notes ? String(item.notes) : undefined,
      };
    });

  let totalPrestasi = 0;
  let totalPelanggaran = 0;

  if (typeof payloadObj.totalPrestasi === 'number' && typeof payloadObj.totalPelanggaran === 'number') {
    totalPrestasi = payloadObj.totalPrestasi;
    totalPelanggaran = payloadObj.totalPelanggaran;
  } else {
    totalPrestasi = logs
      .filter((l) => l.kind === 'prestasi')
      .reduce((sum, l) => sum + l.points, 0);
    totalPelanggaran = logs
      .filter((l) => l.kind === 'pelanggaran')
      .reduce((sum, l) => sum + l.points, 0);
  }

  const balancePoints =
    typeof payloadObj.balancePoints === 'number'
      ? payloadObj.balancePoints
      : totalPrestasi - totalPelanggaran;

  let pagination: StudentPointsResult['pagination'] | undefined;
  if (payloadObj.meta && typeof payloadObj.meta === 'object') {
    const meta = payloadObj.meta;
    pagination = {
      page: Number(meta.page ?? meta.current_page ?? 1),
      limit: Number(meta.limit ?? meta.per_page ?? (logs.length || 15)),
      total: Number(meta.total ?? logs.length),
      totalPages: Number(meta.totalPages ?? meta.last_page ?? 1),
    };
  }

  return {
    totalPrestasi,
    totalPelanggaran,
    balancePoints,
    logs,
    ...(pagination ? { pagination } : {}),
  };
}

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

  /**
   * Mengambil daftar tugas KBM siswa
   */
  async getStudentTasks(): Promise<StudentTaskItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StudentTaskItem[]>('/assignments');
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => (m as any).MOCK_STUDENT_TASKS || []) : undefined
    );
  },

  /**
   * Mengumpulkan jawaban / berkas tugas siswa
   */
  async submitStudentTask(
    taskId: string,
    payload: { file_name?: string; drive_link?: string; notes?: string }
  ): Promise<{ success: boolean; message: string }> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.post<{ success: boolean; message: string }>(
          `/assignments/${taskId}/submissions`,
          payload
        );
        return res.data;
      },
      async () => ({ success: true, message: 'Tugas berhasil dikumpulkan.' })
    );
  },

  /**
   * Mengambil daftar permohonan konseling siswa
   */
  async getStudentCounseling(): Promise<StudentCounselingItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StudentCounselingItem[]>('/counseling/requests');
        return res.data;
      },
      loadPortalMock ? () => loadPortalMock().then((m) => (m as any).MOCK_STUDENT_COUNSELING || []) : undefined
    );
  },

  /**
   * Mengajukan janji temu konseling mandiri
   */
  async submitStudentCounseling(payload: {
    topic: string;
    category?: string;
    preferred_date?: string;
    preferred_time?: string;
    reason: string;
  }): Promise<StudentCounselingItem> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.post<StudentCounselingItem>('/me/counseling-requests', payload);
        return res.data;
      },
      async () => ({
        id: `csl-${Date.now()}`,
        topic: payload.topic,
        category: payload.category || 'Pengembangan Diri',
        requestDate: 'Hari Ini',
        preferredSchedule: `${payload.preferred_date || 'Tanggal fleksibel'} - ${payload.preferred_time || 'Sepulang Sekolah'}`,
        counselorName: 'Guru BK Terjadwal',
        status: 'menunggu',
        notes: payload.reason,
      })
    );
  },

  /**
   * Mengambil ringkasan dan riwayat poin kedisiplinan & prestasi siswa (COND-02)
   */
  async getStudentPoints(): Promise<StudentPointsResult> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<unknown>('/student-points');
        return mapBackendStudentPointsResponse(res.data);
      },
      loadPortalMock
        ? () =>
            loadPortalMock().then((m) =>
              mapBackendStudentPointsResponse(
                (m as any).MOCK_STUDENT_POINTS || {
                  totalPrestasi: 45,
                  totalPelanggaran: 0,
                  balancePoints: 45,
                  logs: [],
                }
              )
            )
        : undefined
    );
  },
};

