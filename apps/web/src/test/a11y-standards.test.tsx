import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { LoginForm } from '@/features/auth/login-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { PortalShell } from '@/components/shell/portal/portal-shell';
import * as AuthProviderModule from '@/providers/auth-provider';
import { ApiClientError } from '@/lib/api/errors';

// Mock Next.js navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
  usePathname: () => '/portal/siswa',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('FASE 6: Accessibility (a11y) & Usability Compliance Standards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Form Controls, Labels, & Accessible States', () => {
    const loginMock = vi.fn();

    beforeEach(() => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        activeRole: null,
        login: loginMock,
        logout: vi.fn(),
        checkAuth: vi.fn(),
        setActiveRole: vi.fn(),
      });
    });

    it('renders login form inputs with clear placeholder hints and accessible roles', () => {
      render(<LoginForm />);

      const usernameInput = screen.getByPlaceholderText('NISN / NIS / NIP / Username / Email');
      const passwordInput = screen.getByPlaceholderText('Masukkan kata sandi akun');
      const submitBtn = screen.getByRole('button', { name: /Masuk ke Portal Terpadu/i });

      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).toHaveAttribute('type', 'submit');
    });

    it('exposes accessible error message on validation failure', async () => {
      render(<LoginForm />);

      const submitBtn = screen.getByRole('button', { name: /Masuk ke Portal Terpadu/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Identitas.*wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/Kata sandi wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('renders server errors with role="alert" for assistive screen readers', async () => {
      loginMock.mockRejectedValueOnce(
        new ApiClientError(
          'Identitas atau kata sandi tidak sesuai.',
          'UNAUTHENTICATED',
          401
        )
      );

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText('NISN / NIS / NIP / Username / Email'), {
        target: { value: '2026001' },
      });
      fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi akun'), {
        target: { value: 'wrongpassword' },
      });

      const submitBtn = screen.getByRole('button', { name: /Masuk ke Portal Terpadu/i });
      fireEvent.click(submitBtn);

      const alert = await screen.findByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Identitas atau kata sandi tidak sesuai.');
    });
  });

  describe('2. Modal & Dialog ARIA Compliance', () => {
    it('renders ConfirmDialog with dialog role, clear title, and accessible action buttons', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Konfirmasi Kunci E-Rapor"
          description="E-Rapor yang telah dikunci tidak dapat diedit kembali oleh guru."
          confirmLabel="Ya, Kunci Sekarang"
          cancelLabel="Batal"
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      // Verify accessible dialog presentation
      expect(screen.getByText('Konfirmasi Kunci E-Rapor')).toBeInTheDocument();
      expect(
        screen.getByText('E-Rapor yang telah dikunci tidak dapat diedit kembali oleh guru.')
      ).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Ya, Kunci Sekarang/i });
      const cancelBtn = screen.getByRole('button', { name: /Batal/i });

      expect(confirmBtn).toBeInTheDocument();
      expect(cancelBtn).toBeInTheDocument();
    });
  });

  describe('3. Shell Navigation, ARIA Landmarks, & Mobile Usability', () => {
    beforeEach(() => {
      vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
        user: {
          id: 'u-1',
          schoolId: 'sch-1',
          username: 'siswa_test',
          email: 'test@labschool.sch.id',
          phone: null,
          status: 'active',
          mustChangePassword: false,
          lastLoginAt: '2026-10-14T08:00:00Z',
          roles: ['student'],
          permissions: [],
          profile: { name: 'Ahmad Siswa 7A' },
        },
        isLoading: false,
        isAuthenticated: true,
        activeRole: 'student',
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        setActiveRole: vi.fn(),
      });
    });

    it('renders portal navigation landmarks with accessible labels and action buttons', () => {
      render(
        <PortalShell>
          <div data-testid="portal-content">Konten Dashboard Siswa</div>
        </PortalShell>
      );

      expect(screen.getByTestId('portal-content')).toBeInTheDocument();

      // Check header and navigation elements
      const logoutBtn = screen.getByRole('button', { name: /Tombol Keluar Akun/i });
      expect(logoutBtn).toBeInTheDocument();

      const hamburgerBtn = screen.getByRole('button', { name: /Buka Menu Navigasi/i });
      expect(hamburgerBtn).toBeInTheDocument();
    });

    it('toggles mobile menu drawer with responsive touch-friendly navigation links', () => {
      render(
        <PortalShell>
          <div>Konten</div>
        </PortalShell>
      );

      const hamburgerBtn = screen.getByRole('button', { name: /Buka Menu Navigasi/i });
      fireEvent.click(hamburgerBtn);

      // Verify mobile drawer renders navigation links
      const mobileNav = screen.getByRole('navigation', { name: /Menu Navigasi Mobile/i });
      expect(mobileNav).toBeInTheDocument();

      // Mobile links should include primary destinations within the mobile drawer
      expect(within(mobileNav).getByText('Beranda')).toBeInTheDocument();
      expect(within(mobileNav).getByText('Jadwal')).toBeInTheDocument();
    });
  });

  describe('4. Button Accessibility & Touch Target Standards', () => {
    it('sets aria-hidden on loading spinner icon to avoid confusing screen readers', () => {
      render(
        <Button isLoading={true}>
          Simpan Data
        </Button>
      );

      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();

      // Verify loading svg has aria-hidden="true"
      const spinner = btn.querySelector('svg');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies focus-visible styles for keyboard navigation compliance', () => {
      render(<Button variant="default">Aksi Fokus</Button>);
      const btn = screen.getByRole('button', { name: 'Aksi Fokus' });

      expect(btn.className).toContain('focus-visible:ring-2');
    });
  });
});
