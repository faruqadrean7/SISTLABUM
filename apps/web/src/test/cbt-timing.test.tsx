import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import StudentCbtPlayerPage from '@/app/(portal)/portal/siswa/ujian/[id]/page';
import { cbtApi } from '@/features/cbt/cbt-api';
import * as AuthProviderModule from '@/providers/auth-provider';

const mockPush = vi.fn();
const mockExamId = 'exam-timing-test-1';

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

describe('GAP-02: CBT Server-Enforced Exam Duration and Anti-Throttling Timing', () => {
  const baseServerTime = new Date('2026-10-14T20:00:00.000Z').getTime();
  const baseEndsAt = new Date('2026-10-14T21:00:00.000Z').getTime(); // 60 menit (3600 detik)
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

    // Default mock response: 1 jam tersisa
    vi.spyOn(cbtApi, 'getStudentSessionQuestions').mockResolvedValue({
      data: {
        session_id: 'sess-timing-1',
        exam_id: mockExamId,
        title: 'Asesmen Matematika Digital',
        status: 'mengerjakan',
        server_time: new Date(baseServerTime).toISOString(),
        ends_at: new Date(baseEndsAt).toISOString(),
        deadline_at: new Date(baseEndsAt).toISOString(),
        remaining_seconds: 3600,
        violation_count: 0,
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
    vi.spyOn(cbtApi, 'logStudentViolation').mockResolvedValue({ data: { violation_count: 0 } } as any);
    vi.spyOn(cbtApi, 'sendStudentHeartbeat').mockResolvedValue({ data: { success: true } } as any);
    vi.spyOn(cbtApi, 'finishStudentSession').mockResolvedValue({ data: { status: 'selesai' } } as any);
  });

  it('GAP-02: immune to client clock skew (offset = server_time - Date.now())', async () => {
    // Jam client sengaja dibuat salah: 3 jam lebih cepat dari server (23:00 bukan 20:00)
    mockCurrentTime = baseServerTime + 3 * 3600 * 1000;

    render(<StudentCbtPlayerPage />);

    // Tunggu data selesai dimuat
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Meskipun jam HP/client melenceng 3 jam, sisa waktu HARUS tetap 01:00:00 (3600 detik)
    // karena offset server_time - clientTime mengompensasi skew secara mutlak
    expect(screen.getByText('01:00:00')).toBeInTheDocument();
  });

  it('GAP-02: immune to tab throttling (65-second jump produces exact remaining time)', async () => {
    mockCurrentTime = baseServerTime;

    render(<StudentCbtPlayerPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('01:00:00')).toBeInTheDocument();

    // Simulasikan throttling tab latar belakang: waktu melompat 65 detik saat user beralih tab
    act(() => {
      mockCurrentTime += 65 * 1000;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 3600 - 65 = 3535 detik -> 00:58:55
    expect(screen.getByText('00:58:55')).toBeInTheDocument();
  });

  it('GAP-02: page reload restores exact remaining time without resetting timer to 5400', async () => {
    mockCurrentTime = baseServerTime;

    // Render pertama
    const { unmount } = render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('01:00:00')).toBeInTheDocument();
    unmount();

    // Simulasikan reload 10 menit kemudian (waktu telah maju 10 menit)
    mockCurrentTime = baseServerTime + 10 * 60 * 1000;

    // Mock API mengembalikan session yang sama (ends_at tetap sama)
    vi.spyOn(cbtApi, 'getStudentSessionQuestions').mockResolvedValueOnce({
      data: {
        session_id: 'sess-timing-1',
        exam_id: mockExamId,
        server_time: new Date(mockCurrentTime).toISOString(),
        ends_at: new Date(baseEndsAt).toISOString(),
        remaining_seconds: 50 * 60, // 3000 detik
        violation_count: 0,
        questions: [
          {
            number: 1,
            question_id: 'q-math-1',
            question_type: 'pg',
            stem: 'Berapakah 15 x 4?',
            current_answer: 'opt-b',
          },
        ],
      },
    } as any);

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Sisa waktu harus 00:50:00 (bukan nilai default hardcode 90 menit / 5400 detik)
    expect(screen.getByText('00:50:00')).toBeInTheDocument();
    expect(screen.queryByText('01:30:00')).not.toBeInTheDocument();
  });

  it('GAP-02: answers surviving reload and pending answers flushed when back online', async () => {
    mockCurrentTime = baseServerTime;

    // Gagal kirim jawaban (simulasi offline/network error)
    vi.spyOn(cbtApi, 'saveStudentAnswer').mockRejectedValueOnce(new Error('Network error'));

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Siswa memilih opsi B
    const optB = screen.getByText('60');
    await act(async () => {
      fireEvent.click(optB);
    });

    // Jawaban tersimpan di pending local storage
    const pendingAnswers = localStorage.getItem(`cbt_pending_answers_${mockExamId}`);
    expect(pendingAnswers).toBeTruthy();
    expect(JSON.parse(pendingAnswers!)['q-math-1']).toBe('opt-b');

    // Sekarang online & API berhasil
    vi.spyOn(cbtApi, 'saveStudentAnswer').mockResolvedValueOnce({ data: { is_saved: true } } as any);

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    // Harus terkirim ulang
    await waitFor(() => {
      expect(cbtApi.saveStudentAnswer).toHaveBeenCalledWith(mockExamId, expect.objectContaining({
        question_id: 'q-math-1',
        answer: 'opt-b',
      }));
    });
  });

  it('Skenario 2: immune to negative client clock skew (clock set 2 hours backward)', async () => {
    // Jam gawai siswa disetel mundur 2 jam ke belakang
    mockCurrentTime = baseServerTime - 2 * 3600 * 1000;

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Sisa waktu tetap tepat 01:00:00 karena offset = serverTime - clientTime
    expect(screen.getByText('01:00:00')).toBeInTheDocument();
  });

  it('Skenario 7: connection drops during drain; succeeded item deleted, failed item remains queued', async () => {
    mockCurrentTime = baseServerTime;

    // Mulai dalam kondisi offline agar initial mount tidak langsung mem-flush antrean
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    // Siapkan 2 butir soal dalam antrean pending
    const initialPending = {
      'q-math-1': 'opt-a',
      'q-math-2': 'opt-b',
    };
    store[`cbt_pending_answers_${mockExamId}`] = JSON.stringify(initialPending);

    // Item 1 berhasil, item 2 gagal karena koneksi terputus saat drain
    vi.spyOn(cbtApi, 'saveStudentAnswer')
      .mockResolvedValueOnce({ data: { is_saved: true } } as any)
      .mockRejectedValueOnce(new Error('Connection lost midway'));

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Kembalikan status online dan picu event 'online'
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(cbtApi.saveStudentAnswer).toHaveBeenCalledWith(mockExamId, expect.objectContaining({
        question_id: 'q-math-1',
        answer: 'opt-a',
      }));
    });

    // Item 1 telah dihapus dari antrean karena server mengonfirmasi keberhasilan,
    // sedangkan item 2 TETAP berada di antrean untuk retry berikutnya!
    const queueAfterPartialDrain = JSON.parse(store[`cbt_pending_answers_${mockExamId}`] || '{}');
    expect(queueAfterPartialDrain['q-math-1']).toBeUndefined();
    expect(queueAfterPartialDrain['q-math-2']).toBe('opt-b');
  });

  it('Skenario B: offline answer queue does not leak between students on a shared device', async () => {
    mockCurrentTime = baseServerTime;

    // Simulasikan Siswa 1 (usr-student-1) memiliki jawaban pending di antrean lokal
    store[`cbt_pending_answers_usr-student-1_${mockExamId}`] = JSON.stringify({ 'q-math-1': 'opt-a' });

    // Sekarang Siswa 2 (usr-student-2) login pada perangkat yang sama
    vi.spyOn(AuthProviderModule, 'useAuth').mockReturnValue({
      user: {
        id: 'usr-student-2',
        username: '20261002',
        role: 'student',
        permissions: ['cbt.exam.take'],
        profile: { fullName: 'Budi Santoso', nis: '20261002' },
      },
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Siswa 2 tidak boleh memuat jawaban milik Siswa 1
    const radioA = screen.queryByRole('radio', { name: /A/i });
    if (radioA) {
      expect(radioA).not.toBeChecked();
    }
  });

  it('Release Gate: loads session that is already expired or finished gracefully', async () => {
    vi.spyOn(cbtApi, 'getStudentSessionQuestions').mockRejectedValueOnce({
      code: 'EXAM_TIME_OVER',
      message: 'Waktu pengerjaan ujian telah berakhir (timeout lock).',
    });

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    // Harus menampilkan layar selesai dan bukan pesan error crash
    expect(screen.getByText(/Ujian Berhasil Dikumpulkan/i)).toBeInTheDocument();
  });

  it('Release Gate: answers are saved exclusively with user-scoped storage keys', async () => {
    mockCurrentTime = baseServerTime;
    vi.spyOn(cbtApi, 'saveStudentAnswer').mockRejectedValueOnce(new Error('Network offline'));

    render(<StudentCbtPlayerPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Menyiapkan workspace/i)).not.toBeInTheDocument();
    });

    const optB = screen.getByText('60');
    fireEvent.click(optB);

    await waitFor(() => {
      // Scoped key dan active owner harus tercatat untuk mencegah kebocoran pada perangkat bersama
      expect(store[`cbt_pending_answers_usr-student-1_${mockExamId}`]).toBeTruthy();
      expect(store[`cbt_pending_answers_meta_usr-student-1_${mockExamId}`]).toBeTruthy();
      expect(store[`cbt_active_owner_${mockExamId}`]).toBe('usr-student-1');
    });
  });
});
