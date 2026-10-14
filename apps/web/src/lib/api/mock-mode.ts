/**
 * Centralized Mock Mode Controller (GAP-03)
 * Mengendalikan isolasi data mock agar tidak pernah aktif di production
 * dan tidak pernah menyamarkan error otorisasi/server (401, 403, 404, 422, 5xx).
 */

export function isMockEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  );
}

/**
 * Eksekusi panggilan API dengan fallback ke data mock secara aman.
 *
 * Aturan Kepatuhan:
 * 1. Di lingkungan production (NODE_ENV === 'production'):
 *    - Selalu memanggil apiCall() secara langsung.
 *    - Tidak ada fallback mock sama sekali (termasuk pada network error).
 *    - mockLoader tidak pernah dievaluasi sehingga dapat di-tree-shake.
 * 2. Di lingkungan development:
 *    - Hanya aktif jika env eksplisit NEXT_PUBLIC_USE_MOCK === 'true'.
 *    - Jika server mengembalikan HTTP status (401, 403, 404, 422, 5xx):
 *      WAJIB melempar error, dilarang menyamarkan error dengan data mock.
 *    - Fallback mock hanya diizinkan untuk pure network error (server mati / endpoint belum dibuat).
 */
export async function executeWithMockFallback<T>(
  apiCall: () => Promise<T>,
  mockLoader?: () => Promise<T>
): Promise<T> {
  // Di production atau jika mock mode tidak aktif: jalankan API murni
  if (!isMockEnabled()) {
    return await apiCall();
  }

  // Jika mock mode eksplisit aktif di development
  try {
    return await apiCall();
  } catch (err: unknown) {
    const errorWithResponse = err as {
      response?: { status?: number };
      statusCode?: number;
      status?: number;
    };

    const httpStatus =
      errorWithResponse?.response?.status ||
      errorWithResponse?.statusCode ||
      errorWithResponse?.status;

    // Jika ada response status HTTP resmi dari backend, JANGAN PERNAH fallback ke mock!
    if (httpStatus) {
      throw err;
    }

    // Jika terjadi network error dan mockLoader tersedia, fallback ke mockLoader
    if (mockLoader) {
      return await mockLoader();
    }

    throw err;
  }
}
