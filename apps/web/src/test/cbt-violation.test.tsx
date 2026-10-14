import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import StudentCbtPlayerPage from '@/app/(portal)/portal/siswa/ujian/[id]/page';
import { cbtApi } from '@/features/cbt/cbt-api';
import * as AuthProviderModule from '@/providers/auth-provider';

const mockPush = vi.fn();
const mockExamId = 'exam-violation-test-1';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: mockExamId }),
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

let store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

describe('GAP-07: CBT Anti-Cheat Violation Tracking and Offline Queueing', () => {
  const baseServerTime = new Date('2026-10-14T20:00:00.000Z').getTime();
  const baseEndsAt = new Date('2026-10-14T21:00:00.000Z').getTime();
  let mockCurrentTime: number = baseServerTime;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
    mockCurrentTime = baseServerTime;

    vi.spyOn(Date, 'now').mockImplementation(() => mockCurrentTime);

    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-student-1',
        username: '20261001',
        role: 'student',
        permissions: ['cbt.exam.take'],
        profile: { fullName: 'Ahmad Faiz Pratama', nis: '20261001' },
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as any);

    vi.spyOn(cbtApi, 'getStudentSessionQuestions').mockResolvedValue({
      data: {
        session_id: 'sess-violation-1',
        exam_id: mockExamId,
        title: 'Asesmen Matematika Digital',
        status: 'mengerjakan',
        server_time: new Date(baseServerTime).toISOString(),
        ends_at: new Date(baseEndsAt).toISOString(),
        deadline_at: new Date(baseEndsAt).toISOString(),
        remaining_seconds: 3600,
        violation_count: 2,
        questions: [
          {
            number: 1,
            question_id: 'q-math-1',
            question_type: 'pg',
            stem: 'Berapakah 15 x 4?',
            options: [
              { id: 'opt-a', label: 'A', text: '50' },
              { id: 'opt-b', label: 'B', text: '60' },
            ],
            current_answer: null,
            is_flagged: false,
          },
        ],
      },
    } as any);

    vi.spyOn(cbtApi, 'saveStudentAnswer').mockResolvedValue({ data: { is_saved: true } } as any);
    vi.spyOn(cbtApi, 'logStudentViolation').mockResolvedValue({
      data: { violation_count: 3, total_violations: 3, is_locked: true, session_status: 'terkunci' },
    } as any);
    vi.spyOn(cbtApi, 'sendStudentHeartbeat').mockResolvedValue({ data: { success: true } } as any);
    vi.spyOn(cbtApi, 'finishStudentSession').mockResolvedValue({ data: { status: 'selesai' } } as any);
  });

  it('GAP-07: violationCount is sourced from server and restored on reload', async () => {
    mockCurrentTime = baseServerTime;

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Trigger pelanggaran window blur
    await act(async () => {
      fireEvent(window, new Event('blur'));
    });

    expect(cbtApi.logStudentViolation).toHaveBeenCalledWith(mockExamId, expect.objectContaining({
      violation_type: 'window_blur',
    }));

    // Server mengembalikan total_violations = 3 & is_locked = true
    await waitFor(() => {
      expect(screen.getByText(/Total Peringatan/i)).toBeInTheDocument();
    });
  });

  it('GAP-07: offline violations are queued in localStorage and flushed when online', async () => {
    mockCurrentTime = baseServerTime;

    // Set kondisi offline
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Trigger pelanggaran saat offline
    await act(async () => {
      fireEvent(window, new Event('blur'));
    });

    // Disimpan ke antrean localStorage
    const savedQueue = localStorage.getItem(`cbt_pending_violations_${mockExamId}`);
    expect(savedQueue).toBeTruthy();
    expect(JSON.parse(savedQueue!)).toHaveLength(1);
    expect(JSON.parse(savedQueue!)[0].violation_type).toBe('window_blur');

    // Kembalikan status online
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });

    // Trigger event online
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    // Harus di-flush ke server
    await waitFor(() => {
      expect(cbtApi.logStudentViolation).toHaveBeenCalledWith(mockExamId, expect.objectContaining({
        violation_type: 'window_blur',
      }));
    });
  });
});
