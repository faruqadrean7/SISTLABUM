import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sistlabum_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 & Server Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sistlabum_access_token");
        localStorage.removeItem("sistlabum_user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?session_expired=1";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return data.message;
    }
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && data.errors[firstKey].length > 0) {
        return data.errors[firstKey][0];
      }
    }
    if (error.response?.status === 403) {
      return "Anda tidak memiliki hak akses untuk tindakan ini.";
    }
    if (error.response?.status === 404) {
      return "Data yang diminta tidak ditemukan.";
    }
    if (error.response?.status === 429) {
      return "Terlalu banyak permintaan. Silakan tunggu beberapa saat.";
    }
    if (error.response?.status === 500) {
      return "Terjadi kendala pada server backend. Silakan coba lagi.";
    }
    if (error.code === "ECONNABORTED" || error.message.includes("Network Error")) {
      return "Koneksi ke backend server gagal. Pastikan server API aktif di port 8000.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak terduga.";
}
