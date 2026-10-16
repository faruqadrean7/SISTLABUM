import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSwitcher } from '@/components/shell/shared/role-switcher';
import PortalRootLayout from '@/app/(portal)/portal/layout';
import * as AuthProviderModule from '@/providers/auth-provider';
import { User } from '@/types/auth';

const pushMock = vi.fn();
const replaceMock = vi.fn();
let mockPathname = '/portal/guru';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => mockPathname,
}));

describe('GAP-10: RoleSwitcher & activeRole Synchronization', () => {
  const setActiveRoleMock = vi.fn();

  const multiRoleUser: User = {
    id: 'usr-multi-01',
    schoolId: 'sch-01',
    username: 'guru_dan_ortu',
    email: 'guru.ortu@labschool.sch.id',
    phone: null,
    status: 'active',
    mustChangePassword: false,
    lastLoginAt: '2026-10-14T08:00:00Z',
    roles: ['teacher', 'guardian'],
    permissions: [],
    profile: { name: 'Ibu Ratna, M.Pd' },
  };

  const studentUser: User = {
    id: 'usr-student-01',
    schoolId: 'sch-01',
    username: 'siswa_01',
    email: 'siswa@labschool.sch.id',
    phone: null,
    status: 'active',
    mustChangePassword: false,
    lastLoginAt: '2026-10-14T08:00:00Z',
    roles: ['student'],
    permissions: [],
    profile: { name: 'Ahmad' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/portal/guru';
  });

  it('updates activeRole in AuthContext when switching portal via RoleSwitcher', () => {
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: multiRoleUser,
      isLoading: false,
      isAuthenticated: true,
      activeRole: 'guru',
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setActiveRole: setActiveRoleMock,
    });

    render(<RoleSwitcher />);

    // Open dropdown
    const toggleButton = screen.getByRole('button', { name: /Ganti Portal/i });
    fireEvent.click(toggleButton);

    // Click 'Portal Orang Tua' option
    const parentOption = screen.getByRole('button', { name: /Portal Orang Tua/i });
    fireEvent.click(parentOption);

    // Must call setActiveRole with 'ortu' AND push route
    expect(setActiveRoleMock).toHaveBeenCalledWith('ortu');
    expect(pushMock).toHaveBeenCalledWith('/portal/ortu');
  });

  it('synchronizes activeRole on deep link if user has permission for that portal', () => {
    mockPathname = '/portal/ortu';

    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: multiRoleUser,
      isLoading: false,
      isAuthenticated: true,
      activeRole: 'guru', // Currently guru, but landing on /portal/ortu
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setActiveRole: setActiveRoleMock,
    });

    render(
      <PortalRootLayout>
        <div>Konten Ortu</div>
      </PortalRootLayout>
    );

    // Deep link should synchronize activeRole to 'ortu'
    expect(setActiveRoleMock).toHaveBeenCalledWith('ortu');
  });

  it('does NOT synchronize activeRole if user does not have permission for the portal path', () => {
    mockPathname = '/portal/guru'; // Student lands on teacher portal

    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: studentUser, // Only 'student' role
      isLoading: false,
      isAuthenticated: true,
      activeRole: 'siswa',
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      setActiveRole: setActiveRoleMock,
    });

    render(
      <PortalRootLayout>
        <div>Konten</div>
      </PortalRootLayout>
    );

    // Student must NOT be assigned 'guru' role
    expect(setActiveRoleMock).not.toHaveBeenCalledWith('guru');
  });
});
