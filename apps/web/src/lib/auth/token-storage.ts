/**
 * Token Storage Manager untuk SISTLABUM Frontend
 * Mengelola access token dan refresh token di sisi klien.
 */

import { User } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'sistlabum_access_token';
const REFRESH_TOKEN_KEY = 'sistlabum_refresh_token';
const USER_DATA_KEY = 'sistlabum_user_profile';

// In-memory fallback untuk SSR / sesi tab aktif / environment tanpa localStorage
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryUser: User | null = null;

function hasSessionStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.sessionStorage && typeof window.sessionStorage.getItem === 'function';
  } catch {
    return false;
  }
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage && typeof window.localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!hasSessionStorage()) {
      return memoryAccessToken;
    }
    try {
      return memoryAccessToken || window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return memoryAccessToken;
    }
  },

  setAccessToken(token: string | null): void {
    memoryAccessToken = token;
    if (hasSessionStorage()) {
      try {
        if (token) {
          window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
          window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      } catch {
        // Fallback to memory
      }
    }
  },

  getRefreshToken(): string | null {
    if (!hasLocalStorage()) {
      return memoryRefreshToken;
    }
    try {
      return memoryRefreshToken || window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return memoryRefreshToken;
    }
  },

  setRefreshToken(token: string | null): void {
    memoryRefreshToken = token;
    if (hasLocalStorage()) {
      try {
        if (token) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
        } else {
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } catch {
        // Fallback to memory
      }
    }
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  },

  getUser(): User | null {
    if (memoryUser) return memoryUser;
    if (hasSessionStorage()) {
      try {
        const raw = window.sessionStorage.getItem(USER_DATA_KEY);
        if (raw) return JSON.parse(raw) as User;
      } catch {
        // Fallback
      }
    }
    return null;
  },

  setUser(user: User | null): void {
    memoryUser = user;
    if (hasSessionStorage()) {
      try {
        if (user) {
          window.sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        } else {
          window.sessionStorage.removeItem(USER_DATA_KEY);
        }
      } catch {
        // Fallback
      }
    }
  },

  clearAll(): void {
    memoryAccessToken = null;
    memoryRefreshToken = null;
    memoryUser = null;
    if (hasSessionStorage()) {
      try {
        window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        window.sessionStorage.removeItem(USER_DATA_KEY);
      } catch {
        // Ignore
      }
    }
    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // Ignore
      }
    }
  },
};
