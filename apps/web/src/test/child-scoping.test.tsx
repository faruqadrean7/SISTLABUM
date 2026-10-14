import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { verifyGuardianChildAccess } from '@/features/portal/portal-api';
import ChildDetailPage from '@/app/(portal)/portal/ortu/anak/[id]/page';
import * as AuthProviderModule from '@/providers/auth-provider';
import * as PortalHooksModule from '@/features/portal/use-portal';
import { User } from '@/types/auth';

const pushMock = vi.fn();
let mockChildId = 'std-01';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: mockChildId }),
  useRouter: () => ({ push: pushMock }),
}));

describe('GAP-09: Guardian Child-Scoping & Strict Perwalian Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChildId = 'std-01';

    // Mock subsidiary query hooks to avoid unhandled queries
    vi.spyOn(PortalHooksModule, 'useChildAttendance').mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.spyOn(PortalHooksModule, 'useChildReportCard').mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.spyOn(PortalHooksModule, 'useChildCharacterNote').mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.spyOn(PortalHooksModule, 'useChildProgressReports').mockReturnValue({ data: [], isLoading: false } as any);
  });

  describe('1. verifyGuardianChildAccess pure logic', () => {
    it('returns false when userChildrenList is undefined', () => {
      // Must NOT fallback to MOCK_CHILDREN
      expect(verifyGuardianChildAccess('child-1', undefined)).toBe(false);
      expect(verifyGuardianChildAccess('std-01', undefined)).toBe(false);
    });

    it('returns false when userChildrenList is empty', () => {
      expect(verifyGuardianChildAccess('child-1', [])).toBe(false);
      expect(verifyGuardianChildAccess('std-01', [])).toBe(false);
    });

    it('returns false when childId is not in userChildrenList', () => {
      const guardianChildren = [{ id: 'child-real-1' }, { id: 'child-real-2' }];
      expect(verifyGuardianChildAccess('child-1', guardianChildren)).toBe(false);
      expect(verifyGuardianChildAccess('stranger-kid', guardianChildren)).toBe(false);
    });

    it('returns true ONLY when childId is explicitly present in userChildrenList', () => {
      const guardianChildren = [{ id: 'child-real-1' }, { id: 'child-real-2' }];
      expect(verifyGuardianChildAccess('child-real-1', guardianChildren)).toBe(true);
      expect(verifyGuardianChildAccess('child-real-2', guardianChildren)).toBe(true);
    });
  });

  describe('2. ChildDetailPage access enforcement', () => {
    const guardianUser: User = {
      id: 'usr-guardian-01',
      schoolId: 'sch-01',
      username: 'wali_01',
      email: 'wali@example.com',
      phone: null,
      status: 'active',
      mustChangePassword: false,
      lastLoginAt: '2026-10-14T08:00:00Z',
      roles: ['guardian'],
      permissions: [],
      profile: { name: 'Ibu Fatimah' },
    };

    it('renders EmptyState when guardian account has no registered children', () => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        user: guardianUser,
        isLoading: false,
        isAuthenticated: true,
        activeRole: 'ortu',
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        setActiveRole: vi.fn(),
      });

      vi.spyOn(PortalHooksModule, 'useChildren').mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      vi.spyOn(PortalHooksModule, 'useChildDetail').mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<ChildDetailPage />);

      expect(screen.getByText('Belum Ada Anak Terhubung')).toBeInTheDocument();
      expect(screen.queryByText(/Akses Data Siswa Ditolak/i)).not.toBeInTheDocument();
    });

    it('renders AccessDenied when guardian visits child id not belonging to them', () => {
      mockChildId = 'foreign-child-99';

      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        user: guardianUser,
        isLoading: false,
        isAuthenticated: true,
        activeRole: 'ortu',
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        setActiveRole: vi.fn(),
      });

      // Guardian owns 'child-real-1', but visits 'foreign-child-99'
      vi.spyOn(PortalHooksModule, 'useChildren').mockReturnValue({
        data: [{ id: 'child-real-1', name: 'Anak Sah' }],
        isLoading: false,
      } as any);

      vi.spyOn(PortalHooksModule, 'useChildDetail').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Akses ditolak') as any,
      } as any);

      render(<ChildDetailPage />);

      expect(screen.getByText(/Akses Data Siswa Ditolak/i)).toBeInTheDocument();
      expect(screen.getByText(/tidak memiliki hak perwalian sah/i)).toBeInTheDocument();
    });
  });
});
