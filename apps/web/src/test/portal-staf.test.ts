import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessShell } from '@/lib/rbac/evaluator';
import { sharedPortalApi } from '@/features/portal/shared';
import { stafApi } from '@/features/portal/staf';
import { apiClient } from '@/lib/api/api-client';
import {
  MOCK_SHARED_SELF_ATTENDANCE,
  MOCK_SHARED_LEAVE_REQUESTS,
  MOCK_SHARED_SALARY_SLIPS,
} from '@/features/portal/shared/shared-portal-mock-data';
import {
  MOCK_STAFF_DASHBOARD,
  MOCK_STAFF_TICKETS,
} from '@/features/portal/staf/staf-mock-data';

describe('FASE 3: Portal Staf & Tenaga Kependidikan (/portal/staf) Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/self-attendance')) return { data: MOCK_SHARED_SELF_ATTENDANCE } as any;
      if (url.includes('/leave-requests')) return { data: MOCK_SHARED_LEAVE_REQUESTS } as any;
      if (url.includes('/salary-slips')) {
        return {
          data: {
            data: MOCK_SHARED_SALARY_SLIPS.map((s) => ({
              id: s.id,
              slip_number: s.slipNumber,
              period_month: s.periodMonth,
              basic_salary: s.basicSalary,
              functional_allowance: s.functionalAllowance,
              operational_allowance: s.operationalAllowance,
              deduction: s.deduction,
              total_net_salary: s.totalNetSalary,
              payment_date: s.paymentDate,
              is_paid: s.isPaid,
            })),
          },
        } as any;
      }
      if (url.includes('/staff/dashboard')) return { data: MOCK_STAFF_DASHBOARD } as any;
      if (url.includes('/staff/tickets')) {
        return {
          data: {
            data: MOCK_STAFF_TICKETS.map((t) => ({
              id: t.id,
              code: t.code,
              title: t.title,
              category: t.category,
              location: t.location,
              description: t.description,
              priority: t.priority,
              status: t.status,
              created_at: t.reportedAt,
            })),
          },
        } as any;
      }
      return { data: [] } as any;
    });

    vi.spyOn(apiClient, 'post').mockImplementation(async (url: string, payload: any) => {
      if (url.includes('/self-attendance')) {
        return { data: { success: true, timestamp: '07:15:00', message: 'Presensi berhasil dicatat.' } } as any;
      }
      if (url.includes('/leave-requests')) {
        return { data: { success: true, message: 'Permohonan izin berhasil diajukan.' } } as any;
      }
      if (url.includes('/tickets')) {
        return {
          data: {
            id: 'tck-new-1',
            code: 'TCK-2026-999',
            title: payload.title,
            category: payload.category,
            location: payload.location,
            description: payload.description,
            priority: payload.priority,
            status: 'pending',
            reportedAt: new Date().toISOString(),
          },
        } as any;
      }
      return { data: { success: true } } as any;
    });
  });

  describe('1. Akses Peran & Guard Portal Staf', () => {
    it('authorizes admin_tu, facility_staff, and librarian to access portal staf shell', () => {
      expect(canAccessShell(['admin_tu'], 'staf')).toBe(true);
      expect(canAccessShell(['facility_staff'], 'staf')).toBe(true);
      expect(canAccessShell(['librarian'], 'staf')).toBe(true);
      expect(canAccessShell(['super_admin'], 'staf')).toBe(true);
    });

    it('denies students and guardians from accessing portal staf', () => {
      expect(canAccessShell(['student'], 'staf')).toBe(false);
      expect(canAccessShell(['guardian'], 'staf')).toBe(false);
    });

    it('denies teachers without staff roles from accessing portal staf', () => {
      expect(canAccessShell(['teacher'], 'staf')).toBe(false);
    });
  });

  describe('2. Presensi Mandiri Staf (Shared Attendance)', () => {
    it('retrieves self-attendance details for staff', async () => {
      const attendance = await sharedPortalApi.getSelfAttendance('staf');
      expect(attendance).toHaveProperty('todayDate');
      expect(attendance).toHaveProperty('workHoursThisMonth');
      expect(attendance).toHaveProperty('targetWorkHours');
      expect(attendance.targetWorkHours).toBe(160);
      expect(attendance.workHoursThisMonth).toBeGreaterThan(0);
    });

    it('records clock-in for staff and returns timestamp', async () => {
      const res = await sharedPortalApi.recordSelfAttendance('check_in', 'staf');
      expect(res.success).toBe(true);
      expect(res).toHaveProperty('timestamp');
      expect(res.message).toContain('berhasil');
    });

    it('records clock-out for staff and returns timestamp', async () => {
      const res = await sharedPortalApi.recordSelfAttendance('check_out', 'staf');
      expect(res.success).toBe(true);
      expect(res).toHaveProperty('timestamp');
      expect(res.message).toContain('berhasil');
    });
  });

  describe('3. Pengajuan Izin & Cuti Staf (Shared Leave)', () => {
    it('fetches existing leave requests for staff', async () => {
      const leaves = await sharedPortalApi.getLeaveRequests('staf');
      expect(leaves.length).toBeGreaterThan(0);
      expect(leaves[0]).toHaveProperty('leaveType');
      expect(leaves[0]).toHaveProperty('status');
      expect(leaves[0]).toHaveProperty('daysCount');
    });

    it('submits a new leave request for staff and returns confirmation', async () => {
      const res = await sharedPortalApi.createLeaveRequest(
        {
          leaveType: 'annual',
          startDate: '2026-11-10',
          endDate: '2026-11-12',
          reason: 'Cuti tahunan keperluan keluarga',
        },
        'staf'
      );
      expect(res.success).toBe(true);
      expect(res.message).toContain('berhasil diajukan');
    });
  });

  describe('4. Slip Gaji Staf (Shared Salary Slips)', () => {
    it('retrieves monthly salary slips for staff', async () => {
      const slips = await sharedPortalApi.getSalarySlips();
      expect(slips.length).toBeGreaterThan(0);
      const latestSlip = slips[0];
      expect(latestSlip).toHaveProperty('slipNumber');
      expect(latestSlip).toHaveProperty('basicSalary');
      expect(latestSlip).toHaveProperty('totalNetSalary');
      expect(latestSlip).toHaveProperty('downloadUrl');
      expect(latestSlip.downloadUrl).toContain('/download');
    });
  });

  describe('5. Dashboard Ringkasan & Tiket Aduan Sarpras Staf', () => {
    it('retrieves staff dashboard summary with metrics and announcements', async () => {
      const dashboard = await stafApi.getDashboardSummary();
      expect(dashboard).toHaveProperty('staffName');
      expect(dashboard).toHaveProperty('department');
      expect(dashboard).toHaveProperty('todayAttendance');
      expect(dashboard).toHaveProperty('openTicketsCount');
      expect(dashboard.recentAnnouncements.length).toBeGreaterThan(0);
    });

    it('retrieves sarpras damage reports submitted by staff', async () => {
      const tickets = await stafApi.getMyTickets();
      expect(tickets.length).toBeGreaterThan(0);
      expect(tickets[0]).toHaveProperty('code');
      expect(tickets[0]).toHaveProperty('title');
      expect(tickets[0]).toHaveProperty('location');
      expect(tickets[0]).toHaveProperty('priority');
      expect(tickets[0]).toHaveProperty('status');
    });

    it('creates a new sarpras maintenance ticket', async () => {
      const newTicket = await stafApi.createTicket({
        title: 'Lampu Koridor Gedung B Padam',
        category: 'Kelistrikan',
        location: 'Gedung B Lantai 1',
        description: 'Dua buah lampu neon 36W di depan ruang guru padam total.',
        priority: 'sedang',
      });
      expect(newTicket).toHaveProperty('id');
      expect(newTicket.code).toContain('TCK-');
      expect(newTicket.title).toBe('Lampu Koridor Gedung B Padam');
      expect(newTicket.status).toBe('pending');
    });
  });
});
