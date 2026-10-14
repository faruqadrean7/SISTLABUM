import { apiClient } from '@/lib/api/api-client';
import { executeWithMockFallback } from '@/lib/api/mock-mode';
import { ExecutiveKpiMetrics, ApprovalItem, ReviewApprovalPayload } from './types';

const loadExecutiveMock =
  process.env.NODE_ENV !== 'production'
    ? () => import('./executive-mock-data')
    : null;

export const executiveApi = {
  // === OVERVIEW METRICS DASHBOARD EKSEKUTIF ===
  async getOverviewMetrics(): Promise<ExecutiveKpiMetrics> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<ExecutiveKpiMetrics>('/dashboard/executive');
        return res.data;
      },
      loadExecutiveMock ? () => loadExecutiveMock().then((m) => m.MOCK_EXECUTIVE_METRICS) : undefined
    );
  },

  // === ANTREAN PERSETUJUAN KEPALA SEKOLAH / WAKASEK ===
  async getApprovals(): Promise<ApprovalItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<{ data: ApprovalItem[] }>('/approvals/pending');
        if (res.data?.data && Array.isArray(res.data.data)) {
          return res.data.data;
        }
        return [];
      },
      loadExecutiveMock ? () => loadExecutiveMock().then((m) => m.MOCK_APPROVAL_ITEMS) : undefined
    );
  },

  async reviewApproval(
    id: string,
    payload: ReviewApprovalPayload
  ): Promise<{ success: boolean; message: string; reviewedAt: string }> {
    if (payload.action === 'reject' && !payload.rejectionReason?.trim()) {
      throw new Error('Alasan penolakan wajib diisi.');
    }

    const now = new Date().toISOString();
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.post<{ success: boolean; message: string; reviewedAt: string }>(
          `/approvals/${id}/review`,
          {
            action: payload.action,
            notes: payload.notes || payload.rejectionReason,
          }
        );
        return res.data;
      },
      () =>
        Promise.resolve({
          success: true,
          message:
            payload.action === 'approve'
              ? 'Pengajuan berhasil disetujui dan diverifikasi secara resmi.'
              : 'Pengajuan telah ditolak beserta alasan tertulis.',
          reviewedAt: now,
        })
    );
  },
};

