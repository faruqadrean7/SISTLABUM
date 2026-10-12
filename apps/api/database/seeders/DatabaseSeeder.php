<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $rolesData = [
            ['code' => 'super_admin', 'name' => 'Super Administrator'],
            ['code' => 'admin_tu', 'name' => 'Admin Tata Usaha'],
            ['code' => 'principal', 'name' => 'Kepala Sekolah'],
            ['code' => 'teacher', 'name' => 'Guru Mata Pelajaran'],
            ['code' => 'homeroom', 'name' => 'Wali Kelas'],
            ['code' => 'counselor', 'name' => 'Guru BK (Bimbingan Konseling)'],
            ['code' => 'facility_staff', 'name' => 'Staf Sarana & Prasarana'],
            ['code' => 'ppdb_committee', 'name' => 'Panitia PPDB'],
            ['code' => 'librarian', 'name' => 'Pustakawan'],
            ['code' => 'student', 'name' => 'Siswa'],
            ['code' => 'guardian', 'name' => 'Orang Tua / Wali Murid'],
            ['code' => 'guest', 'name' => 'Tamu / Calon Siswa'],
        ];

        $roleModels = [];
        foreach ($rolesData as $roleInfo) {
            $roleModels[$roleInfo['code']] = Role::firstOrCreate(
                ['code' => $roleInfo['code']],
                [
                    'name' => $roleInfo['name'],
                    'is_system' => true,
                ]
            );
        }

        // 2. Core Permissions
        $permissionsData = [
            // Auth & Users
            ['code' => 'auth.user.read', 'description' => 'Melihat daftar pengguna'],
            ['code' => 'auth.user.write', 'description' => 'Mengelola akun pengguna'],
            ['code' => 'auth.role.manage', 'description' => 'Mengelola role dan permission'],
            ['code' => 'audit.read', 'description' => 'Melihat catatan log audit keamanan'],

            // Master Data
            ['code' => 'master.academic_year.manage', 'description' => 'Mengelola tahun ajaran dan semester'],
            ['code' => 'master.student.read', 'description' => 'Melihat data siswa'],
            ['code' => 'master.student.write', 'description' => 'Mengubah data siswa'],
            ['code' => 'master.teacher.manage', 'description' => 'Mengelola data guru'],
            ['code' => 'master.class.manage', 'description' => 'Mengelola kelas dan rombel'],
            ['code' => 'master.subject.manage', 'description' => 'Mengelola mata pelajaran'],
            ['code' => 'master.room.manage', 'description' => 'Mengelola ruangan dan fasilitas dasar'],
            ['code' => 'master.promotion.manage', 'description' => 'Mengelola kenaikan kelas dan kelulusan siswa'],

            // PPDB
            ['code' => 'ppdb.wave.manage', 'description' => 'Mengelola gelombang dan jalur PPDB'],
            ['code' => 'ppdb.applicant.read', 'description' => 'Melihat pendaftar PPDB'],
            ['code' => 'ppdb.applicant.verify', 'description' => 'Verifikasi berkas pendaftar PPDB'],
            ['code' => 'ppdb.selection.run', 'description' => 'Menjalankan proses seleksi PPDB'],

            // Akademik & LMS
            ['code' => 'academic.schedule.read', 'description' => 'Melihat jadwal pelajaran'],
            ['code' => 'academic.schedule.manage', 'description' => 'Mengelola jadwal pelajaran'],
            ['code' => 'academic.journal.read', 'description' => 'Melihat jurnal mengajar'],
            ['code' => 'academic.journal.write', 'description' => 'Mengisi jurnal mengajar'],
            ['code' => 'academic.attendance.read', 'description' => 'Melihat presensi siswa'],
            ['code' => 'academic.attendance.write', 'description' => 'Mencatat presensi siswa'],
            ['code' => 'academic.grade.read', 'description' => 'Melihat nilai'],
            ['code' => 'academic.grade.write', 'description' => 'Menginput nilai'],
            ['code' => 'academic.report.generate', 'description' => 'Mencetak rapor'],

            // CBT
            ['code' => 'cbt.bank.write', 'description' => 'Mengelola bank soal'],
            ['code' => 'cbt.exam.manage', 'description' => 'Mengelola jadwal dan sesi ujian CBT'],
            ['code' => 'cbt.proctor.action', 'description' => 'Aksi pengawas ujian CBT'],
            ['code' => 'cbt.exam.take', 'description' => 'Mengerjakan ujian CBT'],
            ['code' => 'cbt.exam.review', 'description' => 'Melihat review dan pembahasan ujian CBT'],

            // Kesiswaan & BK
            ['code' => 'student.point.read', 'description' => 'Melihat poin pelanggaran/prestasi'],
            ['code' => 'student.point.write', 'description' => 'Mencatat poin pelanggaran/prestasi'],
            ['code' => 'counseling.case.read', 'description' => 'Melihat kasus konseling BK'],
            ['code' => 'counseling.case.write', 'description' => 'Mencatat sesi dan kasus konseling BK'],

            // Sarpras & Pustaka
            ['code' => 'facility.booking.manage', 'description' => 'Menyetujui/menolak booking fasilitas'],
            ['code' => 'facility.asset.manage', 'description' => 'Mengelola inventaris aset'],
            ['code' => 'library.book.manage', 'description' => 'Mengelola buku dan peminjaman pustaka'],

            // CMS & Notifikasi
            ['code' => 'cms.site.manage', 'description' => 'Mengelola pengaturan situs dan profil sekolah'],
            ['code' => 'cms.post.manage', 'description' => 'Mengelola artikel dan berita CMS'],
            ['code' => 'cms.gallery.manage', 'description' => 'Mengelola galeri foto, video, dan buletin digital CMS'],
            ['code' => 'cms.event.manage', 'description' => 'Mengelola agenda dan kalender kegiatan CMS'],
            ['code' => 'cms.download.manage', 'description' => 'Mengelola berkas dan dokumen pusat unduhan CMS'],
            ['code' => 'cms.page.manage', 'description' => 'Mengelola halaman statis dan menu navigasi CMS'],
            ['code' => 'notification.broadcast', 'description' => 'Kirim broadcast pengumuman'],

            // Buku Tamu & Humas
            ['code' => 'guest.book.read', 'description' => 'Melihat daftar dan detail buku tamu'],
            ['code' => 'guest.book.manage', 'description' => 'Mengelola buku tamu (checkout tamu)'],

            // Pengaduan & Aspirasi (Whistleblowing)
            ['code' => 'complaint.read', 'description' => 'Melihat daftar dan detail aduan/aspirasi'],
            ['code' => 'complaint.manage', 'description' => 'Menindaklanjuti dan mengubah status aduan/aspirasi'],
        ];

        $allPermissionIds = [];
        $permissionModelMap = [];
        foreach ($permissionsData as $perm) {
            $p = Permission::firstOrCreate(
                ['code' => $perm['code']],
                [
                    'description' => $perm['description'],
                ]
            );
            $allPermissionIds[] = $p->id;
            $permissionModelMap[$perm['code']] = $p->id;
        }

        // Hubungkan super_admin dengan semua permission
        $roleModels['super_admin']->permissions()->sync($allPermissionIds);

        // GAP-F: Pemetaan default permissions resmi berbasis Matriks Hak Akses SISTLABUM (Idempoten via syncWithoutDetaching)
        $assignRolePermissions = function (string $roleCode, array $permCodes) use ($roleModels, $permissionModelMap) {
            if (! isset($roleModels[$roleCode])) {
                return;
            }
            $ids = [];
            foreach ($permCodes as $code) {
                if (isset($permissionModelMap[$code])) {
                    $ids[] = $permissionModelMap[$code];
                }
            }
            if (! empty($ids)) {
                $roleModels[$roleCode]->permissions()->syncWithoutDetaching($ids);
            }
        };

        // 1. Kepala Sekolah (principal)
        $assignRolePermissions('principal', [
            'academic.grade.read',
            'academic.report.generate',
            'academic.attendance.read',
            'academic.schedule.read',
            'academic.journal.read',
            'cbt.exam.manage',
            'student.point.read',
            'counseling.case.read',
            'facility.booking.manage',
            'facility.asset.manage',
            'guest.book.read',
            'complaint.read',
            'complaint.manage',
            'audit.read',
            'master.student.read',
            'master.teacher.manage',
            'ppdb.applicant.read',
        ]);

        // 2. Admin Tata Usaha (admin_tu)
        $assignRolePermissions('admin_tu', [
            'master.academic_year.manage',
            'master.student.read',
            'master.student.write',
            'master.teacher.manage',
            'master.class.manage',
            'master.subject.manage',
            'master.room.manage',
            'master.promotion.manage',
            'academic.schedule.read',
            'academic.schedule.manage',
            'academic.attendance.read',
            'academic.attendance.write',
            'academic.report.generate',
            'guest.book.read',
            'guest.book.manage',
            'student.point.read',
            'facility.booking.manage',
            'facility.asset.manage',
            'audit.read',
        ]);

        // 3. Guru Mata Pelajaran (teacher)
        $assignRolePermissions('teacher', [
            'academic.schedule.read',
            'academic.journal.read',
            'academic.journal.write',
            'academic.attendance.read',
            'academic.attendance.write',
            'academic.grade.read',
            'academic.grade.write',
            'cbt.bank.write',
            'cbt.proctor.action',
            'student.point.read',
            'student.point.write',
        ]);

        // 4. Wali Kelas (homeroom)
        $assignRolePermissions('homeroom', [
            'academic.schedule.read',
            'academic.journal.read',
            'academic.journal.write',
            'academic.attendance.read',
            'academic.attendance.write',
            'academic.grade.read',
            'academic.grade.write',
            'academic.report.generate',
            'cbt.bank.write',
            'cbt.proctor.action',
            'student.point.read',
            'student.point.write',
        ]);

        // 5. Guru BK (counselor)
        $assignRolePermissions('counselor', [
            'counseling.case.read',
            'counseling.case.write',
            'complaint.read',
            'complaint.manage',
            'student.point.read',
            'student.point.write',
            'academic.attendance.read',
            'academic.grade.read',
        ]);

        // 6. Staf Sarana & Prasarana (facility_staff)
        $assignRolePermissions('facility_staff', [
            'facility.booking.manage',
            'facility.asset.manage',
        ]);

        // 7. Pustakawan (librarian)
        $assignRolePermissions('librarian', [
            'library.book.manage',
            'facility.asset.manage',
        ]);

        // 8. Panitia PPDB (ppdb_committee)
        $assignRolePermissions('ppdb_committee', [
            'ppdb.wave.manage',
            'ppdb.applicant.read',
            'ppdb.applicant.verify',
            'ppdb.selection.run',
        ]);

        // 9. Siswa (student)
        $assignRolePermissions('student', [
            'cbt.exam.take',
            'cbt.exam.review',
            'academic.schedule.read',
            'student.point.read',
            'academic.grade.read',
        ]);

        // 10. Orang Tua / Wali Murid (guardian)
        $assignRolePermissions('guardian', [
            'academic.attendance.read',
            'academic.grade.read',
            'student.point.read',
        ]);

        // Enforce Least Privilege: pastikan peran siswa & wali murid tidak memiliki izin administratif
        $prohibitedStudentPerms = [
            'cbt.bank.write',
            'cbt.exam.manage',
            'cbt.proctor.action',
            'academic.grade.write',
            'academic.attendance.write',
            'academic.journal.write',
            'academic.report.generate',
            'facility.booking.manage',
            'facility.asset.manage',
            'complaint.manage',
            'counseling.case.write',
        ];
        $prohibitedStudentIds = array_filter(array_map(fn ($c) => $permissionModelMap[$c] ?? null, $prohibitedStudentPerms));
        if (! empty($prohibitedStudentIds) && isset($roleModels['student'])) {
            $roleModels['student']->permissions()->detach($prohibitedStudentIds);
        }

        $prohibitedGuardianPerms = [
            'cbt.exam.take',
            'cbt.exam.review',
            'cbt.bank.write',
            'cbt.exam.manage',
            'cbt.proctor.action',
            'academic.grade.write',
            'academic.attendance.write',
            'academic.journal.write',
            'academic.report.generate',
            'facility.booking.manage',
            'facility.asset.manage',
            'complaint.manage',
            'counseling.case.write',
        ];
        $prohibitedGuardianIds = array_filter(array_map(fn ($c) => $permissionModelMap[$c] ?? null, $prohibitedGuardianPerms));
        if (! empty($prohibitedGuardianIds) && isset($roleModels['guardian'])) {
            $roleModels['guardian']->permissions()->detach($prohibitedGuardianIds);
        }

        // 3. Initial Super Admin User
        $superAdmin = User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'email' => 'admin@labschool.sch.id',
                'password_hash' => Hash::make('Admin123!@#'),
                'status' => 'active',
                'must_change_password' => false,
            ]
        );

        if (! $superAdmin->roles()->where('role_id', $roleModels['super_admin']->id)->exists()) {
            $superAdmin->roles()->attach($roleModels['super_admin']->id);
        }
    }
}
