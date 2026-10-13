"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { User, UserRole, LoginResponseData, ApiResponse } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load session from localStorage on initial mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("sistlabum_user");
      const token = localStorage.getItem("sistlabum_access_token");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("sistlabum_user");
      localStorage.removeItem("sistlabum_access_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("sistlabum_access_token");
      if (!token) return;

      const res = await apiClient.get<ApiResponse<User>>("/auth/me");
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem("sistlabum_user", JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn("Failed to refresh user session:", err);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", {
        identifier,
        password,
        platform: "web",
      });

      const { user: loggedInUser, tokens } = response.data.data;

      localStorage.setItem("sistlabum_access_token", tokens.accessToken);
      localStorage.setItem("sistlabum_refresh_token", tokens.refreshToken);
      localStorage.setItem("sistlabum_user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      toast.success("Login Berhasil", {
        description: `Selamat datang kembali, ${loggedInUser.profile?.fullName || loggedInUser.username}!`,
      });

      router.push("/dashboard");
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error("Gagal Masuk", { description: msg });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("sistlabum_access_token");
      localStorage.removeItem("sistlabum_refresh_token");
      localStorage.removeItem("sistlabum_user");
      setUser(null);
      toast.info("Anda telah keluar");
      router.push("/login");
    }
  };

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      if (user.roles.includes("super_admin")) return true;
      const targetRoles = Array.isArray(roles) ? roles : [roles];
      return targetRoles.some((r) => user.roles.includes(r));
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string | string[]): boolean => {
      if (!user) return false;
      if (user.roles.includes("super_admin")) return true;
      const targetPerms = Array.isArray(permission) ? permission : [permission];
      return targetPerms.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
