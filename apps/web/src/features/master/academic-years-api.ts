import { apiClient } from '@/lib/api/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { AcademicYearItem, ActivePeriodData, AcademicYearFormValues } from '@/types/master';

export const academicYearsApi = {
  /**
   * Ambil daftar tahun ajaran berpaginasi
   */
  async list(params?: { page?: number; limit?: number; q?: string }): Promise<PaginatedResponse<AcademicYearItem>> {
    const res = await apiClient.get<PaginatedResponse<AcademicYearItem>>('/academic-years', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        q: params?.q || undefined,
      },
    });
    return res.data;
  },

  /**
   * Ambil periode aktif saat ini
   */
  async getActive(): Promise<ActivePeriodData> {
    const res = await apiClient.get<ApiResponse<ActivePeriodData>>('/academic-years/active');
    return res.data.data;
  },

  /**
   * Tambah tahun ajaran baru
   */
  async create(data: AcademicYearFormValues): Promise<AcademicYearItem> {
    const res = await apiClient.post<ApiResponse<AcademicYearItem>>('/academic-years', data);
    return res.data.data;
  },

  /**
   * Perbarui tahun ajaran
   */
  async update(id: string, data: Partial<AcademicYearFormValues>): Promise<AcademicYearItem> {
    const res = await apiClient.put<ApiResponse<AcademicYearItem>>(`/academic-years/${id}`, data);
    return res.data.data;
  },

  /**
   * Aktifkan tahun ajaran (menonaktifkan tahun ajaran lain secara transaksional)
   */
  async activate(id: string): Promise<AcademicYearItem> {
    const res = await apiClient.patch<ApiResponse<AcademicYearItem>>(`/academic-years/${id}/activate`);
    return res.data.data;
  },

  /**
   * Hapus tahun ajaran
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/academic-years/${id}`);
  },
};
