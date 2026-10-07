<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

            // Master Data
            ['code' => 'master.academic_year.manage', 'description' => 'Mengelola tahun ajaran dan semester'],
            ['code' => 'master.student.read', 'description' => 'Melihat data siswa'],
            ['code' => 'master.student.write', 'description' => 'Mengubah data siswa'],
            ['code' => 'master.teacher.manage', 'description' => 'Mengelola data guru'],
            ['code' => 'master.class.manage', 'description' => 'Mengelola kelas dan rombel'],
            ['code' => 'master.subject.manage', 'description' => 'Mengelola mata pelajaran'],

            // PPDB
            ['code' => 'ppdb.wave.manage', 'description' => 'Mengelola gelombang dan jalur PPDB'],
            ['code' => 'ppdb.applicant.read', 'description' => 'Melihat pendaftar PPDB'],
            ['code' => 'ppdb.applicant.verify', 'description' => 'Verifikasi berkas pendaftar PPDB'],
            ['code' => 'ppdb.selection.run', 'description' => 'Menjalankan proses seleksi PPDB'],

            // Akademik & LMS
            ['code' => 'academic.schedule.manage', 'description' => 'Mengelola jadwal pelajaran'],
            ['code' => 'academic.journal.write', 'description' => 'Mengisi jurnal mengajar'],
            ['code' => 'academic.attendance.write', 'description' => 'Mencatat presensi siswa'],
            ['code' => 'academic.grade.read', 'description' => 'Melihat nilai'],
            ['code' => 'academic.grade.write', 'description' => 'Menginput nilai'],
            ['code' => 'academic.report.generate', 'description' => 'Mencetak rapor'],

            // CBT
            ['code' => 'cbt.bank.write', 'description' => 'Mengelola bank soal'],
            ['code' => 'cbt.exam.manage', 'description' => 'Mengelola jadwal dan sesi ujian CBT'],
            ['code' => 'cbt.proctor.action', 'description' => 'Aksi pengawas ujian CBT'],
            ['code' => 'cbt.exam.take', 'description' => 'Mengerjakan ujian CBT'],

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
            ['code' => 'cms.post.manage', 'description' => 'Mengelola artikel dan berita CMS'],
            ['code' => 'notification.broadcast', 'description' => 'Kirim broadcast pengumuman'],
        ];

        $allPermissionIds = [];
        foreach ($permissionsData as $perm) {
            $p = Permission::firstOrCreate(
                ['code' => $perm['code']],
                [
                    'description' => $perm['description'],
                ]
            );
            $allPermissionIds[] = $p->id;
        }

        // Hubungkan super_admin dengan semua permission
        $roleModels['super_admin']->permissions()->sync($allPermissionIds);

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

        if (!$superAdmin->roles()->where('role_id', $roleModels['super_admin']->id)->exists()) {
            $superAdmin->roles()->attach($roleModels['super_admin']->id);
        }
    }
}
