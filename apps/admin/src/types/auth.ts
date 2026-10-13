export type UserRole =
  | "super_admin"
  | "admin_tu"
  | "principal"
  | "teacher"
  | "homeroom"
  | "counselor"
  | "facility_staff"
  | "ppdb_committee"
  | "librarian"
  | "student"
  | "guardian"
  | "guest";

export interface UserProfileSummary {
  fullName?: string;
  nip?: string;
  nis?: string;
  nisn?: string;
  avatarUrl?: string;
  gender?: "L" | "P";
  position?: string;
  homeroomClass?: string;
}

export interface User {
  id: string;
  schoolId?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  status: "active" | "suspended" | "locked";
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
  roles: UserRole[];
  permissions: string[];
  profile?: UserProfileSummary | null;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    currentPage?: number;
    lastPage?: number;
    perPage?: number;
    total?: number;
  };
  errors?: Record<string, string[]>;
}
