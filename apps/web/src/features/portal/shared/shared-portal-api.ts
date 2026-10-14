import { apiClient } from '@/lib/api/api-client';
import { executeWithMockFallback } from '@/lib/api/mock-mode';
import {
  SharedSelfAttendance,
  SharedLeaveRequest,
  SharedSalarySlipItem,
  CreateLeaveRequestInput,
} from './types';

interface BackendSalarySlip {
  id: string;
  slip_number?: string;
  period_month?: string;
  period?: string;
  basic_salary?: number;
  functional_allowance?: number;
  operational_allowance?: number;
  teaching_allowance?: number;
  deduction?: number;
  total_net_salary?: number;
  net_salary?: number;
  payment_date?: string;
  created_at?: string;
  is_paid?: boolean;
}

const loadSharedMock =
  process.env.NODE_ENV !== 'production'
    ? () => import('./shared-portal-mock-data')
    : null;

export const sharedPortalApi = {
  // === PRESENSI MANDIRI (GURU / STAF) ===
  async getSelfAttendance(portalType: 'guru' | 'staf' = 'staf'): Promise<SharedSelfAttendance> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<SharedSelfAttendance>(`/me/${portalType}/self-attendance`);
        return res.data;
      },
      loadSharedMock ? () => loadSharedMock().then((m) => m.MOCK_SHARED_SELF_ATTENDANCE) : undefined
    );
  },

  async recordSelfAttendance(
    action: 'check_in' | 'check_out',
    portalType: 'guru' | 'staf' = 'staf'
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    const now = new Date().toTimeString().split(' ')[0];
    await apiClient.post(`/me/${portalType}/self-attendance`, { action });
    return {
      success: true,
      message: `Presensi kerja (${action === 'check_in' ? 'Masuk' : 'Pulang'}) berhasil dicatat.`,
      timestamp: now,
    };
  },

  // === IZIN & CUTI (GURU / STAF) ===
  async getLeaveRequests(portalType: 'guru' | 'staf' = 'staf'): Promise<SharedLeaveRequest[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<SharedLeaveRequest[]>(`/me/${portalType}/leave-requests`);
        return res.data;
      },
      loadSharedMock ? () => loadSharedMock().then((m) => m.MOCK_SHARED_LEAVE_REQUESTS) : undefined
    );
  },

  async createLeaveRequest(
    payload: CreateLeaveRequestInput,
    portalType: 'guru' | 'staf' = 'staf'
  ): Promise<{ success: boolean; message: string }> {
    await apiClient.post(`/me/${portalType}/leave-requests`, payload);
    return { success: true, message: 'Permohonan izin berhasil diajukan.' };
  },

  // === SLIP GAJI (GURU / STAF - BACKEND RESMI) ===
  async getSalarySlips(): Promise<SharedSalarySlipItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<{ data: BackendSalarySlip[] }>('/salary-slips');
        if (res.data?.data && Array.isArray(res.data.data)) {
          return res.data.data.map((item) => ({
            id: item.id,
            slipNumber: item.slip_number || `SLIP-${item.id}`,
            periodMonth: item.period_month || item.period || 'Periode Berjalan',
            basicSalary: Number(item.basic_salary || 0),
            functionalAllowance: Number(item.functional_allowance || 0),
            operationalAllowance: Number(item.operational_allowance || item.teaching_allowance || 0),
            teachingAllowance: Number(item.teaching_allowance || 0),
            deduction: Number(item.deduction || 0),
            totalNetSalary: Number(item.total_net_salary || item.net_salary || 0),
            paymentDate: item.payment_date || item.created_at || new Date().toISOString().split('T')[0],
            isPaid: Boolean(item.is_paid ?? true),
            downloadUrl: `/api/v1/salary-slips/${item.id}/download`,
          }));
        }
        return [];
      },
      loadSharedMock ? () => loadSharedMock().then((m) => m.MOCK_SHARED_SALARY_SLIPS) : undefined
    );
  },
};
