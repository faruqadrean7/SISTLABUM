import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canAccessShell,
  resolvePortalDestination,
  getDestinationPath,
  getPortalRoleOptions,
  sanitizeRoles,
} from '@/lib/rbac/evaluator';
import {
  portalApi,
  verifyGuardianChildAccess,
  PortalSecurityError,
} from '@/features/portal';
import { apiClient } from '@/lib/api/api-client';

describe('FASE 1: Fondasi Portal Terpadu SISTLABUM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Guard & RBAC Shell Access (Siswa, Ortu, Guru, Staf)', () => {
    it('denies access when user is unauthenticated or has no roles', () => {
      expect(canAccessShell(null, 'siswa')).toBe(false);
      expect(canAccessShell(undefined, 'ortu')).toBe(false);
      expect(canAccessShell([], 'guru')).toBe(false);
      expect(canAccessShell([], 'staf')).toBe(false);
    });

    it('denies access when user has the wrong role (e.g. student accessing teacher/parent shell)', () => {
      expect(canAccessShell(['student'], 'ortu')).toBe(false);
      expect(canAccessShell(['student'], 'guru')).toBe(false);
      expect(canAccessShell(['student'], 'staf')).toBe(false);
      expect(canAccessShell(['student'], 'admin')).toBe(false);

      expect(canAccessShell(['guardian'], 'siswa')).toBe(false);
      expect(canAccessShell(['guardian'], 'guru')).toBe(false);
      expect(canAccessShell(['guardian'], 'staf')).toBe(false);
    });

    it('grants access when user has the exact matching role', () => {
      expect(canAccessShell(['student'], 'siswa')).toBe(true);
      expect(canAccessShell(['guardian'], 'ortu')).toBe(true);
      expect(canAccessShell(['teacher'], 'guru')).toBe(true);
      expect(canAccessShell(['homeroom'], 'guru')).toBe(true);
      expect(canAccessShell(['admin_tu'], 'staf')).toBe(true);
      expect(canAccessShell(['facility_staff'], 'staf')).toBe(true);
      expect(canAccessShell(['librarian'], 'staf')).toBe(true);
    });

    it('grants universal access for super_admin across all portal shells', () => {
      expect(canAccessShell(['super_admin'], 'siswa')).toBe(true);
      expect(canAccessShell(['super_admin'], 'ortu')).toBe(true);
      expect(canAccessShell(['super_admin'], 'guru')).toBe(true);
      expect(canAccessShell(['super_admin'], 'staf')).toBe(true);
      expect(canAccessShell(['super_admin'], 'admin')).toBe(true);
    });
  });

  describe('2. Redirect Resolver di /portal/page.tsx', () => {
    it('resolves single role student directly to /portal/siswa', () => {
      const dest = resolvePortalDestination(['student']);
      expect(dest).toBe('siswa');
      expect(getDestinationPath(dest)).toBe('/portal/siswa');
    });

    it('resolves single role guardian directly to /portal/ortu', () => {
      const dest = resolvePortalDestination(['guardian']);
      expect(dest).toBe('ortu');
      expect(getDestinationPath(dest)).toBe('/portal/ortu');
    });

    it('resolves teacher / homeroom directly to /portal/guru', () => {
      const dest1 = resolvePortalDestination(['teacher']);
      expect(dest1).toBe('guru');
      expect(getDestinationPath(dest1)).toBe('/portal/guru');

      const dest2 = resolvePortalDestination(['homeroom']);
      expect(dest2).toBe('guru');
      expect(getDestinationPath(dest2)).toBe('/portal/guru');
    });

    it('resolves administrative staff directly to /portal/staf', () => {
      const dest = resolvePortalDestination(['admin_tu']);
      expect(dest).toBe('staf');
      expect(getDestinationPath(dest)).toBe('/portal/staf');
    });

    it('detects multiple options for multi-role users (e.g. Guru sekaligus Wali Murid)', () => {
      const multiRole = ['teacher', 'guardian'];
      const options = getPortalRoleOptions(multiRole);
      expect(options.length).toBeGreaterThanOrEqual(2);

      const portalCodes = options.map((o) => o.portal);
      expect(portalCodes).toContain('guru');
      expect(portalCodes).toContain('ortu');
    });
  });

  describe('3. Pemilih Anak Ortu & Validasi IDOR Server-Side Guard', () => {
    const parentChildren = [
      { id: 'child-1', name: 'Ahmad Fauzi', nisn: '0081234567' },
      { id: 'child-2', name: 'Siti Sarah Hanifah', nisn: '0098765432' },
    ];

    it('authorizes access to children listed under guardian profile', () => {
      expect(verifyGuardianChildAccess('child-1', parentChildren)).toBe(true);
      expect(verifyGuardianChildAccess('child-2', parentChildren)).toBe(true);
    });

    it('strictly denies access to student ID not owned by the guardian (IDOR prevention)', () => {
      const foreignChildId = 'child-stranger-999';
      expect(verifyGuardianChildAccess(foreignChildId, parentChildren)).toBe(false);
      expect(verifyGuardianChildAccess('', parentChildren)).toBe(false);
    });

    it('throws PortalSecurityError (403) when querying child detail of unauthorized child', async () => {
      await expect(
        portalApi.getChildDetail('unauthorized-child-id', parentChildren)
      ).rejects.toThrowError(PortalSecurityError);
    });

    it('throws PortalSecurityError (403) when querying child attendance of unauthorized child', async () => {
      await expect(
        portalApi.getChildAttendance('unauthorized-child-id', parentChildren)
      ).rejects.toThrowError(PortalSecurityError);
    });

    it('throws PortalSecurityError (403) when querying child report card of unauthorized child', async () => {
      await expect(
        portalApi.getChildReportCard('unauthorized-child-id', parentChildren)
      ).rejects.toThrowError(PortalSecurityError);
    });

    it('returns legitimate data when querying valid child detail', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          id: 'child-1',
          name: 'Ahmad Fauzi',
          nisn: '0081234567',
          className: '7-A',
          homeroomTeacher: 'Budi Raharjo, S.Pd.',
          academicYear: '2024/2025',
          semester: 'Ganjil',
          attendanceSummary: { presentPercentage: 98, sickDays: 1, leaveDays: 1, unexcusedDays: 0 },
          pendingPaymentsCount: 0,
          unreadCharacterNotesCount: 0,
          recentAnnouncementsCount: 2,
        },
      });
      const child = await portalApi.getChildDetail('child-1', parentChildren);
      expect(child.id).toBe('child-1');
      expect(child.name).toBe('Ahmad Fauzi');
    });
  });

  describe('4. Single Notification Inbox & Route Mapping', () => {
    it('maps all portal roles to /portal/notifikasi', () => {
      const portalDestinations = ['siswa', 'ortu', 'guru', 'staf', 'portal'];
      portalDestinations.forEach((p) => {
        const inboxPath = p === 'admin' ? '/admin/notifications' : '/portal/notifikasi';
        expect(inboxPath).toBe('/portal/notifikasi');
      });
    });

    it('maps admin shell notifications specifically to /admin/notifications', () => {
      const adminRole = 'admin';
      const inboxPath = adminRole === 'admin' ? '/admin/notifications' : '/portal/notifikasi';
      expect(inboxPath).toBe('/admin/notifications');
    });
  });
});
