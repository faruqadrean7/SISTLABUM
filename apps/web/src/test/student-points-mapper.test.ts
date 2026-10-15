import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapBackendStudentPointsResponse, portalApi } from '@/features/portal/portal-api';
import { apiClient } from '@/lib/api/api-client';

describe('COND-02: Student Points API Response Mapper & Contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapBackendStudentPointsResponse unit tests', () => {
    it('memetakan respons paginasi standar Laravel { data: [...], meta: {...} } dengan benar', () => {
      const mockLaravelPagination = {
        data: [
          {
            id: 'pt-uuid-1',
            student_id: 'std-uuid-1',
            point_type_id: 'type-uuid-1',
            point_date: '2026-10-14',
            notes: 'Juara 1 Lomba Cipta Puisi Nasional',
            point_type: {
              id: 'type-uuid-1',
              kind: 'prestasi',
              name: 'Juara 1 Lomba Nasional',
              points: 50,
              severity: 'tinggi',
            },
            recorder: {
              id: 'usr-1',
              full_name: 'Dra. Endang Setyowati',
            },
          },
          {
            id: 'pt-uuid-2',
            student_id: 'std-uuid-1',
            point_type_id: 'type-uuid-2',
            point_date: '2026-10-15',
            notes: 'Terlambat masuk kelas 15 menit',
            point_type: {
              id: 'type-uuid-2',
              kind: 'pelanggaran',
              name: 'Keterlambatan KBM',
              points: 5,
              severity: 'rendah',
            },
            recorder: {
              id: 'usr-2',
              full_name: 'Budi Santoso, S.Pd',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 15,
          total: 2,
          totalPages: 1,
        },
      };

      const result = mapBackendStudentPointsResponse(mockLaravelPagination);

      expect(result.logs).toHaveLength(2);
      expect(result.totalPrestasi).toBe(50);
      expect(result.totalPelanggaran).toBe(5);
      expect(result.balancePoints).toBe(45); // 50 - 5 = 45

      // Verifikasi pemetaan field eksplisit
      expect(result.logs[0]).toEqual({
        id: 'pt-uuid-1',
        date: '2026-10-14',
        category: 'tinggi',
        title: 'Juara 1 Lomba Nasional',
        kind: 'prestasi',
        points: 50,
        reporterName: 'Dra. Endang Setyowati',
        notes: 'Juara 1 Lomba Cipta Puisi Nasional',
      });

      expect(result.logs[1]).toEqual({
        id: 'pt-uuid-2',
        date: '2026-10-15',
        category: 'rendah',
        title: 'Keterlambatan KBM',
        kind: 'pelanggaran',
        points: 5,
        reporterName: 'Budi Santoso, S.Pd',
        notes: 'Terlambat masuk kelas 15 menit',
      });

      // Verifikasi metadata paginasi
      expect(result.pagination).toEqual({
        page: 1,
        limit: 15,
        total: 2,
        totalPages: 1,
      });
    });

    it('menangani respons data kosong secara aman tanpa exception', () => {
      const emptyPagination = {
        data: [],
        meta: {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
        },
      };

      const result = mapBackendStudentPointsResponse(emptyPagination);

      expect(result.logs).toEqual([]);
      expect(result.totalPrestasi).toBe(0);
      expect(result.totalPelanggaran).toBe(0);
      expect(result.balancePoints).toBe(0);
      expect(result.pagination?.total).toBe(0);
    });

    it('menangani respons null, undefined, atau objek kosong dengan fallback aman', () => {
      const nullResult = mapBackendStudentPointsResponse(null);
      expect(nullResult).toEqual({
        totalPrestasi: 0,
        totalPelanggaran: 0,
        balancePoints: 0,
        logs: [],
      });

      const undefinedResult = mapBackendStudentPointsResponse(undefined);
      expect(undefinedResult).toEqual({
        totalPrestasi: 0,
        totalPelanggaran: 0,
        balancePoints: 0,
        logs: [],
      });

      const emptyObjResult = mapBackendStudentPointsResponse({});
      expect(emptyObjResult).toEqual({
        totalPrestasi: 0,
        totalPelanggaran: 0,
        balancePoints: 0,
        logs: [],
      });
    });

    it('menghormati total autoritatif dari backend jika backend menyediakannya', () => {
      const preAggregated = {
        totalPrestasi: 120,
        totalPelanggaran: 10,
        balancePoints: 110,
        logs: [
          {
            id: 'pt-1',
            date: '2026-10-01',
            kind: 'prestasi',
            points: 120,
            title: 'Penghargaan Khusus',
            category: 'Utama',
            reporterName: 'Kepala Sekolah',
          },
        ],
      };

      const result = mapBackendStudentPointsResponse(preAggregated);

      expect(result.totalPrestasi).toBe(120);
      expect(result.totalPelanggaran).toBe(10);
      expect(result.balancePoints).toBe(110);
      expect(result.logs).toHaveLength(1);
    });

    it('menghitung saldo bersih secara benar tanpa duplikasi ketika ada banyak poin', () => {
      const mockMultiplePoints = {
        data: [
          {
            id: 'p1',
            point_date: '2026-10-01',
            point_type: { kind: 'prestasi', points: 30, name: 'Lomba Robotika' },
          },
          {
            id: 'p2',
            point_date: '2026-10-02',
            point_type: { kind: 'prestasi', points: 20, name: 'Lomba Pidato' },
          },
          {
            id: 'p3',
            point_date: '2026-10-03',
            point_type: { kind: 'pelanggaran', points: 15, name: 'Atribut Seragam' },
          },
          {
            id: 'p4',
            point_date: '2026-10-04',
            point_type: { kind: 'pelanggaran', points: 10, name: 'Lupa Tugas' },
          },
        ],
      };

      const result = mapBackendStudentPointsResponse(mockMultiplePoints);

      expect(result.totalPrestasi).toBe(50); // 30 + 20
      expect(result.totalPelanggaran).toBe(25); // 15 + 10
      expect(result.balancePoints).toBe(25); // 50 - 25 = 25
      expect(result.logs).toHaveLength(4);
    });
  });

  describe('portalApi.getStudentPoints integration tests', () => {
    it('memanggil GET /student-points dan mengembalikan data terpetakan', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 'p-real-1',
              point_date: '2026-10-15',
              notes: 'Aktif kepengurusan OSIS',
              point_type: {
                kind: 'prestasi',
                name: 'Pengurus OSIS Inti',
                points: 25,
                severity: 'sedang',
              },
              recorder: {
                full_name: 'Pembina Kesiswaan',
              },
            },
          ],
          meta: {
            page: 1,
            limit: 15,
            total: 1,
            totalPages: 1,
          },
        },
      };

      vi.spyOn(apiClient, 'get').mockResolvedValue(mockApiResponse);

      const res = await portalApi.getStudentPoints();

      expect(apiClient.get).toHaveBeenCalledWith('/student-points');
      expect(res.totalPrestasi).toBe(25);
      expect(res.totalPelanggaran).toBe(0);
      expect(res.balancePoints).toBe(25);
      expect(res.logs[0].title).toBe('Pengurus OSIS Inti');
      expect(res.logs[0].reporterName).toBe('Pembina Kesiswaan');
    });

    it('melempar error jika apiClient gagal dengan status HTTP resmi (tidak menelan error)', async () => {
      const httpError = new Error('Forbidden') as any;
      httpError.response = { status: 403, data: { message: 'Akses ditolak' } };

      vi.spyOn(apiClient, 'get').mockRejectedValue(httpError);

      await expect(portalApi.getStudentPoints()).rejects.toThrow();
    });
  });
});
