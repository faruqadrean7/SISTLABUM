import { PortalDestination, RoleCode, User } from '@/types/auth';

/**
 * Daftar role administratif dan pengajar yang masuk ke Shell Admin
 */
export const ADMIN_SHELL_ROLES: RoleCode[] = [
  'super_admin',
  'admin_tu',
  'principal',
  'vice_principal',
  'teacher',
  'homeroom',
  'counselor',
  'facility_staff',
  'ppdb_committee',
  'librarian',
  'treasurer',
  'student_affairs',
  'public_relations',
  'operator_cms',
  'committee',
  'supervisor',
];

/**
 * Daftar role dengan hak akses baca-saja (tanpa izin mutasi data operasional)
 */
export const READ_ONLY_ROLES: RoleCode[] = ['committee', 'supervisor'];

/**
 * Cek apakah sekumpulan peran pengguna berstatus baca-saja murni
 */
export function isReadOnlyRole(roles: unknown): boolean {
  const safeRoles = sanitizeRoles(roles);
  const hasReadOnly = safeRoles.some((r) => READ_ONLY_ROLES.includes(r as RoleCode));
  const hasWriteAdminRole = safeRoles.some(
    (r) => ADMIN_SHELL_ROLES.includes(r as RoleCode) && !READ_ONLY_ROLES.includes(r as RoleCode)
  );
  return hasReadOnly && !hasWriteAdminRole;
}

/**
 * Fungsi sanitasi & anonimisasi identitas personal siswa untuk role baca-saja (Komite / Pengawas)
 */
export function anonymizeStudentName(name?: string): string {
  if (!name) return 'Siswa ***';
  const trimmed = name.trim();
  if (!trimmed) return 'Siswa ***';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }
  return `${parts[0].slice(0, 1)}*** ${parts.slice(1).map((p) => p.slice(0, 1) + '.').join(' ')}`;
}

/**
 * Cek apakah pengguna diizinkan melakukan operasi mutasi data (create, update, delete)
 */
export function canPerformWriteOperation(user: User | null | undefined): boolean {
  if (!user) return false;
  const safeRoles = sanitizeRoles(user.roles);
  if (safeRoles.includes('super_admin')) return true;
  if (isReadOnlyRole(safeRoles)) return false;
  return true;
}

/**
 * Sanitasi dan normalisasi input roles agar selalu berupa array of string yang aman
 */
export function sanitizeRoles(roles: unknown): string[] {
  if (!roles || !Array.isArray(roles)) {
    return [];
  }
  return roles.filter((r): r is string => typeof r === 'string' && r.trim().length > 0);
}

/**
 * Tentukan destinasi portal utama pengguna berdasarkan hierarki peran
 */
export function resolveUserDestination(roles: unknown): PortalDestination {
  const safeRoles = sanitizeRoles(roles);

  if (safeRoles.length === 0) {
    return 'admin';
  }

  // Jika memiliki role siswa murni (tanpa peran manajerial)
  if (safeRoles.includes('student') && !safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode))) {
    return 'siswa';
  }

  // Jika memiliki role orang tua / wali murid (tanpa peran manajerial)
  if (safeRoles.includes('guardian') && !safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode))) {
    return 'ortu';
  }

  // Jika memiliki peran admin/guru/staf
  if (safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode))) {
    return 'admin';
  }

  return 'admin';
}

/**
 * Dapatkan rute awal untuk portal yang dituju
 */
export function getDestinationPath(destination: PortalDestination): string {
  switch (destination) {
    case 'siswa':
      return '/portal/siswa';
    case 'ortu':
      return '/portal/ortu';
    case 'guru':
      return '/portal/guru';
    case 'staf':
      return '/portal/staf';
    case 'admin':
    default:
      return '/admin';
  }
}

/**
 * Tentukan destinasi sub-portal (/portal/*) pengguna berdasarkan hierarki peran
 */
export function resolvePortalDestination(roles: unknown): PortalDestination {
  const safeRoles = sanitizeRoles(roles);

  if (safeRoles.length === 0) {
    return 'admin';
  }

  // Jika memiliki peran siswa
  if (safeRoles.includes('student')) {
    return 'siswa';
  }

  // Jika memiliki peran orang tua / wali murid
  if (safeRoles.includes('guardian')) {
    return 'ortu';
  }

  // Jika memiliki peran guru atau wali kelas
  if (safeRoles.some((r) => r === 'teacher' || r === 'homeroom')) {
    return 'guru';
  }

  // Jika memiliki peran staf TU, sarpras, perpustakaan
  if (safeRoles.some((r) => r === 'admin_tu' || r === 'facility_staff' || r === 'librarian')) {
    return 'staf';
  }

  return 'admin';
}

/**
 * Evaluasi portal apa saja yang dapat diakses oleh pengguna (untuk Role Switcher multi-peran)
 */
export function getAccessiblePortals(roles: unknown): Array<{
  portal: PortalDestination;
  label: string;
  href: string;
  iconName: string;
}> {
  const safeRoles = sanitizeRoles(roles);
  const result: Array<{
    portal: PortalDestination;
    label: string;
    href: string;
    iconName: string;
  }> = [];

  const hasAdmin = safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode));
  const hasStudent = safeRoles.includes('student');
  const hasGuardian = safeRoles.includes('guardian');

  if (hasAdmin) {
    result.push({
      portal: 'admin',
      label: 'Portal Manajemen & Guru',
      href: '/admin',
      iconName: 'Shield',
    });
  }

  if (hasStudent) {
    result.push({
      portal: 'siswa',
      label: 'Portal Siswa',
      href: '/portal/siswa',
      iconName: 'GraduationCap',
    });
  }

  if (hasGuardian) {
    result.push({
      portal: 'ortu',
      label: 'Portal Orang Tua',
      href: '/portal/ortu',
      iconName: 'Users',
    });
  }

  return result;
}

/**
 * Cek apakah user memiliki izin akses (permission) tertentu
 */
export function hasPermission(
  user: User | null | undefined,
  requiredPermission?: string | string[]
): boolean {
  if (!requiredPermission) return true;
  if (!user) return false;

  const userRoles = sanitizeRoles(user.roles);
  // Super admin selalu lolos bypass
  if (userRoles.includes('super_admin')) {
    return true;
  }

  const userPermissions = Array.isArray(user.permissions)
    ? user.permissions.filter((p): p is string => typeof p === 'string')
    : [];

  if (Array.isArray(requiredPermission)) {
    // Memerlukan salah satu permission yang cocok
    return requiredPermission.some((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(requiredPermission);
}

export function canAccessShell(
  roles: unknown,
  shell: 'admin' | 'siswa' | 'ortu' | 'guru' | 'staf'
): boolean {
  const safeRoles = sanitizeRoles(roles);

  if (safeRoles.length === 0) {
    return false;
  }

  if (safeRoles.includes('super_admin')) {
    return true;
  }

  switch (shell) {
    case 'admin':
      return safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode));
    case 'siswa':
      return safeRoles.includes('student');
    case 'ortu':
      return safeRoles.includes('guardian');
    case 'guru':
      return safeRoles.some((r) => r === 'teacher' || r === 'homeroom');
    case 'staf':
      return safeRoles.some((r) => r === 'admin_tu' || r === 'facility_staff' || r === 'librarian');
    default:
      return false;
  }
}

/**
 * Mendapatkan seluruh opsi portal yang dapat diakses pengguna (untuk pemilihan portal multi-peran)
 */
export function getPortalRoleOptions(roles: unknown): Array<{
  portal: PortalDestination;
  label: string;
  href: string;
  description: string;
  iconName: string;
}> {
  const safeRoles = sanitizeRoles(roles);
  const result: Array<{
    portal: PortalDestination;
    label: string;
    href: string;
    description: string;
    iconName: string;
  }> = [];

  const isSuperAdmin = safeRoles.includes('super_admin');

  if (isSuperAdmin || safeRoles.includes('student')) {
    result.push({
      portal: 'siswa',
      label: 'Portal Siswa',
      href: '/portal/siswa',
      description: 'Jadwal pelajaran, tugas, nilai rapor, dan ujian CBT',
      iconName: 'GraduationCap',
    });
  }

  if (isSuperAdmin || safeRoles.includes('guardian')) {
    result.push({
      portal: 'ortu',
      label: 'Portal Orang Tua / Wali',
      href: '/portal/ortu',
      description: 'Monitoring presensi, nilai, dan perkembangan ananda',
      iconName: 'Users',
    });
  }

  if (isSuperAdmin || safeRoles.some((r) => r === 'teacher' || r === 'homeroom')) {
    result.push({
      portal: 'guru',
      label: 'Portal Guru',
      href: '/portal/guru',
      description: 'Presensi kelas, jurnal harian, penilaian, materi & tugas',
      iconName: 'BookOpen',
    });
  }

  if (isSuperAdmin || safeRoles.some((r) => r === 'admin_tu' || r === 'facility_staff' || r === 'librarian')) {
    result.push({
      portal: 'staf',
      label: 'Portal Staf & TU',
      href: '/portal/staf',
      description: 'Layanan administrasi persuratan, presensi kerja, dan operasional',
      iconName: 'Briefcase',
    });
  }

  if (isReadOnlyRole(safeRoles)) {
    result.push({
      portal: 'admin',
      label: 'Panel Supervisi & Laporan',
      href: '/admin/reports',
      description: 'Pusat pemantauan capaian agregat, presensi, dan evaluasi eksekutif sekolah',
      iconName: 'Shield',
    });
  } else if (isSuperAdmin || safeRoles.some((r) => ADMIN_SHELL_ROLES.includes(r as RoleCode))) {
    result.push({
      portal: 'admin',
      label: 'Panel Admin & Manajemen',
      href: '/admin',
      description: 'Pengaturan sekolah, master data, PPDB, dan laporan analitik',
      iconName: 'Shield',
    });
  }

  return result;
}

