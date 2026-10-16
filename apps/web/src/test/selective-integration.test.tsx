import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentTugasPage from '@/app/(portal)/portal/siswa/tugas/page';
import StudentKonselingPage from '@/app/(portal)/portal/siswa/konseling/page';
import StudentPoinPage from '@/app/(portal)/portal/siswa/poin/page';
import TeacherSpeedGraderPage from '@/app/(portal)/portal/guru/tugas/[id]/penilaian/page';
import { portalApi } from '@/features/portal/portal-api';
import { guruApi, TeacherAssignmentSubmission } from '@/features/portal/guru';
import { StudentTaskItem, StudentCounselingItem } from '@/features/portal/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/portal/siswa/tugas',
}));

describe('TASK: SISTLABUM-LOCAL-FIRST-SELECTIVE-INTEGRATION-01 Test Suite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  describe('1. Student LMS Assignments Page (/portal/siswa/tugas)', () => {
    const mockTasks: StudentTaskItem[] = [
      {
        id: 'task-101',
        title: 'Pembuatan Web Portfolio Sederhana',
        subjectName: 'Informatika',
        dueDate: '2026-10-20',
        dueTime: '23:59 WIB',
        status: 'aktif',
        description: 'Buatlah file HTML dan CSS dengan struktur semantic.',
        teacherName: 'Budi Santoso, S.Kom.',
        maxScore: 100,
      },
      {
        id: 'task-102',
        title: 'Resensi Novel Laskar Pelangi',
        subjectName: 'Bahasa Indonesia',
        dueDate: '2026-10-14',
        dueTime: '15:00 WIB',
        status: 'dinilai',
        description: 'Tulis ringkasan amanat dan penokohan novel.',
        teacherName: 'Dra. Siti Rahayu',
        maxScore: 100,
        score: 95,
        teacherFeedback: 'Analisis karakter sangat tajam dan bahasa runtut.',
        submission: {
          file_name: 'Resensi_Ahmad.pdf',
          submitted_at: '2026-10-14 11:20:00',
        },
      },
    ];

    it('merender daftar tugas KBM dari API dengan benar', async () => {
      vi.spyOn(portalApi, 'getStudentTasks').mockResolvedValue(mockTasks);

      renderWithClient(<StudentTugasPage />);

      await waitFor(() => {
        expect(screen.getByText('Pembuatan Web Portfolio Sederhana')).toBeInTheDocument();
        expect(screen.getByText('Resensi Novel Laskar Pelangi')).toBeInTheDocument();
      });

      expect(screen.getByText('Informatika')).toBeInTheDocument();
      expect(screen.getByText('Nilai: 95/100')).toBeInTheDocument();
    });

    it('memfilter tugas berdasarkan status dan membuka modal kumpul tugas', async () => {
      vi.spyOn(portalApi, 'getStudentTasks').mockResolvedValue(mockTasks);
      const submitSpy = vi.spyOn(portalApi, 'submitStudentTask').mockResolvedValue({ success: true, message: 'OK' });

      renderWithClient(<StudentTugasPage />);

      await waitFor(() => {
        expect(screen.getByText('Pembuatan Web Portfolio Sederhana')).toBeInTheDocument();
      });

      // Buka modal kumpul tugas
      const kumpulBtn = screen.getByRole('button', { name: /Kumpulkan Tugas/i });
      fireEvent.click(kumpulBtn);

      expect(screen.getByText('Pengumpulan Tugas Siswa')).toBeInTheDocument();

      // Isi form kumpul
      const fileInput = screen.getByPlaceholderText(/Contoh: Tugas_Informatika_AhmadFauzi.pdf/i);
      fireEvent.change(fileInput, { target: { value: 'Portofolio_Siswa.pdf' } });

      const submitFormBtn = screen.getByRole('button', { name: /Kirim Tugas Sekarang/i });
      fireEvent.click(submitFormBtn);

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith('task-101', expect.objectContaining({
          file_name: 'Portofolio_Siswa.pdf',
        }));
      });
    });

    it('membuka modal catatan feedback guru untuk tugas yang sudah dinilai', async () => {
      vi.spyOn(portalApi, 'getStudentTasks').mockResolvedValue(mockTasks);

      renderWithClient(<StudentTugasPage />);

      await waitFor(() => {
        expect(screen.getByText('Resensi Novel Laskar Pelangi')).toBeInTheDocument();
      });

      const feedbackBtn = screen.getByRole('button', { name: /Lihat Catatan Guru/i });
      fireEvent.click(feedbackBtn);

      expect(screen.getByText('Ulasan & Nilai Guru')).toBeInTheDocument();
      expect(screen.getByText(/Analisis karakter sangat tajam dan bahasa runtut/i)).toBeInTheDocument();
    });
  });

  describe('2. Student Counseling Request Page (/portal/siswa/konseling)', () => {
    const mockRequests: StudentCounselingItem[] = [
      {
        id: 'csl-1',
        topic: 'Konsultasi Pilihan Jurusan SMA',
        category: 'Pengembangan Diri',
        requestDate: '12 Okt 2026',
        preferredSchedule: '16 Okt 2026 - Sepulang Sekolah',
        counselorName: 'Ibu Ratna Dewi, Kons.',
        status: 'dijadwalkan',
        roomName: 'Ruang BK Lantai 2',
        notes: 'Diskusi peminatan sains dan teknologi.',
      },
    ];

    it('merender jaminan privasi dan riwayat konseling aktif', async () => {
      vi.spyOn(portalApi, 'getStudentCounseling').mockResolvedValue(mockRequests);

      renderWithClient(<StudentKonselingPage />);

      expect(screen.getByText(/Jaminan Kerahasiaan Konseling/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Konsultasi Pilihan Jurusan SMA')).toBeInTheDocument();
        expect(screen.getByText('Dijadwalkan')).toBeInTheDocument();
        expect(screen.getByText('Ruang BK Lantai 2')).toBeInTheDocument();
      });
    });

    it('mengajukan permohonan janji temu konseling mandiri baru', async () => {
      vi.spyOn(portalApi, 'getStudentCounseling').mockResolvedValue([]);
      const submitSpy = vi.spyOn(portalApi, 'submitStudentCounseling').mockResolvedValue({
        id: 'csl-new',
        topic: 'Kesulitan Belajar Matematika',
        category: 'Akademik',
        requestDate: 'Hari Ini',
        preferredSchedule: 'Tanggal fleksibel - Sepulang Sekolah',
        counselorName: 'Guru BK',
        status: 'menunggu',
      });

      renderWithClient(<StudentKonselingPage />);

      // Isi form
      const topicInput = screen.getByPlaceholderText(/Contoh: Kesulitan mengatur waktu belajar & ekskul/i);
      fireEvent.change(topicInput, { target: { value: 'Kesulitan Belajar Matematika' } });

      const reasonInput = screen.getByPlaceholderText(/Ceritakan sedikit tentang apa yang ingin Anda diskusikan.../i);
      fireEvent.change(reasonInput, { target: { value: 'Sering cemas saat ujian rumus aljabar.' } });

      const submitBtn = screen.getByRole('button', { name: /Ajukan Janji Temu/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith(expect.objectContaining({
          topic: 'Kesulitan Belajar Matematika',
          reason: 'Sering cemas saat ujian rumus aljabar.',
        }));
      });
    });
  });

  describe('3. Student Discipline Points & Extracurriculars (/portal/siswa/poin)', () => {
    it('merender ringkasan saldo poin, kartu prestasi dan pelanggaran', async () => {
      vi.spyOn(portalApi, 'getStudentPoints').mockResolvedValue({
        totalPrestasi: 50,
        totalPelanggaran: 5,
        balancePoints: 45,
        logs: [
          {
            id: 'pt-1',
            date: '2026-10-10',
            category: 'Juara Olimpiade Sains',
            title: 'Juara 2 OSN Tingkat Kota Malang',
            kind: 'prestasi',
            points: 50,
            reporterName: 'Pembina OSN',
          },
        ],
      });

      renderWithClient(<StudentPoinPage />);

      await waitFor(() => {
        expect(screen.getByText('+45')).toBeInTheDocument();
        expect(screen.getAllByText('+50').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('-5')).toBeInTheDocument();
        expect(screen.getByText('Juara 2 OSN Tingkat Kota Malang')).toBeInTheDocument();
      });
    });

    it('berpindah ke tab ekstrakurikuler dengan lancar', async () => {
      vi.spyOn(portalApi, 'getStudentPoints').mockResolvedValue({
        totalPrestasi: 0,
        totalPelanggaran: 0,
        balancePoints: 0,
        logs: [],
      });

      renderWithClient(<StudentPoinPage />);

      const ekskulTab = screen.getByRole('button', { name: /Ekstrakurikuler/i });
      fireEvent.click(ekskulTab);

      expect(screen.getByText('Coding & Robotika Club')).toBeInTheDocument();
      expect(screen.getByText('Palang Merah Remaja (PMR Madya)')).toBeInTheDocument();
    });
  });

  describe('4. Teacher SpeedGrader Page (/portal/guru/tugas/[id]/penilaian)', () => {
    const mockSubmissions: TeacherAssignmentSubmission[] = [
      {
        id: 'sub-01',
        studentId: 'std-01',
        studentName: 'Ahmad Fauzi',
        nisn: '0081234567',
        submittedAt: '2026-10-14 10:30',
        score: undefined,
        feedback: undefined,
        status: 'pending',
        notes: 'Lampiran_Tugas_Ahmad.pdf',
        fileUrl: 'https://storage.labschool.sch.id/files/tugas-1.pdf',
      },
      {
        id: 'sub-02',
        studentId: 'std-02',
        studentName: 'Siti Hanifah',
        nisn: '0087654321',
        submittedAt: '2026-10-14 11:15',
        score: 90,
        feedback: 'Pekerjaan rapi dan tepat waktu.',
        status: 'graded',
        notes: 'Tugas_Siti.pdf',
      },
    ];

    it('merender lembar penilaian submisi dan dapat berpindah antarsiswa', async () => {
      vi.spyOn(guruApi, 'getAssignmentSubmissions').mockResolvedValue(mockSubmissions);

      renderWithClient(<TeacherSpeedGraderPage params={{ id: 'asg-101' }} />);

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
        expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
        expect(screen.getByText('Belum Dinilai')).toBeInTheDocument();
      });

      // Navigasi ke siswa berikutnya
      const nextBtn = screen.getByRole('button', { name: /Berikutnya/i });
      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByText('Siti Hanifah')).toBeInTheDocument();
        expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();
        expect(screen.getByText('Nilai: 90')).toBeInTheDocument();
      });
    });

    it('menyimpan penilaian dan feedback guru melalui API riil', async () => {
      vi.spyOn(guruApi, 'getAssignmentSubmissions').mockResolvedValue(mockSubmissions);
      const gradeSpy = vi.spyOn(guruApi, 'gradeSubmission').mockResolvedValue({
        success: true,
        message: 'Nilai dan feedback berhasil diberikan.',
      });

      renderWithClient(<TeacherSpeedGraderPage params={{ id: 'asg-101' }} />);

      await waitFor(() => {
        expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      });

      const scoreInput = screen.getByPlaceholderText(/Contoh: 88/i);
      fireEvent.change(scoreInput, { target: { value: '88' } });

      const feedbackInput = screen.getByPlaceholderText(/Tuliskan evaluasi, koreksi, atau apresiasi/i);
      fireEvent.change(feedbackInput, { target: { value: 'Sangat baik, terus pertahankan.' } });

      const saveBtn = screen.getByRole('button', { name: /Simpan Nilai Siswa/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(gradeSpy).toHaveBeenCalledWith('sub-01', 88, 'Sangat baik, terus pertahankan.');
        expect(screen.getByText(/Nilai dan catatan berhasil disimpan/i)).toBeInTheDocument();
      });
    });
  });
});
