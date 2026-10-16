import { apiClient } from '@/lib/api/api-client';
import { executeWithMockFallback } from '@/lib/api/mock-mode';
import { StaffDashboardSummary, StaffTicketItem, CreateStaffTicketInput } from './types';
import { TicketPriority, TicketStatus } from '@/features/sarpras/tickets-api';

interface BackendTicketItem {
  id: string;
  code?: string;
  title: string;
  category?: string;
  location?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  created_at?: string;
  updated_at?: string;
  resolution_notes?: string;
}

const loadStafMock =
  process.env.NODE_ENV !== 'production'
    ? () => import('./staf-mock-data')
    : null;

export const stafApi = {
  // === DASHBOARD UTAMA STAF ===
  async getDashboardSummary(): Promise<StaffDashboardSummary> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<StaffDashboardSummary>('/me/staff/dashboard');
        return res.data;
      },
      loadStafMock ? () => loadStafMock().then((m) => m.MOCK_STAFF_DASHBOARD) : undefined
    );
  },

  // === TIKET ADUAN KERUSAKAN SARPRAS SAYA ===
  async getMyTickets(): Promise<StaffTicketItem[]> {
    return executeWithMockFallback(
      async () => {
        const res = await apiClient.get<{ data?: BackendTicketItem[] }>('/me/staff/tickets');
        if (res.data?.data && Array.isArray(res.data.data)) {
          return res.data.data.map((item) => ({
            id: item.id,
            code: item.code || `TCK-${item.id}`,
            title: item.title,
            category: item.category || 'Sarpras',
            location: item.location || 'Area Sekolah',
            description: item.description || '',
            priority: item.priority || 'sedang',
            status: item.status || 'pending',
            reportedAt: item.created_at || new Date().toISOString(),
            updatedAt: item.updated_at,
            resolutionNotes: item.resolution_notes,
          }));
        }
        return [];
      },
      loadStafMock ? () => loadStafMock().then((m) => m.MOCK_STAFF_TICKETS) : undefined
    );
  },

  async createTicket(payload: CreateStaffTicketInput): Promise<StaffTicketItem> {
    const res = await apiClient.post<StaffTicketItem>('/tickets', {
      title: payload.title,
      category: payload.category,
      location: payload.location,
      description: payload.description,
      priority: payload.priority,
    });
    return res.data;
  },
};
