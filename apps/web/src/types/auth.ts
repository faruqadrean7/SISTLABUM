/**
 * Definisi Role resmi SISTLABUM
 */
export type RoleCode =
  | 'super_admin'
  | 'admin_tu'
  | 'principal'
  | 'vice_principal'
  | 'teacher'
  | 'homeroom'
  | 'counselor'
  | 'facility_staff'
  | 'ppdb_committee'
  | 'librarian'
  | 'treasurer'
  | 'student_affairs'
  | 'public_relations'
  | 'operator_cms'
  | 'committee'
  | 'supervisor'
  | 'student'
  | 'guardian'
  | 'guest';

export interface UserProfileSummary {
  name?: string;
  fullName?: string;
  nip?: string;
  nuptk?: string;
  nis?: string;
  nisn?: string;
  className?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  schoolId: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  status: 'active' | 'inactive' | 'suspended' | string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  roles: RoleCode[] | string[];
  permissions: string[];
  profile: UserProfileSummary;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  platform?: 'web' | 'android' | 'ios';
  fcm_token?: string;
}

export interface LoginResponseData {
  user: User;
  tokens: AuthTokens;
}

export type PortalDestination = 'admin' | 'siswa' | 'ortu' | 'guru' | 'staf' | 'kepsek' | 'portal';
